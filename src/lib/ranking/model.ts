import type { Applicant } from "@/lib/scholarship/model";

export enum RankingMode {
	DecisionTree = "decision-tree",
	AI = "ai",
}

export interface RankingCriteria {
	name: string;
	weight: number; // 0-100
	required: boolean;
}

export interface RankedApplicant {
	applicant: Applicant;
	rank: number;
	score: number; // 0-100
	criteriaMet: string[];
	criteriaNotMet: string[];
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
