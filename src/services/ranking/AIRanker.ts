import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Applicant } from "@/lib/scholarship/model";
import type {
	RankingCriteria,
	RankedApplicant,
	RankingResult,
	RankingSession,
} from "@/lib/ranking/model";
import { RankingMode } from "@/lib/ranking/model";

export class AIRanker {
	private genAI: GoogleGenerativeAI;

	constructor(apiKey: string) {
		this.genAI = new GoogleGenerativeAI(apiKey);
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

	private async analyzeApplicant(
		model: any,
		applicant: Applicant,
		criterias: RankingCriteria[],
		scholarshipDescription?: string,
	): Promise<RankedApplicant> {
		const student = applicant.student;

		// Extract file information and text from form field answers
		const submittedFiles: Array<{ url: string; extractedText?: string }> = [];
		if (applicant.formFieldAnswers) {
			for (const answer of applicant.formFieldAnswers) {
				if (answer.value) {
					// Handle different value formats
					if (typeof answer.value === "string" && answer.value.startsWith("http")) {
						submittedFiles.push({ url: answer.value });
					} else if (typeof answer.value === "object" && answer.value !== null) {
						// Handle object format: { url: string, extractedText?: string }
						const docData = answer.value as any;
						if (docData.url) {
							submittedFiles.push({
								url: docData.url,
								extractedText: docData.extractedText,
							});
						}
					} else if (Array.isArray(answer.value)) {
						for (const val of answer.value) {
							if (typeof val === "string" && val.startsWith("http")) {
								submittedFiles.push({ url: val });
							} else if (typeof val === "object" && val !== null) {
								const docData = val as any;
								if (docData.url) {
									submittedFiles.push({
										url: docData.url,
										extractedText: docData.extractedText,
									});
								}
							}
						}
					}
				}
			}
		}

		// Build detailed form responses including extracted document text
		const formResponses = applicant.formFieldAnswers?.map((answer) => {
			let value = "No response";
			if (answer.value) {
				if (typeof answer.value === "string") {
					value = answer.value.startsWith("http") ? "[File uploaded]" : answer.value;
				} else if (typeof answer.value === "object" && answer.value !== null) {
					const docData = answer.value as any;
					if (docData.url) {
						value = `[Document uploaded: ${docData.url}]`;
						if (docData.extractedText) {
							value += `\n    Extracted Text: ${docData.extractedText.substring(0, 500)}...`;
						}
					}
				} else if (Array.isArray(answer.value)) {
					value = answer.value.map((v: any) => {
						if (typeof v === "string" && v.startsWith("http")) {
							return "[File uploaded]";
						} else if (typeof v === "object" && v !== null && v.url) {
							return `[Document: ${v.url}]`;
						}
						return String(v);
					}).join(", ");
				} else {
					value = String(answer.value);
				}
			}
			return `  - ${answer.formFieldId}: ${value}`;
		}).join("\n") || "  No responses submitted";

		const prompt = `You are an expert scholarship evaluator with years of experience in student assessment. Your role is to provide fair, thorough, and evidence-based evaluations.

SCHOLARSHIP CONTEXT:
${scholarshipDescription ? `Description: ${scholarshipDescription}` : "No description provided"}

EVALUATION CRITERIA (in order of importance):
${criterias.map((c, i) => `${i + 1}. ${c.name} (Weight: ${c.weight}% - ${c.weight >= 40 ? "CRITICAL" : c.weight >= 25 ? "Important" : "Standard"})`).join("\n")}

APPLICANT INFORMATION:
Name: ${student.firstName} ${student.lastName}
Email: ${student.email}
School: ${student.schoolName || "❌ Not provided"}
Education Level: ${student.educationLevel?.name || "❌ Not provided"}
Gender: ${student.gender?.name || "Not specified"}
Application Date: ${new Date(applicant.createdAt).toLocaleDateString()}

APPLICATION RESPONSES:
${formResponses}

DOCUMENTS: ${submittedFiles.length > 0 ? `✓ ${submittedFiles.length} file(s) submitted` : "❌ No documents submitted"}

${submittedFiles.length > 0 && submittedFiles.some(f => f.extractedText) ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 EXTRACTED DOCUMENT TEXT (PRIMARY EVIDENCE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${submittedFiles.filter(f => f.extractedText).map((f, i) => `
Document ${i + 1}: ${f.url.split('/').pop()}
────────────────────────────────────────
${f.extractedText}
────────────────────────────────────────
`).join('\n')}

DOCUMENT VERIFICATION CHECKLIST:
✓ Does the student name in documents match "${student.firstName} ${student.lastName}"?
✓ What year level is stated? (Look for "Year Level:", "Second Year", "Third Year", etc.)
✓ What school/university is mentioned?
✓ Is enrollment status confirmed? (Look for enrollment dates, semester info)
✓ Are there any red flags or inconsistencies?

` : `
⚠️ NO DOCUMENT TEXT AVAILABLE
- Cannot verify claims through documents
- Must rely on profile information only
- This significantly reduces confidence in evaluation
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVALUATION INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 - CRITERIA MATCHING (Be strict and evidence-based):
${criterias.map((c, i) => `
${i + 1}. "${c.name}" (${c.weight}% weight)
   - Check if applicant clearly meets this requirement
   - Use DOCUMENT TEXT as primary evidence when available
   - If documents contradict profile, trust the documents
   - Mark as MET only if you have clear evidence
`).join('\n')}

STEP 2 - SCORING GUIDELINES:
- Start with base score of 50
- For each criterion MET: Add (criterion weight × 0.8) to score
- For each criterion NOT MET: Subtract (criterion weight × 0.3) from score
- Bonus points (+5-10) for exceptional documentation or profile completeness
- Penalty points (-5-10) for missing critical information or inconsistencies
- Final score must be 0-100

STEP 3 - PROVIDE CLEAR, ACTIONABLE FEEDBACK:

STRENGTHS (What's good about this applicant):
- Write in simple, positive language
- Be specific about what they did well
- Example: "Submitted a valid Certificate of Registration showing they're in 3rd year"
- Example: "Currently enrolled at a reputable university"
- Avoid technical jargon

CONCERNS (What's missing or problematic):
- Write in clear, constructive language
- Be specific about what's wrong or missing
- Example: "No proof of full-time enrollment status"
- Example: "Documents show 2nd year, but scholarship requires 3rd year"
- Suggest what would fix the issue if possible

RECOMMENDATION (Your final verdict):
- Start with clear action: "Approve", "Shortlist for review", or "Deny"
- Give ONE clear reason why
- Write like you're talking to a friend, not writing a report
- Example: "Approve - This student meets all requirements and submitted valid documents proving 3rd year enrollment."
- Example: "Deny - Student is only in 2nd year, but scholarship specifically requires 3rd year students."

CONFIDENCE (How sure are you):
- 0.9-1.0: You have documents and everything checks out
- 0.7-0.8: Profile looks good but some documents are missing
- 0.5-0.6: Limited information, hard to verify claims
- 0.3-0.4: Missing critical information or documents
- 0.0-0.2: Almost no information to evaluate

WRITING STYLE RULES:
✓ Use simple words (avoid: "tertiary", "verification", "compliance")
✓ Use everyday language (prefer: "college", "proof", "meets requirements")
✓ Be direct and specific
✓ Write complete sentences
✓ Avoid abbreviations unless common (OK: "COR", "GPA")
✗ Don't use technical terms
✗ Don't be vague ("may not meet", "possibly")
✗ Don't write long paragraphs

IMPORTANT RULES:
1. Year level criteria: ONLY use document text, not profile data
2. Document requirements: Check both submission AND content validity
3. Be fair but strict - don't give benefit of doubt without evidence
4. If documents are missing for required criteria, mark as NOT MET
5. Provide actionable feedback that helps sponsors make decisions

OUTPUT FORMAT (JSON only, no markdown):
{
  "score": <0-100, calculated using guidelines above>,
  "criteriaMet": [<only criteria with clear evidence>],
  "criteriaNotMet": [<criteria lacking evidence or clearly not met>],
  "strengths": [
    "<Simple, specific strength in everyday language>",
    "<Another clear strength with evidence>"
  ],
  "concerns": [
    "<Clear concern or missing item in simple words>",
    "<Another specific issue that needs attention>"
  ],
  "recommendation": "<Action (Approve/Shortlist/Deny) - One clear reason in plain English>",
  "confidence": <0-1, based on information quality>
}

EXAMPLE GOOD OUTPUT:
{
  "score": 85,
  "criteriaMet": ["Must be enrolled in 3rd year tertiary education", "Must have submitted Certificate of Registration"],
  "criteriaNotMet": ["Must be a full-time student"],
  "strengths": [
    "Submitted a valid Certificate of Registration that clearly shows 3rd year enrollment",
    "Currently studying at University of Makati, a recognized institution"
  ],
  "concerns": [
    "The document doesn't clearly state if they're full-time or part-time",
    "No transcript or grades provided to verify academic standing"
  ],
  "recommendation": "Shortlist for review - Student meets most requirements but needs to clarify full-time enrollment status",
  "confidence": 0.75
}`;

		try {
			const result = await model.generateContent(prompt, {
				generationConfig: {
					temperature: 0.4, // Slightly higher for more natural language
					maxOutputTokens: 1000, // More tokens for detailed, clear explanations
				},
			});
			const response = await result.response;
			const text = response.text();

			// Extract JSON from response
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error("No JSON found in AI response");
			}

			const analysis = JSON.parse(jsonMatch[0]);

			return {
				applicant,
				rank: 0,
				score: Math.min(100, Math.max(0, analysis.score)),
				criteriaMet: analysis.criteriaMet || [],
				criteriaNotMet: analysis.criteriaNotMet || [],
				aiInsights: {
					strengths: analysis.strengths || [],
					concerns: analysis.concerns || [],
					recommendation: analysis.recommendation || "No recommendation provided",
					confidence: Math.min(1, Math.max(0, analysis.confidence || 0.5)),
				},
			};
		} catch (error) {
			console.error("AI analysis error:", error);
			// Return fallback instead of throwing
			return this.getFallbackRanking(applicant, criterias);
		}
	}

	private getFallbackRanking(
		applicant: Applicant,
		criterias: RankingCriteria[],
	): RankedApplicant {
		const student = applicant.student;
		
		// Simple rule-based scoring
		let score = 50; // Base score
		const criteriaMet: string[] = [];
		const criteriaNotMet: string[] = [];

		for (const criteria of criterias) {
			const criteriaLower = criteria.name.toLowerCase();
			let met = false;

			// Check tertiary education
			if (criteriaLower.includes("tertiary") || criteriaLower.includes("college")) {
				met = student.educationLevel?.code === "tertiary_education";
			}
			// Check enrollment
			else if (criteriaLower.includes("full-time") || criteriaLower.includes("enrolled")) {
				met = !!(student.schoolName && student.educationLevel);
			}
			// Check documents
			else if (criteriaLower.includes("document") || criteriaLower.includes("certificate")) {
				met = !!(applicant.formFieldAnswers && applicant.formFieldAnswers.length > 0);
			}
			// Default check
			else {
				met = !!(student.schoolName && student.educationLevel);
			}

			if (met) {
				criteriaMet.push(criteria.name);
				score += criteria.weight * 0.5; // Add half the weight to score
			} else {
				criteriaNotMet.push(criteria.name);
			}
		}

		return {
			applicant,
			rank: 0,
			score: Math.min(100, Math.round(score)),
			criteriaMet,
			criteriaNotMet,
			aiInsights: {
				strengths: criteriaMet.length > 0 ? ["Meets some basic requirements"] : [],
				concerns: ["AI analysis unavailable - using basic evaluation"],
				recommendation: "Manual review recommended due to AI service unavailability",
				confidence: 0.3,
			},
		};
	}
}
