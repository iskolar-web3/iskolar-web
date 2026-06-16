import type { Applicant } from "@/lib/scholarship/model";
import type {
	RankingCriteria,
	RankedApplicant,
	RankingResult,
	RankingSession,
} from "@/lib/ranking/model";
import { RankingMode } from "@/lib/ranking/model";

// Shape returned by the backend deterministic ranking engine
// (server/src/ranking/types.ts → DeterministicRankingResponse).
interface ExtractedFields {
	gwa: number | null;
	yearLevel: number | null;
	enrollmentStatus: "full-time" | "part-time" | "unknown";
	institutionName: string | null;
	issueDate: string | null;
}

interface DocumentAuthenticityReport {
	overallScore: number;
	confidence: "high" | "moderate" | "low";
	documentType: string;
	fraudIndicators: string[];
}

interface DeterministicRankedApplicant {
	applicant: Applicant;
	rank: number;
	score: number;
	criteriaMet: string[];
	criteriaNotMet: string[];
	documentAuthenticity: DocumentAuthenticityReport[];
	extractedFields: ExtractedFields;
	documentVerificationFlag: "verified" | "requires_manual_review" | "unverified";
	duplicateDocumentFlag: boolean;
}

interface DeterministicSummary {
	averageScore: number;
	topScore: number;
	bottomScore: number;
	qualifiedCount: number;
	weightNormalizationApplied: boolean;
	flaggedForManualReview: number;
}

interface DeterministicResponse {
	message: string;
	data: {
		rankedApplicants: DeterministicRankedApplicant[];
		summary: DeterministicSummary;
	};
}

const FRAUD_LABELS: Record<string, string> = {
	name_mismatch: "Document name doesn't match the applicant",
	date_in_future: "Document date is in the future",
	date_too_old: "Document is too old",
	gwa_implausible: "Implausible GWA value",
	low_text_density: "Very little readable text",
	uniform_confidence: "Suspiciously uniform OCR confidence",
	isolated_field_region: "Key field appears isolated/edited",
	cross_document_name_conflict: "Names conflict across documents",
	duplicate_document_hash: "Identical document submitted elsewhere",
};

function humanizeFraud(indicator: string): string {
	return FRAUD_LABELS[indicator] ?? indicator.replace(/_/g, " ");
}

/**
 * Builds the `aiInsights` panel shown in RankedApplicationsTable from the
 * deterministic engine's structured output. There is no LLM involved — these
 * are derived directly from OCR-extracted fields and the authenticity report.
 */
function buildInsights(
	item: DeterministicRankedApplicant,
): RankedApplicant["aiInsights"] {
	const reports = item.documentAuthenticity ?? [];
	const bestAuthScore = reports.length
		? Math.max(...reports.map((r) => r.overallScore))
		: null;
	const fraudIndicators = Array.from(
		new Set(reports.flatMap((r) => r.fraudIndicators ?? [])),
	);
	const fields = item.extractedFields;
	const documentsRead = item.documentVerificationFlag !== "unverified";
	const totalCriteria = item.criteriaMet.length + item.criteriaNotMet.length;

	// Summarize what OCR actually pulled out, so reviewers can see the document
	// data WAS read even when the score is driven by criteria fit.
	const extracted: string[] = [];
	if (fields?.gwa != null) extracted.push(`GWA ${fields.gwa.toFixed(2)}`);
	if (fields?.yearLevel != null) extracted.push(`year level ${fields.yearLevel}`);
	if (fields?.enrollmentStatus && fields.enrollmentStatus !== "unknown") {
		extracted.push(`${fields.enrollmentStatus} enrollment`);
	}
	if (fields?.institutionName) extracted.push(fields.institutionName);
	if (fields?.issueDate) extracted.push(`issued ${fields.issueDate}`);

	const strengths: string[] = [];
	// Lead with extracted data — the compact card surfaces only strengths[0].
	if (extracted.length > 0) {
		strengths.push(`Read from documents: ${extracted.join(", ")}`);
	}
	if (item.criteriaMet.length > 0) {
		strengths.push(
			`Meets ${item.criteriaMet.length} of ${totalCriteria} criteria: ${item.criteriaMet.join(", ")}`,
		);
	}
	if (item.documentVerificationFlag === "verified") {
		strengths.push("Documents passed authenticity checks");
	}

	const concerns: string[] = [];
	if (item.criteriaNotMet.length > 0) {
		concerns.push(`Does not meet: ${item.criteriaNotMet.join(", ")}`);
	}
	for (const indicator of fraudIndicators) concerns.push(humanizeFraud(indicator));
	if (item.duplicateDocumentFlag) {
		concerns.push("Duplicate of a document submitted by another applicant");
	}
	if (!documentsRead) concerns.push("No documents were submitted");

	// Wording separates document status (was it read?) from criteria fit (how
	// well does it match?) so a weak score never implies the OCR failed.
	let recommendation: string;
	if (item.documentVerificationFlag === "requires_manual_review") {
		recommendation =
			"Documents were read, but anomalies were detected — manual review recommended.";
	} else if (!documentsRead) {
		recommendation =
			"No documents were submitted, so this score reflects profile information only.";
	} else {
		const fit =
			item.score >= 80
				? "a strong match"
				: item.score >= 60
					? "a fair match"
					: "a weak match";
		recommendation = `Documents were read and analyzed; this applicant is ${fit} for the configured criteria.`;
	}

	// Confidence reflects document authenticity, not model certainty.
	const confidence =
		bestAuthScore != null
			? Math.max(0, Math.min(1, bestAuthScore / 100))
			: documentsRead
				? 0.5
				: 0.2;

	return { recommendation, strengths, concerns, confidence };
}

export class DeterministicRanker {
	async rank(
		scholarshipId: string,
		applicants: Applicant[],
		criterias: RankingCriteria[],
		scholarshipDescription?: string,
	): Promise<RankingResult> {
		const BACKEND_URL =
			import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

		// Authenticated via the session cookie (credentials: "include"), matching
		// the rest of the app — no Bearer token is held in JS.
		const response = await fetch(`${BACKEND_URL}/ranking/deterministic`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				applicants,
				criterias,
				scholarshipDescription,
				// Rank every applicant: the deterministic engine runs locally against
				// the self-hosted OCR service, so there is no per-applicant API cost.
				topN: applicants.length,
			}),
		});

		if (!response.ok) {
			const err = await response
				.json()
				.catch(() => ({ message: `Ranking failed (${response.status})` }));
			if (response.status === 503) {
				throw new Error(
					"The OCR ranking service is currently unavailable. Please try again shortly.",
				);
			}
			if (response.status === 429) {
				throw new Error("Too many ranking requests — please wait a moment and retry.");
			}
			throw new Error(err.message || `Ranking failed (${response.status})`);
		}

		const result = (await response.json()) as DeterministicResponse;
		const { rankedApplicants: backendRanked, summary } = result.data;

		const rankedApplicants: RankedApplicant[] = backendRanked.map((item) => ({
			rank: item.rank,
			applicant: item.applicant,
			score: item.score,
			criteriaMet: item.criteriaMet,
			criteriaNotMet: item.criteriaNotMet,
			aiInsights: buildInsights(item),
		}));

		const session: RankingSession = {
			id: crypto.randomUUID(),
			scholarshipId,
			mode: RankingMode.AI,
			criterias,
			timestamp: new Date(),
			totalApplicants: applicants.length,
		};

		return {
			session,
			rankedApplicants,
			summary: {
				averageScore: summary.averageScore,
				topScore: summary.topScore,
				bottomScore: summary.bottomScore,
				qualifiedCount: summary.qualifiedCount,
			},
		};
	}
}
