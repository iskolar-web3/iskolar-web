import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth";
import {
	adminDashboardQueryOptions,
	adminSignupTimelineQueryOptions,
} from "@/lib/admin/queries";
import MetricCard from "@/components/admin/MetricCard";
import SignupChart from "@/components/admin/SignupChart";
import {
	Users,
	GraduationCap,
	Heart,
	ShieldCheck,
	TrendingUp,
	Activity,
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

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-xl text-primary">Dashboard</h1>
				<p className="text-sm text-[#6B7280] mt-1">
					iSkolar beta signup overview
				</p>
			</div>

			{metricsLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="bg-white rounded-xl border border-[#E0ECFF] p-5 h-28 animate-pulse"
						/>
					))}
				</div>
			) : metrics ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
					<MetricCard
						title="Total Users"
						value={metrics.totalUsers}
						icon={Users}
						description="All registered accounts"
					/>
					<MetricCard
						title="Students"
						value={metrics.studentCount}
						icon={GraduationCap}
					/>
					<MetricCard
						title="Sponsors"
						value={metrics.sponsorCount}
						icon={Heart}
					/>
					<MetricCard
						title="Admins"
						value={metrics.adminCount}
						icon={ShieldCheck}
					/>
					<MetricCard
						title="Sponsor:Student Ratio"
						value={`${metrics.sponsorToStudentRatio}:1`}
						icon={TrendingUp}
						description="Sponsor to student ratio"
					/>
					<MetricCard
						title="Active (7 Days)"
						value={metrics.activeUsersLast7Days}
						icon={Activity}
						description={`${metrics.signupsLast7Days} new signups this week`}
					/>
				</div>
			) : null}

			{timelineLoading ? (
				<div className="bg-white rounded-xl border border-[#E0ECFF] p-5 h-80 animate-pulse" />
			) : timeline ? (
				<SignupChart data={timeline} />
			) : null}
		</div>
	);
}
