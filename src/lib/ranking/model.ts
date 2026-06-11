import z from "zod";
import type { Applicant } from "@/lib/scholarship/model";

export enum RankingMode {
	DecisionTree = "decision-tree",
	AI = "ai",
}

export enum AnalysisStatus {
	Analyzed = "analyzed",
	Failed = "failed",
}

export interface RankingCriteria {
	name: string;
	weight: number; // 0-100
	required: boolean;
}

export const criterionAssessmentSchema = z.object({
	name: z.string(),
	met: z.boolean(),
	note: z.string().default(""),
});
export type CriterionAssessment = z.output<typeof criterionAssessmentSchema>;

export interface RankedApplicant {
	applicant: Applicant;
	rank: number;
	score: number; // 0-100
	criteriaMet: string[];
	criteriaNotMet: string[];
	criteriaAssessments?: CriterionAssessment[];
	analysisFailed?: boolean; // AI analysis failed; score is not meaningful
	aiInsights?: {
		strengths: string[];
		concerns: string[];
		recommendation: string;
		confidence: number; // 0-1
	};
}

export interface RankingSession {
	id: string;
	scholarshipId: string;
	mode: RankingMode;
	criterias: RankingCriteria[];
	timestamp: Date;
	totalApplicants: number;
}

export interface RankingResult {
	session: RankingSession;
	rankedApplicants: RankedApplicant[];
	summary: {
		averageScore: number;
		topScore: number;
		bottomScore: number;
		qualifiedCount: number;
	};
}

// A row of the latest persisted ranking run, as returned by
// GET /ranking/:scholarshipId/latest
export const persistedRankingResultSchema = z.object({
	rankingResultId: z.string(),
	runId: z.string(),
	scholarshipApplicationId: z.string(),
	score: z.number().nullable(),
	recommendation: z.string().nullable(),
	strengths: z.array(z.string()).nullable(),
	concerns: z.array(z.string()).nullable(),
	criteria: z.array(criterionAssessmentSchema).nullable(),
	confidence: z.number().nullable(),
	status: z.enum(AnalysisStatus),
	createdAt: z.coerce.date(),
});
export type PersistedRankingResult = z.output<
	typeof persistedRankingResultSchema
>;
