import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for the 5-card metric grid (Total Users, Students, Sponsors,
 * Admins, Scholarships), mirroring MetricCard's internal layout: an icon
 * block top-right, a title line, a large value line, and a two-line
 * description.
 */
export function MetricCardsSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
			{Array.from({ length: 5 }).map((_, i) => (
				<motion.div
					key={i}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: i * 0.05 }}
					className="rounded-[28px] border border-[#E0ECFF] bg-white/95 p-5 shadow-[0_18px_45px_-28px_rgba(58,82,166,0.55)]"
				>
					<div className="mb-4 flex items-start justify-between gap-4">
						<Skeleton className="h-4 w-20 bg-muted-foreground" />
						<Skeleton className="h-11 w-11 shrink-0 rounded-2xl bg-muted-foreground" />
					</div>
					<Skeleton className="h-8 w-16 bg-muted-foreground" />
					<div className="mt-2 space-y-1.5">
						<Skeleton className="h-3 w-32 bg-muted-foreground" />
						<Skeleton className="h-3 w-20 bg-muted-foreground" />
					</div>
				</motion.div>
			))}
		</div>
	);
}

/**
 * Skeleton for the signup timeline card, mirroring SignupChart: header
 * (label/title/subtitle + range select), a total/peak-day stat pair, and
 * the recharts area-chart region as a plain placeholder block.
 */
export function SignupChartSkeleton() {
	return (
		<div className="rounded-4xl border border-[#D8E6FF] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(58,82,166,0.55)]">
			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-2">
					<Skeleton className="h-3 w-28 bg-muted-foreground" />
					<Skeleton className="h-5 w-52 bg-muted-foreground" />
					<Skeleton className="h-3 w-64 bg-muted-foreground" />
				</div>
				<Skeleton className="h-8 w-24 rounded-xl bg-muted-foreground" />
			</div>
			<div className="mb-6 flex gap-3">
				<div className="rounded-2xl border border-[#E0ECFF] bg-[#F8FBFF] px-4 py-3">
					<Skeleton className="mb-1 h-3 w-10 bg-muted-foreground" />
					<Skeleton className="h-6 w-8 bg-muted-foreground" />
				</div>
				<div className="rounded-2xl border border-[#E0ECFF] bg-[#F8FBFF] px-4 py-3">
					<Skeleton className="mb-1 h-3 w-14 bg-muted-foreground" />
					<Skeleton className="h-6 w-8 bg-muted-foreground" />
				</div>
			</div>
			<div className="rounded-[28px] border border-[#E8F0FF] bg-[linear-gradient(180deg,#FCFDFF_0%,#F6FAFF_100%)] p-4">
				<Skeleton className="h-[280px] w-full rounded-2xl bg-muted" />
			</div>
		</div>
	);
}

/**
 * Skeleton for the two-panel student distribution section, mirroring
 * StudentDistributionChart: a "Students by School" panel (title, total
 * stat, donut-chart placeholder, scrollable legend rows) and an
 * "Education Levels" panel (title, bar-chart placeholder, stat pair).
 */
export function StudentDistributionChartSkeleton() {
	return (
		<div className="grid gap-4 lg:grid-cols-2">
			{/* School distribution panel */}
			<div className="rounded-4xl border border-[#D8E6FF] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(58,82,166,0.55)]">
				<div className="mb-4 flex items-start justify-between gap-4">
					<div className="space-y-2">
						<Skeleton className="h-6 w-40 bg-muted-foreground" />
						<Skeleton className="h-3 w-56 bg-muted-foreground" />
					</div>
					<div className="shrink-0 rounded-2xl border border-[#E0ECFF] bg-[#F8FBFF] px-3 py-2">
						<Skeleton className="mb-1 h-3 w-8 bg-muted-foreground" />
						<Skeleton className="h-5 w-6 bg-muted-foreground" />
					</div>
				</div>
				<div className="rounded-[28px] border border-[#E8F0FF] bg-[linear-gradient(180deg,#FCFDFF_0%,#F6FAFF_100%)] p-4">
					<Skeleton className="h-[200px] w-full rounded-2xl bg-muted" />
				</div>
				<div className="mt-4 divide-y divide-[#EEF5FF] rounded-[20px] border border-[#E8F0FF] bg-[#FAFCFF]">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3 px-4 py-2.5">
							<Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted-foreground" />
							<Skeleton className="h-3 flex-1 bg-muted-foreground" />
							<Skeleton className="h-1.5 w-16 rounded-full bg-muted-foreground" />
							<Skeleton className="h-3 w-6 bg-muted-foreground" />
						</div>
					))}
				</div>
			</div>

			{/* Education level panel */}
			<div className="rounded-4xl border border-[#D8E6FF] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(58,82,166,0.55)]">
				<div className="mb-4 space-y-2">
					<Skeleton className="h-6 w-36 bg-muted-foreground" />
					<Skeleton className="h-3 w-52 bg-muted-foreground" />
				</div>
				<div className="rounded-[28px] border border-[#E8F0FF] bg-[linear-gradient(180deg,#FCFDFF_0%,#F6FAFF_100%)] p-4">
					<Skeleton className="h-[200px] w-full rounded-2xl bg-muted" />
				</div>
				<div className="mt-3 grid grid-cols-2 gap-2">
					{Array.from({ length: 2 }).map((_, i) => (
						<div
							key={i}
							className="rounded-2xl border border-[#E0ECFF] bg-[#F8FBFF] px-4 py-3"
						>
							<div className="mb-1 flex items-center gap-2">
								<Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full bg-muted-foreground" />
								<Skeleton className="h-3 w-16 bg-muted-foreground" />
							</div>
							<Skeleton className="h-6 w-10 bg-muted-foreground" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
