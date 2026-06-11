import { useState, useMemo, useEffect, createElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
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
	Sparkles,
	GraduationCap,
	HandCoins,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import { SEO } from "@/components/SEO";
import { handleError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import { formatDateTime } from "@/utils/formatting.utils";
import {
	ScholarshipApplicationStatus,
	ScholarshipStatus,
	type Applicant,
} from "@/lib/scholarship/model";
import {
	endScholarship,
	getApplicantsQuery,
	getScholarshipByIdQuery,
	updateApplication,
} from "@/lib/scholarship/api";
import { RankingControlPanel } from "@/components/ranking/RankingControlPanel";
import { RankedApplicationsTable } from "@/components/ranking/RankedApplicationsTable";
import type { RankingResult } from "@/lib/ranking/model";
import { usePersistedRankingResult } from "@/hooks/useRankingResults";
import { getSponsorDisbursementsQuery } from "@/lib/disbursement/api";
import type { Disbursement } from "@/lib/disbursement/model";
import { DisbursementStatusBadge } from "@/components/disbursement/DisbursementShared";
import {
	DisbursementDialog,
	type ScholarInfo,
} from "@/routes/_sponsor/scholars/-components/DisbursementDialog";

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
	const router = useRouter();
	const queryClient = useQueryClient();

	const applicantsQuery = useQuery(getApplicantsQuery(params.id));
	const scholarshipQuery = useQuery(getScholarshipByIdQuery(params.id));
	const disbursementsQuery = useQuery(getSponsorDisbursementsQuery());

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

	// Ranking state
	const [showRanking, setShowRanking] = useState(false);
	const [rankingResult, setRankingResult] = useState<RankingResult | null>(null);
	const [persistedDismissed, setPersistedDismissed] = useState(false);
	const [showPremiumModal, setShowPremiumModal] = useState(false); // Premium modal state

	const rankingEnabled =
		import.meta.env.VITE_ENABLE_APPLICANT_RANKING === "true";

	// Last saved ranking run, shown when the ranking panel is open and no
	// fresh ranking has been produced in this session
	const persistedRanking = usePersistedRankingResult(
		params.id,
		applicants,
		rankingEnabled,
	);
	const displayedRanking =
		rankingResult ??
		(showRanking && !persistedDismissed ? persistedRanking : null);

	// Disbursement state
	const [activeScholar, setActiveScholar] = useState<ScholarInfo | null>(null);

	const disbursementsByApplication = useMemo(() => {
		const map = new Map<string, Disbursement>();
		for (const d of disbursementsQuery.data ?? []) {
			map.set(d.scholarshipApplicationId, d);
		}
		return map;
	}, [disbursementsQuery.data]);


	// End scholarship state
	const [showEndConfirmation, setShowEndConfirmation] = useState(false);
	const [ending, setEnding] = useState(false);

	const endMutation = useMutation({
		mutationFn: () => endScholarship(params.id),
		onSuccess: async (res) => {
			await queryClient.invalidateQueries({ queryKey: ["scholarships", params.id] });
			await queryClient.invalidateQueries({ queryKey: ["scholarships"] });
			await queryClient.invalidateQueries({ queryKey: ["scholarships", "applicants", params.id] });
			toast.success("Scholarship ended", res.message, 1250);
			setEnding(false);
			setShowEndConfirmation(false);
			setTimeout(() => router.history.back(), 1500);
		},
		onError: (err: Error) => {
			toast.error("Error", err.message);
			setEnding(false);
		},
	});

	const handleEndScholarship = () => {
		setEnding(true);
		endMutation.mutate();
	};

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
			toast.error("Error", error, 2500);
		}
	}, [error]);

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
			toast.error("Error", "Please select at least one applicant", 2500);
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
			toast.error(`Error ${handled.code}`, handled.message, 2500);
		} finally {
			setIsBulkUpdating(false);
		}
	};

	const mutation = useMutation({
		mutationFn: updateApplication,
		onSuccess: async (res) => {
			console.log(res);
			toast.success(`Success`, res.message, 1250);
			queryClient.invalidateQueries({
				queryKey: ["scholarships", "applicants", params.id],
			});
			setConfirmationModal(false);
			setDenialRemarks("");
			setPendingAction(null);
			setIsUpdatingStatus(false);
			handleCloseModal();
		},
		onError: (err) => {
			toast.error("Error", err.message);
			console.error(err);
			setIsUpdatingStatus(false);
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
	};

	const getStatusColor = (status: ScholarshipApplicationStatus) => {
		switch (status) {
			case ScholarshipApplicationStatus.Approved:
				return "#31D0AA";
			case ScholarshipApplicationStatus.Granted:
				return "#C7D2FE";
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
			case ScholarshipApplicationStatus.Granted:
				return GraduationCap;
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
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<h1 className="text-2xl text-primary mb-1">
									{scholarship?.name}
								</h1>
								<p className="text-[11px] md:text-xs text-[#6B7280]">
									{applicants.length}{" "}
									{applicants.length === 1 ? "Applicant" : "Applicants"}
								</p>
							</div>
							{scholarship?.status.code !== ScholarshipStatus.Archived ? (
								<button
									type="button"
									disabled={ending}
									onClick={() => setShowEndConfirmation(true)}
									className="shrink-0 px-3 py-1.5 bg-destructive text-tertiary text-xs rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
								>
									End Scholarship
								</button>
							) : (
								<span className="shrink-0 px-3 py-1.5 bg-muted border border-border text-muted-foreground text-xs rounded-lg">
									Ended
								</span>
							)}
						</div>
					</div>

					{/* Toolbar */}
					<div className="flex items-center gap-2 mb-4">
						{/* Bulk Select Button */}
						<button
							onClick={toggleBulkMode}
							className={`px-4 py-2 rounded-md border cursor-pointer text-[11px] md:text-xs transition-colors ${
								bulkMode
									? "bg-secondary text-tertiary border-secondary"
									: "bg-card text-primary border-border"
							}`}
						>
							{bulkMode ? "Cancel" : "Bulk Select"}
						</button>

						{bulkMode && (
							<>
								<button
									onClick={selectAll}
									className="px-4 py-2 bg-card cursor-pointer border border-border rounded-md text-[11px] md:text-xs text-muted-foreground hover:bg-muted transition-colors"
								>
									Select All
								</button>
								<button
									onClick={deselectAll}
									className="px-4 py-2 bg-card cursor-pointer border border-border rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors"
								>
									Deselect
								</button>
							</>
						)}

						{/* Scholars shortcut */}
						{!bulkMode && statusCounts.approved > 0 && (
							<button
								onClick={() =>
									setFilterStatus(
										filterStatus === ScholarshipApplicationStatus.Approved
											? "all"
											: ScholarshipApplicationStatus.Approved,
									)
								}
								className={`flex items-center cursor-pointer gap-1.5 px-4 py-2 rounded-md border transition-colors text-[11px] md:text-xs ${
									filterStatus === ScholarshipApplicationStatus.Approved
										? "bg-success text-tertiary border-success"
										: "bg-card text-primary border-border"
								}`}
							>
								<GraduationCap className="w-3.5 h-3.5" />
								Scholars
								<span
									className={`px-1 rounded-full text-[9px] md:text-[10px] ${
										filterStatus === ScholarshipApplicationStatus.Approved
											? "bg-white/30 text-white"
											: "bg-primary text-tertiary"
									}`}
								>
									{statusCounts.approved}
								</span>
							</button>
						)}

						{/* Rank Applicants Button */}
						{rankingEnabled && !bulkMode && (
							<button
								onClick={() => setShowRanking(!showRanking)}
								className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-[#EFA508] text-tertiary rounded-md hover:bg-[#D89407] transition-colors text-[11px] md:text-xs"
							>
								<Trophy className="w-3.5 h-3.5" />
								{showRanking ? "Hide Ranking" : "Rank Applicants"}
							</button>
						)}

						{/* Filter Dropdown */}
						<div className="relative ml-auto">
							<button
								onClick={() => setShowDropdown(!showDropdown)}
								className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md hover:border-secondary transition-colors"
							>
								<span className="text-[11px] md:text-xs text-primary capitalize">
									{filterStatus}
								</span>
								<span className="px-1  bg-primary text-tertiary text-[9px] md:text-[10px] rounded-full">
									{/* @ts-expect-error just leave it like this for now */}
									{statusCounts[filterStatus]}
								</span>
								<ChevronDown
									className={`w-4 h-4 text-muted-foreground transition-transform ${showDropdown ? "rotate-180" : ""}`}
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

					{/* Ranking Panel */}
					{rankingEnabled && showRanking && scholarship && (
						<RankingControlPanel
							scholarship={scholarship}
							applicants={filteredApplicants}
							onRankingComplete={(result) => {
								setRankingResult(result);
								setPersistedDismissed(false);
								queryClient.invalidateQueries({
									queryKey: ["ranking", "latest", params.id],
								});
							}}
							onShowSuccess={(title, message) => toast.success(title, message, 2000)}
							onShowError={(title, message) => toast.error(title, message, 2500)}
						/>
					)}

					{/* Ranking Results */}
					{rankingEnabled && displayedRanking && (
						<div className="mb-6">
							<div className="mb-4 flex items-center justify-between">
								<button
									onClick={() => {
										setRankingResult(null);
										setPersistedDismissed(true);
									}}
									className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B7280] hover:text-[#3A52A6] transition-colors"
								>
									<ChevronDown className="w-4 h-4 rotate-90" />
									Back to Applicants
								</button>
								{!rankingResult && (
									<span className="text-xs text-[#9CA3AF]">
										Last ranked {formatDateTime(displayedRanking.session.timestamp)}
									</span>
								)}
							</div>
							<RankedApplicationsTable
								results={displayedRanking.rankedApplicants}
								onApplicationClick={(applicationId) => {
									const applicant = applicants.find((a) => a.id === applicationId);
									if (applicant) {
										openApplicantModal(applicant);
									}
								}}
								onUpgradePremium={() => {
									// Show the premium modal
									setShowPremiumModal(true);
								}}
							/>
						</div>
					)}

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
										className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-destructive text-tertiary rounded-md hover:bg-destructive/90 transition-colors text-xs"
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
										className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-success text-tertiary rounded-md hover:bg-success/90 transition-colors text-xs"
									>
										<CheckCircle2 className="w-4 h-4" />
										Approve
									</button>
								)}
							</div>
						</div>
					)}

					{/* Applicants List */}
					{!displayedRanking && filteredApplicants.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 bg-card rounded-lg shadow-sm">
							<Users className="w-14 h-14 text-[#D1D5DB]" />
							<p className="mt-4 text-[#9CA3AF]">No applicants found</p>
						</div>
					) : !displayedRanking ? (
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

										{/* Disburse Funds — approved/granted scholars only */}
										{(applicant.status.code === ScholarshipApplicationStatus.Approved ||
											applicant.status.code === ScholarshipApplicationStatus.Granted) && (
											<div
												className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2"
												onClick={(e) => e.stopPropagation()}
											>
												{(() => {
													const d = disbursementsByApplication.get(applicant.id);
													return d ? (
														<DisbursementStatusBadge status={d.status} />
													) : (
														<span className="text-xs text-[#9CA3AF]">Not disbursed</span>
													);
												})()}
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setActiveScholar({
															applicationId: applicant.id,
															studentId: applicant.student.id,
															studentName: applicantName,
															scholarshipName: scholarship?.name ?? "",
														});
													}}
													className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90 shrink-0"
												>
													<HandCoins className="h-3.5 w-3.5" />
													{disbursementsByApplication.has(applicant.id)
														? "View Disbursement"
														: "Disburse Funds"}
												</button>
											</div>
										)}
									</motion.div>
								);
							})}
						</div>
					) : null}
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
																	{(() => {
																		// Handle different value formats
																		const value = item.value;
																		
																		// Check if it's an object with url property
																		if (value && typeof value === "object" && !Array.isArray(value) && (value as any).url) {
																			const docData = value as any;
																			const isPlaceholder = docData.url.includes('example.com');
																			
																			return (
																				<div className="space-y-2 mt-2">
																					{isPlaceholder ? (
																						<div className="bg-[#FEF3C7] px-4 py-3 rounded-lg border-l-4 border-[#F59E0B]">
																							<div className="flex items-center gap-3">
																								<FileText className="w-5 h-5 text-[#F59E0B] shrink-0" />
																								<div className="flex-1">
																									<p className="text-[11px] text-[#92400E] font-medium">
																										📄 {docData.url.split("/").pop() || "Document"} (Test Data)
																									</p>
																									{docData.extractedText && (
																										<p className="text-[10px] text-[#10B981] mt-1">
																											✓ Contains extracted text for AI analysis
																										</p>
																									)}
																									<p className="text-[10px] text-[#92400E] mt-1 italic">
																										This is placeholder test data. In production, this would link to the actual uploaded file.
																									</p>
																								</div>
																							</div>
																						</div>
																					) : (
																						<a
																							href={docData.url}
																							rel="noreferrer"
																							target="_blank"
																							className="flex items-center justify-between bg-[#F3F4F6] px-4 py-3 rounded-lg border-l-4 border-[#3A52A6] hover:bg-[#E5E7EB] transition-colors"
																						>
																							<div className="flex items-center gap-3 flex-1 min-w-0">
																								<FileText className="w-5 h-5 text-secondary shrink-0" />
																								<div className="flex-1 min-w-0">
																									<p className="text-[11px] text-primary truncate">
																										{docData.url.split("/").pop() || "Document"}
																									</p>
																									{docData.extractedText && (
																										<p className="text-[10px] text-[#10B981] mt-0.5">
																											✓ Text extracted ({docData.extractedText.length} chars)
																										</p>
																									)}
																								</div>
																							</div>
																							<ExternalLink className="w-4 h-4 text-primary shrink-0" />
																						</a>
																					)}
																				</div>
																			);
																		}
																		
																		// Handle array of URLs (strings)
																		if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string" && value[0].startsWith("http")) {
																			return (
																				<div className="space-y-2 mt-2">
																					{value.map((url: string, idx: number) => (
																						<div
																							key={idx}
																							className="flex items-center justify-between bg-[#F3F4F6] px-4 py-3 rounded-lg border-l-4 border-[#3A52A6]"
																						>
																							<div className="flex items-center gap-3 flex-1 min-w-0">
																								<FileText className="w-5 h-5 text-secondary shrink-0" />
																								<p className="text-[11px] text-primary truncate">
																									{url.split("/").pop() || "Document"}
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
																					))}
																				</div>
																			);
																		}
																		
																		// Handle single string URL
																		if (typeof value === "string" && value.startsWith("http")) {
																			return (
																				<div className="space-y-2 mt-2">
																					<a
																						href={value}
																						rel="noreferrer"
																						target="_blank"
																						className="flex items-center justify-between bg-[#F3F4F6] px-4 py-3 rounded-lg border-l-4 border-[#3A52A6] hover:bg-[#E5E7EB] transition-colors"
																					>
																						<div className="flex items-center gap-3 flex-1 min-w-0">
																							<FileText className="w-5 h-5 text-secondary shrink-0" />
																							<p className="text-[11px] text-primary truncate">
																								{value.split("/").pop() || "Document"}
																							</p>
																						</div>
																						<ExternalLink className="w-4 h-4 text-primary" />
																					</a>
																				</div>
																			);
																		}
																		
																		// Handle null or empty
																		if (value === null || value === "") {
																			return (
																				<p className="text-xs text-[#9CA3AF] italic mt-1">
																					No response provided
																				</p>
																			);
																		}
																		
																		// Handle other values (text, etc.)
																		return (
																			<p className="text-xs text-[#6B7280] leading-relaxed mt-1">
																				{Array.isArray(value) ? value.join(", ") : String(value)}
																			</p>
																		);
																	})()}
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

			{/* Premium Modal */}
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
										<CheckCircle2 className="w-4 h-4 text-[#10B981]" />
										<span>Rank unlimited applicants with AI</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 text-[#10B981]" />
										<span>Full document reading and analysis</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 text-[#10B981]" />
										<span>Detailed AI recommendations</span>
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 text-[#10B981]" />
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
									// For now, show success message and close modal
									setShowPremiumModal(false);
									toast.success("Contact Sales", "Please contact our sales team to upgrade to premium");
									// Optionally, show the ranking panel to use premium features
									setShowRanking(true);
								}}
								className="flex-1 py-2 px-4 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED]"
							>
								Contact Sales
							</button>
						</div>
					</div>
				</div>
			)}

			{/* End Scholarship Confirmation Dialog */}
			<Dialog open={showEndConfirmation} onOpenChange={setShowEndConfirmation}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="font-normal">End Scholarship</DialogTitle>
						<DialogDescription>
							This will permanently end the {scholarship?.name} scholarship and notify all applicants. Selected applicants will receive a congratulatory message; others will receive a closing notice. This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<button
							type="button"
							disabled={ending}
							onClick={() => setShowEndConfirmation(false)}
							className="px-4 py-2 rounded-md border border-[#C4CBD5] text-primary text-sm hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="button"
							disabled={ending}
							onClick={handleEndScholarship}
							className="px-4 py-2 rounded-md bg-[#7F1D1D] text-white text-sm hover:bg-[#6B1A1A] transition-colors disabled:opacity-60"
						>
							{ending ? "Ending..." : "End Scholarship"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<DisbursementDialog
				open={!!activeScholar}
				onOpenChange={(next) => {
					if (!next) setActiveScholar(null);
				}}
				scholar={activeScholar}
				existing={
					activeScholar
						? disbursementsByApplication.get(activeScholar.applicationId)
						: undefined
				}
			/>
		</div>
	);
}
