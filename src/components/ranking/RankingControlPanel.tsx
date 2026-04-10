import { useState, useEffect } from "react";
import { AlertCircle, Sparkles, GitBranch, Zap, Clock, Sliders, CheckCircle, Star } from "lucide-react";
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
	const [criteriaStars, setCriteriaStars] = useState<Record<string, number>>(
		{},
	);
	const [aiTopN, setAiTopN] = useState(5); // Only analyze top N candidates with AI

	// Initialize criteria weights when scholarship changes
	useEffect(() => {
		if (scholarship.criterias.length > 0) {
			const equalWeight = 100 / scholarship.criterias.length;
			const weights: Record<string, number> = {};
			const stars: Record<string, number> = {};
			scholarship.criterias.forEach((criteria) => {
				weights[criteria] = Math.round(equalWeight);
				stars[criteria] = 3; // Default to 3 stars (medium importance)
			});
			setCriteriaWeights(weights);
			setCriteriaStars(stars);
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

	const handleStarChange = (criteriaName: string, stars: number) => {
		// Update stars
		const newStars = { ...criteriaStars, [criteriaName]: stars };
		setCriteriaStars(newStars);
		
		// Convert stars to weights (1-5 stars)
		// Calculate total stars
		const totalStars = Object.values(newStars).reduce((sum, s) => sum + s, 0);
		
		if (totalStars === 0) {
			// All are 0 stars, reset to equal
			const equalWeight = 100 / scholarship.criterias.length;
			const weights: Record<string, number> = {};
			scholarship.criterias.forEach((criteria) => {
				weights[criteria] = Math.round(equalWeight);
			});
			setCriteriaWeights(weights);
			return;
		}
		
		// Convert stars to percentage weights
		const newWeights: Record<string, number> = {};
		scholarship.criterias.forEach((criteria) => {
			const criteriaStars = newStars[criteria] || 0;
			newWeights[criteria] = Math.round((criteriaStars / totalStars) * 100);
		});
		
		// Fix rounding errors to ensure total is exactly 100
		const currentTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
		if (currentTotal !== 100) {
			// Find the criterion with the most stars and adjust it
			const maxStarCriteria = scholarship.criterias.reduce((max, c) => 
				newStars[c] > newStars[max] ? c : max
			, scholarship.criterias[0]);
			newWeights[maxStarCriteria] += (100 - currentTotal);
		}
		
		setCriteriaWeights(newWeights);
	};

	const handleWeightChange = (criteriaName: string, newWeight: number) => {
		const oldWeight = criteriaWeights[criteriaName] || 0;
		const difference = newWeight - oldWeight;
		
		// Get other criteria (excluding the one being changed)
		const otherCriteria = scholarship.criterias.filter(c => c !== criteriaName);
		
		if (otherCriteria.length === 0) {
			// Only one criterion, just set it
			setCriteriaWeights({ [criteriaName]: newWeight });
			return;
		}
		
		// Calculate total weight of other criteria
		const otherWeightsTotal = otherCriteria.reduce(
			(sum, c) => sum + (criteriaWeights[c] || 0),
			0
		);
		
		// Auto-adjust other criteria proportionally
		const newWeights: Record<string, number> = { [criteriaName]: newWeight };
		
		if (otherWeightsTotal > 0) {
			// Distribute the difference proportionally among other criteria
			const targetTotal = 100 - newWeight;
			otherCriteria.forEach(c => {
				const currentWeight = criteriaWeights[c] || 0;
				const proportion = currentWeight / otherWeightsTotal;
				const adjustedWeight = Math.round(targetTotal * proportion);
				newWeights[c] = Math.max(0, Math.min(100, adjustedWeight));
			});
			
			// Fix rounding errors - adjust the largest weight
			const calculatedTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
			if (calculatedTotal !== 100) {
				const largestOther = otherCriteria.reduce((max, c) => 
					newWeights[c] > newWeights[max] ? c : max
				, otherCriteria[0]);
				newWeights[largestOther] += (100 - calculatedTotal);
				newWeights[largestOther] = Math.max(0, Math.min(100, newWeights[largestOther]));
			}
		} else {
			// Other criteria are all 0, distribute remaining weight equally
			const remaining = 100 - newWeight;
			const equalWeight = Math.floor(remaining / otherCriteria.length);
			const remainder = remaining % otherCriteria.length;
			
			otherCriteria.forEach((c, idx) => {
				newWeights[c] = equalWeight + (idx < remainder ? 1 : 0);
			});
		}
		
		setCriteriaWeights(newWeights);
	};

	const resetWeights = () => {
		const equalWeight = 100 / scholarship.criterias.length;
		const weights: Record<string, number> = {};
		const stars: Record<string, number> = {};
		scholarship.criterias.forEach((criteria) => {
			weights[criteria] = Math.round(equalWeight);
			stars[criteria] = 3; // Reset to 3 stars
		});
		setCriteriaWeights(weights);
		setCriteriaStars(stars);
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
						<div>
							<h4 className="text-sm font-medium text-primary flex items-center gap-2">
								<Star className="w-4 h-4 text-[#F59E0B]" />
								Rate Importance
							</h4>
							<p className="text-xs text-[#6B7280] mt-0.5">
								Click stars to show how important each requirement is. More stars = more important.
							</p>
						</div>
						<button
							onClick={resetWeights}
							disabled={isRanking}
							className="text-xs text-[#3A52A6] hover:text-[#2A4296] disabled:opacity-50 whitespace-nowrap ml-3"
						>
							Reset All
						</button>
					</div>

					<div className="space-y-3">
						{scholarship.criterias.map((criteria) => {
							const stars = criteriaStars[criteria] || 3;
							const weight = criteriaWeights[criteria] || 0;
							
							return (
								<div key={criteria} className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
									<div className="flex items-start justify-between gap-3 mb-2">
										<label className="text-sm text-[#374151] font-medium flex-1">
											{criteria}
										</label>
										<span className="text-sm font-bold text-[#3A52A6] whitespace-nowrap">
											{weight}%
										</span>
									</div>
									
									<div className="flex items-center gap-1">
										{[1, 2, 3, 4, 5].map((starValue) => (
											<button
												key={starValue}
												type="button"
												onClick={() => handleStarChange(criteria, starValue)}
												disabled={isRanking}
												className="p-1 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<Star
													className={`w-6 h-6 ${
														starValue <= stars
															? "fill-[#F59E0B] text-[#F59E0B]"
															: "text-[#D1D5DB]"
													}`}
												/>
											</button>
										))}
										<span className="ml-2 text-xs text-[#6B7280]">
											{stars === 1 && "Low"}
											{stars === 2 && "Medium-Low"}
											{stars === 3 && "Medium"}
											{stars === 4 && "High"}
											{stars === 5 && "Very High"}
										</span>
									</div>
								</div>
							);
						})}
					</div>

					<div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
						<span className="text-xs text-[#6B7280]">
							Weights are calculated automatically based on your star ratings
						</span>
						<div className="flex items-center gap-2">
							<CheckCircle className="w-4 h-4 text-[#10B981]" />
							<span className="text-sm font-medium text-[#10B981]">
								Total: {totalWeight}%
							</span>
						</div>
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
