import { CheckCircle, XCircle, Download, FileText, ExternalLink, Sparkles, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useState } from "react";
import type { RankedApplicant } from "@/lib/ranking/model";

interface RankedApplicationsTableProps {
	results: RankedApplicant[];
	onApplicationClick?: (applicationId: string) => void;
}

export function RankedApplicationsTable({
	results,
	onApplicationClick,
}: RankedApplicationsTableProps) {
	const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

	const toggleCard = (applicantId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setExpandedCards(prev => {
			const newSet = new Set(prev);
			if (newSet.has(applicantId)) {
				newSet.delete(applicantId);
			} else {
				newSet.add(applicantId);
			}
			return newSet;
		});
	};

	const getScoreLabel = (score: number) => {
		if (score >= 90) return "Excellent Match";
		if (score >= 80) return "Strong Match";
		if (score >= 70) return "Good Match";
		if (score >= 60) return "Fair Match";
		if (score >= 50) return "Weak Match";
		return "Poor Match";
	};

	const exportToCSV = () => {
		const headers = [
			"Rank",
			"Name",
			"Email",
			"Score",
			"Criteria Met",
			"Criteria Not Met",
		];
		const rows = results.map((r) => [
			r.rank,
			`${r.applicant.student.firstName} ${r.applicant.student.lastName}`,
			r.applicant.student.email,
			r.analysisFailed ? "N/A" : r.score,
			r.criteriaMet.join("; "),
			r.criteriaNotMet.join("; "),
		]);

		const csv = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `ranking-results-${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="bg-card rounded-lg shadow-sm overflow-hidden">
			{/* Header */}
			<div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
				<h3 className="text-lg text-primary">
					Ranking Results ({results.length})
				</h3>
				<button
					onClick={exportToCSV}
					className="flex items-center gap-2 px-3 py-2 text-sm bg-[#3A52A6] text-white rounded-lg hover:bg-[#2A4296] transition-all hover:shadow-md active:scale-95"
				>
					<Download className="w-4 h-4" />
					Export CSV
				</button>
			</div>

			{/* Results as Cards for better mobile/desktop experience */}
			<div className="divide-y divide-[#E5E7EB]">
				{results.map((result) => {
					const score = result.score;
					const failed = result.analysisFailed;
					const scoreColor = failed ? "text-[#6B7280]" : score >= 80 ? "text-[#10B981]" : score >= 60 ? "text-[#F59E0B]" : "text-[#EF4444]";
					const scoreBgLight = failed ? "bg-[#F3F4F6]" : score >= 80 ? "bg-[#D1FAE5]" : score >= 60 ? "bg-[#FEF3C7]" : "bg-[#FEE2E2]";
					const noteFor = (name: string) =>
						result.criteriaAssessments?.find((a) => a.name === name)?.note;

					return (
					<div
						key={result.applicant.id}
						onClick={() => onApplicationClick?.(result.applicant.id)}
						className="p-4 hover:bg-[#EFF6FF] cursor-pointer transition-all hover:shadow-sm"
					>
						<div className="flex items-start gap-4">
							{/* Rank & Score */}
							<div className="flex flex-col items-center gap-2 min-w-[100px]">
								<div className="text-center">
									<div className="text-2xl text-[#374151] mb-1">
										#{result.rank}
									</div>
									<div className={`px-3 py-1 rounded-full ${scoreBgLight}`}>
										<div className={`text-2xl ${scoreColor}`}>
											{failed ? "N/A" : score}
										</div>
									</div>
									<div className={`text-[10px] ${scoreColor} mt-1`}>
										{failed ? "Analysis Failed" : getScoreLabel(score)}
									</div>
								</div>
							</div>

							{/* Applicant Info */}
							<div className="flex-1 min-w-0">
								<div className="mb-3">
									<h4 className="text-lg text-primary">
										{result.applicant.student.firstName}{" "}
										{result.applicant.student.lastName}
									</h4>
									<p className="text-sm text-[#6B7280]">
										{result.applicant.student.email}
									</p>
								</div>

								{/* Failed AI analysis notice */}
								{failed && (
									<div className="bg-[#FEF2F2] rounded-lg p-4 border border-[#FCA5A5] mb-4 flex items-start gap-2">
										<AlertCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
										<p className="text-sm text-[#7F1D1D]">
											AI analysis could not be completed for this applicant.
											Please review their application manually or run the
											ranking again.
										</p>
									</div>
								)}

								{/* AI Insights - MOVED TO TOP */}
								{result.aiInsights && (
									<div className="bg-gradient-to-r from-[#F5F3FF] to-[#EFF6FF] rounded-lg p-4 border border-[#8B5CF6] mb-4">
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2">
												<Sparkles className="w-4 h-4 text-[#8B5CF6]" />
												<span className="text-sm text-[#374151]">
													AI Analysis
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div className="h-1.5 w-20 bg-[#E5E7EB] rounded-full overflow-hidden">
													<div
														className="h-full bg-[#8B5CF6]"
														style={{
															width: `${result.aiInsights.confidence * 100}%`,
														}}
													/>
												</div>
												<span className="text-xs text-[#8B5CF6]">
													{Math.round(result.aiInsights.confidence * 100)}% confident
												</span>
											</div>
										</div>
										<p className="text-sm text-[#374151] mb-3 leading-relaxed">
											{result.aiInsights.recommendation}
										</p>
										{(result.aiInsights.strengths.length > 0 || result.aiInsights.concerns.length > 0) && (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
												{result.aiInsights.strengths.length > 0 && (
													<div className="bg-white/50 rounded p-2">
														<div className="text-[#10B981] mb-1 flex items-center gap-1">
															<CheckCircle className="w-3 h-3" />
															Strengths
														</div>
														<div className="text-[#374151]">
															{result.aiInsights.strengths[0]}
														</div>
													</div>
												)}
												{result.aiInsights.concerns.length > 0 && (
													<div className="bg-white/50 rounded p-2">
														<div className="text-[#EF4444] mb-1 flex items-center gap-1">
															<XCircle className="w-3 h-3" />
															Concerns
														</div>
														<div className="text-[#374151]">
															{result.aiInsights.concerns[0]}
														</div>
													</div>
												)}
											</div>
										)}
									</div>
								)}

								{/* Criteria - MOVED TO BOTTOM - COLLAPSIBLE */}
								<div className="border-t border-[#E5E7EB] pt-3">
									<button
										onClick={(e) => toggleCard(result.applicant.id, e)}
										className="w-full flex items-center justify-between text-sm text-[#374151] hover:text-[#3A52A6] transition-colors"
									>
										<div className="flex items-center gap-2">
											{result.criteriaMet.length > 0 && (
												<span className="text-[#10B981]">
													✓ {result.criteriaMet.length} Criteria Met
												</span>
											)}
											{result.criteriaNotMet.length > 0 && (
												<span className="text-[#EF4444]">
													✗ {result.criteriaNotMet.length} Not Met
												</span>
											)}
										</div>
										{expandedCards.has(result.applicant.id) ? (
											<ChevronUp className="w-4 h-4" />
										) : (
											<ChevronDown className="w-4 h-4" />
										)}
									</button>

									{expandedCards.has(result.applicant.id) && (
										<div className="mt-3 space-y-3">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
												{result.criteriaMet.length > 0 && (
													<div className="flex items-start gap-2">
														<CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
														<div className="text-xs flex-1">
															<div className="text-[#10B981] mb-1">
																Criteria Met
															</div>
															<div className="text-[#6B7280] space-y-0.5">
																{result.criteriaMet.map((c, i) => (
																	<div key={i} className="leading-relaxed">
																		• {c}
																		{noteFor(c) && (
																			<span className="text-[#9CA3AF]">: {noteFor(c)}</span>
																		)}
																	</div>
																))}
															</div>
														</div>
													</div>
												)}
												{result.criteriaNotMet.length > 0 && (
													<div className="flex items-start gap-2">
														<XCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
														<div className="text-xs flex-1">
															<div className="text-[#EF4444] mb-1">
																Not Met
															</div>
															<div className="text-[#6B7280] space-y-0.5">
																{result.criteriaNotMet.map((c, i) => (
																	<div key={i} className="leading-relaxed">
																		• {c}
																		{noteFor(c) && (
																			<span className="text-[#9CA3AF]">: {noteFor(c)}</span>
																		)}
																	</div>
																))}
															</div>
														</div>
													</div>
												)}
											</div>

											{/* Submitted Documents - INSIDE DROPDOWN */}
											{result.applicant.formFieldAnswers && result.applicant.formFieldAnswers.length > 0 && (
												<div>
													<div className="text-xs text-[#6B7280] mb-2">
														Submitted Documents:
													</div>
													<div className="space-y-1.5">
														{result.applicant.formFieldAnswers.map((answer, idx) => {
															let fileUrl: string | null = null;
															let hasExtractedText = false;

															// Extract file URL from different formats
															if (typeof answer.value === "string" && answer.value.startsWith("http")) {
																fileUrl = answer.value;
															} else if (typeof answer.value === "object" && answer.value !== null) {
																const docData = answer.value as any;
																if (docData.url && typeof docData.url === "string") {
																	fileUrl = docData.url;
																	hasExtractedText = !!docData.extractedText;
																}
															}

															if (!fileUrl) return null;

															// Check if it's a placeholder URL (after confirming fileUrl is not null)
															const isPlaceholder = fileUrl.includes('example.com');

															if (isPlaceholder) {
																return (
																	<div
																		key={idx}
																		className="flex items-center gap-2 px-3 py-2 bg-[#FEF3C7] border border-[#F59E0B] rounded-lg"
																	>
																		<FileText className="w-4 h-4 text-[#F59E0B] shrink-0" />
																		<div className="flex-1 min-w-0">
																			<div className="text-xs text-[#92400E] truncate">
																				{fileUrl.split("/").pop() || "Document"} (Test)
																			</div>
																			{hasExtractedText && (
																				<div className="text-[10px] text-[#10B981]">
																					✓ Has extracted text for AI
																				</div>
																			)}
																		</div>
																	</div>
																);
															}

															return (
																<a
																	key={idx}
																	href={fileUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	onClick={(e) => e.stopPropagation()}
																	className="flex items-center gap-2 px-3 py-2 bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] transition-colors group"
																>
																	<FileText className="w-4 h-4 text-[#6B7280] shrink-0" />
																	<div className="flex-1 min-w-0">
																		<div className="text-xs text-[#374151] truncate">
																			{fileUrl.split("/").pop() || "Document"}
																		</div>
																		{hasExtractedText && (
																			<div className="text-[10px] text-[#10B981]">
																				✓ Text extracted
																			</div>
																		)}
																	</div>
																	<ExternalLink className="w-3.5 h-3.5 text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
																</a>
															);
														})}
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				)})}
			</div>
		</div>
	);
}
