import { Calendar, Users, Coins, UserIcon } from "lucide-react";
import { formatCurrency, formatDeadline } from "@/utils/formatting.utils";
import { ScholarshipType, type ScholarshipFormData } from "@/lib/scholarship/model";
import { useAuth } from "@/auth";
import type { AnySponsor } from "@/lib/sponsor/model";
import { getSponsorName } from "@/lib/sponsor/api";
import type { AmountType } from "../../-model";

interface ScholarshipPreviewCardProps {
	scholarship: Partial<ScholarshipFormData>;
	amountType?: AmountType;
	unlimitedSlots?: boolean;
	onClick?: () => void;
}

export default function ScholarshipPreviewCard({ scholarship, amountType = "fixed", unlimitedSlots = false, onClick }: ScholarshipPreviewCardProps) {
	const auth = useAuth<AnySponsor>();

	const isFixed = amountType === "fixed";
	const isRange = amountType === "range";
	const isVaries = amountType === "varies";

	return (
		<div
			onClick={onClick}
			className="bg-card rounded-md overflow-hidden border border-[#D3DCF6] cursor-pointer transition-transform duration-200 hover:scale-98"
		>
			<div className="bg-[#3A52A6]">
				<div className="flex">
					{/* Image Section */}
					<div className="relative w-32 h-32 shrink-0">
						<img
							src={scholarship.imageUrl || "/scholarship-banner-placeholder.png"}
							alt="Preview"
							className="w-full h-full object-cover"
						/>
					</div>

					{/* Info */}
					<div className="flex-1 text-tertiary px-4 py-2">
						<h3 className="text-xl mb-1 line-clamp-1">
							{scholarship.name || "Scholarship Title"}
						</h3>

						{scholarship.scholarshipType && (
							<div className="flex flex-wrap items-center gap-2 mb-4">
								{scholarship.scholarshipType === ScholarshipType.Combined ? (
									<>
										<span className="px-2 py-0.5 text-white text-[11px] rounded bg-transparent">
											Merit-Based
										</span>
										<span className="px-2 py-0.5 text-white text-[11px] rounded bg-transparent">
											Skill-Based
										</span>
									</>
								) : (
									<span className="px-2 py-0.5 text-white text-[11px] rounded bg-transparent">
										{scholarship.scholarshipType === ScholarshipType.NeedBased ? "Need-Based" : "Merit-Based"}
									</span>
								)}
							</div>
						)}

						<div className="flex items-center gap-2 text-xs mb-1.5">
							<div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
								{auth.profile.avatarUrl ? (
									<img
										src={auth.profile.avatarUrl}
										alt={getSponsorName(auth.profile)}
										className="w-full h-full rounded-full object-cover"
									/>
								) : (
									<UserIcon className="w-full h-full" />
								)}
							</div>
							<span>{getSponsorName(auth.profile) || "iSkolar"}</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<Calendar size={16} />
							<span>
								{formatDeadline(scholarship.applicationDeadline)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 pb-4 pt-2">
				{/* Amount & Slots */}
				<div className="grid grid-cols-2 gap-2 mt-2 mb-4">
					<div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
						<div className="flex items-center gap-1 text-[#6B7280] text-sm mb-1">
							<Coins size={16} />
							<span>Amount</span>
						</div>
						{isFixed && (
							<>
								<p className="text-base text-primary">
									{formatCurrency(scholarship.totalAmount ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
								</p>
								<p className="text-xs text-[#6B7280]">per scholar</p>
							</>
						)}
						{isRange && (
							<>
								<p className="text-base text-primary">
									{formatCurrency(scholarship.totalAmountMin ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
									{" – "}
									{formatCurrency(scholarship.totalAmountMax ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
								</p>
								<p className="text-xs text-[#6B7280]">per scholar</p>
							</>
						)}
						{isVaries && (
							<>
								<p className="text-base text-primary">Varies</p>
								<p className="text-xs text-[#6B7280]">see details</p>
							</>
						)}
					</div>

					<div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
						<div className="flex items-center gap-1 text-[#6B7280] text-sm mb-1">
							<Users size={16} />
							<span>Slots</span>
						</div>
						<p className="text-base text-primary">{unlimitedSlots ? "No limit" : (scholarship.totalSlots ?? 0)}</p>
						<p className="text-xs text-[#6B7280]">scholars</p>
					</div>
				</div>
			</div>
		</div>
	);
}
