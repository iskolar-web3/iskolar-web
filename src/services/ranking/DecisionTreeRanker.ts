import type {
	RankedApplicant,
	RankingCriteria,
	RankingResult,
	RankingSession,
} from "@/lib/ranking/model";
import { RankingMode } from "@/lib/ranking/model";
import type { Applicant, FormField } from "@/lib/scholarship/model";
import { FormFieldType } from "@/lib/scholarship/model";
import { EducationLevel } from "@/lib/student/model";

// Credit a criterion contributes to the weighted score
const MET = 1;
const PARTIAL = 0.5;
const NOT_MET = 0;

// Keyword coverage needed for a criterion to count as met / partially met
const MET_COVERAGE = 0.6;
const PARTIAL_COVERAGE = 0.3;

// Filler words that carry no meaning when matching a criterion against answers
const STOPWORDS = new Set([
	"must",
	"be",
	"being",
	"been",
	"a",
	"an",
	"the",
	"have",
	"has",
	"had",
	"is",
	"are",
	"was",
	"were",
	"in",
	"of",
	"at",
	"to",
	"for",
	"with",
	"and",
	"or",
	"on",
	"by",
	"from",
	"as",
	"that",
	"this",
	"their",
	"they",
	"who",
	"currently",
	"should",
	"required",
	"require",
	"requires",
	"requirement",
	"applicant",
	"applicants",
	"student",
	"students",
	"least",
	"minimum",
	"maximum",
	"every",
	"any",
	"all",
	"only",
	"per",
	"each",
]);

// Interchangeable spellings: "3rd year" in a criterion should match
// "third year" in an answer and vice versa
const SYNONYMS: Record<string, string[]> = {
	"1st": ["first"],
	first: ["1st"],
	"2nd": ["second"],
	second: ["2nd"],
	"3rd": ["third"],
	third: ["3rd"],
	"4th": ["fourth"],
	fourth: ["4th"],
	"5th": ["fifth"],
	fifth: ["5th"],
};

// Criteria about submitted documents; Quick Rank does not read files, so the
// most it can verify is that a file was actually submitted
const DOCUMENT_WORDS = [
	"document",
	"certificate",
	"certification",
	"cor",
	"transcript",
	"upload",
	"submitted",
	"submit",
	"proof",
];

const TERTIARY_WORDS = ["tertiary", "college", "university", "undergraduate"];
const SECONDARY_WORDS = [
	"secondary",
	"high school",
	"senior high",
	"junior high",
];

// Tokens already consumed by the education level branch
const LEVEL_WORDS = new Set([
	"tertiary",
	"college",
	"university",
	"undergraduate",
	"secondary",
	"high",
	"school",
	"senior",
	"junior",
	"education",
	"level",
]);

export class DecisionTreeRanker {
	static rank(
		scholarshipId: string,
		applicants: Applicant[],
		criterias: RankingCriteria[],
		formFields: FormField[] = [],
	): RankingResult {
		const rankedApplicants: RankedApplicant[] = applicants.map((applicant) => {
			const corpus = DecisionTreeRanker.buildTextCorpus(applicant, formFields);
			const criteriaMet: string[] = [];
			const criteriaNotMet: string[] = [];
			let score = 0;

			for (const criteria of criterias) {
				const credit = DecisionTreeRanker.evaluateCriteria(
					applicant,
					criteria,
					corpus,
				);
				score += criteria.weight * credit;

				if (credit === MET) {
					criteriaMet.push(criteria.name);
				} else {
					criteriaNotMet.push(criteria.name);
				}
			}

			return {
				applicant,
				rank: 0, // Will be assigned after sorting
				score: Math.round(score),
				criteriaMet,
				criteriaNotMet,
			};
		});

		// Sort by score descending
		rankedApplicants.sort((a, b) => b.score - a.score);

		// Assign ranks
		rankedApplicants.forEach((applicant, index) => {
			applicant.rank = index + 1;
		});

		const session: RankingSession = {
			id: crypto.randomUUID(),
			scholarshipId,
			mode: RankingMode.DecisionTree,
			criterias,
			timestamp: new Date(),
			totalApplicants: applicants.length,
		};

		const scores = rankedApplicants.map((a) => a.score);
		const summary =
			scores.length > 0
				? {
						averageScore: Math.round(
							scores.reduce((sum, s) => sum + s, 0) / scores.length,
						),
						topScore: Math.max(...scores),
						bottomScore: Math.min(...scores),
						qualifiedCount: rankedApplicants.filter((a) => a.score >= 60)
							.length,
					}
				: { averageScore: 0, topScore: 0, bottomScore: 0, qualifiedCount: 0 };

		return {
			session,
			rankedApplicants,
			summary,
		};
	}

	// Decision tree per criterion. Branches are checked in order and the
	// first decisive one wins; without evidence the criterion is NOT met.
	private static evaluateCriteria(
		applicant: Applicant,
		criteria: RankingCriteria,
		corpus: string,
	): number {
		const criteriaLower = criteria.name.toLowerCase();

		// Branch 1: document criteria → was a file actually submitted?
		if (DOCUMENT_WORDS.some((word) => criteriaLower.includes(word))) {
			return DecisionTreeRanker.hasSubmittedFile(applicant) ? MET : NOT_MET;
		}

		// Branch 2: education level criteria are gated by the profile…
		const wantsTertiary = TERTIARY_WORDS.some((word) =>
			criteriaLower.includes(word),
		);
		const wantsSecondary = SECONDARY_WORDS.some((word) =>
			criteriaLower.includes(word),
		);
		if (wantsTertiary || wantsSecondary) {
			const level = applicant.student.educationLevel?.code;
			const levelMatches = wantsTertiary
				? level === EducationLevel.Tertiary
				: level === EducationLevel.Secondary;
			if (!levelMatches) return NOT_MET;

			// …and anything beyond the level (e.g. "3rd year") needs evidence
			// in the text answers
			const keywords = DecisionTreeRanker.extractKeywords(criteriaLower).filter(
				(word) => !LEVEL_WORDS.has(word),
			);
			if (keywords.length === 0) return MET;
			return DecisionTreeRanker.keywordCredit(corpus, keywords);
		}

		// Branch 3: everything else needs evidence in the text answers
		const keywords = DecisionTreeRanker.extractKeywords(criteriaLower);
		if (keywords.length === 0) return NOT_MET;
		return DecisionTreeRanker.keywordCredit(corpus, keywords);
	}

	// All the text Quick Rank is allowed to look at: text form answers plus
	// the school name and education level from the profile. File answers are
	// excluded by field type, and link or object values are never included.
	private static buildTextCorpus(
		applicant: Applicant,
		formFields: FormField[],
	): string {
		const fileFieldIds = new Set(
			formFields
				.filter((field) => field.fieldType.code === FormFieldType.File)
				.map((field) => field.id),
		);

		const pieces: string[] = [];
		for (const answer of applicant.formFieldAnswers ?? []) {
			if (fileFieldIds.has(answer.formFieldId)) continue;
			DecisionTreeRanker.collectText(answer.value, pieces);
		}

		const student = applicant.student;
		if (student.schoolName) pieces.push(student.schoolName);
		if (student.educationLevel) pieces.push(student.educationLevel.name);

		return pieces.join("\n").toLowerCase();
	}

	private static collectText(value: unknown, pieces: string[]): void {
		if (typeof value === "string") {
			// Links point at files; Quick Rank reads text only
			if (!/^https?:\/\//i.test(value)) {
				pieces.push(value);
			}
			return;
		}
		if (typeof value === "number" || typeof value === "boolean") {
			pieces.push(String(value));
			return;
		}
		if (Array.isArray(value)) {
			for (const item of value) {
				DecisionTreeRanker.collectText(item, pieces);
			}
		}
		// Objects (file payloads) and null carry no readable text
	}

	private static hasSubmittedFile(applicant: Applicant): boolean {
		return (applicant.formFieldAnswers ?? []).some((answer) => {
			const value = answer.value;
			if (typeof value === "string") return /^https?:\/\//i.test(value);
			return (
				typeof value === "object" &&
				value !== null &&
				typeof value.url === "string"
			);
		});
	}

	private static extractKeywords(text: string): string[] {
		const words = text
			.toLowerCase()
			.split(/[^a-z0-9]+/)
			.filter((word) => word.length > 1 && !STOPWORDS.has(word));
		return [...new Set(words)];
	}

	private static keywordCredit(corpus: string, keywords: string[]): number {
		if (corpus.length === 0) return NOT_MET;

		const matched = keywords.filter((word) =>
			DecisionTreeRanker.containsWord(corpus, word),
		).length;
		const coverage = matched / keywords.length;

		if (coverage >= MET_COVERAGE) return MET;
		if (coverage >= PARTIAL_COVERAGE) return PARTIAL;
		return NOT_MET;
	}

	private static containsWord(corpus: string, word: string): boolean {
		const forms = [word, ...(SYNONYMS[word] ?? [])];
		return forms.some((form) =>
			new RegExp(`\\b${DecisionTreeRanker.escapeRegExp(form)}\\b`).test(corpus),
		);
	}

	private static escapeRegExp(text: string): string {
		return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
}
