// On-device bilingual (English + Tagalog) FAQ retrieval via Transformers.js.
//
// How it works: a multilingual distilled sentence-transformer turns text into a
// cosine-normalized embedding (a vector). We embed every FAQ's English AND
// Tagalog question and aliases, then embed the user's question and find
// the FAQ whose vector is closest (highest dot product == cosine similarity,
// since vectors are unit length). The query's language is detected separately so
// we reply in the same language. If nothing clears the threshold, we return a
// graceful fallback instead of a wrong answer.
//
// Everything runs in the browser — no API key, no backend, no data leaves the
// device. The model (~120MB) downloads on first use and is cached afterwards.

import type { Faq, FaqLanguage } from "./faq";
import { FAQS } from "./faq";

// Multilingual distilled sentence-transformer (covers English + Tagalog),
// cosine-normalized via mean pooling. English-only DistilBERT can't match
// Tagalog, so multilingual is required for bilingual support.
const MODEL_ID = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

// Minimum cosine similarity to count as a confident match. Tune to taste:
// lower = more answers but more wrong matches; higher = stricter, more "not sure".
const SIMILARITY_THRESHOLD = 0.40;

const FALLBACK_ANSWER: Record<FaqLanguage, string> = {
	en: "Sorry, I can only answer questions about iSkolar, and I'm not sure about that one. Try rephrasing it, or email our team at hello@iskolar.io and we'll be glad to help.",
	tl: "Paumanhin, mga tanong lang tungkol sa iSkolar ang kaya kong sagutin, at hindi ako sigurado diyan. Subukang baguhin ang tanong, o i-email ang aming team sa hello@iskolar.io at malugod kaming tutulong.",
};

// Examples of clearly off-topic questions. If a query is closer to one of these
// than to any FAQ, we treat it as unrelated and return the fallback — this
// rejects nonsense that would otherwise scrape past the similarity threshold.
const OUT_OF_SCOPE_ANCHORS: string[] = [
	"when will someone die",
	"kelan mamamatay si",
	"how do I kill someone",
	"paano pumatay ng tao",
	"do you love me",
	"mahal mo ba ako",
	"will you marry me",
	"what's the weather today",
	"anong oras na ngayon",
	"tell me a joke",
	"magkwento ka ng joke",
	"how do I cook adobo",
	"paano magluto ng adobo",
	"who is the president",
	"sino ang pangulo ng pilipinas",
	"what is the capital of japan",
	"what is two plus two",
	"sing me a song",
	"play some music",
	"what is your favorite color",
];

// High-frequency Tagalog words that rarely appear as standalone English words.
// One hit flags the query (and any Taglish) as Tagalog so we answer in Tagalog.
const TAGALOG_MARKERS = new Set([
	"ano", "anong", "paano", "papaano", "pano", "saan", "sino", "kanino",
	"kailan", "bakit", "magkano", "ilan", "mga", "ang", "yung", "iyong",
	"ninyo", "niyo", "nyo", "po", "opo", "ba", "pwede", "puwede", "maaari",
	"maari", "hindi", "kailangan", "gusto", "libre", "bayad", "naman", "kasi",
	"dito", "ito", "meron", "mayroon", "ako", "ikaw", "kayo", "kami", "tayo",
	"namin", "natin", "ng", "nang", "mag", "kung", "para", "sa", "ni", "kay",
	"kelan", "si", "sina", "kina", "nasaan", "gaano", "kanina", "ngayon",
]);

function detectLanguage(query: string): FaqLanguage {
	const words = query.toLowerCase().split(/[^a-zñ]+/);
	for (const word of words) {
		if (word.length > 0 && TAGALOG_MARKERS.has(word)) return "tl";
	}
	return "en";
}

// Minimal structural type for the bits of the feature-extraction pipeline we use.
// Avoids depending on the library's exported type names across versions.
type Embedder = (
	text: string | string[],
	options: { pooling: "mean"; normalize: true },
) => Promise<{ data: Float32Array; dims: number[] }>;

// Each FAQ is indexed by several vectors — its English and Tagalog question and
// aliases — so a query can match on whichever phrasing is closest.
interface IndexedFaq {
	faq: Faq;
	vectors: number[][];
}

let extractorPromise: Promise<Embedder> | null = null;
let faqIndex: IndexedFaq[] | null = null;
let oosVectors: number[][] | null = null;

// Lazily load Transformers.js (kept out of the main bundle via dynamic import)
// and instantiate the pipeline exactly once.
function getExtractor(): Promise<Embedder> {
	if (!extractorPromise) {
		extractorPromise = (async () => {
			const { pipeline } = await import("@huggingface/transformers");
			// dtype "q8" loads the ~120MB quantized weights instead of the much
			// larger fp32 default — far faster first download.
			const extractor = await pipeline("feature-extraction", MODEL_ID, {
				dtype: "q8",
			});
			return extractor as unknown as Embedder;
		})();
		// If loading fails, clear the cache so a later call can retry instead of
		// re-awaiting the same rejected promise.
		extractorPromise.catch(() => {
			extractorPromise = null;
		});
	}
	return extractorPromise;
}

// Embed many texts in a single batched call (far faster than one-by-one).
async function embedBatch(
	extractor: Embedder,
	texts: string[],
): Promise<number[][]> {
	const output = await extractor(texts, { pooling: "mean", normalize: true });
	const dim = output.dims[output.dims.length - 1];
	const vectors: number[][] = [];
	for (let i = 0; i < texts.length; i++) {
		vectors.push(Array.from(output.data.slice(i * dim, (i + 1) * dim)));
	}
	return vectors;
}

async function embedOne(extractor: Embedder, text: string): Promise<number[]> {
	const [vector] = await embedBatch(extractor, [text]);
	return vector;
}

function dotProduct(a: number[], b: number[]): number {
	let sum = 0;
	for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
	return sum;
}

/**
 * Preload the model and precompute FAQ embeddings. Safe to call repeatedly —
 * the work happens only once. Call it when the chat opens so the first answer
 * isn't blocked on the model download.
 */
export async function warmUpFaqBot(): Promise<void> {
	const extractor = await getExtractor();
	if (!faqIndex) {
		const index: IndexedFaq[] = [];
		for (const faq of FAQS) {
			const texts: string[] = [];
			for (const language of ["en", "tl"] as const) {
				const content = faq[language];
				texts.push(content.question, ...(content.aliases ?? []));
			}
			index.push({ faq, vectors: await embedBatch(extractor, texts) });
		}
		oosVectors = await embedBatch(extractor, OUT_OF_SCOPE_ANCHORS);
		faqIndex = index;
	}
}

/**
 * Whether the model and FAQ embeddings are fully loaded and ready to answer.
 * The chat widget uses this to decide between its loading screen and the chat.
 */
export function isFaqBotReady(): boolean {
	return faqIndex !== null && oosVectors !== null;
}

export interface FaqAnswer {
	answer: string;
	matched: boolean;
	score: number;
	language: FaqLanguage;
	matchedQuestion?: string;
}

/**
 * Answer a user's question by matching it against the FAQ knowledge base.
 * Detects the query language and replies in it. Returns the closest FAQ answer,
 * or a fallback if nothing is confident enough.
 */
export async function askFaqBot(query: string): Promise<FaqAnswer> {
	const extractor = await getExtractor();
	await warmUpFaqBot();
	// faqIndex is guaranteed populated by warmUpFaqBot above.
	const index = faqIndex as IndexedFaq[];
	const language = detectLanguage(query);

	const queryVector = await embedOne(extractor, query);

	let bestScore = Number.NEGATIVE_INFINITY;
	let bestFaq: Faq | null = null;
	for (const entry of index) {
		// An FAQ's score is its best-matching vector (question or alias, in
		// either language).
		for (const vector of entry.vectors) {
			const score = dotProduct(queryVector, vector);
			if (score > bestScore) {
				bestScore = score;
				bestFaq = entry.faq;
			}
		}
	}

	// Off-topic guard: if the query is closer to a known out-of-scope example
	// than to any FAQ, treat it as unrelated and fall back.
	let bestOffTopicScore = Number.NEGATIVE_INFINITY;
	for (const vector of oosVectors ?? []) {
		const score = dotProduct(queryVector, vector);
		if (score > bestOffTopicScore) bestOffTopicScore = score;
	}

	if (
		!bestFaq ||
		bestScore < SIMILARITY_THRESHOLD ||
		bestOffTopicScore > bestScore
	) {
		return {
			answer: FALLBACK_ANSWER[language],
			matched: false,
			score: bestScore,
			language,
		};
	}

	const content = bestFaq[language];
	return {
		answer: content.answer,
		matched: true,
		score: bestScore,
		language,
		matchedQuestion: content.question,
	};
}
