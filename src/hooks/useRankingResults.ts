import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getLatestRankingResultsQuery } from "@/lib/ranking/api";
import {
	AnalysisStatus,
	type RankedApplicant,
	RankingMode,
	type RankingResult,
} from "@/lib/ranking/model";
import type { Applicant } from "@/lib/scholarship/model";

// Rebuilds a RankingResult from the latest persisted ranking run so results
// survive page refreshes. Returns null while loading or when no run exists.
export function usePersistedRankingResult(
	scholarshipId: string,
	applicants: Applicant[],
	enabled: boolean,
): RankingResult | null {
	const { data: rows } = useQuery({
		...getLatestRankingResultsQuery(scholarshipId),
		enabled,
	});

	return useMemo(() => {
		if (!rows || rows.length === 0 || applicants.length === 0) {
			return null;
		}

		const applicantsById = new Map(applicants.map((a) => [a.id, a]));

		const rankedApplicants: RankedApplicant[] = [];
		for (const row of rows) {
			// Skip results whose application no longer exists or is filtered out
			const applicant = applicantsById.get(row.scholarshipApplicationId);
			if (!applicant) continue;

			const assessments = row.criteria ?? [];
			const analysisFailed = row.status === AnalysisStatus.Failed;

			rankedApplicants.push({
				rank: rankedApplicants.length + 1,
				applicant,
				score: row.score ?? 0,
				analysisFailed,
				criteriaMet: assessments.filter((a) => a.met).map((a) => a.name),
				criteriaNotMet: assessments.filter((a) => !a.met).map((a) => a.name),
				criteriaAssessments: assessments,
				aiInsights: analysisFailed
					? undefined
					: {
							recommendation: row.recommendation ?? "",
							strengths: row.strengths ?? [],
							concerns: row.concerns ?? [],
							confidence: row.confidence ?? 0,
						},
			});
		}

		if (rankedApplicants.length === 0) {
			return null;
		}

		const scored = rankedApplicants.filter((a) => !a.analysisFailed);
		const scores = scored.map((a) => a.score);

		return {
			session: {
				id: rows[0].runId,
				scholarshipId,
				mode: RankingMode.AI,
				criterias: [],
				timestamp: rows[0].createdAt,
				totalApplicants: rankedApplicants.length,
			},
			rankedApplicants,
			summary: {
				averageScore:
					scores.length > 0
						? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
						: 0,
				topScore: scores.length > 0 ? Math.max(...scores) : 0,
				bottomScore: scores.length > 0 ? Math.min(...scores) : 0,
				qualifiedCount: scored.filter((a) => a.score >= 60).length,
			},
		};
	}, [rows, applicants, scholarshipId]);
}
