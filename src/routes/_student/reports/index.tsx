import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyReportsQuery } from "@/lib/report/api";
import type { Report } from "@/lib/report/model";
import { ReportStatus } from "@/lib/report/model";
import { getMyApplicationsQuery } from "@/lib/scholarship/api";
import { ScholarshipApplicationStatus } from "@/lib/scholarship/status";
import { ReportFormDialog } from "./-components/ReportFormDialog";
import { SetEndDateDialog } from "./-components/SetEndDateDialog";

export const Route = createFileRoute("/_student/reports/")({
	component: ReportsPage,
});

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

const STATUS_BADGE_VARIANT: Record<
	ReportStatus,
	"secondary" | "default" | "destructive"
> = {
	[ReportStatus.Pending]: "secondary",
	[ReportStatus.Approved]: "default",
	[ReportStatus.Rejected]: "destructive",
};

const STATUS_LABEL: Record<ReportStatus, string> = {
	[ReportStatus.Pending]: "Pending",
	[ReportStatus.Approved]: "Approved",
	[ReportStatus.Rejected]: "Rejected",
};

function ReportCard({
	report,
	onSetEndDate,
}: {
	report: Report;
	onSetEndDate: () => void;
}) {
	const isOngoing = !report.endedAt;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{report.title}</CardTitle>
				<CardAction>
					<Badge variant={STATUS_BADGE_VARIANT[report.status]}>
						{STATUS_LABEL[report.status]}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<p className="flex items-center gap-2 text-sm text-muted-foreground">
					{report.scholarshipName} &middot; {formatDate(report.startedAt)} -{" "}
					{report.endedAt ? formatDate(report.endedAt) : "Present"}
					{isOngoing && report.status === ReportStatus.Pending && (
						<Button variant="outline" size="sm" onClick={onSetEndDate}>
							Set end date
						</Button>
					)}
				</p>
				<p className="text-sm text-muted-foreground">{report.description}</p>
				{report.remarks && (
					<p className="text-sm text-muted-foreground">
						<span className="font-medium text-foreground">
							Sponsor remarks:{" "}
						</span>
						{report.remarks}
					</p>
				)}
				{report.attachments.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{report.attachments.map((attachment, index) => (
							<a
								key={attachment.id}
								href={attachment.url}
								target="_blank"
								rel="noreferrer"
								className="text-sm text-primary underline underline-offset-4"
							>
								Attachment {index + 1}
							</a>
						))}
					</div>
				)}
			</CardContent>
			<CardFooter>
				<span className="text-xs text-muted-foreground">
					Submitted {formatDate(report.createdAt)}
				</span>
			</CardFooter>
		</Card>
	);
}

function ReportsPage() {
	const [formOpen, setFormOpen] = useState(false);
	const [settingEndDateFor, setSettingEndDateFor] = useState<Report | null>(
		null,
	);

	const grantedQuery = useQuery(
		getMyApplicationsQuery({ status: ScholarshipApplicationStatus.Granted }),
	);
	const reportsQuery = useQuery(getMyReportsQuery());

	const grantedApplications = grantedQuery.data ?? [];
	const reports = reportsQuery.data ?? [];
	const isEligible = grantedApplications.length > 0;

	return (
		<div className="min-h-screen">
			<SEO title="My Reports" noindex={true} />

			<div className="mx-auto max-w-3xl space-y-5">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl text-primary">My Reports</h1>
						<p className="mt-0.5 text-sm text-muted-foreground">
							Keep your sponsor updated on your academic progress.
						</p>
					</div>
					{isEligible && (
						<Button onClick={() => setFormOpen(true)}>Submit Report</Button>
					)}
				</div>

				{grantedQuery.isLoading || reportsQuery.isLoading ? (
					<div className="space-y-3">
						{["skel-1", "skel-2"].map((key) => (
							<Skeleton key={key} className="h-40 w-full rounded-lg" />
						))}
					</div>
				) : !isEligible ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<FileText />
							</EmptyMedia>
							<EmptyTitle>No active scholarships yet</EmptyTitle>
							<EmptyDescription>
								Once one of your scholarship applications is granted,
								you&apos;ll be able to submit progress reports here.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : reports.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<FileText />
							</EmptyMedia>
							<EmptyTitle>No reports yet</EmptyTitle>
							<EmptyDescription>
								Submit a progress report to keep your sponsor updated.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={() => setFormOpen(true)}>Submit Report</Button>
						</EmptyContent>
					</Empty>
				) : (
					<div className="space-y-3">
						{reports.map((report) => (
							<ReportCard
								key={report.id}
								report={report}
								onSetEndDate={() => setSettingEndDateFor(report)}
							/>
						))}
					</div>
				)}
			</div>

			<ReportFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				grantedApplications={grantedApplications}
			/>

			<SetEndDateDialog
				open={!!settingEndDateFor}
				onOpenChange={(next) => !next && setSettingEndDateFor(null)}
				report={settingEndDateFor}
			/>
		</div>
	);
}
