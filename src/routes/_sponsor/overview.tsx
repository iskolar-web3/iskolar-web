import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	BookOpen,
	CheckCircle2,
	GraduationCap,
	TrendingUp,
	Wallet,
} from "lucide-react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import MetricCard from "@/components/admin/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getSponsorDashboardQuery } from "@/lib/sponsor/api";

export const Route = createFileRoute("/_sponsor/overview")({
	component: SponsorOverview,
});

const STATUS_COLORS: Record<string, string> = {
	pending: "#F59E0B",
	shortlisted: "#3A52A6",
	approved: "#8B5CF6",
	denied: "#EF4444",
	granted: "#31D0AA",
};

const STATUS_LABELS: Record<string, string> = {
	pending: "Pending",
	shortlisted: "Shortlisted",
	approved: "Approved",
	denied: "Denied",
	granted: "Granted",
};

function PHTimeClock() {
	const fmt = () =>
		new Date().toLocaleString("en-PH", {
			timeZone: "Asia/Manila",
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});

	const [display, setDisplay] = useState(fmt);

	useEffect(() => {
		const id = setInterval(() => setDisplay(fmt()), 1000);
		return () => clearInterval(id);
	}, []);

	return (
		<p className="text-sm text-muted-foreground">
			{display}{" "}
			<span className="font-medium text-secondary">PHT</span>
		</p>
	);
}

function formatPeso(value: number): string {
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		maximumFractionDigits: 2,
	}).format(value);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-52 rounded-4xl" />
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-36 rounded-3xl" />
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				<Skeleton className="h-96 rounded-3xl" />
				<Skeleton className="h-96 rounded-3xl" />
			</div>
		</div>
	);
}

export default function SponsorOverview() {
	const dashboard = useQuery(getSponsorDashboardQuery());

	if (dashboard.isLoading) {
		return <DashboardSkeleton />;
	}

	if (dashboard.isError || !dashboard.data) {
		return (
			<div className="flex h-64 items-center justify-center text-sm text-destructive">
				Failed to load dashboard. Please try again.
			</div>
		);
	}

	const data = dashboard.data;

	const metricCards = [
		{
			title: "Scholarships Posted",
			value: data.totalScholarships,
			icon: BookOpen,
			description: "All scholarship programs created.",
		},
		{
			title: "Active Scholarships",
			value: data.activeScholarships,
			icon: TrendingUp,
			description: "Currently accepting applications.",
		},
		{
			title: "Total Applicants",
			value: data.totalApplicants,
			icon: GraduationCap,
			description: "Applications received across all scholarships.",
		},
		{
			title: "Scholars Granted",
			value: data.totalScholarsGranted,
			icon: CheckCircle2,
			description: "Students successfully awarded.",
		},
		{
			title: "Total Disbursed",
			value: formatPeso(data.totalDisbursementAmount),
			icon: Wallet,
			description: "Total funds sent to scholars.",
		},
	];

	const pieData = data.applicantsByStatus.map((entry) => ({
		name: STATUS_LABELS[entry.status.code] ?? entry.status.name,
		value: entry.count,
		color: STATUS_COLORS[entry.status.code] ?? "#9CA3AF",
	}));

	const totalSlots = data.slotFillRates.reduce((sum, r) => sum + r.totalSlots, 0);
	const totalGranted = data.slotFillRates.reduce((sum, r) => sum + r.granted, 0);
	const overallFillRate =
		totalSlots > 0 ? Math.round((totalGranted / totalSlots) * 100) : 0;

	return (
		<div className="space-y-6">
			{/* Header panel */}
			<div className="relative overflow-hidden rounded-4xl border border-border bg-gradient-to-br from-card via-background to-card px-6 py-6 shadow-sm sm:px-8 sm:py-7">
				<div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-secondary/5 blur-2xl" />
				<div className="absolute bottom-0 right-0 h-20 w-32 rounded-tl-4xl bg-secondary/5" />
				<div className="relative flex flex-col gap-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<h1 className="text-3xl tracking-tight text-primary sm:text-4xl">
								Dashboard
							</h1>
							<p className="mt-1 text-sm text-muted-foreground">
								Performance overview for your scholarship programs.
							</p>
						</div>
						<PHTimeClock />
					</div>

					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-3xl border border-border/60 bg-card/90 p-4 shadow-sm">
							<p className="text-xs uppercase tracking-widest text-muted-foreground">
								Overall fill rate
							</p>
							<p className="mt-2 text-2xl text-primary">{overallFillRate}%</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Granted vs. total slots
							</p>
						</div>
						<div className="rounded-3xl border border-border/60 bg-card/90 p-4 shadow-sm">
							<p className="text-xs uppercase tracking-widest text-muted-foreground">
								Total slots
							</p>
							<p className="mt-2 text-2xl text-primary">{totalSlots}</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Across all scholarships
							</p>
						</div>
						<div className="rounded-3xl border border-border/60 bg-card/90 p-4 shadow-sm">
							<p className="text-xs uppercase tracking-widest text-muted-foreground">
								Disbursed
							</p>
							<p className="mt-2 text-2xl text-primary">
								{formatPeso(data.totalDisbursementAmount)}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">Total funds sent</p>
						</div>
					</div>
				</div>
			</div>

			{/* Metric cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
				{metricCards.map((m) => (
					<MetricCard key={m.title} {...m} />
				))}
			</div>

			{/* Charts + slot fill rates */}
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Applicants by status */}
				<div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
					<h2 className="mb-1 text-base font-medium text-primary">
						Applicants by Status
					</h2>
					<p className="mb-4 text-xs text-muted-foreground">
						Distribution across all scholarships.
					</p>
					{pieData.length === 0 ? (
						<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
							No applications yet.
						</div>
					) : (
						<ResponsiveContainer width="100%" height={280}>
							<PieChart>
								<Pie
									data={pieData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={100}
									paddingAngle={3}
									dataKey="value"
								>
									{pieData.map((entry) => (
										<Cell key={entry.name} fill={entry.color} />
									))}
								</Pie>
								<Tooltip />
								<Legend
									formatter={(value) => (
										<span className="text-xs text-foreground">{value}</span>
									)}
								/>
							</PieChart>
						</ResponsiveContainer>
					)}
				</div>

				{/* Slot fill rate per scholarship */}
				<div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
					<h2 className="mb-1 text-base font-medium text-primary">
						Slot Fill Rate
					</h2>
					<p className="mb-4 text-xs text-muted-foreground">
						Granted scholars vs. available slots per scholarship.
					</p>
					{data.slotFillRates.length === 0 ? (
						<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
							No scholarships yet.
						</div>
					) : (
						<div className="max-h-72 space-y-4 overflow-y-auto pr-1">
							{data.slotFillRates.map((r) => {
								const pct =
									r.totalSlots > 0
										? Math.round((r.granted / r.totalSlots) * 100)
										: 0;
								return (
									<div key={r.scholarshipId}>
										<div className="mb-1 flex items-center justify-between gap-2">
											<p
												className="truncate text-sm text-foreground"
												title={r.name}
											>
												{r.name}
											</p>
											<span className="shrink-0 text-xs text-muted-foreground">
												{r.granted}/{r.totalSlots} ({pct}%)
											</span>
										</div>
										<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
											<div
												className="h-full rounded-full bg-secondary transition-all"
												style={{ width: `${pct}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
