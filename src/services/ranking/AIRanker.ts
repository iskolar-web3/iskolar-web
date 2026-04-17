import type { Applicant } from "@/lib/scholarship/model";
import type {
	RankingCriteria,
	RankedApplicant,
	RankingResult,
	RankingSession,
} from "@/lib/ranking/model";
import { RankingMode } from "@/lib/ranking/model";

export class AIRanker {
	constructor(_apiKey: string) {
		// API key is passed but not used in current backend-based implementation
		// Kept for backwards compatibility
	}

	async rank(
		scholarshipId: string,
		applicants: Applicant[],
		criterias: RankingCriteria[],
		scholarshipDescription?: string,
		token?: string,
	): Promise<RankingResult> {
		return this.rankTopCandidates(
			scholarshipId,
			applicants,
			criterias,
			scholarshipDescription,
			token,
		);
	}

	async rankTopCandidates(
		scholarshipId: string,
		applicants: Applicant[],
		criterias: RankingCriteria[],
		scholarshipDescription?: string,
		token?: string,
	): Promise<RankingResult> {
		// Call backend API for AI ranking with on-demand OCR
		const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
		
		if (!token) {
			console.error('No authentication token provided for AI ranking');
			return this.fallbackRanking(scholarshipId, applicants, criterias);
		}
		
		console.log('Starting AI ranking with backend:', BACKEND_URL);
		console.log('Token available:', !!token);
		console.log('Number of applicants:', applicants.length);
		
		try {
			const response = await fetch(`${BACKEND_URL}/ranking/ai`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				credentials: 'include',
				body: JSON.stringify({
					applicants,
					criterias,
					scholarshipDescription,
					topN: applicants.length // Process all for now
				})
			});

			console.log('Backend response status:', response.status);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
				console.error('Backend error response:', errorData);
				
				// Handle specific AI unavailable errors
				if (response.status === 503 && errorData.error === 'QUOTA_EXCEEDED') {
					throw new Error('AI_QUOTA_EXCEEDED: AI ranking is temporarily unavailable due to quota limits. Please try again later or use Basic Ranking.');
				}
				
				if (errorData.error === 'AI_UNAVAILABLE') {
					throw new Error('AI_UNAVAILABLE: AI ranking failed due to technical issues. Please try Basic Ranking instead.');
				}
				
				throw new Error(`Backend ranking failed: ${response.status} ${response.statusText}`);
			}

			const result = await response.json();
			console.log('Backend ranking result:', result);
			console.log('Ranked applicants from backend:', result.data?.rankedApplicants);
			console.log('First applicant AI insights:', result.data?.rankedApplicants?.[0]?.aiInsights);
			const { rankedApplicants: backendRanked, remainingApplicants } = result.data;

			// Convert backend response to RankedApplicant format
			const rankedApplicants: RankedApplicant[] = backendRanked.map((item: any, index: number) => {
				const { applicant, aiInsights, documentsWithText } = item;
				
				console.log(`Processing applicant ${index + 1}:`, {
					hasAiInsights: !!aiInsights,
					aiInsights,
					hasDocuments: !!documentsWithText,
					documentCount: documentsWithText?.length
				});
				
				return {
					rank: index + 1,
					applicant: {
						...applicant,
						formFieldAnswers: documentsWithText // Use documents with extracted text
					},
					score: aiInsights?.score || 50,
					criteriaMet: this.getCriteriaMet(applicant, criterias, aiInsights),
					criteriaNotMet: this.getCriteriaNotMet(applicant, criterias, aiInsights),
					aiInsights: aiInsights ? {
						recommendation: aiInsights.recommendation,
						strengths: aiInsights.strengths || [],
						concerns: aiInsights.concerns || [],
						confidence: aiInsights.confidence || 0.5
					} : undefined
				};
			});

			// Add remaining applicants without AI insights
			remainingApplicants.forEach((applicant: Applicant, index: number) => {
				rankedApplicants.push({
					rank: backendRanked.length + index + 1,
					applicant,
					score: this.calculateBasicScore(applicant, criterias),
					criteriaMet: this.getCriteriaMet(applicant, criterias),
					criteriaNotMet: this.getCriteriaNotMet(applicant, criterias),
				});
			});

			const session: RankingSession = {
				id: crypto.randomUUID(),
				scholarshipId,
				mode: RankingMode.AI,
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

		} catch (error) {
			console.error('Backend ranking failed, using fallback:', error);
			
			// Check if it's an AI unavailable error
			if (error instanceof Error) {
				if (error.message.includes('AI_QUOTA_EXCEEDED')) {
					// For quota errors, throw the error up to be handled by the UI
					throw new Error('AI ranking is temporarily unavailable due to quota limits. Please try again later or use Basic Ranking.');
				}
				
				if (error.message.includes('AI_UNAVAILABLE')) {
					throw new Error('AI ranking failed due to technical issues. Please try Basic Ranking instead.');
				}
			}
			
			// For other errors, fallback to basic ranking
			console.log('Using fallback ranking due to technical error');
			return this.fallbackRanking(scholarshipId, applicants, criterias);
		}
	}

	private calculateBasicScore(applicant: Applicant, criterias: RankingCriteria[]): number {
		const met = this.getCriteriaMet(applicant, criterias).length;
		const total = criterias.length;
		return Math.round((met / total) * 100);
	}

	private getCriteriaMet(applicant: Applicant, criterias: RankingCriteria[], aiInsights?: any): string[] {
		const criteriaMet: string[] = [];
		
		// If we have AI insights, use them to determine criteria matching
		if (aiInsights && aiInsights.strengths) {
			for (const criteria of criterias) {
				const criteriaLower = criteria.name.toLowerCase();
				
				// Check if AI mentions this criteria as a strength or in positive context
				const isPositivelyMentioned = aiInsights.strengths.some((strength: string) => 
					strength.toLowerCase().includes(criteriaLower.split(' ').slice(-2).join(' ')) ||
					this.checkCriteriaMatch(criteriaLower, strength.toLowerCase())
				);
				
				// Also check if the recommendation mentions meeting this criteria
				const isInRecommendation = aiInsights.recommendation && 
					this.checkCriteriaMatch(criteriaLower, aiInsights.recommendation.toLowerCase());
				
				if (isPositivelyMentioned || isInRecommendation) {
					criteriaMet.push(criteria.name);
				}
			}
		}
		
		// Fallback to basic evaluation if no AI insights
		if (criteriaMet.length === 0) {
			return this.evaluateBasicCriteria(applicant, criterias, true);
		}
		
		return criteriaMet;
	}

	private getCriteriaNotMet(applicant: Applicant, criterias: RankingCriteria[], aiInsights?: any): string[] {
		const criteriaMet = this.getCriteriaMet(applicant, criterias, aiInsights);
		return criterias.filter(c => !criteriaMet.includes(c.name)).map(c => c.name);
	}
	
	private checkCriteriaMatch(criteria: string, text: string): boolean {
		// Check for key terms in criteria
		if (criteria.includes('full-time') || criteria.includes('full time')) {
			return text.includes('full-time') || text.includes('full time') || text.includes('21.0 units');
		}
		if (criteria.includes('3rd year') || criteria.includes('third year')) {
			return text.includes('third-year') || text.includes('third year') || text.includes('3rd year');
		}
		if (criteria.includes('certificate') && criteria.includes('registration')) {
			return text.includes('certificate') || text.includes('registration') || text.includes('cor') || text.includes('document');
		}
		
		// Generic keyword matching
		const criteriaWords = criteria.split(' ').filter(word => word.length > 3);
		return criteriaWords.some(word => text.includes(word.toLowerCase()));
	}
	
	private evaluateBasicCriteria(applicant: Applicant, criterias: RankingCriteria[], returnMet: boolean): string[] {
		// Basic fallback evaluation
		const results: string[] = [];
		
		for (const criteria of criterias) {
			const criteriaLower = criteria.name.toLowerCase();
			let isMet = false;
			
			// Basic checks based on criteria content
			if (criteriaLower.includes('full-time') || criteriaLower.includes('full time')) {
				// Assume met if no specific data available
				isMet = true;
			}
			if (criteriaLower.includes('3rd year') || criteriaLower.includes('third year')) {
				// This would need document analysis
				isMet = false;
			}
			if (criteriaLower.includes('certificate') && criteriaLower.includes('registration')) {
				// Check if documents are submitted
				isMet = applicant.formFieldAnswers?.some(answer => 
					typeof answer.value === 'object' && answer.value?.url
				) || false;
			}
			
			if ((returnMet && isMet) || (!returnMet && !isMet)) {
				results.push(criteria.name);
			}
		}
		
		return results;
	}

	private fallbackRanking(
		scholarshipId: string,
		applicants: Applicant[],
		criterias: RankingCriteria[]
	): RankingResult {
		const rankedApplicants: RankedApplicant[] = applicants.map((applicant, index) => ({
			rank: index + 1,
			applicant,
			score: this.calculateBasicScore(applicant, criterias),
			criteriaMet: this.getCriteriaMet(applicant, criterias),
			criteriaNotMet: this.getCriteriaNotMet(applicant, criterias),
		}));

		rankedApplicants.sort((a, b) => b.score - a.score);
		rankedApplicants.forEach((a, i) => a.rank = i + 1);

		const session: RankingSession = {
			id: crypto.randomUUID(),
			scholarshipId,
			mode: RankingMode.AI,
			criterias,
			timestamp: new Date(),
			totalApplicants: applicants.length,
		};

		const scores = rankedApplicants.map((a) => a.score);
		return {
			session,
			rankedApplicants,
			summary: {
				averageScore: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
				topScore: Math.max(...scores),
				bottomScore: Math.min(...scores),
				qualifiedCount: rankedApplicants.filter((a) => a.score >= 60).length,
			},
		};
	}

}
