import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	GraduationCap,
	Mail,
	Phone,
	HandCoins,
	ArrowLeft,
	Calendar,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getApplicantsQuery, getScholarshipByIdQuery } from "@/lib/scholarship/api";
import { type Applicant } from "@/lib/scholarship/model";
import { ScholarshipApplicationStatus } from "@/lib/scholarship/status";
import { getSponsorDisbursementsQuery } from "@/lib/disbursement/api";
import type { Disbursement } from "@/lib/disbursement/model";
import { DisbursementStatusBadge } from "@/components/disbursement/DisbursementShared";
import {
	DisbursementDialog,
	type ScholarInfo,
} from "@/routes/_sponsor/scholars/-components/DisbursementDialog";

export const Route = createFileRoute("/_sponsor/scholarship/$id/scholars/")({
	component: ScholarshipScholarsPage,
});

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function ScholarCardSkeleton({ index }: { index: number }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
			className="bg-card border border-[#D3DCF6] rounded-md p-4 shadow-sm"
		>
			<div className="flex items-start gap-3">
				<Skeleton className="w-12 h-12 rounded-full shrink-0" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-48" />
					<Skeleton className="h-3 w-28" />
				</div>
			</div>
			<div className="mt-3 pt-3 border-t border-border space-y-1.5">
				<Skeleton className="h-3 w-40" />
				<Skeleton className="h-3 w-24" />
			</div>
			<div className="mt-3 flex items-center justify-between">
				<Skeleton className="h-5 w-20 rounded-full" />
				<Skeleton className="h-7 w-32 rounded-md" />
			</div>
		</motion.div>
	);
}

function ScholarCard({
	scholar,
	index,
	disbursement,
	onDisburse,
}: {
	scholar: Applicant;
	index: number;
	disbursement?: Disbursement;
	onDisburse: (scholar: Applicant) => void;
}) {
	const { student } = scholar;
	const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.04 }}
			className="bg-card border border-[#D3DCF6] rounded-md p-4 shadow-sm"
		>
			<div className="flex items-start gap-3">
				<Avatar className="w-12 h-12 shrink-0">
					<AvatarImage src={student.avatarUrl ?? ""} />
					<AvatarFallback className="bg-[#EEF2FF] text-primary text-sm font-medium">
						{initials}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-primary truncate">
						{student.firstName} {student.lastName}
					</p>
					<div className="mt-1 space-y-0.5">
						<div className="flex items-center gap-1.5 text-[#6B7280]">
							<Mail className="w-3 h-3 shrink-0" />
							<span className="text-xs truncate">{student.email}</span>
						</div>
						{student.contact?.value && (
							<div className="flex items-center gap-1.5 text-[#6B7280]">
								<Phone className="w-3 h-3 shrink-0" />
								<span className="text-xs">{student.contact.value}</span>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="mt-3 pt-3 border-t border-border space-y-1">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-1.5 text-[#6B7280]">
						<Calendar className="w-3 h-3 shrink-0" />
						<span className="text-xs shrink-0">Approved</span>
					</div>
					<span className="text-xs text-[#6B7280]">
						{formatDate(scholar.updatedAt)}
					</span>
				</div>
			</div>

			<div className="mt-3 flex items-center justify-between gap-2">
				{disbursement ? (
					<DisbursementStatusBadge status={disbursement.status} />
				) : (
					<span className="text-xs text-[#9CA3AF]">Not disbursed</span>
				)}
				<button
					type="button"
					onClick={() => onDisburse(scholar)}
					className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90"
				>
					<HandCoins className="h-3.5 w-3.5" />
					{disbursement ? "View Disbursement" : "Disburse Funds"}
				</button>
			</div>
		</motion.div>
	);
}

function ScholarshipScholarsPage() {
	const { id } = Route.useParams();
	const [activeScholar, setActiveScholar] = useState<ScholarInfo | null>(null);

	const scholarshipQuery = useQuery(getScholarshipByIdQuery(id));
	const applicantsQuery = useQuery(getApplicantsQuery(id));
	const disbursementsQuery = useQuery(getSponsorDisbursementsQuery());

	const isLoading =
		scholarshipQuery.isLoading ||
		applicantsQuery.isLoading ||
		disbursementsQuery.isLoading;

	const scholars = useMemo(
		() =>
			(applicantsQuery.data ?? []).filter(
				(a) =>
					a.status.code === ScholarshipApplicationStatus.Approved ||
					a.status.code === ScholarshipApplicationStatus.Granted,
			),
		[applicantsQuery.data],
	);

	const disbursementsByApplication = useMemo(() => {
		const map = new Map<string, Disbursement>();
		for (const d of disbursementsQuery.data ?? []) {
			map.set(d.scholarshipApplicationId, d);
		}
		return map;
	}, [disbursementsQuery.data]);

	const scholarshipName = scholarshipQuery.data?.name ?? "";

	return (
		<div className="min-h-screen">
			<SEO title="Scholars Directory" noindex={true} />

			<div className="space-y-4">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="bg-card rounded-md border border-[#D3DCF6] shadow-sm p-4"
				>
					<Link
						to="/scholarship/$id/applicants"
						params={{ id }}
						className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-primary transition-colors mb-3"
					>
						<ArrowLeft className="w-3.5 h-3.5" />
						Back to Applicants
					</Link>
					<div className="flex items-start gap-3">
						<div className="p-2 bg-[#EEF2FF] rounded-md shrink-0">
							<GraduationCap className="w-5 h-5 text-primary" />
						</div>
						<div>
							<p className="text-xl text-primary">
								{isLoading ? (
									<Skeleton className="h-6 w-48 inline-block" />
								) : (
									scholarshipName
								)}
							</p>
							<p className="text-xs text-[#6B7280] mt-0.5">Scholars Directory</p>
						</div>
					</div>
					{!isLoading && (
						<p className="text-xs text-[#6B7280] mt-2 pl-11">
							{scholars.length}{" "}
							{scholars.length === 1 ? "approved scholar" : "approved scholars"}
						</p>
					)}
				</motion.div>

				{/* Scholars grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
					{isLoading ? (
						Array.from({ length: 6 }).map((_, i) => (
							<ScholarCardSkeleton key={`skel-${i}`} index={i} />
						))
					) : scholars.length === 0 ? (
						<div className="col-span-full flex flex-col items-center justify-center pt-24 pb-16">
							<GraduationCap className="w-24 h-24 text-[#D1D5DB]" />
							<p className="mt-5 text-lg text-[#9CA3AF]">No approved scholars yet</p>
							<p className="max-w-sm text-sm text-[#9CA3AF] mt-2 text-center">
								Approve applicants from this scholarship to see them listed here.
							</p>
							<Link
								to="/scholarship/$id/applicants"
								params={{ id }}
								className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm rounded-md hover:opacity-90 transition-opacity"
							>
								<ArrowLeft className="w-4 h-4" />
								Go to Applicants
							</Link>
						</div>
					) : (
						scholars.map((scholar, index) => (
							<ScholarCard
								key={scholar.id}
								scholar={scholar}
								index={index}
								disbursement={disbursementsByApplication.get(scholar.id)}
								onDisburse={(s) =>
									setActiveScholar({
										applicationId: s.id,
										studentId: s.student.id,
										studentName: `${s.student.firstName} ${s.student.lastName}`,
										scholarshipName,
									})
								}
							/>
						))
					)}
				</div>
			</div>

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
