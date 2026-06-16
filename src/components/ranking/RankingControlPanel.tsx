import { useState, useEffect } from "react";
import { Sparkles, Clock, CheckCircle, Star } from "lucide-react";
import type { Applicant, Scholarship } from "@/lib/scholarship/model";
import type { RankingCriteria, RankingResult } from "@/lib/ranking/model";
import { DeterministicRanker } from "@/services/ranking/DeterministicRanker";

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
	const [isRanking, setIsRanking] = useState(false);
	const [cooldownRemaining, setCooldownRemaining] = useState(0);
	const [criteriaWeights, setCriteriaWeights] = useState<
		Record<string, number>
	>({});
	const [criteriaStars, setCriteriaStars] = useState<Record<string, number>>(
		{},
	);

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

	const handleRank = async () => {
		setIsRanking(true);
		try {
			const criterias: RankingCriteria[] = scholarship.criterias.map(
				(name) => ({
					name,
					weight: criteriaWeights[name] || 100 / scholarship.criterias.length,
					required: true,
				}),
			);

			// Ranking runs entirely on the backend (POST /ranking/deterministic):
			// the self-hosted PaddleOCR service extracts document text and the
			// deterministic engine scores authenticity + criteria. No AI/Gemini key
			// is used in the browser; the request is authenticated via the session
			// cookie (credentials: "include").
			const ranker = new DeterministicRanker();
			const result = await ranker.rank(
				scholarship.id,
				applicants,
				criterias,
				scholarship.description || undefined,
			);

			setCooldown();
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

	const totalWeight = Object.values(criteriaWeights).reduce(
		(sum, w) => sum + w,
		0,
	);

	return (
		<div className="bg-card rounded-lg shadow-sm p-4 mb-4">
			<div className="flex items-center gap-2 mb-1">
				<div className="p-2 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-lg">
					<Sparkles className="w-5 h-5 text-white" />
				</div>
				<div>
					<h3 className="text-lg text-primary">AI Applicant Ranking</h3>
					<p className="text-xs text-[#6B7280]">
						Reads uploaded documents, verifies authenticity, and ranks every
						applicant against your criteria.
					</p>
				</div>
			</div>

			{/* Criteria Weights Configuration */}
			{scholarship.criterias.length > 0 && (
				<div className="mt-4 mb-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
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
						? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
						: "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
				}`}
			>
				{isRanking ? (
					<span className="flex items-center justify-center gap-2">
						<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						Ranking...
					</span>
				) : (
					`Rank ${applicants.length} ${applicants.length === 1 ? "Applicant" : "Applicants"}`
				)}
			</button>
		</div>
	);
}
