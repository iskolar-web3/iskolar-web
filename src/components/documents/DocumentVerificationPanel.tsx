import { useState } from "react";
import { FileText, CheckCircle, XCircle, AlertCircle, Eye, Loader2 } from "lucide-react";

interface DocumentMetadata {
	documentId: string;
	fileUrl: string;
	extractedText?: string;
	metadata?: {
		studentName?: string;
		schoolName?: string;
		yearLevel?: string;
		semester?: string;
		academicYear?: string;
		program?: string;
	};
	verificationStatus: "pending" | "verified" | "rejected" | "processing";
	aiSuggestion?: {
		shouldApprove: boolean;
		confidence: number;
		reasoning: string;
		extractedInfo: Record<string, string>;
	};
}

interface DocumentVerificationPanelProps {
	documents: DocumentMetadata[];
	criteriaToCheck: string[];
	onVerify: (documentId: string, status: "verified" | "rejected", reason?: string) => void;
	onRequestAIAnalysis: (documentId: string) => Promise<void>;
}

export function DocumentVerificationPanel({
	documents,
	criteriaToCheck,
	onVerify,
	onRequestAIAnalysis,
}: DocumentVerificationPanelProps) {
	const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [analyzingDoc, setAnalyzingDoc] = useState<string | null>(null);

	const getStatusIcon = (status: DocumentMetadata["verificationStatus"]) => {
		switch (status) {
			case "verified":
				return <CheckCircle className="w-5 h-5 text-[#10B981]" />;
			case "rejected":
				return <XCircle className="w-5 h-5 text-[#EF4444]" />;
			case "processing":
				return <Loader2 className="w-5 h-5 text-[#3A52A6] animate-spin" />;
			default:
				return <AlertCircle className="w-5 h-5 text-[#F59E0B]" />;
		}
	};

	const handleAIAnalysis = async (documentId: string) => {
		setAnalyzingDoc(documentId);
		try {
			await onRequestAIAnalysis(documentId);
		} finally {
			setAnalyzingDoc(null);
		}
	};

	return (
		<div className="bg-card rounded-lg shadow-sm p-4">
			<h3 className="text-lg font-semibold text-primary mb-4">
				Document Verification
			</h3>

			{/* Criteria Checklist */}
			<div className="mb-4 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
				<h4 className="text-sm font-medium text-primary mb-2">
					Required Criteria to Verify:
				</h4>
				<ul className="space-y-1">
					{criteriaToCheck.map((criteria, idx) => (
						<li key={idx} className="text-xs text-[#6B7280] flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-[#3A52A6]" />
							{criteria}
						</li>
					))}
				</ul>
			</div>

			{/* Documents List */}
			<div className="space-y-3">
				{documents.map((doc) => (
					<div
						key={doc.documentId}
						className="border border-[#E5E7EB] rounded-lg p-4 hover:border-[#3A52A6] transition-colors"
					>
						<div className="flex items-start gap-3">
							{/* Status Icon */}
							<div className="mt-1">
								{getStatusIcon(doc.verificationStatus)}
							</div>

							{/* Document Info */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-2">
									<FileText className="w-4 h-4 text-[#6B7280]" />
									<span className="text-sm font-medium text-primary truncate">
										{doc.fileUrl.split("/").pop()}
									</span>
								</div>

								{/* Extracted Metadata */}
								{doc.metadata && Object.keys(doc.metadata).length > 0 && (
									<div className="mb-3 p-2 bg-[#F9FAFB] rounded text-xs space-y-1">
										{Object.entries(doc.metadata).map(([key, value]) => (
											<div key={key} className="flex gap-2">
												<span className="text-[#6B7280] capitalize">
													{key.replace(/([A-Z])/g, " $1").trim()}:
												</span>
												<span className="text-primary font-medium">{value}</span>
											</div>
										))}
									</div>
								)}

								{/* AI Suggestion */}
								{doc.aiSuggestion && (
									<div
										className={`mb-3 p-3 rounded-lg border ${
											doc.aiSuggestion.shouldApprove
												? "bg-[#ECFDF5] border-[#10B981]"
												: "bg-[#FEF2F2] border-[#EF4444]"
										}`}
									>
										<div className="flex items-center gap-2 mb-1">
											<span className="text-xs font-medium text-primary">
												AI Recommendation:
											</span>
											<span
												className={`text-xs font-semibold ${
													doc.aiSuggestion.shouldApprove
														? "text-[#10B981]"
														: "text-[#EF4444]"
												}`}
											>
												{doc.aiSuggestion.shouldApprove ? "APPROVE" : "REJECT"}
											</span>
											<span className="text-xs text-[#6B7280]">
												({Math.round(doc.aiSuggestion.confidence * 100)}% confident)
											</span>
										</div>
										<p className="text-xs text-[#6B7280]">
											{doc.aiSuggestion.reasoning}
										</p>
									</div>
								)}

								{/* Actions */}
								<div className="flex items-center gap-2">
									<a
										href={doc.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#F3F4F6] text-[#6B7280] rounded hover:bg-[#E5E7EB] transition-colors"
									>
										<Eye className="w-3.5 h-3.5" />
										View
									</a>

									{doc.verificationStatus === "pending" && (
										<>
											<button
												onClick={() => handleAIAnalysis(doc.documentId)}
												disabled={analyzingDoc === doc.documentId}
												className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#8B5CF6] text-white rounded hover:bg-[#7C3AED] transition-colors disabled:opacity-50"
											>
												{analyzingDoc === doc.documentId ? (
													<Loader2 className="w-3.5 h-3.5 animate-spin" />
												) : (
													<FileText className="w-3.5 h-3.5" />
												)}
												AI Analyze
											</button>

											<button
												onClick={() => onVerify(doc.documentId, "verified")}
												className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#10B981] text-white rounded hover:bg-[#059669] transition-colors"
											>
												<CheckCircle className="w-3.5 h-3.5" />
												Approve
											</button>

											<button
												onClick={() => setSelectedDoc(doc.documentId)}
												className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#EF4444] text-white rounded hover:bg-[#DC2626] transition-colors"
											>
												<XCircle className="w-3.5 h-3.5" />
												Reject
											</button>
										</>
									)}
								</div>
							</div>
						</div>

						{/* Rejection Reason Input */}
						{selectedDoc === doc.documentId && (
							<div className="mt-3 pt-3 border-t border-[#E5E7EB]">
								<textarea
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									placeholder="Enter reason for rejection..."
									className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A52A6] resize-none"
									rows={2}
								/>
								<div className="flex gap-2 mt-2">
									<button
										onClick={() => {
											onVerify(doc.documentId, "rejected", rejectionReason);
											setSelectedDoc(null);
											setRejectionReason("");
										}}
										className="px-3 py-1.5 text-xs bg-[#EF4444] text-white rounded hover:bg-[#DC2626]"
									>
										Confirm Rejection
									</button>
									<button
										onClick={() => {
											setSelectedDoc(null);
											setRejectionReason("");
										}}
										className="px-3 py-1.5 text-xs bg-[#E5E7EB] text-[#6B7280] rounded hover:bg-[#D1D5DB]"
									>
										Cancel
									</button>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
