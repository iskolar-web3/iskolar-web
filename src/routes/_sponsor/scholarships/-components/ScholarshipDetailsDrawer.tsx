import { motion, AnimatePresence } from "framer-motion";
import {
	Calendar,
	Users,
	Coins,
	ChevronsRight,
	Edit2,
	Trash2,
	Archive,
	AlertCircle,
	UserIcon,
	Loader2,
} from "lucide-react";
import { useState, useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDeadline } from "@/utils/formatting.utils";
import {
	FormFieldType,
	ScholarshipStatus,
	ScholarshipType,
	type Scholarship,
} from "@/lib/scholarship/model";
import { getSponsorName } from "@/lib/sponsor/api";
import {
	getFieldTypeLabel,
	renderFieldTypeIcon,
} from "@/utils/formField.utils";

/**
 * Props for the ScholarshipDetailsModal component (sponsor view)
 */
interface ScholarshipDetailsModalProps {
	/** Scholarship data to display */
	scholarship: Scholarship;
	/** Callback function to close the modal */
	onClose: () => void;
	/** Optional callback when edit is clicked */
	onEdit?: (scholarship: Scholarship) => void;
	/** Optional callback when delete is clicked */
	onDelete?: (scholarship: Scholarship) => void;
	/** Optional callback when view applicants is clicked */
	onViewApplicants?: (scholarship: Scholarship) => void;
}

/**
 * Scholarship details modal component for sponsors
 * Displays comprehensive scholarship information with edit, delete, and view applicants actions
 * @param props - Component props
 * @returns Animated side panel modal with scholarship details and action buttons
 */
export default function ScholarshipDetailsModal({
	scholarship,
	onClose,
	onEdit,
	onDelete,
	onViewApplicants,
}: ScholarshipDetailsModalProps) {
	const [isExiting, setIsExiting] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showQuestionnairesDialog, setShowQuestionnairesDialog] =
		useState(false);
	const [showTitleModal, setShowTitleModal] = useState(false);
	const [titleInput, setTitleInput] = useState("");
	const [loading, setLoading] = useState(false);

	const isRange =
		scholarship.totalAmountMin != null || scholarship.totalAmountMax != null;
	const isFixed = !isRange && scholarship.totalAmount != null;
	const isVaries = !isRange && !isFixed;

	/**
	 * Checks if the scholarship is closed
	 * @returns True if scholarship status is 'closed'
	 */
	const isClosed = useCallback(() => {
		return scholarship.status.code === ScholarshipStatus.Closed;
	}, [scholarship?.status]);

	/**
	 * Handles modal close with exit animation
	 */
	const handleClose = () => {
		setIsExiting(true);
		setTimeout(onClose, 200);
	};

	/**
	 * Handles edit button click
	 */
	const handleEdit = () => {
		onEdit?.(scholarship);
	};

	/**
	 * Handles delete button click, shows confirmation modal
	 */
	const handleDeleteClick = () => {
		setShowDeleteModal(true);
	};

	/**
	 * Handles view applicants button click
	 */
	const handleViewApplicants = () => {
		onViewApplicants?.(scholarship);
	};

	/**
	 * Moves from the first confirmation modal to the title-type modal
	 */
	const proceedToTitleConfirm = () => {
		setShowDeleteModal(false);
		setTitleInput("");
		setShowTitleModal(true);
	};

	/**
	 * Confirms and executes the delete action after title is verified
	 */
	const confirmDelete = async () => {
		try {
			setLoading(true);

			onDelete?.(scholarship);

			setShowTitleModal(false);
			handleClose();
		} catch (error) {
			console.error("Delete error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
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
						<div className="sticky top-0 bg-card border-b border-border px-5 py-3 flex items-center justify-between z-10">
							<h2 className="text-lg text-primary flex items-center gap-2">
								<button
									onClick={handleClose}
									className="hover:bg-gray-100 rounded-lg transition-colors"
								>
									<ChevronsRight size={20} className="text-primary" />
								</button>
								Scholarship Details
							</h2>
						</div>

						<div className="p-5">
							{/* Status Badge */}
							<div className="flex items-center gap-2 mb-4">
								<div
									className={`w-2 h-2 rounded-full ${
										scholarship.status.code === ScholarshipStatus.Archived
											? "bg-[#9CA3AF]"
											: scholarship.status.code === ScholarshipStatus.Closed
												? "bg-[#EF4444]"
												: "bg-[#31D0AA]"
									}`}
								/>
								<span
									className={`text-sm font-medium capitalize ${
										scholarship.status.code === ScholarshipStatus.Archived
											? "text-[#9CA3AF]"
											: scholarship.status.code === ScholarshipStatus.Closed
												? "text-[#EF4444]"
												: "text-[#31D0AA]"
									}`}
								>
									{scholarship.status.name}
								</span>
							</div>

							{/* Image Banner */}
							<div className="relative w-full aspect-square mb-5 rounded-lg overflow-hidden shadow-[0_0_20px_2px_rgba(0,0,0,0.2)]">
								<img
									src={
										scholarship.imageUrl ||
										"/scholarship-banner-placeholder.png"
									}
									alt={scholarship.name || "Scholarship"}
									className="w-full h-full object-cover"
								/>
							</div>

							{/* Title and Badges */}
							<h1 className="text-[26px] text-primary mb-2">
								{scholarship.name || "Scholarship Title"}
							</h1>
							<div className="flex gap-2 mb-4">
								{scholarship.scholarshipType.code ===
								ScholarshipType.Combined ? (
									<>
										<span className="px-2.5 py-1 bg-[#F3F4F6] text-[#374151] text-xs rounded border border-border">
											Merit-Based
										</span>
										<span className="px-2.5 py-1 bg-[#F3F4F6] text-[#374151] text-xs rounded border border-border">
											Need-Based
										</span>
									</>
								) : (
									<span className="px-2.5 py-1 bg-[#F3F4F6] text-[#374151] text-xs rounded border border-border">
										{scholarship.scholarshipType.name}
									</span>
								)}
							</div>

							{/* Sponsor and Deadline */}
							<div className="space-y-3 mb-4 text-[#6B7280]">
								<div className="flex items-center gap-2">
									<div className="w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0">
										{scholarship?.sponsor?.avatarUrl ? (
											<img
												src={scholarship?.sponsor?.avatarUrl}
												alt={getSponsorName(scholarship.sponsor)}
												className="w-full h-full rounded-full object-cover"
											/>
										) : (
											<UserIcon className="w-full h-full" />
										)}
									</div>
									<span className="text-sm">
										{getSponsorName(scholarship.sponsor)}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Calendar size={22} />
									<span className="text-sm">
										{formatDeadline(scholarship.applicationDeadline)}
									</span>
								</div>
							</div>

							{/* Amount and Slots */}
							<div className="grid grid-cols-3 gap-3 mb-6">
								<div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
									<div className="flex items-center gap-1.5 text-[#6B7280] mb-1.5">
										<Users size={16} />
										<span className="text-xs">Applications</span>
									</div>
									<p className="text-base text-primary">
										{scholarship.applicationCount || 0}
									</p>
									<p className="text-xs text-[#6B7280]">applicants</p>
								</div>

								<div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
									<div className="flex items-center gap-1.5 text-[#6B7280] mb-1.5">
										<Coins size={16} />
										<span className="text-xs">Amount</span>
									</div>
									{isFixed && (
										<>
											<p className="text-base text-primary mb-0.5">
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
											<p className="text-base text-primary mb-0.5">
												{formatCurrency(scholarship.totalAmountMin ?? 0, {
													minimumFractionDigits: 0,
													maximumFractionDigits: 0,
												})}{" "}
												–{" "}
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
											<p className="text-base text-primary mb-0.5">Varies</p>
											<p className="text-xs text-[#6B7280]">see details</p>
										</>
									)}
								</div>

								<div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
									<div className="flex items-center gap-1.5 text-[#6B7280] mb-1.5">
										<Users size={16} />
										<span className="text-xs">Slots</span>
									</div>
									<p className="text-base text-primary mb-0.5">
										{scholarship.totalSlots ?? "No limit"}
									</p>
									<p className="text-xs text-[#6B7280]">scholars</p>
								</div>
							</div>

							{/* Description */}
							{scholarship.description && (
								<div className="mb-6">
									<h3 className="text-sm text-primary mb-2">
										About Scholarship
									</h3>
									<p className="text-[#6B7280] text-xs leading-relaxed whitespace-pre-wrap">
										{scholarship.description}
									</p>
								</div>
							)}

							{/* Eligibility Criteria */}
							{scholarship.criterias.length > 0 && (
								<div className="mb-6">
									<h3 className="text-sm text-primary mb-2">
										Eligibility Criteria
									</h3>
									<div className="flex flex-wrap gap-2">
										{scholarship.criterias.map(
											(criterion: string, i: number) => (
												<span
													key={i}
													className="px-3 py-1.5 bg-[#F9FAFB] text-[#374151] text-xs rounded border border-border"
												>
													{criterion}
												</span>
											),
										)}
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
											{scholarship.requirements.map(
												(doc: string, i: number) => (
													<div
														key={i}
														className="px-3 py-2 bg-[#F9FAFB] text-[#374151] text-xs rounded border border-border text-center"
													>
														{doc}
													</div>
												),
											)}
										</div>
									</div>
								)}

							{/* Questionnaires */}
							{scholarship.formFields.length > 0 && (
								<div className="mb-6">
									<button
										type="button"
										onClick={() => setShowQuestionnairesDialog(true)}
										className="w-full flex cursor-pointer items-center justify-between px-4 py-3 border border-primary text-primary bg-transparent rounded-lg text-sm transition-all duration-100 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md"
									>
										<span>Application Forms</span>
										<span className="text-xs opacity-70">
											{scholarship.formFields.length} item
											{scholarship.formFields.length !== 1 ? "s" : ""}
										</span>
									</button>
								</div>
							)}

							{/* View Applicants Button */}
							<button
								onClick={handleViewApplicants}
								className="w-full border border-primary text-primary bg-transparent cursor-pointer py-3 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all duration-100 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md mb-3"
							>
								<Users size={15} />
								View Applicants
								<span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full border border-current text-[10px] leading-none">
									{scholarship.applicationCount ?? 0}
								</span>
							</button>

							{/* Edit and Delete/Archive Buttons */}
							<div className="flex gap-3 mt-2">
								<button
									onClick={handleEdit}
									disabled={isClosed()}
									className={`flex-1 py-3 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all duration-100 ${
										isClosed()
											? "border border-gray-300 bg-transparent text-gray-400 cursor-not-allowed"
											: "border border-primary bg-transparent text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md"
									}`}
								>
									<Edit2 size={15} />
									Edit
								</button>
								<button
									onClick={handleDeleteClick}
									className={`flex-1 cursor-pointer text-tertiary py-3 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all duration-100 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md ${
										isClosed()
											? "bg-[#F59E0B] hover:bg-[#D97706]"
											: "bg-[#EF4444] hover:bg-[#DC2626]"
									}`}
								>
									{isClosed() ? (
										<>
											<Archive size={15} />
											Archive
										</>
									) : (
										<>
											<Trash2 size={15} />
											Delete
										</>
									)}
								</button>
							</div>
						</div>
					</motion.div>

					{/* Delete Confirmation Modal */}
					<Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
						<DialogContent
							className="bg-tertiary border-0 py-4 px-6 w-[400px]"
							showCloseButton={true}
						>
							<DialogHeader>
								<div className="text-center">
									<div
										className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-1 ${
											isClosed() ? "text-[#F59E0B]" : "text-[#EF4444]"
										}`}
									>
										<AlertCircle size={38} />
									</div>
									<h3 className="text-lg text-primary mb-2">
										{isClosed() ? "Archive Scholarship" : "Delete Scholarship"}
									</h3>
									<p className="text-sm text-[#6B7280] mb-6">
										{isClosed()
											? `Are you sure you want to archive "${scholarship.name}"? This will move it to your archived scholarships.`
											: `Are you sure you want to delete "${scholarship.name}"? This action cannot be undone.`}
									</p>
								</div>
							</DialogHeader>
							<DialogFooter className="flex gap-3">
								<button
									onClick={() => setShowDeleteModal(false)}
									className="flex-1 px-4 py-2 cursor-pointer text-sm bg-tertiary border border-[#D1D5DB] text-[#374151] rounded-md hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={isClosed() ? confirmDelete : proceedToTitleConfirm}
									className={`flex-1 px-4 py-2 cursor-pointer text-sm text-tertiary rounded-md transition-colors flex items-center justify-center gap-2 ${
										isClosed()
											? "bg-[#F59E0B] hover:bg-[#D97706]"
											: "bg-[#EF4444] hover:bg-[#DC2626]"
									}`}
								>
									{isClosed() ? "Archive" : "Continue"}
								</button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* Title Confirmation Modal */}
					<Dialog
						open={showTitleModal}
						onOpenChange={(open) => {
							if (!open) {
								setShowTitleModal(false);
								setTitleInput("");
							}
						}}
					>
						<DialogContent
							className="bg-tertiary border-0 py-4 px-6 w-[400px]"
							showCloseButton={true}
						>
							<DialogHeader>
								<div className="text-center">
									<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-1 text-[#EF4444]">
										<AlertCircle size={38} />
									</div>
									<h3 className="text-lg text-primary mb-2">
										Confirm Deletion
									</h3>
									<p className="text-sm text-[#374151] font-medium mb-4">
										Type this to confirm deletion:
									</p>
									<p className="text-xs font-medium text-primary mb-4 bg-[#F9FAFB] border border-border rounded px-3 py-2 select-none">
										{scholarship.name}
									</p>
									<Input
										value={titleInput}
										onChange={(e) => setTitleInput(e.target.value)}
										placeholder="Type here"
										className="text-sm placeholder:text-[#9CA3AF]"
										autoFocus
									/>
								</div>
							</DialogHeader>
							<DialogFooter className="flex gap-3 mt-4">
								<button
									onClick={() => {
										setShowTitleModal(false);
										setTitleInput("");
									}}
									disabled={loading}
									className="flex-1 px-4 py-2 cursor-pointer text-sm bg-tertiary border border-[#D1D5DB] text-[#374151] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
								>
									Cancel
								</button>
								<button
									onClick={confirmDelete}
									disabled={loading || titleInput !== scholarship.name}
									className="flex-1 px-4 py-2 cursor-pointer text-sm text-tertiary bg-[#EF4444] rounded-md transition-colors flex items-center justify-center gap-2 hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										"Delete"
									)}
								</button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</AnimatePresence>

			{/* Questionnaires Dialog */}

			<Dialog
				open={showQuestionnairesDialog}
				onOpenChange={setShowQuestionnairesDialog}
			>
				<DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
					<DialogHeader>
						<DialogTitle className="font-normal">
							Application Forms ({scholarship.formFields.length})
						</DialogTitle>
					</DialogHeader>
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
				</DialogContent>
			</Dialog>
		</>
	);
}
