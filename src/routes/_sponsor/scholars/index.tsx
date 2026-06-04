import { useState, useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, Search, Mail, Phone, HandCoins } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/auth";
import { useAnimateOnce } from "@/hooks/useAnimateOnce";
import { getMyScholarshipsQuery, getApplicantsQuery } from "@/lib/scholarship/api";
import { ScholarshipApplicationStatus, type Applicant } from "@/lib/scholarship/model";
import type { AnySponsor } from "@/lib/sponsor/model";
import type { Scholarship } from "@/lib/scholarship/model";
import { getSponsorDisbursementsQuery } from "@/lib/disbursement/api";
import type { Disbursement } from "@/lib/disbursement/model";
import { DisbursementStatusBadge } from "@/components/disbursement/DisbursementShared";
import {
	DisbursementDialog,
	type ScholarInfo,
} from "./-components/DisbursementDialog";

export const Route = createFileRoute("/_sponsor/scholars/")({
	component: ScholarsPage,
});

type Scholar = Applicant & {
	scholarshipName: string;
	scholarshipId: string;
};

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function ScholarCardSkeleton({ index, shouldAnimate }: { index: number; shouldAnimate: boolean }) {
	return (
		<motion.div
			initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: shouldAnimate ? index * 0.05 : 0 }}
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
		</motion.div>
	);
}

function ScholarCard({
	scholar,
	index,
	disbursement,
	onDisburse,
	shouldAnimate,
}: {
	scholar: Scholar;
	index: number;
	disbursement?: Disbursement;
	onDisburse: (scholar: Scholar) => void;
	shouldAnimate: boolean;
}) {
	const { student } = scholar;
	const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

	return (
		<motion.div
			initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: shouldAnimate ? index * 0.04 : 0 }}
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
					<span className="text-xs text-[#6B7280] shrink-0">Scholarship</span>
					<span className="text-xs text-primary font-medium text-right truncate">
						{scholar.scholarshipName}
					</span>
				</div>
				<div className="flex items-center justify-between gap-2">
					<span className="text-xs text-[#6B7280] shrink-0">Approved</span>
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

function ScholarsPage() {
	const auth = useAuth<AnySponsor>();
	const headerAnim = useAnimateOnce("scholars:header");
	const filtersAnim = useAnimateOnce("scholars:filters");
	const sectionAnim = useAnimateOnce("scholars:section");

	const [search, setSearch] = useState("");
	const [filterScholarshipId, setFilterScholarshipId] = useState("all");
	const [activeScholar, setActiveScholar] = useState<ScholarInfo | null>(null);

	const scholarshipsQuery = useQuery(
		getMyScholarshipsQuery({
			sponsorId: auth.profile?.id ?? "",
		}),
	);

	const disbursementsQuery = useQuery(getSponsorDisbursementsQuery());
	const disbursementsByApplication = useMemo(() => {
		const map = new Map<string, Disbursement>();
		for (const d of disbursementsQuery.data ?? []) {
			map.set(d.scholarshipApplicationId, d);
		}
		return map;
	}, [disbursementsQuery.data]);

	const scholarships: Scholarship[] = scholarshipsQuery.data ?? [];

	const applicantResults = useQueries({
		queries: scholarships.map((s) => ({
			...getApplicantsQuery(s.id),
			enabled: !scholarshipsQuery.isLoading && !!scholarships.length,
		})),
		combine: (results) => ({
			data: results.flatMap((result, index) =>
				(result.data ?? [])
					.filter(
						(a) =>
							a.status.code === ScholarshipApplicationStatus.Approved ||
							a.status.code === ScholarshipApplicationStatus.Granted,
					)
					.map(
						(a): Scholar => ({
							...a,
							scholarshipName: scholarships[index]?.name ?? "",
							scholarshipId: scholarships[index]?.id ?? "",
						}),
					),
			),
			isLoading: results.length > 0 && results.some((r) => r.isLoading),
		}),
	});

	const isLoading =
		scholarshipsQuery.isLoading ||
		(scholarships.length > 0 && applicantResults.isLoading);

	const scholars = useMemo(() => {
		const filter = (scholar: Scholar) => {
			const fullName =
				`${scholar.student.firstName} ${scholar.student.lastName}`.toLowerCase();
			const matchesSearch =
				!search ||
				fullName.includes(search.toLowerCase()) ||
				scholar.student.email.toLowerCase().includes(search.toLowerCase());
			const matchesScholarship =
				filterScholarshipId === "all" ||
				scholar.scholarshipId === filterScholarshipId;
			return matchesSearch && matchesScholarship;
		};
		return applicantResults.data.filter(filter);
	}, [applicantResults.data, search, filterScholarshipId]);

	return (
		<div className="min-h-screen">
			<SEO title="My Scholars" noindex={true} />

			<div className="space-y-4">
				{/* Header */}
				<motion.div
					initial={headerAnim.shouldAnimate ? { opacity: 0, y: -20 } : false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					onAnimationComplete={headerAnim.markAnimated}
					className="bg-card rounded-md text-center p-3 border border-[#D3DCF6] shadow-sm"
				>
					<p className="text-xl text-primary tracking-wide">My Scholars</p>
					{!isLoading && (
						<p className="text-xs text-[#6B7280] mt-0.5">
							{scholars.length}{" "}
							{scholars.length === 1 ? "scholar" : "scholars"}
						</p>
					)}
				</motion.div>

				{/* Filters */}
				<motion.div
					initial={filtersAnim.shouldAnimate ? { opacity: 0, y: -10 } : false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: filtersAnim.shouldAnimate ? 0.1 : 0 }}
					onAnimationComplete={filtersAnim.markAnimated}
					className="flex flex-col sm:flex-row gap-2"
				>
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
						<input
							type="text"
							placeholder="Search by name or email"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 bg-card border border-[#D3DCF6] rounded-md text-sm text-primary placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
						/>
					</div>

					{scholarships.length > 1 && (
						<select
							value={filterScholarshipId}
							onChange={(e) => setFilterScholarshipId(e.target.value)}
							className="px-3 py-2 bg-card border border-[#D3DCF6] rounded-md text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent sm:w-56 shrink-0"
						>
							<option value="all">All Scholarships</option>
							{scholarships.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</select>
					)}
				</motion.div>

				{/* Scholars grid */}
				<motion.div
					initial={sectionAnim.shouldAnimate ? { opacity: 0, y: 20 } : false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					onAnimationComplete={sectionAnim.markAnimated}
				>
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
					{isLoading ? (
						Array.from({ length: 6 }).map((_, i) => (
							<ScholarCardSkeleton key={`skel-${i}`} index={i} shouldAnimate={sectionAnim.shouldAnimate} />
						))
					) : scholars.length === 0 ? (
						<div className="col-span-full flex flex-col items-center justify-center pt-24 pb-16">
							<GraduationCap className="w-24 h-24 text-[#D1D5DB]" />
							<p className="mt-5 text-lg text-[#9CA3AF]">No scholars yet</p>
							<p className="max-w-sm text-sm text-[#9CA3AF] mt-2 text-center">
								{search || filterScholarshipId !== "all"
									? "No scholars match your current filters."
									: "Approve applicants from your scholarships to see them listed here."}
							</p>
						</div>
					) : (
						scholars.map((scholar, index) => (
							<ScholarCard
								key={`${scholar.scholarshipId}-${scholar.id}`}
								scholar={scholar}
								index={index}
								disbursement={disbursementsByApplication.get(scholar.id)}
								shouldAnimate={sectionAnim.shouldAnimate}
								onDisburse={(s) =>
									setActiveScholar({
										applicationId: s.id,
										studentId: s.student.id,
										studentName: `${s.student.firstName} ${s.student.lastName}`,
										scholarshipName: s.scholarshipName,
									})
								}
							/>
						))
					)}
				</div>
				</motion.div>
			</div>

			<DisbursementDialog
				open={!!activeScholar}
				onOpenChange={(next) => {
					if (!next) {
						setActiveScholar(null);
					}
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
