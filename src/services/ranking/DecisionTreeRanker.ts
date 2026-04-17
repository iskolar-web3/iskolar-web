import type { Applicant } from "@/lib/scholarship/model";
import type {
	RankingCriteria,
	RankedApplicant,
	RankingResult,
	RankingSession,
} from "@/lib/ranking/model";
import { RankingMode } from "@/lib/ranking/model";

export class DecisionTreeRanker {
	static rank(
		scholarshipId: string,
		applicants: Applicant[],
		criterias: RankingCriteria[],
	): RankingResult {
		const rankedApplicants: RankedApplicant[] = applicants.map((applicant) => {
			const criteriaMet: string[] = [];
			const criteriaNotMet: string[] = [];
			let score = 0;

			// Evaluate each criteria
			for (const criteria of criterias) {
				const isMet = this.evaluateCriteria(applicant, criteria);
				if (isMet) {
					criteriaMet.push(criteria.name);
					score += criteria.weight;
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

	private static evaluateCriteria(
		applicant: Applicant,
		criteria: RankingCriteria,
	): boolean {
		const student = applicant.student;
		const criteriaLower = criteria.name.toLowerCase();

		// Check education level
		if (criteriaLower.includes("tertiary") || criteriaLower.includes("college")) {
			return student.educationLevel?.code === "tertiary_education";
		}

		if (criteriaLower.includes("secondary") || criteriaLower.includes("high school")) {
			return student.educationLevel?.code === "secondary_education";
		}

		// Check specific year levels
		if (criteriaLower.includes("3rd year") || criteriaLower.includes("third year")) {
			// Would need to check document metadata for actual year level
			// For now, check if they're in tertiary and have documents
			return (
				student.educationLevel?.code === "tertiary_education" &&
				applicant.formFieldAnswers &&
				applicant.formFieldAnswers.length > 0
			);
		}

		if (criteriaLower.includes("2nd year") || criteriaLower.includes("second year")) {
			return (
				student.educationLevel?.code === "tertiary_education" &&
				applicant.formFieldAnswers &&
				applicant.formFieldAnswers.length > 0
			);
		}

		// Check enrollment status
		if (criteriaLower.includes("full-time") || criteriaLower.includes("enrolled")) {
			return !!student.schoolName && !!student.educationLevel;
		}

		// Check documents
		if (criteriaLower.includes("document") || criteriaLower.includes("certificate")) {
			return (
				applicant.formFieldAnswers &&
				applicant.formFieldAnswers.length > 0 &&
				applicant.formFieldAnswers.some((answer) => answer.value !== null)
			);
		}

		// Default: consider met if student has complete profile
		return !!(
			student.firstName &&
			student.lastName &&
			student.email &&
			student.schoolName
		);
	}
}
