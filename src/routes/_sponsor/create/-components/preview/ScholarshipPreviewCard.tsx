import { Calendar, Users, Coins, UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatDeadline } from "@/utils/formatting.utils";
import { ScholarshipType, type ScholarshipFormData } from "@/lib/scholarship/model";
import { useAuth } from "@/auth";
import type { AnySponsor } from "@/lib/sponsor/model";
import { getSponsorName } from "@/lib/sponsor/api";
import { Button } from "@/components/ui/button";
import type { AmountType } from "../../-model";

interface ScholarshipPreviewCardProps {
	scholarship: Partial<ScholarshipFormData>;
	amountType?: AmountType;
	unlimitedSlots?: boolean;
	onClick?: () => void;
}

export default function ScholarshipPreviewCard({ scholarship, amountType = "varies", unlimitedSlots = true, onClick }: ScholarshipPreviewCardProps) {
	const auth = useAuth<AnySponsor>();

	const isFixed = amountType === "fixed";
	const isRange = amountType === "range";
	const isVaries = amountType === "varies";

	const handleApplyClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.4,
				ease: [0.25, 0.1, 0.25, 1]
			}}
			whileHover={{
				scale: 0.99,
				transition: { duration: 0.2 }
			}}
			onClick={onClick}
			className="bg-card cursor-pointer rounded-md overflow-hidden border border-[#D3DCF6] hover:border-[#3A52A6] transition-colors"
		>
			{/* Header */}
			<div className="bg-[#3A52A6]">
				<div className="flex">
					{/* Image */}
					<motion.div
						transition={{ duration: 0.3 }}
						className="w-32 h-32 bg-white/10 shrink-0 overflow-hidden"
					>
						<img
							src={scholarship.imageUrl || "/scholarship-banner-placeholder.png"}
							alt="Preview"
							className="w-full h-full object-cover"
						/>
					</motion.div>

					{/* Info */}
					<div className="flex-1 text-tertiary px-4 py-2">
						<h3 className="text-xl mb-1 line-clamp-1">{scholarship.name || "Scholarship Title"}</h3>

						{/* Badges */}
						<div className="flex flex-wrap gap-2 mb-3">
							{scholarship.scholarshipType && (
								scholarship.scholarshipType === ScholarshipType.Combined ? (
									<>
										<motion.span
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ delay: 0.1 }}
											className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
										>
											Merit-Based
										</motion.span>
										<motion.span
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ delay: 0.15 }}
											className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
										>
											Need-Based
										</motion.span>
									</>
								) : (
									<motion.span
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.1 }}
										className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
									>
										{scholarship.scholarshipType === ScholarshipType.NeedBased ? "Need-Based" : "Merit-Based"}
									</motion.span>
								)
							)}
						</div>

						{/* Sponsor and Deadline */}
						<div className="space-y-1.5 text-xs">
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 rounded-full bg-card flex items-center justify-center shrink-0">
									{auth.profile.avatarUrl ? (
										<img
											src={auth.profile.avatarUrl}
											alt={getSponsorName(auth.profile)}
											className="w-full h-full rounded-full object-cover"
										/>
									) : (
										<UserIcon className="w-full h-full text-secondary" />
									)}
								</div>
								<span>{getSponsorName(auth.profile) || "iSkolar"}</span>
							</div>
							<div className="flex items-center gap-2">
								<Calendar size={16} />
								<span>{formatDeadline(scholarship.applicationDeadline)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-4">
				{/* Amount and Slots */}
				<div className="grid grid-cols-2 gap-2 mb-4">
					<motion.div
						transition={{ duration: 0.2 }}
						className="bg-[#F9FAFB] border border-border rounded-lg p-3"
					>
						<div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
							<Coins size={16} />
							<span>Amount</span>
						</div>
						{isFixed && (<><p className="text-sm md:text-base text-primary">{formatCurrency(scholarship.totalAmount ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>)}
						{isRange && (<><p className="text-sm md:text-base text-primary">{formatCurrency(scholarship.totalAmountMin ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" – "}{formatCurrency(scholarship.totalAmountMax ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>)}
						{isVaries && (<><p className="text-sm md:text-base text-primary">Varies</p><p className="text-xs text-[#6B7280]">see details</p></>)}
					</motion.div>

					<motion.div
						transition={{ duration: 0.2 }}
						className="bg-[#F9FAFB] border border-border rounded-lg p-3"
					>
						<div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
							<Users size={16} />
							<span>Slots</span>
						</div>
						<p className="text-sm md:text-base text-primary">{unlimitedSlots ? "No limit" : (scholarship.totalSlots ?? "No limit")}</p>
						<p className="text-xs text-[#6B7280]">scholars</p>
					</motion.div>
				</div>

				{/* Action Buttons */}
				<div className="grid grid-cols-2 gap-2 pt-1">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<Button
							variant="outline"
							size="default"
							onClick={onClick}
							className="w-full text-xs md:text-sm border-[#3A52A6] text-[#3A52A6] hover:bg-[#3A52A6] hover:text-white cursor-pointer"
						>
							View Details
						</Button>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25 }}
					>
						<Button
							size="default"
							onClick={handleApplyClick}
							className="w-full text-xs md:text-sm bg-[#3A52A6] text-white hover:bg-[#2f4389] cursor-pointer"
						>
							Apply Now
						</Button>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}
