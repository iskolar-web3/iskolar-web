import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getReportsQuery } from "@/lib/report/api";
import { type Report, ReportStatus } from "@/lib/report/model";
import { ReportDetailDialog } from "./-components/ReportDetailDialog";

export const Route = createFileRoute("/_sponsor/scholar-reports/")({
	component: SponsorReportsPage,
});

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function ReportRow({
	report,
	onClick,
}: {
	report: Report;
	onClick: () => void;
}) {
	return (
		<Card
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClick();
			}}
			className="cursor-pointer transition-colors hover:bg-accent/50"
		>
			<CardHeader>
				<CardTitle>{report.title}</CardTitle>
				<CardAction>
					<Badge
						variant={
							report.status === ReportStatus.Pending ? "secondary" : "default"
						}
					>
						{report.status === ReportStatus.Pending ? "Pending" : "Reviewed"}
					</Badge>
				</CardAction>
				<p className="text-sm text-muted-foreground">
					{report.student.firstName} {report.student.lastName} &middot;{" "}
					{report.scholarship.name}
				</p>
				<p className="text-xs text-muted-foreground">
					{formatDate(report.startedAt)} -{" "}
					{report.endedAt ? formatDate(report.endedAt) : "Present"} &middot;
					Submitted {formatDate(report.createdAt)}
				</p>
			</CardHeader>
		</Card>
	);
}

function SponsorReportsPage() {
	const [scholarshipId, setScholarshipId] = useState("all");
	const [studentId, setStudentId] = useState("all");
	const [status, setStatus] = useState("all");
	const [selectedReport, setSelectedReport] = useState<Report | null>(null);

	const reportsQuery = useQuery(getReportsQuery({}));
	const reports = reportsQuery.data ?? [];

	const scholarshipOptions = useMemo(() => {
		const map = new Map<string, string>();
		for (const r of reports) map.set(r.scholarship.id, r.scholarship.name);
		return Array.from(map, ([id, name]) => ({ id, name }));
	}, [reports]);

	const scholarOptions = useMemo(() => {
		const map = new Map<string, string>();
		for (const r of reports) {
			map.set(r.student.id, `${r.student.firstName} ${r.student.lastName}`);
		}
		return Array.from(map, ([id, name]) => ({ id, name }));
	}, [reports]);

	const filteredReports = useMemo(() => {
		return reports.filter((r) => {
			if (scholarshipId !== "all" && r.scholarship.id !== scholarshipId) {
				return false;
			}
			if (studentId !== "all" && r.student.id !== studentId) {
				return false;
			}
			if (status !== "all" && r.status !== status) {
				return false;
			}
			return true;
		});
	}, [reports, scholarshipId, studentId, status]);

	return (
		<div className="min-h-screen">
			<SEO title="Scholar Reports" noindex={true} />

			<div className="mx-auto max-w-3xl space-y-5">
				<div>
					<h1 className="text-2xl text-primary">Scholar Reports</h1>
					<p className="mt-0.5 text-sm text-muted-foreground">
						Progress reports submitted by your granted scholars.
					</p>
				</div>

				{reports.length > 0 && (
					<div className="flex flex-col gap-3 sm:flex-row">
						<Select value={scholarshipId} onValueChange={setScholarshipId}>
							<SelectTrigger className="w-full sm:w-52">
								<SelectValue placeholder="Filter by scholarship" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Scholarships</SelectItem>
								{scholarshipOptions.map((s) => (
									<SelectItem key={s.id} value={s.id}>
										{s.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={studentId} onValueChange={setStudentId}>
							<SelectTrigger className="w-full sm:w-52">
								<SelectValue placeholder="Filter by scholar" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Scholars</SelectItem>
								{scholarOptions.map((s) => (
									<SelectItem key={s.id} value={s.id}>
										{s.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="w-full sm:w-40">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value={ReportStatus.Pending}>Pending</SelectItem>
								<SelectItem value={ReportStatus.Approved}>Reviewed</SelectItem>
							</SelectContent>
						</Select>
					</div>
				)}

				{reportsQuery.isLoading ? (
					<div className="space-y-3">
						{["skel-1", "skel-2"].map((key) => (
							<Skeleton key={key} className="h-28 w-full rounded-lg" />
						))}
					</div>
				) : reports.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<FileText />
							</EmptyMedia>
							<EmptyTitle>No reports yet</EmptyTitle>
							<EmptyDescription>
								Progress reports your scholars submit will show up here.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : filteredReports.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<FileText />
							</EmptyMedia>
							<EmptyTitle>No matching reports</EmptyTitle>
							<EmptyDescription>Try adjusting your filters.</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div className="space-y-3">
						{filteredReports.map((report) => (
							<ReportRow
								key={report.id}
								report={report}
								onClick={() => setSelectedReport(report)}
							/>
						))}
					</div>
				)}
			</div>

			<ReportDetailDialog
				open={!!selectedReport}
				onOpenChange={(next) => !next && setSelectedReport(null)}
				report={selectedReport}
			/>
		</div>
	);
}
