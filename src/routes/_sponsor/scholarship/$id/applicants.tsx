import { useState, useMemo, useEffect, createElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
	AlertCircle,
	Loader2,
	CheckCircle2,
	XCircle,
	Star,
	Clock,
	Calendar,
	ChevronDown,
	CheckSquare2,
	Square,
	FileText,
	ExternalLink,
	User,
	Users,
	Trophy,
	ChevronsRight,
	Phone,
	Mail,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
} from "@/components/ui/dialog";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { SEO } from "@/components/SEO";
import { handleError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import { formatDateTime } from "@/utils/formatting.utils";
import {
	ScholarshipApplicationStatus,
	type Applicant,
} from "@/lib/scholarship/model";
import {
	getApplicantsQuery,
	getScholarshipByIdQuery,
	updateApplication,
} from "@/lib/scholarship/api";

type FilterStatus = ScholarshipApplicationStatus | "all";

export const Route = createFileRoute("/_sponsor/scholarship/$id/applicants")({
	// params: {
	//   parse: (params) => {
	//     const schema = z.object({
	//       id: z.string().uuid('Invalid ID format'),
	//     });
	//     return schema.parse(params);
	//   },
	//   stringify: (params) => ({
	//     id: params.id,
	//   }),
	// },
	component: ApplicantsListPage,
});

function ApplicantsListPage() {

	const params = Route.useParams();
	const queryClient = useQueryClient();

	const applicantsQuery = useQuery(getApplicantsQuery(params.id));
	const scholarshipQuery = useQuery(getScholarshipByIdQuery(params.id));

	const {
		data: applicants = [],
		isLoading: applicantsLoading,
		error: applicantsError,
		isError: isApplicantsError,
	} = applicantsQuery;

	const {
		data: scholarship = null,
		isLoading: scholarshipLoading,
		error: scholarshipError,
	} = scholarshipQuery;

	const loading = applicantsLoading || scholarshipLoading;
	const error =
		(isApplicantsError ? applicantsError?.message : null) ||
		(scholarshipError ? scholarshipError?.message : null);

	const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
		null,
	);

	const [modalVisible, setModalVisible] = useState(false);
	const [isExiting, setIsExiting] = useState(false);
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
	const [showDropdown, setShowDropdown] = useState(false);

	// Bulk operations state
	const [bulkMode, setBulkMode] = useState(false);
	const [selectedApplicantIds, setSelectedApplicantIds] = useState<Set<string>>(
		new Set(),
	);
	const [bulkActionModal, setBulkActionModal] = useState(false);
	const [bulkAction, setBulkAction] = useState<
		"shortlisted" | "approved" | "denied" | null
	>(null);
	const [bulkRemarks, setBulkRemarks] = useState("");
	const [isBulkUpdating, setIsBulkUpdating] = useState(false);

	const { toast, showSuccess, showError } = useToast();

	// Confirmation modal state
	const [confirmationModal, setConfirmationModal] = useState(false);
	const [pendingAction, setPendingAction] = useState<{
		type: ScholarshipApplicationStatus;
		applicationId: string;
	} | null>(null);
	const [denialRemarks, setDenialRemarks] = useState("");
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	useEffect(() => {
		if (error) {
			showError("Error", error, 2500);
		}
	}, [error, showError]);

	const toggleBulkMode = () => {
		setBulkMode(!bulkMode);
		setSelectedApplicantIds(new Set());
	};

	const toggleApplicantSelection = (applicationId: string) => {
		const newSelected = new Set(selectedApplicantIds);
		if (newSelected.has(applicationId)) {
			newSelected.delete(applicationId);
		} else {
			newSelected.add(applicationId);
		}
		setSelectedApplicantIds(newSelected);
	};

	const selectAll = () => {
		const allIds = new Set(filteredApplicants.map((app) => app.id));
		setSelectedApplicantIds(allIds);
	};

	const deselectAll = () => {
		setSelectedApplicantIds(new Set());
	};

	const handleBulkAction = (action: "shortlisted" | "approved" | "denied") => {
		if (selectedApplicantIds.size === 0) {
			showError("Error", "Please select at least one applicant", 2500);
			return;
		}
		setBulkAction(action);
		setBulkActionModal(true);
	};

	const executeBulkAction = async () => {
		if (!bulkAction || selectedApplicantIds.size === 0 || isBulkUpdating)
			return;

		try {
			setIsBulkUpdating(true);

			// TODO: Handle bulk updates
			//
			// const response =
			// 	await scholarshipApplicationService.bulkUpdateApplicationStatus(
			// 		Array.from(selectedApplicantIds),
			// 		bulkAction,
			// 		bulkRemarks.trim() || undefined,
			// 	);
			//
			// if (response.success) {
			// 	showSuccess(
			// 		"Success",
			// 		`${selectedApplicantIds.size} application(s) ${bulkAction}`,
			// 		2000,
			// 	);
			// 	setBulkActionModal(false);
			// 	setBulkRemarks("");
			// 	setSelectedApplicantIds(new Set());
			// 	setBulkMode(false);
			// 	queryClient.invalidateQueries({
			// 		queryKey: ["scholarship-applicants", params.id],
			// 	});
			// } else {
			// 	showError("Error", response.message, 2500);
			// }
		} catch (error) {
			const handled = handleError(error, "Failed to update applications");
			logger.error("Bulk update error:", handled.raw);
			showError(`Error ${handled.code}`, handled.message, 2500);
		} finally {
			setIsBulkUpdating(false);
		}
	};

	const mutation = useMutation({
		mutationFn: updateApplication,
		onSuccess: async (res) => {
			console.log(res);
			showSuccess(`Success`, res.message, 1250);
		},
		onError: (err) => {
			showError("Error", err.message);
			console.error(err);
		},
	});

	const handleUpdateStatus = async (
		applicationId: string,
		newStatus: ScholarshipApplicationStatus,
		remarks?: string,
	) => {
		if (isUpdatingStatus) return;

		setIsUpdatingStatus(true);
		const payload = {
			scholarshipId: params.id,
			scholars: [
				{
					applicationId: applicationId,
					status: newStatus,
					remarks: remarks,
				},
			],
		};

		console.log("Updating status", payload);
		mutation.mutate(payload);
		setIsUpdatingStatus(false);
	};

	const getStatusColor = (status: ScholarshipApplicationStatus) => {
		switch (status) {
			case ScholarshipApplicationStatus.Approved:
				return "#31D0AA";
			case ScholarshipApplicationStatus.Denied:
				return "#EF4444";
			case ScholarshipApplicationStatus.Shortlisted:
				return "#8B5CF6";
			case ScholarshipApplicationStatus.Pending:
				return "#F59E0B";
			default:
				return "#6B7280";
		}
	};

	const getStatusIcon = (status: ScholarshipApplicationStatus) => {
		switch (status) {
			case ScholarshipApplicationStatus.Approved:
				return CheckCircle2;
			case ScholarshipApplicationStatus.Denied:
				return XCircle;
			case ScholarshipApplicationStatus.Shortlisted:
				return Star;
			case ScholarshipApplicationStatus.Pending:
				return Clock;
			default:
				return AlertCircle;
		}
	};

	const openApplicantModal = (applicant: Applicant) => {
		if (bulkMode) return;
		setSelectedApplicant(applicant);
		setModalVisible(true);
		setIsExiting(false);
	};

	const handleCloseModal = () => {
		setIsExiting(true);
		setTimeout(() => {
			setModalVisible(false);
			setIsExiting(false);
		}, 200);
	};

	const handleFileOpen = (url: string) => {
		window.open(url, "_blank");
	};

	const filteredApplicants = useMemo(
		() =>
			applicants.filter((app) =>
				filterStatus === "all" ? true : app.status.code === filterStatus,
			),
		[applicants, filterStatus],
	);

	const statusCounts = useMemo(
		() =>
			applicants.reduce(
				(counts, app) => {
					counts.all += 1;
					if (app.status.code === ScholarshipApplicationStatus.Pending)
						counts.pending += 1;
					if (app.status.code === ScholarshipApplicationStatus.Shortlisted)
						counts.shortlisted += 1;
					if (app.status.code === ScholarshipApplicationStatus.Approved)
						counts.approved += 1;
					if (app.status.code === ScholarshipApplicationStatus.Denied)
						counts.denied += 1;
					return counts;
				},
				{
					all: 0,
					pending: 0,
					shortlisted: 0,
					approved: 0,
					denied: 0,
				},
			),
		[applicants],
	);

	return (
		<div className="min-h-screen bg-[#F8F9FC]">
			<SEO title="Applicants" noindex={true} />
			{toast && <Toast {...toast} />}

			{loading ? (
				<div className="max-w-3xl mx-auto">
					{/* Scholarship Info Header Skeleton */}
					<div className="bg-[#F9FAFB] rounded-lg shadow-sm p-4 md:p-5 mb-3">
						<Skeleton className="h-8 w-full mb-2 bg-muted-foreground" />
						<Skeleton className="h-4 w-32 bg-muted-foreground" />
					</div>

					{/* Toolbar Skeleton */}
					<div className="flex items-center gap-2 mb-4">
						<Skeleton className="h-9 w-24 rounded-md bg-muted-foreground" />
						<Skeleton className="h-9 w-32 rounded-md bg-muted-foreground" />
						<Skeleton className="h-9 w-24 rounded-md bg-muted-foreground ml-auto" />
					</div>

					{/* Applicants List Skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{Array.from({ length: 6 }).map((_, index) => (
							<motion.div
								key={`skeleton-${index}`}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.05 }}
								className="bg-[#F9FAFB] rounded-lg shadow-sm p-5 relative"
							>
								<Skeleton className="w-5 h-5 rounded-full bg-muted-foreground absolute top-4 right-4" />

								<div className="flex items-center gap-4">
									<Skeleton className="w-14 h-14 rounded-full bg-muted-foreground shrink-0" />

									<div className="flex-1">
										<Skeleton className="h-5 w-32 mb-2 bg-muted-foreground" />
										<Skeleton className="h-4 w-48 mb-2 bg-muted-foreground" />
										<Skeleton className="h-3 w-36 bg-muted-foreground" />
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			) : error ? (
				<div className="flex flex-col items-center justify-center min-h-screen p-5">
					<AlertCircle className="w-12 h-12 text-[#FF6B6B]" />
					<p className="mt-4 text-[#5D6673] text-center">{error}</p>
					<button
						onClick={() =>
							queryClient.invalidateQueries({
								queryKey: ["scholarship-applicants", params.id],
							})
						}
						className="mt-4 px-6 py-3 bg-[#3A52A6] text-tertiary rounded-md hover:bg-[#2A4296] transition-colors"
					>
						Retry
					</button>
				</div>
			) : (
				<div className="max-w-3xl mx-auto">
					{/* Scholarship Info Header */}
					<div className="bg-card rounded-lg shadow-sm p-4 md:p-5 mb-3">
						<div className="flex-1">
							<h1 className="text-2xl text-primary mb-1">
								{scholarship?.name}
							</h1>
							<p className="text-[11px] md:text-xs text-[#6B7280]">
								{applicants.length}{" "}
								{applicants.length === 1 ? "Applicant" : "Applicants"}
							</p>
						</div>
					</div>

					{/* Toolbar */}
					<div className="flex items-center gap-2 mb-4">
						{/* Bulk Select Button */}
						<button
							onClick={toggleBulkMode}
							className={`px-4 py-2 rounded-md border cursor-pointer text-[11px] md:text-xs transition-colors ${
								bulkMode
									? "bg-[#3A52A6] text-tertiary border-[#3A52A6]"
									: "bg-white text-secondary border-[#3A52A6]"
							}`}
						>
							{bulkMode ? "Cancel" : "Bulk Select"}
						</button>

						{bulkMode && (
							<>
								<button
									onClick={selectAll}
									className="px-4 py-2 bg-card cursor-pointer border border-[#E5E7EB] rounded-md text-[11px] md:text-xs text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
								>
									Select All
								</button>
								<button
									onClick={deselectAll}
									className="px-4 py-2 bg-card cursor-pointer border border-[#E5E7EB] rounded-md text-xs text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
								>
									Deselect
								</button>
							</>
						)}

						{/* Rank Applicants Button */}
						{!bulkMode && (
							<button
								onClick={() => {
									showError(
										"Feature Unavailable",
										"This feature is not available yet.",
										2500,
									);
								}}
								className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-[#EFA508] text-tertiary rounded-md hover:bg-[#D89407] transition-colors text-[11px] md:text-xs"
							>
								<Trophy className="w-3.5 h-3.5" />
								Rank Applicants
							</button>
						)}

						{/* Filter Dropdown */}
						<div className="relative ml-auto">
							<button
								onClick={() => setShowDropdown(!showDropdown)}
								className="flex items-center gap-2 px-4 py-2 bg-card border border-[#E5E7EB] rounded-md hover:border-[#3A52A6] transition-colors"
							>
								<span className="text-[11px] md:text-xs text-primary capitalize">
									{filterStatus}
								</span>
								<span className="px-1  bg-[#3A52A6] text-tertiary text-[9px] md:text-[10px] rounded-full">
									{/* @ts-expect-error just leave it like this for now */}
									{statusCounts[filterStatus]}
								</span>
								<ChevronDown
									className={`w-4 h-4 text-[#6B7280] transition-transform ${showDropdown ? "rotate-180" : ""}`}
								/>
							</button>

							{showDropdown && (
								<div className="absolute top-full right-0 mt-2 border bg-card rounded-md shadow-lg z-10 min-w-[140px]">
									{Object.values([
										"all",
										...Object.values(ScholarshipApplicationStatus),
									]).map((status) => (
										<button
											key={status}
											onClick={() => {
												setFilterStatus(status as FilterStatus);
												setShowDropdown(false);
											}}
											className={`w-full flex items-center justify-between px-4 py-2 text-[11px] md:text-xs hover:bg-[#F3F4F6] transition-colors ${
												filterStatus === status ? "bg-[#EFF6FF]" : ""
											} ${status !== "all" ? "border-b border-[#F3F4F6]" : ""}`}
										>
											<span
												className={`capitalize ${filterStatus === status ? "text-secondary" : "text-[#6B7280]"}`}
											>
												{status}
											</span>
											<span
												className={`px-1 rounded-full text-[9px] md:text-[10px] ${
													filterStatus === status
														? "bg-white text-secondary"
														: "bg-muted text-[#6B7280]"
												}`}
											>
												{/* @ts-expect-error just leave it like this for now */}
												{statusCounts[status]}
											</span>
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Bulk Action Buttons */}
					{bulkMode && selectedApplicantIds.size > 0 && (
						<div className="flex items-center justify-between gap-4 mb-4 bg-card rounded-md shadow-sm p-4">
							<span className="text-xs text-primary">
								{selectedApplicantIds.size} selected
							</span>
							<div className="flex items-center gap-2">
								{filteredApplicants
									.filter((app) => selectedApplicantIds.has(app.id))
									.every(
										(app) =>
											app.status.code !== ScholarshipApplicationStatus.Denied &&
											app.status.code !== ScholarshipApplicationStatus.Approved,
									) && (
									<button
										onClick={() => handleBulkAction("denied")}
										className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-[#EF4444] text-tertiary rounded-md hover:bg-[#DC2626] transition-colors text-xs"
									>
										<XCircle className="w-4 h-4" />
										Deny
									</button>
								)}

								{filteredApplicants
									.filter((app) => selectedApplicantIds.has(app.id))
									.every(
										(app) =>
											app.status.code === ScholarshipApplicationStatus.Pending,
									) && (
									<button
										onClick={() => handleBulkAction("shortlisted")}
										className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-[#8B5CF6] text-tertiary rounded-md hover:bg-[#7C3AED] transition-colors text-xs"
									>
										<Star className="w-4 h-4" />
										Shortlist
									</button>
								)}

								{filteredApplicants
									.filter((app) => selectedApplicantIds.has(app.id))
									.every(
										(app) =>
											app.status.code ===
											ScholarshipApplicationStatus.Shortlisted,
									) && (
									<button
										onClick={() => handleBulkAction("approved")}
										className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-[#31D0AA] text-tertiary rounded-md hover:bg-[#10B981] transition-colors text-xs"
									>
										<CheckCircle2 className="w-4 h-4" />
										Approve
									</button>
								)}
							</div>
						</div>
					)}

					{/* Applicants List */}
					{filteredApplicants.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 bg-card rounded-lg shadow-sm">
							<Users className="w-14 h-14 text-[#D1D5DB]" />
							<p className="mt-4 text-[#9CA3AF]">No applicants found</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{filteredApplicants.map((applicant) => {
								if (!applicant.student) return null;
								const isSelected = selectedApplicantIds.has(applicant.id);
								const StatusIcon = getStatusIcon(applicant.status.code);
								const applicantName = `${applicant.student.firstName} ${applicant.student.lastName}`;

								return (
									<motion.div
										key={applicant.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3 }}
										onClick={() => {
											if (bulkMode) {
												toggleApplicantSelection(applicant.id);
											} else {
												openApplicantModal(applicant);
											}
										}}
										className={`bg-card rounded-lg shadow-sm p-5 cursor-pointer transition-all relative ${
											isSelected
												? "ring-2 ring-[#3A52A6] bg-background"
												: "hover:shadow-md"
										}`}
									>
										{/* Status Icon */}
										<StatusIcon
											className="w-5 h-5 absolute top-4 right-4"
											style={{ color: getStatusColor(applicant.status.code) }}
										/>

										<div className="flex items-center gap-4">
											{/* Checkbox in bulk mode */}
											{bulkMode && (
												<div className="flex items-center">
													{isSelected ? (
														<CheckSquare2 className="w-5 h-5 text-secondary" />
													) : (
														<Square className="w-5 h-5 text-[#9CA3AF]" />
													)}
												</div>
											)}

											{/* Avatar */}
											<div className="shrink-0">
												{applicant.student.avatarUrl ? (
													<img
														src={applicant.student.avatarUrl}
														alt={applicantName}
														className="w-14 h-14 rounded-full object-cover"
													/>
												) : (
													<div className="w-14 h-14 rounded-full bg-[#E0ECFF] flex items-center justify-center">
														<User className="w-7 h-7 text-secondary" />
													</div>
												)}
											</div>

											{/* Applicant Info */}
											<div className="flex-1">
												<h3 className="text-base text-primary truncate">
													{applicantName}
												</h3>
												<p className="text-sm text-[#6B7280] mb-2">
													{applicant.student.email}
												</p>

												<div className="flex items-center gap-2 text-xs text-[#6B7280]">
													<span>{formatDateTime(applicant.createdAt)}</span>
												</div>
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* Applicant Detail Modal */}
			<AnimatePresence>
				{modalVisible && selectedApplicant && selectedApplicant.student && (
					<div className="fixed inset-0 z-50 flex items-center justify-end p-2">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: isExiting ? 0 : 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.1 }}
							onClick={handleCloseModal}
							className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: isExiting ? "100%" : 0 }}
							exit={{ x: "100%" }}
							transition={{
								type: "spring",
								damping: 35,
								stiffness: 300,
								duration: 0.1,
							}}
							className="relative w-full max-w-120 h-full bg-white shadow-2xl rounded-lg overflow-y-auto custom-scrollbar"
						>
							{/* Header */}
							<div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-5 py-3 flex items-center justify-between z-10">
								<h2 className="text-lg text-primary flex items-center gap-2">
									<button
										onClick={handleCloseModal}
										className="hover:bg-gray-100 rounded-lg transition-colors"
									>
										<ChevronsRight size={20} className="text-primary" />
									</button>
									Application Details
								</h2>
							</div>

							<div className="p-5">
								{/* Profile Header */}
								<div className="mb-6">
									{/* Status Badge */}
									<div className="flex items-center gap-2 mb-4">
										{createElement(
											getStatusIcon(selectedApplicant.status.code),
											{
												className: "w-5 h-5",
												style: {
													color: getStatusColor(selectedApplicant.status.code),
												},
											},
										)}
										<span
											className="text-sm font-medium capitalize"
											style={{
												color: getStatusColor(selectedApplicant.status.code),
											}}
										>
											{selectedApplicant.status.name}
										</span>
									</div>

									{/* Profile Image */}
									<div className="flex justify-center mb-4">
										{selectedApplicant.student.avatarUrl ? (
											<img
												src={selectedApplicant.student.avatarUrl}
												alt={`${selectedApplicant.student.firstName} ${selectedApplicant.student.lastName}`}
												className="w-24 h-24 rounded-full object-cover border-2 border-[#E5E7EB] shadow-md"
											/>
										) : (
											<div className="w-24 h-24 rounded-full bg-[#E0ECFF] flex items-center justify-center border-2 border-[#E5E7EB] shadow-md">
												<User className="w-12 h-12 text-secondary" />
											</div>
										)}
									</div>

									{/* Name */}
									<h1 className="text-xl text-primary text-center mb-4">
										{`${selectedApplicant.student.firstName} ${selectedApplicant.student.lastName}`}
									</h1>

									{/* Contact Info */}
									<div className="space-y-2 text-[#6B7280]">
										<div className="flex items-center gap-2">
											<Mail size={17} className="shrink-0" />
											<span className="text-xs md:text-sm truncate">
												{selectedApplicant.student.email}
											</span>
										</div>

										{selectedApplicant.student.gender && (
											<div className="flex items-center gap-2">
												<User size={17} className="shrink-0" />
												<div className="col-span-1 flex items-start gap-2">
													<span className="text-xs md:text-sm capitalize">
														{selectedApplicant.student.gender.name}
													</span>
												</div>
											</div>
										)}

										<div className="flex items-center gap-2">
											<Phone size={17} className="shrink-0" />
											<span className="text-xs md:text-sm">
												{selectedApplicant.student.contact.value}
											</span>
										</div>

										<div className="flex items-center gap-2">
											<Calendar size={17} className="shrink-0" />
											<span className="text-xs md:text-sm">
												{formatDateTime(selectedApplicant.createdAt)}
											</span>
										</div>
									</div>
								</div>

								{/* Application Response */}
								{selectedApplicant.formFieldAnswers &&
									selectedApplicant.formFieldAnswers.length > 0 && (
										<div className="mb-6">
											<h3 className="text-sm text-primary mb-3">
												Application Response
											</h3>
											<div className="space-y-2.5">
												{Array.isArray(selectedApplicant.formFieldAnswers) &&
													selectedApplicant.formFieldAnswers.map(
														(item, index) => {
															const field = scholarship?.formFields.find(
																(f) => f.id === item.formFieldId,
															);

															return (
																<div
																	key={index}
																	className="p-3 bg-[#F9FAFB] border border-[#E0ECFF] rounded-lg"
																>
																	<div className="flex items-center gap-2 mb-1">
																		<span className="text-[13px] text-primary font-medium">
																			{field?.label}
																		</span>
																	</div>
																	{Array.isArray(item.value) &&
																	item.value.length > 0 &&
																	typeof item.value[0] === "string" &&
																	item.value[0].startsWith("http") ? (
																		<div className="space-y-2 mt-2">
																			{item.value.map(
																				(url: string, idx: number) => (
																					<div
																						key={idx}
																						className="flex items-center justify-between bg-[#F3F4F6] px-4 py-3 rounded-lg border-l-4 border-[#3A52A6]"
																					>
																						<div className="flex items-center gap-3 flex-1 min-w-0">
																							<FileText className="w-5 h-5 text-secondary shrink-0" />
																							<p className="text-[11px] text-primary truncate">
																								{item.formFieldId}
																							</p>
																						</div>
																						<button
																							onClick={(e) => {
																								e.stopPropagation();
																								handleFileOpen(url);
																							}}
																							className="p-2 hover:bg-[#E0ECFF] rounded-lg transition-colors shrink-0"
																						>
																							<ExternalLink className="w-4 h-4 text-primary" />
																						</button>
																					</div>
																				),
																			)}
																		</div>
																	) : typeof item.value === "string" &&
																		item.value.startsWith("http") ? (
																		<div className="space-y-2 mt-2">
																			<a
																				href={item.value}
																				rel="noreferrer"
																				target="_blank"
																				className="flex items-center justify-between bg-[#F3F4F6] px-4 py-3 rounded-lg border-l-4 border-[#3A52A6]"
																			>
																				<div className="flex items-center gap-3 flex-1 min-w-0">
																					<FileText className="w-5 h-5 text-secondary shrink-0" />
																					<p className="text-[11px] text-primary truncate">
																						{item.value}
																					</p>
																				</div>
																				<ExternalLink className="size-4 text-primary" />
																			</a>
																		</div>
																	) : item.value === null ||
																		item.value === "" ? (
																		<p className="text-xs text-[#9CA3AF] italic mt-1">
																			No response provided
																		</p>
																	) : (
																		<p className="text-xs text-[#6B7280] leading-relaxed mt-1">
																			{Array.isArray(item.value)
																				? item.value.join(", ")
																				: String(item.value)}
																		</p>
																	)}
																</div>
															);
														},
													)}
											</div>
										</div>
									)}

								{/* Remarks */}
								{selectedApplicant.remarks && (
									<div className="mb-6">
										<h3 className="text-sm text-primary mb-2">Remarks</h3>
										<div className="px-3 py-2 bg-[#FEF3C7] border border-[#FCD34D] rounded-lg">
											<p className="text-[11px] text-[#78350F] leading-relaxed">
												{selectedApplicant.remarks}
											</p>
										</div>
									</div>
								)}

								{/* Action Buttons */}
								{selectedApplicant.status.code !==
									ScholarshipApplicationStatus.Approved &&
									selectedApplicant.status.code !==
										ScholarshipApplicationStatus.Denied && (
										<div className="flex gap-3 mt-2">
											<button
												onClick={() => {
													setPendingAction({
														type: ScholarshipApplicationStatus.Denied,
														applicationId: selectedApplicant.id,
													});
													setConfirmationModal(true);
												}}
												className="flex-1 py-3 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all duration-100 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md bg-[#EF4444] cursor-pointer text-tertiary hover:bg-[#DC2626]"
											>
												<XCircle size={15} />
												Deny
											</button>
											{selectedApplicant.status.code ===
												ScholarshipApplicationStatus.Pending && (
												<button
													onClick={() => {
														setPendingAction({
															type: ScholarshipApplicationStatus.Shortlisted,
															applicationId: selectedApplicant.id,
														});
														setConfirmationModal(true);
													}}
													className="flex-1 py-3 cursor-pointer rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all duration-100 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md bg-[#8B5CF6] text-tertiary hover:bg-[#7C3AED]"
												>
													<Star size={15} />
													Shortlist
												</button>
											)}
											{selectedApplicant.status.code ===
												ScholarshipApplicationStatus.Shortlisted && (
												<button
													onClick={() => {
														setPendingAction({
															type: ScholarshipApplicationStatus.Approved,
															applicationId: selectedApplicant.id,
														});
														setConfirmationModal(true);
													}}
													className="flex-1 py-3 cursor-pointer rounded-lg text-sm flex items-center justify-center gap-1.5 transition-all duration-100 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md bg-[#31D0AA] text-tertiary hover:bg-[#10B981]"
												>
													<CheckCircle2 size={15} />
													Approve
												</button>
											)}
										</div>
									)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Bulk Action Confirmation Modal */}
			<Dialog
				open={bulkActionModal}
				onOpenChange={(open) => {
					setBulkActionModal(open);
					if (!open) setBulkRemarks("");
				}}
			>
				<DialogContent
					className="bg-background border border-[#E5E7EB] px-6 py-4 w-[400px]"
					showCloseButton={true}
				>
					<DialogHeader>
						<h3 className="text-lg text-primary mb-1">
							Bulk {bulkAction?.charAt(0).toUpperCase()}
							{bulkAction?.slice(1)} Applications
						</h3>
						<p className="text-sm text-[#4B5563]">
							Are you sure you want to {bulkAction} {selectedApplicantIds.size}{" "}
							applicant(s)?
						</p>
					</DialogHeader>

					{bulkAction === "denied" && (
						<div className="mb-6">
							<textarea
								value={bulkRemarks}
								onChange={(e) => setBulkRemarks(e.target.value)}
								placeholder="Enter reason for denial (optional)..."
								className="w-full px-4 py-3 rounded-md border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6] resize-none min-h-[100px]"
							/>
							<p className="text-xs text-[#9CA3AF] mt-2 italic">
								This will be visible to all selected applicants.
							</p>
						</div>
					)}

					<DialogFooter className="flex gap-3">
						<button
							onClick={() => {
								setBulkActionModal(false);
								setBulkRemarks("");
							}}
							disabled={isBulkUpdating}
							className={`flex-1 px-2 py-2.5 text-sm rounded-md transition-colors ${
								isBulkUpdating
									? "bg-[#CACAD2] text-[#9CA3AF] cursor-not-allowed"
									: "bg-[#CACAD2] text-[#4B5563] hover:bg-[#B8B8C0] cursor-pointer"
							}`}
						>
							Cancel
						</button>
						<button
							onClick={executeBulkAction}
							disabled={isBulkUpdating}
							className={`flex-1 px-2 py-2.5 text-sm text-tertiary rounded-md transition-colors ${
								isBulkUpdating
									? "opacity-70 cursor-not-allowed"
									: "hover:opacity-90 cursor-pointer"
							}`}
							style={{
								backgroundColor:
									bulkAction === "approved"
										? "#31D0AA"
										: bulkAction === "shortlisted"
											? "#8B5CF6"
											: "#EF4444",
							}}
						>
							{isBulkUpdating ? (
								<span className="flex items-center justify-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
								</span>
							) : (
								"Confirm"
							)}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Confirmation Modal */}
			<Dialog
				open={confirmationModal}
				onOpenChange={(open) => {
					setConfirmationModal(open);
					if (!open) setDenialRemarks("");
				}}
			>
				<DialogContent
					className="bg-background border border-[#E5E7EB] py-4 px-6 w-[400px]"
					showCloseButton={true}
				>
					<DialogHeader>
						<h3 className="text-lg text-primary mb-1">
							{pendingAction?.type === ScholarshipApplicationStatus.Approved
								? "Approve Application"
								: pendingAction?.type ===
										ScholarshipApplicationStatus.Shortlisted
									? "Shortlist Application"
									: "Deny Application"}
						</h3>
						<p className="text-sm text-[#4B5563]">
							{pendingAction?.type === "approved"
								? "Are you sure you want to approve this application?"
								: pendingAction?.type === "shortlisted"
									? "Are you sure you want to shortlist this application?"
									: "Are you sure you want to deny this application?"}
						</p>
					</DialogHeader>

					{pendingAction?.type === "denied" && (
						<div className="mb-6">
							<textarea
								value={denialRemarks}
								onChange={(e) => setDenialRemarks(e.target.value)}
								placeholder="Enter reason for denial..."
								className="w-full px-4 py-3 rounded-md border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6] resize-none min-h-[100px]"
							/>
							<p className="text-xs text-[#9CA3AF] mt-2 italic">
								This will be visible to the applicant (optional).
							</p>
						</div>
					)}

					<DialogFooter className="flex gap-3">
						<button
							onClick={() => {
								setConfirmationModal(false);
								setDenialRemarks("");
							}}
							disabled={isUpdatingStatus}
							className={`flex-1 px-2 py-2.5 text-sm rounded-md transition-colors ${
								isUpdatingStatus
									? "bg-[#CACAD2] text-[#9CA3AF] cursor-not-allowed"
									: "bg-[#CACAD2] text-[#4B5563] hover:bg-[#B8B8C0] cursor-pointer"
							}`}
						>
							Cancel
						</button>
						<button
							onClick={() => {
								if (pendingAction) {
									const remarks =
										pendingAction.type === "denied"
											? denialRemarks.trim()
											: undefined;
									handleUpdateStatus(
										pendingAction.applicationId,
										pendingAction.type,
										remarks,
									);
								}
							}}
							disabled={isUpdatingStatus}
							className={`flex-1 px-2 py-2.5 text-tertiary text-sm rounded-md transition-colors ${
								isUpdatingStatus
									? "opacity-70 cursor-not-allowed"
									: "hover:opacity-90 cursor-pointer"
							}`}
							style={{
								backgroundColor:
									pendingAction?.type === "approved"
										? "#31D0AA"
										: pendingAction?.type === "shortlisted"
											? "#8B5CF6"
											: "#EF4444",
							}}
						>
							{isUpdatingStatus ? (
								<span className="flex items-center justify-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
								</span>
							) : (
								<span>
									{pendingAction?.type === ScholarshipApplicationStatus.Approved
										? "Approve"
										: pendingAction?.type ===
												ScholarshipApplicationStatus.Shortlisted
											? "Shortlist"
											: "Deny"}
								</span>
							)}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
