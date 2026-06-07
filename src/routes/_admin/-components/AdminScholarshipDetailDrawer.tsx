import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	Calendar,
	ChevronDown,
	ChevronUp,
	ClipboardList,
	Coins,
	GraduationCap,
	Loader2,
	Trash2,
	UserCircle2,
	Users,
	X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { adminScholarshipApplicantsQueryOptions } from "@/lib/admin/queries";
import { deleteScholarship } from "@/lib/scholarship/api";
import {
	FormFieldType,
	type Scholarship,
	ScholarshipApplicationStatus,
	ScholarshipStatus,
	ScholarshipType,
} from "@/lib/scholarship/model";
import { getSponsorName } from "@/lib/sponsor/api";
import { toast } from "@/lib/toast";
import { formatCurrency, formatDeadline } from "@/utils/formatting.utils";
import {
	getFieldTypeLabel,
	renderFieldTypeIcon,
} from "@/utils/formField.utils";

const STATUS_STYLES: Record<string, string> = {
	[ScholarshipStatus.Active]:
		"bg-emerald-50 text-emerald-700 border border-emerald-200",
	[ScholarshipStatus.Draft]: "bg-gray-100 text-gray-600 border border-gray-200",
	[ScholarshipStatus.Inactive]:
		"bg-yellow-50 text-yellow-700 border border-yellow-200",
	[ScholarshipStatus.Closed]: "bg-red-50 text-red-600 border border-red-200",
	[ScholarshipStatus.Suspended]:
		"bg-orange-50 text-orange-700 border border-orange-200",
	[ScholarshipStatus.Archived]:
		"bg-slate-100 text-slate-500 border border-slate-200",
};

const TYPE_STYLES: Record<string, string> = {
	[ScholarshipType.MeritBased]:
		"bg-blue-50 text-blue-700 border border-blue-200",
	[ScholarshipType.NeedBased]:
		"bg-violet-50 text-violet-700 border border-violet-200",
	[ScholarshipType.Combined]:
		"bg-indigo-50 text-indigo-700 border border-indigo-200",
};

const APPLICANT_STATUS_STYLES: Record<string, string> = {
	[ScholarshipApplicationStatus.Pending]: "text-gray-500",
	[ScholarshipApplicationStatus.Shortlisted]: "text-blue-600",
	[ScholarshipApplicationStatus.Approved]: "text-emerald-600",
	[ScholarshipApplicationStatus.Denied]: "text-red-500",
	[ScholarshipApplicationStatus.Granted]: "text-teal-600",
};

function formatAmountDisplay(s: Scholarship): { main: string; sub: string } {
	const isRange = s.totalAmountMin != null || s.totalAmountMax != null;
	const isFixed = !isRange && s.totalAmount != null;
	if (isFixed)
		return {
			main: formatCurrency(s.totalAmount!, {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			}),
			sub: "fixed amount",
		};
	if (isRange)
		return {
			main: `${formatCurrency(s.totalAmountMin ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} – ${formatCurrency(s.totalAmountMax ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
			sub: "range",
		};
	return { main: "Varies", sub: "see criteria" };
}

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#8CA2D6]">
			{children}
		</p>
	);
}

function ExpandableList<T>({
	items,
	renderItem,
	initialVisible = 5,
	step = 10,
	emptyMessage,
}: {
	items: T[];
	renderItem: (item: T, i: number) => ReactNode;
	initialVisible?: number;
	step?: number;
	emptyMessage?: string;
}) {
	const [visibleCount, setVisibleCount] = useState(initialVisible);
	if (items.length === 0)
		return emptyMessage ? (
			<p className="text-xs italic text-[#9CA3AF]">{emptyMessage}</p>
		) : null;
	const visible = items.slice(0, visibleCount);
	const remaining = items.length - visibleCount;
	const nextBatch = Math.min(step, remaining);
	return (
		<div>
			<div className="space-y-1.5">
				{visible.map((item, i) => renderItem(item, i))}
			</div>
			<div className="mt-2 flex items-center gap-3">
				{remaining > 0 && (
					<button
						onClick={() => setVisibleCount((v) => v + step)}
						className="flex items-center gap-1 text-xs text-[#3A52A6] transition-colors hover:text-[#2A3F8C]"
					>
						<ChevronDown size={13} />
						Show {nextBatch} more
						<span className="text-[#9CA3AF]">({remaining} remaining)</span>
					</button>
				)}
				{visibleCount > initialVisible && (
					<button
						onClick={() => setVisibleCount(initialVisible)}
						className="flex items-center gap-1 text-xs text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
					>
						<ChevronUp size={13} />
						Collapse
					</button>
				)}
			</div>
		</div>
	);
}

interface Props {
	scholarship: Scholarship;
	onClose: () => void;
}

export default function AdminScholarshipDetailModal({
	scholarship,
	onClose,
}: Props) {
	const [isExiting, setIsExiting] = useState(false);
	const [formFieldsOpen, setFormFieldsOpen] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [confirmText, setConfirmText] = useState("");

	const queryClient = useQueryClient();

	const {
		data: applicants,
		isLoading: applicantsLoading,
		isError: applicantsError,
	} = useQuery(adminScholarshipApplicantsQueryOptions(scholarship.id));

	const deleteMutation = useMutation({
		mutationFn: () => deleteScholarship(scholarship.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "scholarships"] });
			toast.success("Success", "Scholarship permanently deleted", 2000);
			onClose();
		},
		onError: (err) => {
			toast.error(
				"Error",
				err instanceof Error ? err.message : "Failed to delete scholarship",
			);
			console.error(err);
		},
	});

	const canDelete = confirmText.trim() === scholarship.name.trim();

	const handleClose = () => {
		if (deleteMutation.isPending) return;
		setIsExiting(true);
		setTimeout(onClose, 200);
	};

	const amountDisplay = formatAmountDisplay(scholarship);
	const isUnlimitedSlots = scholarship.totalSlots == null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				{/* Backdrop */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: isExiting ? 0 : 1 }}
					transition={{ duration: 0.15 }}
					onClick={handleClose}
					className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
				/>

				{/* Modal */}
				<motion.div
					initial={{ opacity: 0, scale: 0.97, y: 8 }}
					animate={{
						opacity: isExiting ? 0 : 1,
						scale: isExiting ? 0.97 : 1,
						y: isExiting ? 8 : 0,
					}}
					transition={{ type: "spring", damping: 30, stiffness: 320 }}
					className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#D8E6FF] bg-white shadow-[0_32px_80px_-16px_rgba(58,82,166,0.35)]"
				>
					{/* Header */}
					<div className="flex shrink-0 items-center justify-between border-b border-[#E0ECFF] px-6 py-4">
						<h2 className="text-base font-medium text-primary">
							Scholarship Details
						</h2>
						<div className="flex items-center gap-3">
							<span
								className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[scholarship.status.code] ?? "bg-gray-100 text-gray-600"}`}
							>
								{scholarship.status.name}
							</span>
							<button
								onClick={handleClose}
								className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F0F5FF] hover:text-[#3A52A6]"
							>
								<X size={16} />
							</button>
						</div>
					</div>

					{/* Scrollable body */}
					<div className="flex-1 overflow-y-auto">
						<div className="p-6 space-y-6">
							{/* Name + sponsor row */}
							<div className="flex gap-4">
								{/* Square image */}
								<div className="aspect-square w-24 shrink-0 overflow-hidden rounded-xl border border-[#E0ECFF]">
									{scholarship.imageUrl ? (
										<img
											src={scholarship.imageUrl}
											alt={scholarship.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<div
											className="flex h-full w-full items-center justify-center"
											style={{ backgroundColor: `${scholarship.cardColor}18` }}
										>
											<GraduationCap
												size={28}
												style={{ color: scholarship.cardColor }}
												className="opacity-40"
											/>
										</div>
									)}
								</div>

								{/* Name, badges, sponsor */}
								<div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
									<div>
										<h1 className="text-xl font-medium text-primary">
											{scholarship.name}
										</h1>
										<div className="mt-1.5 flex flex-wrap gap-1.5">
											{scholarship.scholarshipType.code ===
											ScholarshipType.Combined ? (
												<>
													<span
														className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[ScholarshipType.MeritBased]}`}
													>
														Merit-Based
													</span>
													<span
														className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[ScholarshipType.NeedBased]}`}
													>
														Need-Based
													</span>
												</>
											) : (
												<span
													className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[scholarship.scholarshipType.code] ?? "bg-gray-100 text-gray-600"}`}
												>
													{scholarship.scholarshipType.name}
												</span>
											)}
										</div>
									</div>

									{/* Sponsor */}
									<div className="flex items-center gap-2">
										<div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF3FF]">
											{scholarship.sponsor.avatarUrl ? (
												<img
													src={scholarship.sponsor.avatarUrl}
													alt={getSponsorName(scholarship.sponsor)}
													className="h-full w-full object-cover"
												/>
											) : (
												<UserCircle2 size={13} className="text-[#3A52A6]" />
											)}
										</div>
										<p className="truncate text-sm text-[#6B7280]">
											{getSponsorName(scholarship.sponsor)}
											<span className="mx-1.5 text-[#C8D9F5]">·</span>
											<span className="text-[11px]">
												{scholarship.sponsor.sponsorType.name}
											</span>
										</p>
									</div>
								</div>
							</div>

							{/* Key stats */}
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
								<div className="rounded-xl border border-[#E0ECFF] bg-[#F8FBFF] p-4">
									<div className="mb-1.5 flex items-center gap-1.5 text-[#8CA2D6]">
										<Users size={13} />
										<span className="text-[10px] uppercase tracking-wide">
											Applications
										</span>
									</div>
									<p className="text-xl text-primary">
										{scholarship.applicationCount}
									</p>
									<p className="text-[10px] text-[#9CA3AF]">applicants</p>
								</div>

								<div className="rounded-xl border border-[#E0ECFF] bg-[#F8FBFF] p-4">
									<div className="mb-1.5 flex items-center gap-1.5 text-[#8CA2D6]">
										<Users size={13} />
										<span className="text-[10px] uppercase tracking-wide">
											Slots
										</span>
									</div>
									{isUnlimitedSlots ? (
										<>
											<p className="text-xl text-[#3A52A6]">∞</p>
											<p className="text-[10px] text-[#9CA3AF]">Unlimited</p>
										</>
									) : (
										<>
											<p className="text-xl text-primary">
												{scholarship.totalSlots}
											</p>
											<p className="text-[10px] text-[#9CA3AF]">scholars</p>
										</>
									)}
								</div>

								<div className="rounded-xl border border-[#E0ECFF] bg-[#F8FBFF] p-4">
									<div className="mb-1.5 flex items-center gap-1.5 text-[#8CA2D6]">
										<Coins size={13} />
										<span className="text-[10px] uppercase tracking-wide">
											Amount
										</span>
									</div>
									<p className="text-base leading-snug text-primary">
										{amountDisplay.main}
									</p>
									<p className="text-[10px] text-[#9CA3AF]">
										{amountDisplay.sub}
									</p>
								</div>

								<div className="rounded-xl border border-[#E0ECFF] bg-[#F8FBFF] p-4">
									<div className="mb-1.5 flex items-center gap-1.5 text-[#8CA2D6]">
										<Calendar size={13} />
										<span className="text-[10px] uppercase tracking-wide">
											Deadline
										</span>
									</div>
									<p className="text-sm leading-snug text-primary">
										{formatDeadline(scholarship.applicationDeadline)}
									</p>
								</div>
							</div>

							{/* Description */}
							{scholarship.description && (
								<div>
									<SectionLabel>About</SectionLabel>
									<p className="text-sm leading-relaxed text-[#374151]">
										{scholarship.description}
									</p>
								</div>
							)}

							{/* Criteria + Requirements side by side */}
							{(scholarship.criterias.length > 0 ||
								scholarship.requirements.length > 0) && (
								<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
									{scholarship.criterias.length > 0 && (
										<div>
											<SectionLabel>
												Eligibility Criteria ({scholarship.criterias.length})
											</SectionLabel>
											<ExpandableList
												items={scholarship.criterias}
												initialVisible={5}
												renderItem={(item, i) => (
													<div key={i} className="flex items-start gap-2">
														<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A52A6]" />
														<span className="text-sm text-[#374151]">
															{item}
														</span>
													</div>
												)}
											/>
										</div>
									)}

									{scholarship.requirements.length > 0 && (
										<div>
											<SectionLabel>
												Requirements ({scholarship.requirements.length})
											</SectionLabel>
											<ExpandableList
												items={scholarship.requirements}
												initialVisible={5}
												renderItem={(item, i) => (
													<div
														key={i}
														className="rounded-lg border border-[#E0ECFF] bg-[#F8FBFF] px-3 py-2 text-sm text-[#374151]"
													>
														{item}
													</div>
												)}
											/>
										</div>
									)}
								</div>
							)}

							{/* Form Fields — collapsible */}
							{scholarship.formFields.length > 0 && (
								<div>
									<button
										onClick={() => setFormFieldsOpen((v) => !v)}
										className="flex w-full items-center justify-between rounded-xl border border-[#E0ECFF] bg-[#F8FBFF] px-4 py-3 text-left transition-colors hover:bg-[#EEF5FF]"
									>
										<div className="flex items-center gap-2">
											<ClipboardList size={14} className="text-[#3A52A6]" />
											<span className="text-sm text-primary">
												Application Form Fields
											</span>
											<span className="rounded-full bg-[#E0ECFF] px-2 py-0.5 text-[10px] text-[#3A52A6]">
												{scholarship.formFields.length}
											</span>
										</div>
										{formFieldsOpen ? (
											<ChevronUp size={14} className="text-[#8CA2D6]" />
										) : (
											<ChevronDown size={14} className="text-[#8CA2D6]" />
										)}
									</button>

									{formFieldsOpen && (
										<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
											{scholarship.formFields.map((field, i) => {
												const fieldTypeCode = (field.fieldType?.code ??
													FormFieldType.ShortAnswer) as FormFieldType;
												const hasOptions = [
													FormFieldType.Dropdown,
													FormFieldType.Checkbox,
													FormFieldType.MultipleChoice,
												].includes(fieldTypeCode);
												return (
													<div
														key={i}
														className="flex items-start gap-3 rounded-lg border border-[#E0ECFF] bg-[#F8FBFF] p-3"
													>
														<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E0ECFF]">
															{renderFieldTypeIcon(fieldTypeCode, {
																size: 14,
																className: "text-[#3A52A6]",
															})}
														</div>
														<div className="min-w-0">
															<div className="flex flex-wrap items-center gap-1.5">
																<span className="text-sm text-primary">
																	{field.label}
																</span>
																{field.isRequired && (
																	<span className="rounded bg-[#FEE2E2] px-1.5 py-0.5 text-[9px] text-[#DC2626]">
																		Required
																	</span>
																)}
															</div>
															<p className="text-[11px] text-[#6B7280]">
																{getFieldTypeLabel(fieldTypeCode)}
																{hasOptions &&
																	field.options.length > 0 &&
																	` · ${field.options.length} option${field.options.length !== 1 ? "s" : ""}`}
															</p>
														</div>
													</div>
												);
											})}
										</div>
									)}
								</div>
							)}

							{/* Applicants */}
							<div>
								<SectionLabel>
									Applicants
									{applicants != null ? ` (${applicants.length})` : ""}
								</SectionLabel>

								{applicantsLoading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2
											size={20}
											className="animate-spin text-[#3A52A6]"
										/>
									</div>
								) : applicantsError ? (
									<p className="text-xs italic text-[#9CA3AF]">
										Unable to load applicants.
									</p>
								) : (
									<ExpandableList
										items={applicants ?? []}
										initialVisible={5}
										emptyMessage="No applicants yet."
										renderItem={(applicant, i) => (
											<div
												key={i}
												className="flex items-center gap-3 rounded-xl border border-[#E0ECFF] bg-[#F8FBFF] px-4 py-3"
											>
												<div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF3FF]">
													{applicant.student.avatarUrl ? (
														<img
															src={applicant.student.avatarUrl}
															alt={applicant.student.firstName}
															className="h-full w-full object-cover"
														/>
													) : (
														<UserCircle2 size={18} className="text-[#3A52A6]" />
													)}
												</div>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm text-primary">
														{applicant.student.firstName}{" "}
														{applicant.student.middleName
															? `${applicant.student.middleName.charAt(0)}. `
															: ""}
														{applicant.student.lastName}
													</p>
													<p className="truncate text-xs text-[#9CA3AF]">
														{applicant.student.email}
													</p>
												</div>
												<span
													className={`shrink-0 text-xs font-medium capitalize ${APPLICANT_STATUS_STYLES[applicant.status.code] ?? "text-gray-500"}`}
												>
													{applicant.status.name}
												</span>
											</div>
										)}
									/>
								)}
							</div>

							{/* Timestamps */}
							<div className="grid grid-cols-2 gap-4 border-t border-[#E0ECFF] pt-5">
								<div>
									<p className="text-[10px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Created
									</p>
									<p className="mt-0.5 text-sm text-[#374151]">
										{formatDeadline(scholarship.createdAt)}
									</p>
								</div>
								<div>
									<p className="text-[10px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Last Updated
									</p>
									<p className="mt-0.5 text-sm text-[#374151]">
										{formatDeadline(scholarship.updatedAt)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Danger zone footer — admin-only permanent delete */}
					<div className="shrink-0 border-t border-[#F0D4D4] bg-[#FFF7F7] px-6 py-4">
						{!confirmingDelete ? (
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-start gap-2">
									<AlertTriangle
										size={16}
										className="mt-0.5 shrink-0 text-red-500"
									/>
									<div>
										<p className="text-sm font-medium text-red-700">
											Delete scholarship
										</p>
										<p className="text-xs text-red-500/80">
											Permanently removes this scholarship and all applications,
											form fields, and related records. This cannot be undone.
										</p>
									</div>
								</div>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									className="shrink-0"
									onClick={() => setConfirmingDelete(true)}
								>
									<Trash2 size={14} />
									Delete
								</Button>
							</div>
						) : (
							<div className="space-y-3">
								<p className="text-sm text-red-700">
									Type <span className="font-semibold">{scholarship.name}</span>{" "}
									to confirm permanent deletion.
								</p>
								<input
									type="text"
									value={confirmText}
									onChange={(e) => setConfirmText(e.target.value)}
									placeholder="Scholarship name"
									disabled={deleteMutation.isPending}
									className="w-full rounded-lg border border-[#F0C4C4] bg-white px-3 py-2 text-sm text-primary placeholder-[#D1A1A1] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60"
								/>
								<div className="flex items-center justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={deleteMutation.isPending}
										onClick={() => {
											setConfirmingDelete(false);
											setConfirmText("");
										}}
									>
										Cancel
									</Button>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										disabled={!canDelete || deleteMutation.isPending}
										onClick={() => deleteMutation.mutate()}
									>
										{deleteMutation.isPending ? (
											<>
												<Loader2 size={14} className="animate-spin" />
												Deleting…
											</>
										) : (
											<>
												<Trash2 size={14} />
												Permanently delete
											</>
										)}
									</Button>
								</div>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
