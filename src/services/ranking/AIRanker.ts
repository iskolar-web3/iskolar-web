import { BACKEND_URL } from "@/lib/api";
import type {
	CriterionAssessment,
	RankedApplicant,
	RankingCriteria,
	RankingResult,
	RankingSession,
} from "@/lib/ranking/model";
import { AnalysisStatus, RankingMode } from "@/lib/ranking/model";
import type { Applicant } from "@/lib/scholarship/model";
import { DecisionTreeRanker } from "./DecisionTreeRanker";

type BackendAIInsights = {
	score: number;
	recommendation: string;
	strengths: string[];
	concerns: string[];
	confidence: number;
	criteria: CriterionAssessment[];
};

type BackendRankedApplicant = {
	applicant: Applicant;
	aiInsights: BackendAIInsights | null;
	analysisStatus: AnalysisStatus;
	documentsWithText: Applicant["formFieldAnswers"];
};

export class AIRanker {
	async rank(
		scholarshipId: string,
		applicants: Applicant[],
		criterias: RankingCriteria[],
		scholarshipDescription?: string,
	): Promise<RankingResult> {
		return this.rankTopCandidates(
			scholarshipId,
			applicants,
			criterias,
			scholarshipDescription,
		);
	}

	async rankTopCandidates(
		scholarshipId: string,
		applicants: Applicant[],
		criterias: RankingCriteria[],
		scholarshipDescription?: string,
	): Promise<RankingResult> {
		try {
			const response = await fetch(`${BACKEND_URL}/ranking/ai`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					scholarshipId,
					applicants,
					criterias,
					scholarshipDescription,
					topN: applicants.length, // Server clamps to its free tier limit
				}),
			});

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Unknown error" }));
				console.error("Backend error response:", errorData);

				if (response.status === 503 && errorData.error === "QUOTA_EXCEEDED") {
					throw new Error(
						"AI_QUOTA_EXCEEDED: AI ranking is temporarily unavailable due to quota limits. Please try again later or use Basic Ranking.",
					);
				}

				if (errorData.error === "AI_UNAVAILABLE") {
					throw new Error(
						"AI_UNAVAILABLE: AI ranking failed due to technical issues. Please try Basic Ranking instead.",
					);
				}

				throw new Error(
					`Backend ranking failed: ${response.status} ${response.statusText}`,
				);
			}

			const result = await response.json();
			const {
				rankedApplicants: backendRanked,
				remainingApplicants,
				quotaExceeded,
			} = result.data as {
				rankedApplicants: BackendRankedApplicant[];
				remainingApplicants: Applicant[];
				quotaExceeded: boolean;
			};

			if (quotaExceeded) {
				console.warn(
					"AI quota was hit during ranking; some applicants were not analyzed",
				);
			}

			// AI-analyzed applicants come pre-sorted by score (failed analyses last)
			const rankedApplicants: RankedApplicant[] = backendRanked.map(
				(item, index) => {
					const { applicant, aiInsights, analysisStatus, documentsWithText } =
						item;
					const assessments = aiInsights?.criteria ?? [];

					return {
						rank: index + 1,
						applicant: {
							...applicant,
							formFieldAnswers: documentsWithText, // Use documents with extracted text
						},
						score: aiInsights ? Math.round(aiInsights.score) : 0,
						analysisFailed: analysisStatus === AnalysisStatus.Failed,
						criteriaMet: assessments.filter((a) => a.met).map((a) => a.name),
						criteriaNotMet: assessments
							.filter((a) => !a.met)
							.map((a) => a.name),
						criteriaAssessments: assessments,
						aiInsights: aiInsights
							? {
									recommendation: aiInsights.recommendation,
									strengths: aiInsights.strengths,
									concerns: aiInsights.concerns,
									confidence: aiInsights.confidence,
								}
							: undefined,
					};
				},
			);

			// Applicants beyond the AI limit are ranked algorithmically below them
			if (remainingApplicants.length > 0) {
				const dtRanked = DecisionTreeRanker.rank(
					scholarshipId,
					remainingApplicants,
					criterias,
				).rankedApplicants;
				for (const ranked of dtRanked) {
					rankedApplicants.push({
						...ranked,
						rank: rankedApplicants.length + 1,
					});
				}
			}

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
				summary: summarize(rankedApplicants),
			};
		} catch (error) {
			console.error("Backend ranking failed:", error);

			if (error instanceof Error) {
				if (error.message.includes("AI_QUOTA_EXCEEDED")) {
					// For quota errors, throw the error up to be handled by the UI
					throw new Error(
						"AI ranking is temporarily unavailable due to quota limits. Please try again later or use Basic Ranking.",
					);
				}

				if (error.message.includes("AI_UNAVAILABLE")) {
					throw new Error(
						"AI ranking failed due to technical issues. Please try Basic Ranking instead.",
					);
				}
			}

			// For other errors, fall back to algorithmic ranking
			console.log("Using fallback ranking due to technical error");
			return DecisionTreeRanker.rank(scholarshipId, applicants, criterias);
		}
	}
}

function summarize(
	rankedApplicants: RankedApplicant[],
): RankingResult["summary"] {
	// Failed analyses carry no meaningful score, so they are excluded
	const scored = rankedApplicants.filter((a) => !a.analysisFailed);
	const scores = scored.map((a) => a.score);

	return {
		averageScore:
			scores.length > 0
				? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
				: 0,
		topScore: scores.length > 0 ? Math.max(...scores) : 0,
		bottomScore: scores.length > 0 ? Math.min(...scores) : 0,
		qualifiedCount: scored.filter((a) => a.score >= 60).length,
	};
}
