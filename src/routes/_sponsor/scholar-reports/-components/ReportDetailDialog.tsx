import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { markReportReviewed } from "@/lib/report/api";
import type { Report } from "@/lib/report/model";
import { ReportStatus } from "@/lib/report/model";
import { toast } from "@/lib/toast";

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

type ReportDetailDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report: Report | null;
};

export function ReportDetailDialog({
	open,
	onOpenChange,
	report,
}: ReportDetailDialogProps) {
	const queryClient = useQueryClient();

	const reviewMutation = useMutation({
		mutationFn: markReportReviewed,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reports"] });
			toast.success("Success", "Report marked as reviewed.");
			onOpenChange(false);
		},
		onError: (err) => toast.error("Error", err.message),
	});

	if (!report) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{report.title}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-3 text-sm">
					<div className="flex items-center justify-between gap-2">
						<p className="text-muted-foreground">
							{report.student.firstName} {report.student.lastName} &middot;{" "}
							{report.scholarship.name}
						</p>
						<Badge
							variant={
								report.status === ReportStatus.Pending
									? "secondary"
									: report.status === ReportStatus.Rejected
										? "destructive"
										: "default"
							}
						>
							{report.status === ReportStatus.Pending ? "Pending" : "Reviewed"}
						</Badge>
					</div>

					<p className="text-muted-foreground">
						{formatDate(report.startedAt)} -{" "}
						{report.endedAt ? formatDate(report.endedAt) : "Present"}
					</p>

					<p>{report.description}</p>

					{report.attachments.length > 0 && (
						<div className="flex flex-col gap-1.5">
							<span className="font-medium text-foreground">Attachments</span>
							{report.attachments.map((attachment, index) => (
								<a
									key={attachment.id}
									href={attachment.url}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-1.5 text-primary underline underline-offset-4"
								>
									<Paperclip className="size-3.5 shrink-0" />
									Attachment {index + 1}
								</a>
							))}
						</div>
					)}
				</div>

				{report.status === ReportStatus.Pending && (
					<DialogFooter className="mt-4">
						<Button
							disabled={reviewMutation.isPending}
							onClick={() => reviewMutation.mutate(report.id)}
						>
							{reviewMutation.isPending ? "Marking..." : "Mark as Reviewed"}
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
