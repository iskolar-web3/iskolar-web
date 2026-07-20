import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip, X } from "lucide-react";
import { useId, useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/lib/api";
import { createReport, getMyReportsQuery } from "@/lib/report/api";
import type { Application } from "@/lib/scholarship/model";
import { toast } from "@/lib/toast";
import { formatFileSize, validateFile } from "@/utils/fileHandling.utils";

const formSchema = z
	.object({
		scholarshipId: z.uuidv4({ error: "Please select a scholarship" }),
		title: z
			.string()
			.min(1, "Title is required")
			.max(200, "Title must be 200 characters or less"),
		description: z
			.string()
			.min(1, "Description is required")
			.max(5000, "Description must be 5000 characters or less"),
		reportingPeriodStart: z.string().min(1, "Start date is required"),
		reportingPeriodEnd: z.string(),
	})
	.refine(
		(data) =>
			!data.reportingPeriodEnd ||
			data.reportingPeriodEnd >= data.reportingPeriodStart,
		{
			message: "End date must not be before the start date.",
			path: ["reportingPeriodEnd"],
		},
	);
type FormValues = z.infer<typeof formSchema>;

type ReportFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	grantedApplications: Application[];
};

export function ReportFormDialog({
	open,
	onOpenChange,
	grantedApplications,
}: ReportFormDialogProps) {
	const queryClient = useQueryClient();
	const scholarshipFieldId = useId();
	const titleFieldId = useId();
	const descriptionFieldId = useId();
	const startFieldId = useId();
	const endFieldId = useId();
	const attachmentsFieldId = useId();

	const [attachments, setAttachments] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			scholarshipId: "",
			title: "",
			description: "",
			reportingPeriodStart: "",
			reportingPeriodEnd: "",
		},
	});

	function reset() {
		form.reset({
			scholarshipId: "",
			title: "",
			description: "",
			reportingPeriodStart: "",
			reportingPeriodEnd: "",
		});
		setAttachments([]);
	}

	function handleOpenChange(next: boolean) {
		if (!next) reset();
		onOpenChange(next);
	}

	const createMutation = useMutation({
		mutationFn: createReport,
		onSuccess: () => {
			queryClient.invalidateQueries(getMyReportsQuery());
			toast.success("Success", "Report submitted.");
			handleOpenChange(false);
		},
		onError: (err) => toast.error("Error", err.message),
	});

	function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? []);
		e.target.value = "";

		for (const file of files) {
			const error = validateFile(file);
			if (error) {
				toast.error("Error", error);
				continue;
			}
			setAttachments((prev) => [...prev, file]);
		}
	}

	function removeAttachment(index: number) {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	}

	async function onSubmit(values: FormValues) {
		let attachmentUrls: string[] = [];

		if (attachments.length > 0) {
			setUploading(true);
			try {
				const uploaded = await Promise.all(
					attachments.map((file) => uploadFile(file, "application-files")),
				);
				const failed = uploaded.find((res) => !res.data?.url);
				if (failed) {
					toast.error(
						"Error",
						failed.message || "Failed to upload one of the attachments.",
					);
					return;
				}
				attachmentUrls = uploaded.map((res) => res.data?.url ?? "");
			} catch (err) {
				toast.error(
					"Error",
					err instanceof Error ? err.message : "Failed to upload attachments.",
				);
				return;
			} finally {
				setUploading(false);
			}
		}

		createMutation.mutate({
			scholarshipId: values.scholarshipId,
			title: values.title,
			description: values.description,
			reportingPeriodStart: new Date(values.reportingPeriodStart),
			reportingPeriodEnd: values.reportingPeriodEnd
				? new Date(values.reportingPeriodEnd)
				: undefined,
			attachmentUrls,
		});
	}

	const isPending = createMutation.isPending || uploading;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Submit Progress Report</DialogTitle>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field data-invalid={!!form.formState.errors.scholarshipId}>
							<FieldLabel htmlFor={scholarshipFieldId}>Scholarship</FieldLabel>
							<Controller
								control={form.control}
								name="scholarshipId"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger id={scholarshipFieldId} className="w-full">
											<SelectValue placeholder="Select a scholarship" />
										</SelectTrigger>
										<SelectContent>
											{grantedApplications.map((app) => (
												<SelectItem
													key={app.scholarship.id}
													value={app.scholarship.id}
												>
													{app.scholarship.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							<FieldError errors={[form.formState.errors.scholarshipId]} />
						</Field>

						<Field data-invalid={!!form.formState.errors.title}>
							<FieldLabel htmlFor={titleFieldId}>Report title</FieldLabel>
							<Controller
								control={form.control}
								name="title"
								render={({ field }) => (
									<Input
										{...field}
										id={titleFieldId}
										placeholder="e.g. First Semester Progress Report"
										aria-invalid={!!form.formState.errors.title}
									/>
								)}
							/>
							<FieldError errors={[form.formState.errors.title]} />
						</Field>

						<div className="grid grid-cols-2 gap-4">
							<Field
								data-invalid={!!form.formState.errors.reportingPeriodStart}
							>
								<FieldLabel htmlFor={startFieldId}>Period start</FieldLabel>
								<Controller
									control={form.control}
									name="reportingPeriodStart"
									render={({ field }) => (
										<Input
											{...field}
											id={startFieldId}
											type="date"
											aria-invalid={
												!!form.formState.errors.reportingPeriodStart
											}
										/>
									)}
								/>
								<FieldError
									errors={[form.formState.errors.reportingPeriodStart]}
								/>
							</Field>

							<Field data-invalid={!!form.formState.errors.reportingPeriodEnd}>
								<FieldLabel htmlFor={endFieldId}>
									Period end (optional)
								</FieldLabel>
								<Controller
									control={form.control}
									name="reportingPeriodEnd"
									render={({ field }) => (
										<Input
											{...field}
											id={endFieldId}
											type="date"
											aria-invalid={!!form.formState.errors.reportingPeriodEnd}
										/>
									)}
								/>
								<FieldError
									errors={[form.formState.errors.reportingPeriodEnd]}
								/>
							</Field>
						</div>

						<Field data-invalid={!!form.formState.errors.description}>
							<FieldLabel htmlFor={descriptionFieldId}>
								Progress description
							</FieldLabel>
							<Controller
								control={form.control}
								name="description"
								render={({ field }) => (
									<Textarea
										{...field}
										id={descriptionFieldId}
										rows={5}
										placeholder="Share your academic progress and how the scholarship has been used..."
										aria-invalid={!!form.formState.errors.description}
									/>
								)}
							/>
							<FieldError errors={[form.formState.errors.description]} />
						</Field>

						<Field>
							<FieldLabel htmlFor={attachmentsFieldId}>
								Attachments (optional)
							</FieldLabel>
							<Input
								id={attachmentsFieldId}
								type="file"
								multiple
								accept="image/png,image/jpeg,image/jpg,application/pdf"
								onChange={handleFilesSelected}
							/>
							{attachments.length > 0 && (
								<ul className="flex flex-col gap-1.5">
									{attachments.map((file, index) => (
										<li
											key={`${file.name}-${file.lastModified}`}
											className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm"
										>
											<span className="flex items-center gap-1.5 truncate">
												<Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
												<span className="truncate">{file.name}</span>
												<span className="shrink-0 text-muted-foreground">
													({formatFileSize(file.size)})
												</span>
											</span>
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												onClick={() => removeAttachment(index)}
											>
												<X />
											</Button>
										</li>
									))}
								</ul>
							)}
						</Field>
					</FieldGroup>

					<DialogFooter className="mt-6">
						<Button type="submit" disabled={isPending}>
							{isPending ? "Submitting..." : "Submit Report"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
