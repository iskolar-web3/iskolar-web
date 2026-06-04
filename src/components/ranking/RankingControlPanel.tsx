import { useState, useEffect } from "react";
import { AlertCircle, Sparkles, GitBranch, Clock, CheckCircle, Star, Lock, Unlock } from "lucide-react";
import type { Applicant, Scholarship } from "@/lib/scholarship/model";
import type { RankingCriteria, RankingResult } from "@/lib/ranking/model";
import { RankingMode } from "@/lib/ranking/model";
import { DecisionTreeRanker } from "@/services/ranking/DecisionTreeRanker";
import { AIRanker } from "@/services/ranking/AIRanker";
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
	const [criteriaWeights, setCriteriaWeights] = useState<Record<string, number>>(
		{},
	);
	const [criteriaStars, setCriteriaStars] = useState<Record<string, number>>(
		{},
	);
	const [aiTopN, setAiTopN] = useState(10); // Default to 10 for free tier
	const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false); // Premium feature flag
	const [showPremiumModal, setShowPremiumModal] = useState(false); // Payment modal

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
		if (selectedMode === RankingMode.AI && !showAIConfirm) {
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
					console.log('Using Quick Ranking (Decision Tree) mode');
					result = DecisionTreeRanker.rank(
						scholarship.id,
						applicants,
						criterias,
					);
					break;

				case RankingMode.AI: {
					console.log('Using AI Insights mode');
					const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
					if (!apiKey) {
						throw new Error("Gemini API key not configured");
					}
					
					// Determine how many to analyze with AI
					const topNToAnalyze = isPremiumUnlocked ? applicants.length : Math.min(aiTopN, applicants.length);
					console.log('AI Top N:', topNToAnalyze, 'Premium:', isPremiumUnlocked);
					
					// First, rank with Decision Tree
					const dtResult = DecisionTreeRanker.rank(
						scholarship.id,
						applicants,
						criterias,
					);
					
					// Then only use AI for top N candidates
					const topCandidates = dtResult.rankedApplicants.slice(0, topNToAnalyze);
					console.log('Top candidates for AI analysis:', topCandidates.length);
					const aiRanker = new AIRanker(apiKey);
					
					try {
						console.log('Calling AI ranker...');
						const aiResult = await aiRanker.rankTopCandidates(
							scholarship.id,
							topCandidates.map(r => r.applicant),
							criterias,
							scholarship.description || undefined,
						);
						
						console.log('AI ranking completed successfully');
						
						// Merge: AI-ranked top candidates + remaining DT-ranked candidates
						result = {
							...aiResult,
							rankedApplicants: [
								...aiResult.rankedApplicants,
								...dtResult.rankedApplicants.slice(topNToAnalyze).map((r, idx) => ({
									...r,
									rank: topNToAnalyze + idx + 1,
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
			<h3 className="text-lg text-primary mb-4">
				Applicant Ranking
			</h3>

			{/* Mode Selection */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				{/* Basic Ranking */}
				<button
					onClick={() => setSelectedMode(RankingMode.DecisionTree)}
					disabled={isRanking}
					className={`p-5 rounded-lg border-2 transition-all text-left ${
						selectedMode === RankingMode.DecisionTree
							? "border-[#3A52A6] bg-[#EFF6FF] shadow-md"
							: "border-[#E5E7EB] hover:border-[#3A52A6] hover:shadow-sm"
					} ${isRanking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
				>
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-[#3A52A6] rounded-lg">
								<GitBranch className="w-5 h-5 text-white" />
							</div>
							<div>
								<span className="text-primary text-base block">Basic Ranking</span>
								<span className="text-[10px] px-2 py-0.5 bg-[#E5E7EB] text-[#6B7280] rounded-full mt-1 inline-block">FREE</span>
							</div>
						</div>
						{selectedMode === RankingMode.DecisionTree && (
							<CheckCircle className="w-5 h-5 text-[#3A52A6]" />
						)}
					</div>
					<p className="text-sm text-[#6B7280] leading-relaxed mb-2">
						Quick automatic ranking based on form answers
					</p>
					<ul className="text-xs text-[#6B7280] space-y-1">
						<li className="flex items-center gap-1">
							<span className="text-[#10B981]">✓</span> Instant results
						</li>
						<li className="flex items-center gap-1">
							<span className="text-[#10B981]">✓</span> Checks all requirements
						</li>
						<li className="flex items-center gap-1">
							<span className="text-[#10B981]">✓</span> No document reading
						</li>
					</ul>
				</button>

				{/* AI Ranking */}
				<button
					onClick={() => setSelectedMode(RankingMode.AI)}
					disabled={isRanking}
					className={`p-5 rounded-lg border-2 transition-all text-left ${
						selectedMode === RankingMode.AI
							? "border-[#8B5CF6] bg-[#F5F3FF] shadow-md"
							: "border-[#E5E7EB] hover:border-[#8B5CF6] hover:shadow-sm"
					} ${isRanking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
				>
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-lg">
								<Sparkles className="w-5 h-5 text-white" />
							</div>
							<div>
								<span className="text-primary text-base block">AI-Powered Ranking</span>
								<span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white rounded-full mt-1 inline-block">PREMIUM</span>
							</div>
						</div>
						{selectedMode === RankingMode.AI && (
							<CheckCircle className="w-5 h-5 text-[#8B5CF6]" />
						)}
					</div>
					<p className="text-sm text-[#6B7280] leading-relaxed mb-2">
						AI reads documents and gives detailed insights
					</p>
					<ul className="text-xs text-[#6B7280] space-y-1">
						<li className="flex items-center gap-1">
							<span className="text-[#8B5CF6]">✓</span> Reads uploaded documents
						</li>
						<li className="flex items-center gap-1">
							<span className="text-[#8B5CF6]">✓</span> Detailed recommendations
						</li>
						<li className="flex items-center gap-1">
							<span className="text-[#8B5CF6]">✓</span> {isPremiumUnlocked ? `All ${applicants.length} applicants` : 'Top 10 applicants'}
						</li>
					</ul>
				</button>
			</div>

			{/* AI Mode - Top N Selector and Premium Unlock */}
			{selectedMode === RankingMode.AI && (
				<div className="mb-4 space-y-3">
					{/* Premium Unlock Card - Subtle design */}
					{!isPremiumUnlocked && (
						<div className="p-4 bg-white rounded-lg border-2 border-[#8B5CF6] shadow-sm">
							<div className="flex items-start gap-3 mb-3">
								<div className="p-2 bg-[#F5F3FF] rounded-lg">
									<Lock className="w-5 h-5 text-[#8B5CF6]" />
								</div>
								<div className="flex-1">
									<h4 className="text-base text-[#374151] mb-1">Premium Feature Available</h4>
									<p className="text-sm text-[#6B7280]">Unlock to rank ALL candidates with AI</p>
								</div>
							</div>
							<div className="bg-[#F9FAFB] rounded-lg p-3 mb-3 space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-[#6B7280]">Free Tier</span>
									<span className="text-[#374151]">Top 10 applicants only</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-[#6B7280]">Premium</span>
									<span className="text-[#8B5CF6]">ALL {applicants.length} applicants analyzed</span>
								</div>
							</div>
							<button
								onClick={() => setShowPremiumModal(true)}
								disabled={isRanking}
								className="w-full py-3 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								<Unlock className="w-4 h-4" />
								Unlock Premium - Rank All {applicants.length} Candidates
							</button>
						</div>
					)}

					{/* Current Settings Display */}
					<div className={`p-4 rounded-lg border-2 ${isPremiumUnlocked ? 'bg-[#F0FDF4] border-[#10B981]' : 'bg-[#F5F3FF] border-[#8B5CF6]'}`}>
						<div className="flex items-start justify-between mb-3">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									{isPremiumUnlocked ? (
										<>
											<Unlock className="w-5 h-5 text-[#10B981]" />
											<span className="text-base text-[#065F46]">Premium Active</span>
										</>
									) : (
										<>
											<Sparkles className="w-5 h-5 text-[#8B5CF6]" />
											<span className="text-base text-[#5B21B6]">Free Tier</span>
										</>
									)}
								</div>
								<p className="text-sm text-[#6B7280] mb-2">
									{isPremiumUnlocked 
										? `AI will analyze all ${applicants.length} applicants with full document review and detailed insights.`
										: `AI will analyze your top ${Math.min(aiTopN, applicants.length)} applicants. Remaining applicants will be ranked automatically.`
									}
								</p>
								{isPremiumUnlocked && (
									<div className="flex items-center gap-2 text-sm text-[#10B981]">
										<CheckCircle className="w-4 h-4" />
										<span>Full AI analysis for all applicants</span>
									</div>
								)}
							</div>
							{isPremiumUnlocked && (
								<button
									onClick={() => setIsPremiumUnlocked(false)}
									disabled={isRanking}
									className="text-xs text-[#6B7280] hover:text-[#374151] ml-3 whitespace-nowrap underline"
								>
									Switch to Free
								</button>
							)}
						</div>
						
						{!isPremiumUnlocked && (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-[#374151]">Number of applicants to analyze:</span>
									<span className="text-2xl text-[#8B5CF6]">{Math.min(aiTopN, applicants.length)}</span>
								</div>
								<input
									type="range"
									min="3"
									max={Math.min(10, applicants.length)}
									value={aiTopN}
									onChange={(e) => setAiTopN(parseInt(e.target.value))}
									disabled={isRanking}
									className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
								/>
								<div className="flex justify-between text-xs text-[#6B7280]">
									<span>3 applicants (faster)</span>
									<span>10 applicants (slower)</span>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Criteria Weights Configuration */}
			{scholarship.criterias.length > 0 && (
				<div className="mb-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
					<div className="flex items-center justify-between mb-3">
						<div>
							<h4 className="text-sm text-primary flex items-center gap-2">
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
										<label className="text-sm text-[#374151] flex-1">
											{criteria}
										</label>
										<span className="text-sm text-[#3A52A6] whitespace-nowrap">
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
							<span className="text-sm text-[#10B981]">
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
				className={`w-full py-3 rounded-lg transition-all ${
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
				) : selectedMode === RankingMode.AI ? (
					isPremiumUnlocked 
						? `Rank All ${applicants.length} with AI (Premium)`
						: `Rank Top ${Math.min(aiTopN, applicants.length)} with AI`
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
							<h4 className="text-lg text-primary">
								Confirm AI Ranking
							</h4>
						</div>
						<p className="text-sm text-[#6B7280] mb-4">
							{isPremiumUnlocked 
								? `This will analyze all ${applicants.length} applicants with AI and may take several minutes.`
								: `This will analyze ${Math.min(aiTopN, applicants.length)} applicants with AI and may take a few moments.`
							}
						</p>
						{isPremiumUnlocked && (
							<div className="mb-4 p-3 bg-[#F0FDF4] rounded-lg border border-[#10B981]">
								<div className="flex items-center gap-2 text-sm text-[#065F46]">
									<Sparkles className="w-4 h-4" />
									<span>Premium AI Analysis Active</span>
								</div>
							</div>
						)}
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

			{/* Premium Payment Modal */}
			{showPremiumModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md mx-4">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-[#F5F3FF] rounded-lg">
								<Sparkles className="w-6 h-6 text-[#8B5CF6]" />
							</div>
							<h4 className="text-lg text-primary">
								Upgrade to Premium
							</h4>
						</div>
						
						<div className="mb-4">
							<p className="text-sm text-[#6B7280] mb-4">
								Unlock AI-powered ranking for all {applicants.length} applicants with detailed document analysis and insights.
							</p>
							
							<div className="bg-[#F9FAFB] rounded-lg p-4 mb-4">
								<div className="text-sm text-[#374151] mb-3">Premium Features:</div>
								<ul className="text-sm text-[#6B7280] space-y-2">
									<li className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-[#10B981]" />
										<span>Rank unlimited applicants with AI</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-[#10B981]" />
										<span>Full document reading and analysis</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-[#10B981]" />
										<span>Detailed AI recommendations</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-[#10B981]" />
										<span>Priority support</span>
									</li>
								</ul>
							</div>
							
							<div className="bg-[#EFF6FF] border border-[#3A52A6] rounded-lg p-4 text-center">
								<div className="text-2xl text-[#3A52A6] mb-1">Contact Sales</div>
								<div className="text-sm text-[#6B7280]">
									Premium pricing available on request
								</div>
							</div>
						</div>
						
						<div className="flex gap-3">
							<button
								onClick={() => setShowPremiumModal(false)}
								className="flex-1 py-2 px-4 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB]"
							>
								Maybe Later
							</button>
							<button
								onClick={() => {
									// TODO: Integrate with payment system
									// For now, just unlock for demo purposes
									setIsPremiumUnlocked(true);
									setShowPremiumModal(false);
									onShowSuccess("Premium Activated", "You can now rank all applicants with AI");
								}}
								className="flex-1 py-2 px-4 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED]"
							>
								Contact Sales
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
