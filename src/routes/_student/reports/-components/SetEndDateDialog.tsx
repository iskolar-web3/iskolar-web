import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getMyReportsQuery, updateReport } from "@/lib/report/api";
import type { Report } from "@/lib/report/model";
import { toast } from "@/lib/toast";

const formSchema = z.object({
	reportingPeriodEnd: z.string().min(1, "End date is required"),
});
type FormValues = z.infer<typeof formSchema>;

type SetEndDateDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report: Report | null;
};

export function SetEndDateDialog({
	open,
	onOpenChange,
	report,
}: SetEndDateDialogProps) {
	const queryClient = useQueryClient();
	const endFieldId = useId();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { reportingPeriodEnd: "" },
	});

	useEffect(() => {
		if (open) form.reset({ reportingPeriodEnd: "" });
	}, [open, form.reset]);

	const updateMutation = useMutation({
		mutationFn: updateReport,
		onSuccess: () => {
			queryClient.invalidateQueries(getMyReportsQuery());
			toast.success("Success", "Report period end date set.");
			onOpenChange(false);
		},
		onError: (err) => toast.error("Error", err.message),
	});

	function onSubmit(values: FormValues) {
		if (!report) return;
		updateMutation.mutate({
			id: report.id,
			reportingPeriodEnd: new Date(values.reportingPeriodEnd),
		});
	}

	const minDate = report?.startedAt.toISOString().split("T")[0];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Set End Date</DialogTitle>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field data-invalid={!!form.formState.errors.reportingPeriodEnd}>
							<FieldLabel htmlFor={endFieldId}>Period end</FieldLabel>
							<Controller
								control={form.control}
								name="reportingPeriodEnd"
								render={({ field }) => (
									<Input
										{...field}
										id={endFieldId}
										type="date"
										min={minDate}
										aria-invalid={!!form.formState.errors.reportingPeriodEnd}
									/>
								)}
							/>
							<FieldError errors={[form.formState.errors.reportingPeriodEnd]} />
						</Field>
					</FieldGroup>

					<DialogFooter className="mt-6">
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
