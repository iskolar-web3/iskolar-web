import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
	Calendar,
	Coins,
	Edit2,
	Lock,
	MoreVertical,
	Power,
	Trash2,
	UserIcon,
	Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useAnimateOnce } from "@/hooks/useAnimateOnce";
import {
	FormFieldType,
	type Scholarship,
	ScholarshipType,
} from "@/lib/scholarship/model";
import { getSponsorName } from "@/lib/sponsor/api";
import { isLightColor } from "@/routes/_sponsor/create/-components/fields/CardColorPicker";
import { formatCurrency } from "@/utils/formatting.utils";
import {
	getFieldTypeLabel,
	renderFieldTypeIcon,
} from "@/utils/formField.utils";

/**
 * Props for the ScholarshipCard component (sponsor view)
 */
export interface ScholarshipCardProps {
	/** Scholarship data to display */
	scholarship: Scholarship;
	/** Index for staggered animation delay */
	index: number;
	/** Optional callback when the card or "View Details" is selected */
	onViewDetails?: (scholarship: Scholarship) => void;
	/** Optional callback when "View Applicants" is selected */
	onViewApplicants?: (scholarship: Scholarship) => void;
	/** Optional callback when edit is selected */
	onEdit?: (scholarship: Scholarship) => void;
	/** Optional callback when delete is selected */
	onDelete?: (scholarship: Scholarship) => void;
	/** Optional callback when close (stop accepting applications) is selected */
	onClose?: (scholarship: Scholarship) => void;
	/** Optional callback when end scholarship is selected */
	onEnd?: (scholarship: Scholarship) => void;
}

/**
 * Scholarship card component for sponsor view
 * Displays scholarship information with a kebab (three-dots) menu for
 * management actions (edit, delete, close, end) and primary buttons for
 * viewing details, applicants, and forms.
 * @param props - Component props
 * @returns Animated scholarship card with action menu
 */
export default function ScholarshipCard({
	scholarship,
	index,
	onViewDetails,
	onViewApplicants,
	onEdit,
	onDelete,
	onClose,
	onEnd,
}: ScholarshipCardProps) {
	const [showMenu, setShowMenu] = useState(false);
	const [showFormsDialog, setShowFormsDialog] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const isRange =
		scholarship.totalAmountMin != null || scholarship.totalAmountMax != null;
	const isFixed = !isRange && scholarship.totalAmount != null;
	const isVaries = !isRange && !isFixed;
	const cardColor = scholarship.cardColor ?? "#3A52A6";
	const isLight = isLightColor(cardColor);
	const headerTextColor = isLight ? "#111827" : undefined;
	const onHoverTextColor = isLight ? "#111827" : "white";
	const [cardHovered, setCardHovered] = useState(false);
	const [viewDetailsHovered, setViewDetailsHovered] = useState(false);
	const [viewApplicantsHovered, setViewApplicantsHovered] = useState(false);
	const [viewFormsHovered, setViewFormsHovered] = useState(false);
	const { shouldAnimate, markAnimated } = useAnimateOnce(
		`scholarship:${scholarship.id}`,
	);

	// Close the kebab menu when clicking outside of it
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowMenu(false);
			}
		};

		if (showMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showMenu]);

	/**
	 * Builds a click handler for a menu item that closes the menu and invokes
	 * the matching callback.
	 * @param action - Callback to run with the scholarship
	 */
	const runMenuAction =
		(action?: (scholarship: Scholarship) => void) => (e: React.MouseEvent) => {
			e.stopPropagation();
			setShowMenu(false);
			action?.(scholarship);
		};

	/**
	 * Handles the "View Details" action.
	 * @param e - Mouse event
	 */
	const handleViewDetails = (e: React.MouseEvent) => {
		e.stopPropagation();
		onViewDetails?.(scholarship);
	};

	/**
	 * Handles the "View Applicants" action.
	 * @param e - Mouse event
	 */
	const handleViewApplicants = (e: React.MouseEvent) => {
		e.stopPropagation();
		onViewApplicants?.(scholarship);
	};

	/**
	 * Handles the "View Forms" action by opening the forms dialog.
	 * @param e - Mouse event
	 */
	const handleViewForms = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowFormsDialog(true);
	};

	return (
		<motion.div
			initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.4,
				delay: shouldAnimate ? index * 0.05 : 0,
				ease: [0.25, 0.1, 0.25, 1],
			}}
			onAnimationComplete={markAnimated}
			onClick={() => onViewDetails?.(scholarship)}
			onMouseEnter={() => setCardHovered(true)}
			onMouseLeave={() => setCardHovered(false)}
			className="bg-white cursor-pointer rounded-md border transition-colors relative shadow-sm"
			style={{ borderColor: cardHovered ? cardColor : undefined }}
		>
			{/* Header */}
			<div
				className="rounded-lg rounded-bl-none rounded-br-none relative"
				style={{ backgroundColor: scholarship.cardColor ?? "#3A52A6" }}
			>
				{/* Kebab (three-dots) menu */}
				<div ref={menuRef} className="absolute top-2 right-2 z-20">
					<button
						type="button"
						aria-label="Scholarship actions"
						onClick={(e) => {
							e.stopPropagation();
							setShowMenu((prev) => !prev);
						}}
						className="p-1 rounded-full hover:bg-black/15 transition-colors cursor-pointer"
						style={{ color: headerTextColor ?? "white" }}
					>
						<MoreVertical size={18} />
					</button>

					<AnimatePresence>
						{showMenu && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: -4 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -4 }}
								transition={{ duration: 0.1 }}
								className="absolute right-0 mt-1 bg-white rounded-lg shadow-xl border border-border py-1 min-w-40 z-30"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									onClick={runMenuAction(onEdit)}
									className="w-full px-4 py-2 cursor-pointer text-left text-[12px] text-primary hover:bg-[#F0F7FF] flex items-center gap-1.5 transition-colors"
								>
									<Edit2 size={15} />
									Edit
								</button>
								<button
									onClick={runMenuAction(onClose)}
									className="w-full px-4 py-2 cursor-pointer text-left text-[12px] text-primary hover:bg-[#F0F7FF] flex items-center gap-1.5 transition-colors"
								>
									<Lock size={15} />
									Close
								</button>
								<button
									onClick={runMenuAction(onEnd)}
									className="w-full px-4 py-2 cursor-pointer text-left text-[12px] text-primary hover:bg-[#F0F7FF] flex items-center gap-1.5 transition-colors"
								>
									<Power size={15} />
									End
								</button>
								<div className="my-1 border-t border-border" />
								<button
									onClick={runMenuAction(onDelete)}
									className="w-full px-4 py-2 cursor-pointer text-left text-[12px] text-[#EF4444] hover:bg-[#FEE2E2] flex items-center gap-1.5 transition-colors"
								>
									<Trash2 size={15} />
									Delete
								</button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<div className="flex">
					{/* Image */}
					<motion.div
						transition={{ duration: 0.3 }}
						className="w-32 h-32 bg-white/10 shrink-0 overflow-hidden rounded-tl-lg"
					>
						<img
							src={
								scholarship.imageUrl || "/scholarship-banner-placeholder.png"
							}
							alt="Preview"
							className="w-full h-full object-cover"
						/>
					</motion.div>

					{/* Info */}
					<div
						className="flex-1 text-tertiary px-4 py-2 pr-9"
						style={{ color: headerTextColor }}
					>
						<h3 className="text-lg mb-1 line-clamp-1">{scholarship.name}</h3>

						{/* Badges */}
						<div className="flex flex-wrap gap-2 mb-3">
							{scholarship.scholarshipType.code === ScholarshipType.Combined ? (
								<>
									<motion.span
										initial={shouldAnimate ? { scale: 0 } : false}
										animate={{ scale: 1 }}
										transition={{ delay: index * 0.05 + 0.1 }}
										className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
									>
										Merit-Based
									</motion.span>
									<motion.span
										initial={shouldAnimate ? { scale: 0 } : false}
										animate={{ scale: 1 }}
										transition={{ delay: index * 0.05 + 0.15 }}
										className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
									>
										Need-Based
									</motion.span>
								</>
							) : (
								<motion.span
									initial={shouldAnimate ? { scale: 0 } : false}
									animate={{ scale: 1 }}
									transition={{ delay: index * 0.05 + 0.1 }}
									className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded"
								>
									{scholarship.scholarshipType.name}
								</motion.span>
							)}
						</div>

						{/* Sponsor and Deadline */}
						<div className="space-y-1.5 text-xs opacity-90">
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 rounded-full bg-card flex items-center justify-center shrink-0">
									{scholarship?.sponsor?.avatarUrl ? (
										<img
											src={scholarship?.sponsor?.avatarUrl}
											alt={getSponsorName(scholarship.sponsor)}
											className="w-full h-full rounded-full object-cover"
										/>
									) : (
										<UserIcon className="w-full h-full text-secondary" />
									)}
								</div>
								<span>{getSponsorName(scholarship.sponsor)}</span>
							</div>
							<div className="flex items-center gap-2">
								<Calendar size={16} />
								<span>
									{format(scholarship.applicationDeadline, "MMM. d, yyyy")}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-4">
				{/* Amount and Slots */}
				<div className="grid grid-cols-3 gap-3 mb-4">
					<motion.div
						transition={{ duration: 0.2 }}
						className="bg-[#F9FAFB] border border-border rounded-lg p-3"
					>
						<div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
							<Users size={14} />
							<span>Applications</span>
						</div>
						<p className="text-sm md:text-base text-primary">
							{scholarship.applicationCount}
						</p>
						<p className="text-xs text-[#6B7280]">applicants</p>
					</motion.div>

					<motion.div
						transition={{ duration: 0.2 }}
						className="bg-[#F9FAFB] border border-border rounded-lg p-3"
					>
						<div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
							<Coins size={14} />
							<span>Amount</span>
						</div>
						{isFixed && (
							<>
								<p className="text-primary text-sm md:text-base">
									{formatCurrency(scholarship.totalAmount!, {
										minimumFractionDigits: 0,
										maximumFractionDigits: 0,
									})}
								</p>
								<p className="text-xs text-[#6B7280]">per scholar</p>
							</>
						)}
						{isRange && (
							<>
								<p className="text-primary text-sm md:text-base">
									{formatCurrency(scholarship.totalAmountMin ?? 0, {
										minimumFractionDigits: 0,
										maximumFractionDigits: 0,
									})}
									{" – "}
									{formatCurrency(scholarship.totalAmountMax ?? 0, {
										minimumFractionDigits: 0,
										maximumFractionDigits: 0,
									})}
								</p>
								<p className="text-xs text-[#6B7280]">per scholar</p>
							</>
						)}
						{isVaries && (
							<>
								<p className="text-primary text-sm md:text-base">Varies</p>
								<p className="text-xs text-[#6B7280]">see details</p>
							</>
						)}
					</motion.div>

					<motion.div
						transition={{ duration: 0.2 }}
						className="bg-[#F9FAFB] border border-border rounded-lg p-3"
					>
						<div className="flex items-center gap-1.5 text-[#6B7280] text-xs mb-1">
							<Users size={14} />
							<span>Slots</span>
						</div>
						<p className="text-primary text-sm md:text-base">
							{scholarship.totalSlots ?? "No limit"}
						</p>
						<p className="text-xs text-[#6B7280]">scholars</p>
					</motion.div>
				</div>

				{/* Action Buttons */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
					<motion.div
						initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 + 0.2 }}
					>
						<Button
							variant="outline"
							size="default"
							onClick={handleViewDetails}
							className="w-full text-xs md:text-sm font-medium cursor-pointer"
							onMouseEnter={() => setViewDetailsHovered(true)}
							onMouseLeave={() => setViewDetailsHovered(false)}
							style={{
								borderColor: cardColor,
								color: viewDetailsHovered ? onHoverTextColor : cardColor,
								backgroundColor: viewDetailsHovered ? cardColor : "transparent",
							}}
						>
							View Details
						</Button>
					</motion.div>
					<motion.div
						initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 + 0.25 }}
					>
						<Button
							variant="outline"
							size="default"
							onClick={handleViewApplicants}
							className="w-full text-xs md:text-sm font-medium cursor-pointer"
							onMouseEnter={() => setViewApplicantsHovered(true)}
							onMouseLeave={() => setViewApplicantsHovered(false)}
							style={{
								borderColor: cardColor,
								color: viewApplicantsHovered ? onHoverTextColor : cardColor,
								backgroundColor: viewApplicantsHovered
									? cardColor
									: "transparent",
							}}
						>
							View Applicants
							<span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full border border-current text-[10px] leading-none">
								{scholarship.applicationCount ?? 0}
							</span>
						</Button>
					</motion.div>
					<motion.div
						initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 + 0.3 }}
					>
						<Button
							variant="outline"
							size="default"
							onClick={handleViewForms}
							className="w-full text-xs md:text-sm font-medium cursor-pointer"
							onMouseEnter={() => setViewFormsHovered(true)}
							onMouseLeave={() => setViewFormsHovered(false)}
							style={{
								borderColor: cardColor,
								color: viewFormsHovered ? onHoverTextColor : cardColor,
								backgroundColor: viewFormsHovered ? cardColor : "transparent",
							}}
						>
							View Forms
							<span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full border border-current text-[10px] leading-none">
								{scholarship.formFields.length}
							</span>
						</Button>
					</motion.div>
				</div>
			</div>

			{/* Forms (Questionnaires) Dialog */}
			<Dialog open={showFormsDialog} onOpenChange={setShowFormsDialog}>
				<DialogContent
					className="sm:max-w-lg max-h-[80vh] flex flex-col"
					onClick={(e) => e.stopPropagation()}
				>
					<DialogHeader>
						<DialogTitle className="font-normal">
							Application Form ({scholarship.formFields.length})
						</DialogTitle>
					</DialogHeader>
					{scholarship.formFields.length > 0 ? (
						<div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
							{scholarship.formFields.map((field: any, i: number) => {
								const fieldTypeCode = (field.fieldType?.code ??
									field.type) as FormFieldType;
								const fieldType = Object.values(FormFieldType).includes(
									fieldTypeCode,
								)
									? fieldTypeCode
									: FormFieldType.ShortAnswer;
								const hasOptions =
									fieldType === FormFieldType.Dropdown ||
									fieldType === FormFieldType.Checkbox ||
									fieldType === FormFieldType.MultipleChoice;
								return (
									<div
										key={i}
										className="flex items-start gap-3 p-3 bg-[#F9FAFB] border border-[#E0ECFF] rounded-lg"
									>
										<span className="text-xs text-[#6B7280] w-5 text-center shrink-0 mt-2.5">
											{i + 1}
										</span>
										<div className="w-9 h-9 bg-[#E0ECFF] rounded-lg flex items-center justify-center shrink-0">
											{renderFieldTypeIcon(fieldType)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-[13px] text-primary font-medium">
													{field.label}
												</span>
												{(field.isRequired ?? field.required) && (
													<span className="px-1.5 py-0.5 bg-[#FEE2E2] text-[#DC2626] text-[9px] rounded">
														Required
													</span>
												)}
											</div>
											<p className="text-[11px] text-[#6B7280]">
												{getFieldTypeLabel(fieldType)}
												{hasOptions &&
													field.options &&
													field.options.length > 0 &&
													` • ${field.options.length} option${field.options.length !== 1 ? "s" : ""}`}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className="text-sm text-[#6B7280] py-6 text-center">
							This scholarship has no custom application form fields.
						</p>
					)}
				</DialogContent>
			</Dialog>
		</motion.div>
	);
}
