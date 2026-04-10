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
		const model = this.genAI.getGenerativeModel({ 
			model: "gemini-2.5-flash-lite",
		});

		const rankedApplicants: RankedApplicant[] = [];

		// Process each applicant with immediate fallback on 503
		for (const applicant of applicants) {
			try {
				const result = await this.analyzeApplicant(
					model,
					applicant,
					criterias,
					scholarshipDescription,
				);
				rankedApplicants.push(result);
				
				// Delay between requests
				await new Promise(resolve => setTimeout(resolve, 2000));
			} catch (error: any) {
				// On any error, use fallback immediately
				console.warn(`AI analysis failed for ${applicant.student.firstName}, using fallback`);
				rankedApplicants.push(this.getFallbackRanking(applicant, criterias));
			}
		}

		// Sort by score descending
		rankedApplicants.sort((a, b) => b.score - a.score);

		// Assign ranks
		rankedApplicants.forEach((applicant, index) => {
			applicant.rank = index + 1;
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

		const prompt = `You are an expert scholarship evaluator. Analyze this applicant and provide a structured assessment.

Scholarship Description: ${scholarshipDescription || "Not provided"}

Evaluation Criteria:
${criterias.map((c) => `- ${c.name} (Weight: ${c.weight}%)`).join("\n")}

Applicant Profile:
- Name: ${student.firstName} ${student.lastName}
- Email: ${student.email}
- School: ${student.schoolName || "Not provided"}
- Education Level: ${student.educationLevel?.name || "Not provided"}
- Gender: ${student.gender?.name || "Not provided"}
- Application Date: ${applicant.createdAt}

Application Form Responses:
${formResponses}

Documents Submitted: ${submittedFiles.length > 0 ? `${submittedFiles.length} file(s) uploaded` : "No documents submitted"}

${submittedFiles.length > 0 && submittedFiles.some(f => f.extractedText) ? `
IMPORTANT - EXTRACTED DOCUMENT TEXT:
${submittedFiles.filter(f => f.extractedText).map((f, i) => `
Document ${i + 1}:
${f.extractedText}
`).join('\n')}

Please carefully read the extracted text above to verify:
1. Student name matches the applicant
2. Year level stated in the document
3. School/university name
4. Enrollment status
5. Any other relevant information
` : ""}

EVALUATION INSTRUCTIONS:
1. Carefully match the applicant's profile against EACH criterion listed above
2. For year level criteria: Check the EXTRACTED TEXT from documents for "Year Level: Second Year", "Year Level: Third Year", etc.
3. For education-related criteria: Check if their education level matches (tertiary/secondary)
4. For enrollment criteria: Verify they have a school name and education level
5. For document criteria: Check if they submitted the required files AND if the content is valid
6. Consider the application completeness and profile quality
7. Provide specific, actionable feedback

Based on the criteria and applicant information, evaluate:
- How well does this applicant meet each criterion?
- What are their key strengths relative to the scholarship requirements?
- What concerns or gaps exist in their application?
- Overall recommendation and confidence level

Provide your analysis in this exact JSON format (no markdown, just raw JSON):
{
  "score": <number 0-100 based on criteria match>,
  "criteriaMet": [<list only criteria names that are clearly met>],
  "criteriaNotMet": [<list only criteria names that are NOT met>],
  "strengths": [<2-3 specific strengths related to scholarship criteria>],
  "concerns": [<2-3 specific concerns or missing requirements>],
  "recommendation": "<1-2 sentence recommendation: approve, shortlist, or deny with reason>",
  "confidence": <number 0-1 based on information completeness>
}`;

		try {
			const result = await model.generateContent(prompt);
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
