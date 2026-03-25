import { motion, AnimatePresence } from "framer-motion";
import {
	Calendar,
	Users,
	Coins,
	ChevronsRight,
	Images,
	UserIcon,
} from "lucide-react";
import { useState } from "react";
import {
	formatCurrency,
	formatDeadline,
} from "@/utils/formatting.utils";
import {
	ScholarshipType,
	type ScholarshipFormData,
} from "@/lib/scholarship/model";
import { useAuth } from "@/auth";
import type { AnySponsor } from "@/lib/sponsor/model";
import { getSponsorName } from "@/lib/sponsor/api";

/**
 * Props for the ScholarshipFullPreviewModal component
 */
interface ScholarshipFullPreviewModalProps {
	/** Partial scholarship data to display in preview */
	scholarship: Partial<ScholarshipFormData>;
	/** Callback function to close the modal */
	onClose: () => void;
	/** Whether this is a preview mode (hides apply button) */
	isPreview?: boolean;
}

/**
 * Full scholarship preview modal component
 * Displays comprehensive scholarship details in preview or view mode
 * @param props - Component props
 * @returns Animated side panel modal with full scholarship preview
 */
export default function ScholarshipFullPreviewModal({
	scholarship,
	onClose,
	isPreview = false,
}: ScholarshipFullPreviewModalProps) {
	const [isExiting, setIsExiting] = useState(false);

	const auth = useAuth<AnySponsor>();
	const isRange = scholarship.totalAmountMin != null || scholarship.totalAmountMax != null;
	const isFixed = !isRange && scholarship.totalAmount != null;
	const isVaries = !isRange && !isFixed;

	/**
	 * Handles modal close with exit animation
	 */
	const handleClose = () => {
		setIsExiting(true);
		setTimeout(onClose, 200);
	};

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-end p-2">
				{/* Backdrop */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: isExiting ? 0 : 1 }}
					transition={{ duration: 0.1 }}
					onClick={handleClose}
					className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
				/>

				<motion.div
					initial={{ x: "100%" }}
					animate={{ x: isExiting ? "100%" : 0 }}
					transition={{
						type: "spring",
						damping: 35,
						stiffness: 300,
						duration: 0.1,
					}}
					className="relative w-full max-w-120 h-full bg-card shadow-2xl rounded-lg overflow-y-auto custom-scrollbar"
				>
					{/* Header */}
					<div className="sticky top-0 bg-white border-b border-border px-5 py-3 flex items-center justify-between z-10">
						<h2 className="text-lg text-primary flex items-center gap-2">
							<button
								onClick={handleClose}
								className="hover:bg-gray-100 rounded-lg transition-colors"
							>
								<ChevronsRight size={20} className="text-primary" />
							</button>
							{isPreview ? "Preview" : "Scholarship Details"}
						</h2>
					</div>

					<div className="p-5">
						{/* Image Banner */}
						<div className="relative w-full aspect-square mb-5 rounded-lg overflow-hidden shadow-[0_0_20px_2px_rgba(0,0,0,0.2)]">
							{scholarship.imageUrl ? (
								<img
									src={scholarship.imageUrl}
									alt={scholarship.name || "Scholarship"}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full bg-gray-100 flex items-center justify-center">
									<Images className="text-gray-400" size={80} />
								</div>
							)}
						</div>

						{/* Title and Badges */}
						<h1 className="text-[26px] text-primary mb-2">
							{scholarship.name || "Scholarship Title"}
						</h1>
						<div className="flex gap-2 mb-4">
							{scholarship.scholarshipType && (
								scholarship.scholarshipType === ScholarshipType.Combined ? (
									<>
										<span className="px-2.5 py-1 bg-[#F3F4F6] text-[#374151] text-xs rounded border border-border">Merit-Based</span>
										<span className="px-2.5 py-1 bg-[#F3F4F6] text-[#374151] text-xs rounded border border-border">Need-Based</span>
									</>
								) : (
									<span className="px-2.5 py-1 bg-[#F3F4F6] text-[#374151] text-xs rounded border border-border">
										{scholarship.scholarshipType === ScholarshipType.NeedBased ? "Need-Based" : "Merit-Based"}
									</span>
								)
							)}
						</div>

						{/* Sponsor and Deadline */}
						<div className="space-y-3 mb-4 text-[#6B7280]">
							<div className="flex items-center gap-2">
								<div className="w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0">
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
								<span className="text-sm">{getSponsorName(auth.profile)}</span>
							</div>
							<div className="flex items-center gap-2">
								<Calendar size={22} />
								<span className="text-sm">
									{formatDeadline(scholarship.applicationDeadline)}
								</span>
							</div>
						</div>

						{/* Amount and Slots */}
						<div className="grid grid-cols-2 gap-3 mb-6">
							<div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
								<div className="flex items-center gap-1.5 text-[#6B7280] mb-1.5">
									<Coins size={16} />
									<span className="text-xs">Amount</span>
								</div>
								{isFixed && (<><p className="text-base text-primary mb-0.5">{formatCurrency(scholarship.totalAmount!, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>)}
								{isRange && (<><p className="text-base text-primary mb-0.5">{formatCurrency(scholarship.totalAmountMin ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" – "}{formatCurrency(scholarship.totalAmountMax ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>)}
								{isVaries && (<><p className="text-base text-primary mb-0.5">Varies</p><p className="text-xs text-[#6B7280]">see details</p></>)}
							</div>

							<div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
								<div className="flex items-center gap-1.5 text-[#6B7280] mb-1.5">
									<Users size={16} />
									<span className="text-xs">Slots</span>
								</div>
								<p className="text-base text-primary mb-0.5">{scholarship.totalSlots ?? "No limit"}</p>
								<p className="text-xs text-[#6B7280]">scholars</p>
							</div>
						</div>

						{/* Description */}
						{scholarship.description && (
							<div className="mb-6">
								<h3 className="text-sm text-primary mb-2">About Scholarship</h3>
								<p className="text-[#6B7280] text-xs leading-relaxed">
									{scholarship.description}
								</p>
							</div>
						)}

						{/* Eligibility Criteria */}
						{scholarship.criterias && scholarship.criterias.length > 0 && (
							<div className="mb-6">
								<h3 className="text-sm text-primary mb-2">
									Eligibility Criteria
								</h3>
								<div className="flex flex-wrap gap-2">
									{scholarship.criterias.map((criterion: string, i: number) => (
										<span
											key={i}
											className="px-3 py-1.5 bg-[#F9FAFB] text-[#374151] text-xs rounded border border-border"
										>
											{criterion}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Required Documents */}
						{scholarship.requirements &&
							scholarship.requirements.length > 0 && (
								<div className="mb-6">
									<h3 className="text-sm text-primary mb-2">
										Required Documents
									</h3>
									<div className="grid grid-cols-2 gap-2">
										{scholarship.requirements.map((doc: string, i: number) => (
											<div
												key={i}
												className="px-3 py-1.5 bg-[#F9FAFB] text-[#374151] text-xs rounded border border-border text-center"
											>
												{doc}
											</div>
										))}
									</div>
								</div>
							)}

						{/* Apply Button - only show if not preview */}
						{!isPreview && (
							<button className="w-full bg-[#3646A8] cursor-pointer text-tertiary py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all duration-100 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md">
								Apply Now →
							</button>
						)}
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
