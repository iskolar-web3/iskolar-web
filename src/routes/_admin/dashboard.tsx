import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth";
import {
	adminDashboardQueryOptions,
	adminSignupTimelineQueryOptions,
	adminStudentDistributionQueryOptions,
} from "@/lib/admin/queries";
import MetricCard from "@/components/admin/MetricCard";
import SignupChart from "@/components/admin/SignupChart";
import StudentDistributionChart from "@/components/admin/StudentDistributionChart";
import { LocalTimeClock } from "@/components/landing/LocalTimeClock";
import {
	Users,
	GraduationCap,
	Heart,
	ShieldCheck,
	TrendingUp,
	ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/_admin/dashboard")({
	component: AdminDashboard,
});

function AdminDashboard() {
	const auth = useAuth();
	const token = auth.sessionToken;

	const { data: metrics, isLoading: metricsLoading } = useQuery(
		adminDashboardQueryOptions(token),
	);
	const { data: timeline, isLoading: timelineLoading } = useQuery(
		adminSignupTimelineQueryOptions(token),
	);
	const { data: studentDistribution, isLoading: studentDistributionLoading } =
		useQuery(adminStudentDistributionQueryOptions(token));

	const spotlightMetrics = metrics
		? [
				{
					title: "Total Users",
					value: metrics.totalUsers,
					icon: Users,
					description: "All registered accounts across the beta.",
					className:
						"md:col-span-2 xl:col-span-1 bg-[linear-gradient(135deg,#FFFFFF_0%,#F5F9FF_100%)]",
					iconClassName: "bg-white",
				},
				{
					title: "Students",
					value: metrics.studentCount,
					icon: GraduationCap,
					description: "Learners currently in the ecosystem.",
				},
				{
					title: "Sponsors",
					value: metrics.sponsorCount,
					icon: Heart,
					description: "Supporters helping the network grow.",
					className: "bg-[#FBFDFF]",
				},
				{
					title: "Admins",
					value: metrics.adminCount,
					icon: ShieldCheck,
					description: "Stewards managing the platform.",
				},
				{
					title: "Sponsor:Student Ratio",
					value: `${metrics.sponsorToStudentRatio}:1`,
					icon: TrendingUp,
					description: "A quick read on support balance.",
				},
			]
		: [];

	const peakSignupDay = timeline?.reduce(
		(peak, entry) => (!peak || entry.count > peak.count ? entry : peak),
		null as (typeof timeline)[number] | null,
	);

	return (
		<div className="space-y-6">
			{/* Header panel */}
			<div className="relative overflow-hidden rounded-[36px] border border-[#D7E5FF] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF5FF_54%,#FFFFFF_100%)] px-6 py-6 shadow-[0_26px_60px_-36px_rgba(58,82,166,0.45)] sm:px-8 sm:py-7">
				<div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/60 blur-2xl" />
				<div className="absolute bottom-0 right-0 h-20 w-32 rounded-tl-[80px] bg-[#EAF2FF]" />
				<div className="relative flex flex-col gap-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<h1 className="text-3xl tracking-tight text-primary sm:text-[2.2rem]">
							Dashboard
						</h1>
						<LocalTimeClock compact />
					</div>

					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
								This week
							</p>
							<p className="mt-2 text-2xl text-primary">
								{metrics?.signupsLast7Days ?? "--"}
							</p>
							<p className="mt-1 text-sm text-[#6B7280]">New signups recorded</p>
						</div>
						<div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
								Peak day
							</p>
							<p className="mt-2 text-2xl text-primary">
								{peakSignupDay?.count ?? "--"}
							</p>
							<p className="mt-1 text-sm text-[#6B7280]">
								{peakSignupDay
									? new Date(peakSignupDay.date).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										})
									: "Waiting for timeline"}
							</p>
						</div>
						<div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Engagement
									</p>
									<p className="mt-2 text-2xl">
										{metrics?.activeUsersLast7Days ?? "--"}
									</p>
								</div>
								<ArrowUpRight className="mt-1 h-4 w-4 text-primary/80" />
							</div>
							<p className="mt-1 text-sm text-primary/70">Active in the last 7 days</p>
						</div>
					</div>
				</div>
			</div>

			{/* Metric cards */}
			{metricsLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="h-36 animate-pulse rounded-[28px] border border-[#E0ECFF] bg-white"
						/>
					))}
				</div>
			) : metrics ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
					{spotlightMetrics.map((metric) => (
						<MetricCard key={metric.title} {...metric} />
					))}
				</div>
			) : null}

			{/* Signup timeline chart */}
			{timelineLoading ? (
				<div className="h-80 animate-pulse rounded-4xl border border-[#E0ECFF] bg-white" />
			) : timeline ? (
				<SignupChart data={timeline} />
			) : null}

			{/* Student school & education level distribution */}
			{studentDistributionLoading ? (
				<div className="grid gap-4 lg:grid-cols-2">
					<div className="h-96 animate-pulse rounded-4xl border border-[#E0ECFF] bg-white" />
					<div className="h-96 animate-pulse rounded-4xl border border-[#E0ECFF] bg-white" />
				</div>
			) : studentDistribution ? (
				<StudentDistributionChart data={studentDistribution} />
			) : null}
		</div>
	);
}
