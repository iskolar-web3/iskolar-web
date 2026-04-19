import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DocumentAnalysisResult {
	shouldApprove: boolean;
	confidence: number;
	reasoning: string;
	extractedInfo: Record<string, string>;
	criteriaMatches: {
		criterion: string;
		matched: boolean;
		evidence: string;
	}[];
}

export class DocumentAnalyzer {
	private genAI: GoogleGenerativeAI;

	constructor(apiKey: string) {
		this.genAI = new GoogleGenerativeAI(apiKey);
	}

	/**
	 * Analyze a document against scholarship criteria
	 * Note: This is a placeholder. In production, you would:
	 * 1. First extract text from the document (backend OCR/PDF parser)
	 * 2. Then analyze the extracted text
	 */
	async analyzeDocument(
		extractedText: string,
		criteriaToCheck: string[],
		applicantInfo: {
			name: string;
			expectedYearLevel?: string;
			expectedSchool?: string;
		},
	): Promise<DocumentAnalysisResult> {
		const model = this.genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
		});

		const prompt = `You are a document verification expert for scholarship applications. Analyze this Certificate of Enrollment document.

APPLICANT INFORMATION:
- Name: ${applicantInfo.name}
${applicantInfo.expectedYearLevel ? `- Expected Year Level: ${applicantInfo.expectedYearLevel}` : ""}
${applicantInfo.expectedSchool ? `- Expected School: ${applicantInfo.expectedSchool}` : ""}

DOCUMENT TEXT (extracted from PDF):
${extractedText || "No text extracted - document may be an image or scanned PDF"}

CRITERIA TO VERIFY:
${criteriaToCheck.map((c, i) => `${i + 1}. ${c}`).join("\n")}

INSTRUCTIONS:
1. Extract key information from the document (student name, school, year level, program, semester, academic year)
2. Verify if the document matches the applicant's information
3. Check if each criterion is satisfied based on the document
4. Provide a recommendation (approve/reject) with confidence level
5. Explain your reasoning clearly

Respond in this exact JSON format:
{
  "shouldApprove": <boolean>,
  "confidence": <number 0-1>,
  "reasoning": "<clear explanation of your decision>",
  "extractedInfo": {
    "studentName": "<name from document>",
    "schoolName": "<school from document>",
    "yearLevel": "<year level from document>",
    "program": "<program/course from document>",
    "semester": "<semester from document>",
    "academicYear": "<academic year from document>"
  },
  "criteriaMatches": [
    {
      "criterion": "<criterion text>",
      "matched": <boolean>,
      "evidence": "<specific evidence from document>"
    }
  ]
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
				shouldApprove: analysis.shouldApprove || false,
				confidence: Math.min(1, Math.max(0, analysis.confidence || 0.5)),
				reasoning: analysis.reasoning || "No reasoning provided",
				extractedInfo: analysis.extractedInfo || {},
				criteriaMatches: analysis.criteriaMatches || [],
			};
		} catch (error) {
			console.error("Document analysis error:", error);
			return {
				shouldApprove: false,
				confidence: 0,
				reasoning: "AI analysis failed. Manual review required.",
				extractedInfo: {},
				criteriaMatches: criteriaToCheck.map((c) => ({
					criterion: c,
					matched: false,
					evidence: "Analysis failed",
				})),
			};
		}
	}

	/**
	 * Batch analyze multiple documents
	 */
	async analyzeDocuments(
		documents: Array<{
			url: string;
			extractedText: string;
		}>,
		criteriaToCheck: string[],
		applicantInfo: {
			name: string;
			expectedYearLevel?: string;
			expectedSchool?: string;
		},
	): Promise<DocumentAnalysisResult[]> {
		const results: DocumentAnalysisResult[] = [];

		for (const doc of documents) {
			const result = await this.analyzeDocument(
				doc.extractedText,
				criteriaToCheck,
				applicantInfo,
			);
			results.push(result);

			// Delay between requests
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}

		return results;
	}
}
