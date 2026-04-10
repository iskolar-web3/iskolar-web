import type { Applicant } from "@/lib/scholarship/model";
import type {
	RankingCriteria,
	RankedApplicant,
	RankingResult,
	RankingSession,
} from "@/lib/ranking/model";
import { RankingMode } from "@/lib/ranking/model";
import { DecisionTreeRanker } from "./DecisionTreeRanker";
import { AIRanker } from "./AIRanker";

export class HybridRanker {
	static async rank(
		scholarshipId: string,
		applicants: Applicant[],
		criterias: RankingCriteria[],
		apiKey: string,
		scholarshipDescription?: string,
		algorithmicWeight: number = 0.5, // 0 = all AI, 1 = all algorithmic
	): Promise<RankingResult> {
		// Get both rankings
		const algorithmicResult = DecisionTreeRanker.rank(
			scholarshipId,
			applicants,
			criterias,
		);

		const aiRanker = new AIRanker(apiKey);
		const aiResult = await aiRanker.rank(
			scholarshipId,
			applicants,
			criterias,
			scholarshipDescription,
		);

		// Combine scores
		const rankedApplicants: RankedApplicant[] = applicants.map((applicant) => {
			const algoApplicant = algorithmicResult.rankedApplicants.find(
				(a) => a.applicant.id === applicant.id,
			);
			const aiApplicant = aiResult.rankedApplicants.find(
				(a) => a.applicant.id === applicant.id,
			);

			const algoScore = algoApplicant?.score || 0;
			const aiScore = aiApplicant?.score || 0;

			const combinedScore = Math.round(
				algoScore * algorithmicWeight + aiScore * (1 - algorithmicWeight),
			);

			// Merge criteria
			const criteriaMet = Array.from(
				new Set([
					...(algoApplicant?.criteriaMet || []),
					...(aiApplicant?.criteriaMet || []),
				]),
			);

			const criteriaNotMet = Array.from(
				new Set([
					...(algoApplicant?.criteriaNotMet || []),
					...(aiApplicant?.criteriaNotMet || []),
				]),
			).filter((c) => !criteriaMet.includes(c));

			return {
				applicant,
				rank: 0,
				score: combinedScore,
				criteriaMet,
				criteriaNotMet,
				aiInsights: aiApplicant?.aiInsights,
			};
		});

		// Sort by combined score
		rankedApplicants.sort((a, b) => b.score - a.score);

		// Assign ranks
		rankedApplicants.forEach((applicant, index) => {
			applicant.rank = index + 1;
		});

		const session: RankingSession = {
			id: crypto.randomUUID(),
			scholarshipId,
			mode: RankingMode.Hybrid,
			criterias,
			timestamp: new Date(),
			totalApplicants: applicants.length,
		};

		const scores = rankedApplicants.map((a) => a.score);
		const summary = {
			averageScore: Math.round(
				scores.reduce((sum, s) => sum + s, 0) / scores.length,
			),
			topScore: Math.max(...scores),
			bottomScore: Math.min(...scores),
			qualifiedCount: rankedApplicants.filter((a) => a.score >= 60).length,
		};

		return {
			session,
			rankedApplicants,
			summary,
		};
	}
}
