import { Trophy, Medal, Award, CheckCircle, XCircle, Download, FileText, ExternalLink } from "lucide-react";
import type { RankedApplicant } from "@/lib/ranking/model";

interface RankedApplicationsTableProps {
	results: RankedApplicant[];
	onApplicationClick?: (applicationId: string) => void;
}

export function RankedApplicationsTable({
	results,
	onApplicationClick,
}: RankedApplicationsTableProps) {
	const getRankIcon = (rank: number) => {
		if (rank === 1)
			return <Trophy className="w-5 h-5 text-[#FFD700]" />;
		if (rank === 2)
			return <Medal className="w-5 h-5 text-[#C0C0C0]" />;
		if (rank === 3)
			return <Medal className="w-5 h-5 text-[#CD7F32]" />;
		return <Award className="w-5 h-5 text-[#9CA3AF]" />;
	};

	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-[#10B981]";
		if (score >= 60) return "text-[#F59E0B]";
		return "text-[#EF4444]";
	};

	const getScoreBgColor = (score: number) => {
		if (score >= 80) return "bg-[#10B981]";
		if (score >= 60) return "bg-[#F59E0B]";
		return "bg-[#EF4444]";
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
			r.score,
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
				<h3 className="text-lg font-semibold text-primary">
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
				{results.map((result) => (
					<div
						key={result.applicant.id}
						onClick={() => onApplicationClick?.(result.applicant.id)}
						className="p-4 hover:bg-[#EFF6FF] cursor-pointer transition-all hover:shadow-sm"
					>
						<div className="flex items-start gap-4">
							{/* Rank & Score */}
							<div className="flex flex-col items-center gap-2 min-w-[80px]">
								<div className="flex items-center gap-2">
									{getRankIcon(result.rank)}
									<span className="font-bold text-lg text-primary">
										#{result.rank}
									</span>
								</div>
								<div className="text-center">
									<div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
										{result.score}
									</div>
									<div className="w-16 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden mt-1">
										<div
											className={`h-full ${getScoreBgColor(result.score)}`}
											style={{ width: `${result.score}%` }}
										/>
									</div>
								</div>
							</div>

							{/* Applicant Info */}
							<div className="flex-1 min-w-0">
								<div className="mb-3">
									<h4 className="font-semibold text-base text-primary truncate">
										{result.applicant.student.firstName}{" "}
										{result.applicant.student.lastName}
									</h4>
									<p className="text-sm text-[#6B7280] truncate">
										{result.applicant.student.email}
									</p>
								</div>

								{/* Criteria */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
									{result.criteriaMet.length > 0 && (
										<div className="flex items-start gap-2">
											<CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
											<div className="text-xs flex-1">
												<div className="font-medium text-[#10B981] mb-1">
													{result.criteriaMet.length} Criteria Met
												</div>
												<div className="text-[#6B7280] space-y-0.5">
													{result.criteriaMet.map((c, i) => (
														<div key={i} className="leading-relaxed">• {c}</div>
													))}
												</div>
											</div>
										</div>
									)}
									{result.criteriaNotMet.length > 0 && (
										<div className="flex items-start gap-2">
											<XCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
											<div className="text-xs flex-1">
												<div className="font-medium text-[#EF4444] mb-1">
													{result.criteriaNotMet.length} Not Met
												</div>
												<div className="text-[#6B7280] space-y-0.5">
													{result.criteriaNotMet.map((c, i) => (
														<div key={i} className="leading-relaxed">• {c}</div>
													))}
												</div>
											</div>
										</div>
									)}
								</div>

								{/* Submitted Documents */}
								{result.applicant.formFieldAnswers && result.applicant.formFieldAnswers.length > 0 && (
									<div className="mb-3">
										<div className="text-xs font-medium text-[#6B7280] mb-2">
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
																	📄 {fileUrl.split("/").pop() || "Document"} (Test)
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

								{/* AI Insights */}
								{result.aiInsights && (
									<div className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
										<div className="flex items-center gap-2 mb-2">
											<span className="text-xs font-medium text-[#6B7280]">
												AI Recommendation:
											</span>
											<div className="flex items-center gap-1.5">
												<div className="h-1 w-16 bg-[#E5E7EB] rounded-full overflow-hidden">
													<div
														className="h-full bg-[#8B5CF6]"
														style={{
															width: `${result.aiInsights.confidence * 100}%`,
														}}
													/>
												</div>
												<span className="text-xs text-[#6B7280]">
													{Math.round(result.aiInsights.confidence * 100)}%
												</span>
											</div>
										</div>
										<p className="text-sm text-[#374151] mb-2">
											{result.aiInsights.recommendation}
										</p>
										{(result.aiInsights.strengths.length > 0 || result.aiInsights.concerns.length > 0) && (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
												{result.aiInsights.strengths.length > 0 && (
													<div>
														<span className="font-medium text-[#10B981]">Strengths: </span>
														<span className="text-[#6B7280]">
															{result.aiInsights.strengths[0]}
														</span>
													</div>
												)}
												{result.aiInsights.concerns.length > 0 && (
													<div>
														<span className="font-medium text-[#EF4444]">Concerns: </span>
														<span className="text-[#6B7280]">
															{result.aiInsights.concerns[0]}
														</span>
													</div>
												)}
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
