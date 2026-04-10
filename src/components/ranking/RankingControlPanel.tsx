import { useState, useEffect } from "react";
import { AlertCircle, Sparkles, GitBranch, Zap, Clock, Sliders } from "lucide-react";
import type { Applicant, Scholarship } from "@/lib/scholarship/model";
import type { RankingCriteria, RankingResult } from "@/lib/ranking/model";
import { RankingMode } from "@/lib/ranking/model";
import { DecisionTreeRanker } from "@/services/ranking/DecisionTreeRanker";
import { AIRanker } from "@/services/ranking/AIRanker";
import { HybridRanker } from "@/services/ranking/HybridRanker";

interface RankingControlPanelProps {
	scholarship: Scholarship;
	applicants: Applicant[];
	onRankingComplete: (result: RankingResult) => void;
	onShowSuccess: (title: string, message: string) => void;
	onShowError: (title: string, message: string) => void;
}

const COOLDOWN_DURATION = 30000; // 30 seconds
const COOLDOWN_KEY_PREFIX = "ranking_cooldown_";

export function RankingControlPanel({
	scholarship,
	applicants,
	onRankingComplete,
	onShowSuccess,
	onShowError,
}: RankingControlPanelProps) {
	const [selectedMode, setSelectedMode] = useState<RankingMode>(
		RankingMode.DecisionTree,
	);
	const [isRanking, setIsRanking] = useState(false);
	const [showAIConfirm, setShowAIConfirm] = useState(false);
	const [cooldownRemaining, setCooldownRemaining] = useState(0);
	const [aiWeight, setAiWeight] = useState(50); // For hybrid mode
	const [criteriaWeights, setCriteriaWeights] = useState<Record<string, number>>(
		{},
	);
	const [aiTopN, setAiTopN] = useState(5); // Only analyze top N candidates with AI

	// Initialize criteria weights when scholarship changes
	useEffect(() => {
		if (scholarship.criterias.length > 0) {
			const equalWeight = 100 / scholarship.criterias.length;
			const weights: Record<string, number> = {};
			scholarship.criterias.forEach((criteria) => {
				weights[criteria] = Math.round(equalWeight);
			});
			setCriteriaWeights(weights);
		}
	}, [scholarship.criterias]);

	// Check cooldown on mount and set up interval
	useEffect(() => {
		checkCooldown();
		const interval = setInterval(checkCooldown, 1000);
		return () => clearInterval(interval);
	}, [scholarship.id]);

	const checkCooldown = () => {
		const cooldownKey = `${COOLDOWN_KEY_PREFIX}${scholarship.id}`;
		const lastRankingTime = localStorage.getItem(cooldownKey);

		if (lastRankingTime) {
			const elapsed = Date.now() - parseInt(lastRankingTime, 10);
			const remaining = Math.max(0, COOLDOWN_DURATION - elapsed);

			if (remaining > 0) {
				setCooldownRemaining(Math.ceil(remaining / 1000));
			} else {
				setCooldownRemaining(0);
				localStorage.removeItem(cooldownKey);
			}
		}
	};

	const setCooldown = () => {
		const cooldownKey = `${COOLDOWN_KEY_PREFIX}${scholarship.id}`;
		localStorage.setItem(cooldownKey, Date.now().toString());
		setCooldownRemaining(COOLDOWN_DURATION / 1000);
	};

	const handleRank = async () => {
		// Check if AI mode requires confirmation
		if (
			(selectedMode === RankingMode.AI ||
				selectedMode === RankingMode.Hybrid) &&
			!showAIConfirm
		) {
			setShowAIConfirm(true);
			return;
		}

		setShowAIConfirm(false);
		setIsRanking(true);

		try {
			// Parse criteria from scholarship with custom weights
			const criterias: RankingCriteria[] = scholarship.criterias.map(
				(name) => ({
					name,
					weight: criteriaWeights[name] || 100 / scholarship.criterias.length,
					required: true,
				}),
			);

			let result: RankingResult;

			switch (selectedMode) {
				case RankingMode.DecisionTree:
					result = DecisionTreeRanker.rank(
						scholarship.id,
						applicants,
						criterias,
					);
					break;

				case RankingMode.AI: {
					const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
					if (!apiKey) {
						throw new Error("Gemini API key not configured");
					}
					
					// First, rank with Decision Tree
					const dtResult = DecisionTreeRanker.rank(
						scholarship.id,
						applicants,
						criterias,
					);
					
					// Then only use AI for top N candidates
					const topCandidates = dtResult.rankedApplicants.slice(0, aiTopN);
					const aiRanker = new AIRanker(apiKey);
					
					try {
						const aiResult = await aiRanker.rankTopCandidates(
							scholarship.id,
							topCandidates.map(r => r.applicant),
							criterias,
							scholarship.description || undefined,
						);
						
						// Merge: AI-ranked top candidates + remaining DT-ranked candidates
						result = {
							...aiResult,
							rankedApplicants: [
								...aiResult.rankedApplicants,
								...dtResult.rankedApplicants.slice(aiTopN).map((r, idx) => ({
									...r,
									rank: aiTopN + idx + 1,
								})),
							],
						};
					} catch (error) {
						console.error("AI ranking failed, using Decision Tree only:", error);
						result = dtResult;
						onShowError(
							"AI Unavailable",
							"Using algorithmic ranking instead. AI service is currently overloaded.",
						);
					}
					
					setCooldown();
					break;
				}

				case RankingMode.Hybrid: {
					const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
					if (!apiKey) {
						throw new Error("Gemini API key not configured");
					}
					result = await HybridRanker.rank(
						scholarship.id,
						applicants,
						criterias,
						apiKey,
						scholarship.description || undefined,
						(100 - aiWeight) / 100, // Convert to 0-1 range, inverted
					);
					setCooldown(); // Set cooldown for AI usage
					break;
				}

				default:
					throw new Error("Invalid ranking mode");
			}

			onRankingComplete(result);
			onShowSuccess(
				"Ranking Complete",
				`Successfully ranked ${applicants.length} applicants`,
			);
		} catch (error) {
			console.error("Ranking error:", error);
			onShowError(
				"Ranking Failed",
				error instanceof Error ? error.message : "An error occurred",
			);
		} finally {
			setIsRanking(false);
		}
	};

	const canRank = applicants.length > 0 && !isRanking && cooldownRemaining === 0;

	const handleWeightChange = (criteriaName: string, newWeight: number) => {
		setCriteriaWeights((prev) => ({
			...prev,
			[criteriaName]: newWeight,
		}));
	};

	const resetWeights = () => {
		const equalWeight = 100 / scholarship.criterias.length;
		const weights: Record<string, number> = {};
		scholarship.criterias.forEach((criteria) => {
			weights[criteria] = Math.round(equalWeight);
		});
		setCriteriaWeights(weights);
	};

	const totalWeight = Object.values(criteriaWeights).reduce(
		(sum, w) => sum + w,
		0,
	);

	return (
		<div className="bg-card rounded-lg shadow-sm p-4 mb-4">
			<h3 className="text-lg font-semibold text-primary mb-4">
				Applicant Ranking
			</h3>

			{/* Mode Selection */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
				<button
					onClick={() => setSelectedMode(RankingMode.DecisionTree)}
					disabled={isRanking}
					className={`p-4 rounded-lg border-2 transition-all ${
						selectedMode === RankingMode.DecisionTree
							? "border-[#3A52A6] bg-[#EFF6FF]"
							: "border-[#E5E7EB] hover:border-[#3A52A6]"
					} ${isRanking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
				>
					<div className="flex items-center gap-2 mb-2">
						<GitBranch className="w-5 h-5 text-[#3A52A6]" />
						<span className="font-medium text-primary">Basic Ranking</span>
					</div>
					<p className="text-xs text-[#6B7280] leading-relaxed">
						Quick automatic ranking based on your criteria. Only checks form answers, not document content.
					</p>
				</button>

				<button
					onClick={() => setSelectedMode(RankingMode.AI)}
					disabled={isRanking}
					className={`p-4 rounded-lg border-2 transition-all ${
						selectedMode === RankingMode.AI
							? "border-[#8B5CF6] bg-[#F5F3FF]"
							: "border-[#E5E7EB] hover:border-[#8B5CF6]"
					} ${isRanking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
				>
					<div className="flex items-center gap-2 mb-2">
						<Sparkles className="w-5 h-5 text-[#8B5CF6]" />
						<span className="font-medium text-primary">Smart AI Ranking</span>
					</div>
					<p className="text-xs text-[#6B7280] leading-relaxed">
						AI reviews top candidates and reads their documents to give detailed insights and recommendations.
					</p>
				</button>

				<button
					onClick={() => setSelectedMode(RankingMode.Hybrid)}
					disabled={isRanking}
					className={`p-4 rounded-lg border-2 transition-all ${
						selectedMode === RankingMode.Hybrid
							? "border-[#EFA508] bg-[#FFFBEB]"
							: "border-[#E5E7EB] hover:border-[#EFA508]"
					} ${isRanking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
				>
					<div className="flex items-center gap-2 mb-2">
						<Zap className="w-5 h-5 text-[#EFA508]" />
						<span className="font-medium text-primary">Balanced Ranking</span>
					</div>
					<p className="text-xs text-[#6B7280] leading-relaxed">
						Combines automatic ranking with AI insights. You control how much weight to give each method.
					</p>
				</button>
			</div>

			{/* AI Mode - Top N Selector */}
			{selectedMode === RankingMode.AI && (
				<div className="mb-4 p-3 bg-[#F5F3FF] rounded-lg border border-[#8B5CF6]">
					<div className="flex items-start justify-between mb-2">
						<div>
							<label className="block text-sm font-medium text-primary mb-1">
								How many top candidates should AI review?
							</label>
							<p className="text-xs text-[#6B7280]">
								AI will give detailed analysis for your top {aiTopN} candidates. Others will be ranked automatically.
							</p>
						</div>
						<span className="text-lg font-bold text-[#8B5CF6] ml-3">{aiTopN}</span>
					</div>
					<input
						type="range"
						min="3"
						max={Math.min(10, applicants.length)}
						value={aiTopN}
						onChange={(e) => setAiTopN(parseInt(e.target.value))}
						disabled={isRanking}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-[#6B7280] mt-1">
						<span>Review fewer (faster)</span>
						<span>Review more (slower)</span>
					</div>
				</div>
			)}

			{/* Hybrid Weight Slider */}
			{selectedMode === RankingMode.Hybrid && (
				<div className="mb-4 p-3 bg-[#FFFBEB] rounded-lg border border-[#EFA508]">
					<div className="flex items-start justify-between mb-2">
						<div>
							<label className="block text-sm font-medium text-primary mb-1">
								How much should AI influence the ranking?
							</label>
							<p className="text-xs text-[#6B7280]">
								Slide left for faster automatic ranking, or right to let AI have more say in the results.
							</p>
						</div>
						<span className="text-lg font-bold text-[#EFA508] ml-3">{aiWeight}%</span>
					</div>
					<input
						type="range"
						min="0"
						max="100"
						value={aiWeight}
						onChange={(e) => setAiWeight(parseInt(e.target.value))}
						disabled={isRanking}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-[#6B7280] mt-1">
						<span>More automatic</span>
						<span>More AI-driven</span>
					</div>
				</div>
			)}

			{/* Criteria Weights Configuration */}
			{scholarship.criterias.length > 0 && (
				<div className="mb-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<Sliders className="w-4 h-4 text-[#6B7280]" />
							<div>
								<h4 className="text-sm font-medium text-primary">
									Criteria Importance
								</h4>
								<p className="text-xs text-[#6B7280] mt-0.5">
									Adjust how important each requirement is. Total must equal 100%.
								</p>
							</div>
						</div>
						<button
							onClick={resetWeights}
							disabled={isRanking}
							className="text-xs text-[#3A52A6] hover:text-[#2A4296] disabled:opacity-50 whitespace-nowrap"
						>
							Reset to Equal
						</button>
					</div>

					<div className="space-y-3">
						{scholarship.criterias.map((criteria) => (
							<div key={criteria} className="space-y-1">
								<div className="flex items-center justify-between">
									<label className="text-xs text-[#6B7280]">{criteria}</label>
									<span className="text-xs font-medium text-primary">
										{criteriaWeights[criteria] || 0}%
									</span>
								</div>
								<input
									type="range"
									min="0"
									max="100"
									value={criteriaWeights[criteria] || 0}
									onChange={(e) =>
										handleWeightChange(criteria, parseInt(e.target.value))
									}
									disabled={isRanking}
									className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3A52A6] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#3A52A6] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
								/>
							</div>
						))}
					</div>

					<div className="mt-3 pt-3 border-t border-[#E5E7EB]">
						<div className="flex items-center justify-between text-xs">
							<span className="text-[#6B7280]">Total Weight:</span>
							<span
								className={`font-medium ${
									totalWeight === 100
										? "text-[#10B981]"
										: totalWeight > 100
											? "text-[#EF4444]"
											: "text-[#F59E0B]"
								}`}
							>
								{totalWeight}%
								{totalWeight !== 100 && (
									<span className="ml-1">
										({totalWeight > 100 ? "over" : "under"} by{" "}
										{Math.abs(100 - totalWeight)}%)
									</span>
								)}
							</span>
						</div>
						{totalWeight !== 100 && (
							<p className="text-xs text-[#EF4444] mt-1">
								Please adjust the sliders so the total equals 100%
							</p>
						)}
					</div>
				</div>
			)}

			{/* Cooldown Warning */}
			{cooldownRemaining > 0 && (
				<div className="mb-4 p-3 bg-[#FEF3C7] rounded-lg flex items-center gap-2">
					<Clock className="w-4 h-4 text-[#F59E0B]" />
					<span className="text-sm text-[#92400E]">
						Please wait {cooldownRemaining}s before ranking again
					</span>
				</div>
			)}

			{/* Rank Button */}
			<button
				onClick={handleRank}
				disabled={!canRank}
				className={`w-full py-3 rounded-lg font-medium transition-all ${
					canRank
						? "bg-[#3A52A6] text-white hover:bg-[#2A4296]"
						: "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
				}`}
			>
				{isRanking ? (
					<span className="flex items-center justify-center gap-2">
						<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						Ranking...
					</span>
				) : (
					`Rank ${applicants.length} Applicants`
				)}
			</button>

			{/* AI Confirmation Dialog */}
			{showAIConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md mx-4">
						<div className="flex items-center gap-3 mb-4">
							<AlertCircle className="w-6 h-6 text-[#F59E0B]" />
							<h4 className="text-lg font-semibold text-primary">
								Confirm AI Ranking
							</h4>
						</div>
						<p className="text-sm text-[#6B7280] mb-4">
							AI ranking uses the Gemini API. This will
							analyze {applicants.length} applicants and may take a few moments.
						</p>
						<div className="flex gap-3">
							<button
								onClick={() => setShowAIConfirm(false)}
								className="flex-1 py-2 px-4 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB]"
							>
								Cancel
							</button>
							<button
								onClick={handleRank}
								className="flex-1 py-2 px-4 bg-[#3A52A6] text-white rounded-lg hover:bg-[#2A4296]"
							>
								Proceed
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
