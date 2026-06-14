import {
	ChevronDown,
	ChevronUp,
	GitBranch,
	Loader2,
	Lock,
	Sparkles,
	Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { RankingCriteria, RankingResult } from "@/lib/ranking/model";
import { RankingMode } from "@/lib/ranking/model";
import type { Applicant, Scholarship } from "@/lib/scholarship/model";
import { AIRanker } from "@/services/ranking/AIRanker";
import { DecisionTreeRanker } from "@/services/ranking/DecisionTreeRanker";

interface RankingControlPanelProps {
	scholarship: Scholarship;
	applicants: Applicant[];
	onRankingComplete: (result: RankingResult) => void;
	onShowSuccess: (title: string, message: string) => void;
	onShowError: (title: string, message: string) => void;
}

const COOLDOWN_DURATION = 30000; // 30 seconds between AI runs
const COOLDOWN_KEY_PREFIX = "ranking_cooldown_";

// AI analyzes at most this many applicants; also enforced server-side
const AI_TOP_N = 10;

// Ranking is a paid feature; the unlock is stored per scholarship.
// TODO: replace the demo unlock with a real payment flow once a payment
// provider is integrated — there is no billing backend yet.
const UNLOCK_KEY_PREFIX = "ranking_unlocked_";

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
	const [cooldownRemaining, setCooldownRemaining] = useState(0);
	const [criteriaWeights, setCriteriaWeights] = useState<
		Record<string, number>
	>({});
	const [criteriaStars, setCriteriaStars] = useState<Record<string, number>>(
		{},
	);
	const [showCriteria, setShowCriteria] = useState(false);
	const [isUnlocked, setIsUnlocked] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);

	// Ranking stays locked until the sponsor pays for this scholarship
	useEffect(() => {
		setIsUnlocked(
			localStorage.getItem(`${UNLOCK_KEY_PREFIX}${scholarship.id}`) === "true",
		);
	}, [scholarship.id]);

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

		checkCooldown();
		const interval = setInterval(checkCooldown, 1000);
		return () => clearInterval(interval);
	}, [scholarship.id]);

	const setCooldown = () => {
		const cooldownKey = `${COOLDOWN_KEY_PREFIX}${scholarship.id}`;
		localStorage.setItem(cooldownKey, Date.now().toString());
		setCooldownRemaining(COOLDOWN_DURATION / 1000);
	};

	const aiCount = Math.min(AI_TOP_N, applicants.length);

	const handleUnlock = () => {
		// TODO: collect the payment through a real provider before unlocking;
		// until then this unlocks immediately for demo purposes.
		localStorage.setItem(`${UNLOCK_KEY_PREFIX}${scholarship.id}`, "true");
		setIsUnlocked(true);
		setShowPaymentModal(false);
		onShowSuccess(
			"Ranking Unlocked",
			"You can now rank applicants for this scholarship.",
		);
	};

	const handleRank = async () => {
		if (!isUnlocked) {
			setShowPaymentModal(true);
			return;
		}

		setIsRanking(true);

		try {
			const criterias: RankingCriteria[] = scholarship.criterias.map(
				(name) => ({
					name,
					weight: criteriaWeights[name] || 100 / scholarship.criterias.length,
					required: true,
				}),
			);

			// Always rank everyone with the decision tree first
			let result = DecisionTreeRanker.rank(
				scholarship.id,
				applicants,
				criterias,
				scholarship.formFields,
			);

			if (selectedMode === RankingMode.AI) {
				const topCandidates = result.rankedApplicants.slice(0, aiCount);

				try {
					const aiResult = await new AIRanker().rankTopCandidates(
						scholarship.id,
						topCandidates.map((r) => r.applicant),
						criterias,
						scholarship.description || undefined,
					);

					// AI-ranked top candidates + remaining auto-ranked candidates
					result = {
						...aiResult,
						rankedApplicants: [
							...aiResult.rankedApplicants,
							...result.rankedApplicants.slice(aiCount).map((r, idx) => ({
								...r,
								rank: aiCount + idx + 1,
							})),
						],
					};
				} catch (error) {
					console.error("AI ranking failed, using automatic ranking:", error);
					onShowError(
						"AI Unavailable",
						"Showing automatic ranking instead. Please try AI again in a few minutes.",
					);
				}

				setCooldown();
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

	const canRank =
		applicants.length > 0 && !isRanking && cooldownRemaining === 0;

	const handleStarChange = (criteriaName: string, stars: number) => {
		const newStars = { ...criteriaStars, [criteriaName]: stars };
		setCriteriaStars(newStars);

		const totalStars = Object.values(newStars).reduce((sum, s) => sum + s, 0);

		if (totalStars === 0) {
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
			const starCount = newStars[criteria] || 0;
			newWeights[criteria] = Math.round((starCount / totalStars) * 100);
		});

		// Fix rounding errors to ensure total is exactly 100
		const currentTotal = Object.values(newWeights).reduce(
			(sum, w) => sum + w,
			0,
		);
		if (currentTotal !== 100) {
			const maxStarCriteria = scholarship.criterias.reduce(
				(max, c) => (newStars[c] > newStars[max] ? c : max),
				scholarship.criterias[0],
			);
			newWeights[maxStarCriteria] += 100 - currentTotal;
		}

		setCriteriaWeights(newWeights);
	};

	const resetWeights = () => {
		const equalWeight = 100 / scholarship.criterias.length;
		const weights: Record<string, number> = {};
		const stars: Record<string, number> = {};
		scholarship.criterias.forEach((criteria) => {
			weights[criteria] = Math.round(equalWeight);
			stars[criteria] = 3;
		});
		setCriteriaWeights(weights);
		setCriteriaStars(stars);
	};

	return (
		<div className="bg-card rounded-lg shadow-sm p-4 mb-4">
			{/* Header: title + the primary action, always visible without scrolling */}
			<div className="flex flex-wrap items-center justify-between gap-3 mb-4">
				<div>
					<h3 className="text-lg text-primary">Rank Applicants</h3>
					<p className="text-xs text-[#6B7280]">
						Sorts the {applicants.length}{" "}
						{applicants.length === 1 ? "applicant" : "applicants"} shown from
						most to least eligible
					</p>
				</div>
				<button
					type="button"
					onClick={handleRank}
					disabled={isUnlocked && !canRank}
					className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-colors ${
						!isUnlocked
							? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
							: canRank
								? selectedMode === RankingMode.AI
									? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
									: "bg-[#3A52A6] text-white hover:bg-[#2A4296]"
								: "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
					}`}
				>
					{!isUnlocked ? (
						<>
							<Lock className="w-4 h-4" />
							Unlock to Rank
						</>
					) : isRanking ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							Ranking...
						</>
					) : cooldownRemaining > 0 ? (
						`Wait ${cooldownRemaining}s`
					) : selectedMode === RankingMode.AI ? (
						<>
							<Sparkles className="w-4 h-4" />
							Rank with AI
						</>
					) : (
						<>
							<GitBranch className="w-4 h-4" />
							Rank Now
						</>
					)}
				</button>
			</div>

			{/* Paid-feature notice while locked */}
			{!isUnlocked && (
				<div className="mb-3 p-3 bg-[#FEF3C7] rounded-lg flex items-center gap-2 text-sm text-[#92400E]">
					<Lock className="w-4 h-4 shrink-0" />
					Ranking is a paid feature. Unlock it once for this scholarship to use
					both ranking modes.
				</div>
			)}

			{/* Mode selection */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
				<button
					type="button"
					onClick={() => setSelectedMode(RankingMode.DecisionTree)}
					disabled={isRanking}
					className={`p-3 rounded-lg border-2 text-left transition-colors ${
						selectedMode === RankingMode.DecisionTree
							? "border-[#3A52A6] bg-[#EFF6FF]"
							: "border-[#E5E7EB] hover:border-[#9CA3AF]"
					} ${isRanking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
				>
					<div className="flex items-center gap-2 mb-1">
						<GitBranch className="w-4 h-4 text-[#3A52A6]" />
						<span className="text-sm text-primary">Quick Rank</span>
					</div>
					<p className="text-xs text-[#6B7280]">
						Instant results from form answers
					</p>
				</button>

				<button
					type="button"
					onClick={() => setSelectedMode(RankingMode.AI)}
					disabled={isRanking}
					className={`p-3 rounded-lg border-2 text-left transition-colors ${
						selectedMode === RankingMode.AI
							? "border-[#8B5CF6] bg-[#F5F3FF]"
							: "border-[#E5E7EB] hover:border-[#9CA3AF]"
					} ${isRanking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
				>
					<div className="flex items-center gap-2 mb-1">
						<Sparkles className="w-4 h-4 text-[#8B5CF6]" />
						<span className="text-sm text-primary">AI Analysis</span>
						<span className="text-[10px] px-1.5 py-0.5 bg-[#F5F3FF] border border-[#8B5CF6] text-[#8B5CF6] rounded-full">
							Top {AI_TOP_N}
						</span>
					</div>
					<p className="text-xs text-[#6B7280]">
						Reads documents and explains each result
					</p>
				</button>
			</div>

			<p className="text-xs text-[#6B7280] mt-2">
				{selectedMode === RankingMode.AI
					? `AI reviews the documents of your top ${aiCount} ${aiCount === 1 ? "applicant" : "applicants"}; the rest are ranked automatically.`
					: "Ranks everyone instantly using their form answers. Documents are not read."}
			</p>

			{/* Progress note while the AI run is in flight */}
			{isRanking && selectedMode === RankingMode.AI && (
				<div className="mt-3 p-3 bg-[#F5F3FF] rounded-lg flex items-center gap-2 text-sm text-[#5B21B6]">
					<Loader2 className="w-4 h-4 animate-spin shrink-0" />
					Analyzing documents. This can take a minute or two, so keep this page
					open.
				</div>
			)}

			{/* Criteria importance, collapsed by default */}
			{scholarship.criterias.length > 0 && (
				<div className="mt-3 border-t border-[#E5E7EB] pt-3">
					<button
						type="button"
						onClick={() => setShowCriteria(!showCriteria)}
						className="w-full flex items-center justify-between text-sm text-[#374151] hover:text-[#3A52A6] transition-colors"
					>
						<span className="flex items-center gap-2">
							<Star className="w-4 h-4 text-[#F59E0B]" />
							Criteria importance
							<span className="text-xs text-[#9CA3AF]">(optional)</span>
						</span>
						{showCriteria ? (
							<ChevronUp className="w-4 h-4" />
						) : (
							<ChevronDown className="w-4 h-4" />
						)}
					</button>

					{showCriteria && (
						<div className="mt-2">
							<div className="flex items-center justify-between gap-3 mb-1">
								<p className="text-xs text-[#6B7280]">
									More stars = more weight in the score.
								</p>
								<button
									type="button"
									onClick={resetWeights}
									disabled={isRanking}
									className="text-xs text-[#3A52A6] hover:text-[#2A4296] disabled:opacity-50 whitespace-nowrap"
								>
									Reset
								</button>
							</div>

							<div className="divide-y divide-[#F3F4F6]">
								{scholarship.criterias.map((criteria) => {
									const stars = criteriaStars[criteria] || 3;
									const weight = criteriaWeights[criteria] || 0;

									return (
										<div
											key={criteria}
											className="flex items-center gap-3 py-2"
										>
											<span
												className="text-sm text-[#374151] flex-1 min-w-0 truncate"
												title={criteria}
											>
												{criteria}
											</span>
											<div className="flex items-center">
												{[1, 2, 3, 4, 5].map((starValue) => (
													<button
														key={starValue}
														type="button"
														onClick={() =>
															handleStarChange(criteria, starValue)
														}
														disabled={isRanking}
														aria-label={`Set importance of "${criteria}" to ${starValue} of 5`}
														className="p-0.5 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
													>
														<Star
															className={`w-4 h-4 ${
																starValue <= stars
																	? "fill-[#F59E0B] text-[#F59E0B]"
																	: "text-[#D1D5DB]"
															}`}
														/>
													</button>
												))}
											</div>
											<span className="text-xs text-[#3A52A6] w-9 text-right">
												{weight}%
											</span>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Payment gate modal */}
			{showPaymentModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-[#F5F3FF] rounded-lg">
								<Lock className="w-6 h-6 text-[#8B5CF6]" />
							</div>
							<h4 className="text-lg text-primary">Unlock Applicant Ranking</h4>
						</div>

						<p className="text-sm text-[#6B7280] mb-4">
							Ranking is a paid feature. A single payment unlocks both ranking
							modes for this scholarship.
						</p>

						<ul className="text-sm text-[#6B7280] space-y-2 bg-[#F9FAFB] rounded-lg p-4 mb-4">
							<li className="flex items-center gap-2">
								<GitBranch className="w-4 h-4 text-[#3A52A6] shrink-0" />
								Instant ranking of all applicants
							</li>
							<li className="flex items-center gap-2">
								<Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0" />
								AI document analysis for your top {AI_TOP_N} applicants
							</li>
							<li className="flex items-center gap-2">
								<Star className="w-4 h-4 text-[#F59E0B] shrink-0" />
								Detailed criteria results you can export
							</li>
						</ul>

						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setShowPaymentModal(false)}
								className="flex-1 py-2 px-4 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB]"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleUnlock}
								className="flex-1 py-2 px-4 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED]"
							>
								Pay to Unlock
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
