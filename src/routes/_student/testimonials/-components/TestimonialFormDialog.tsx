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
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Application } from "@/lib/scholarship/model";
import {
	createTestimonial,
	getMyTestimonialsQuery,
	updateTestimonial,
} from "@/lib/testimonial/api";
import type { Testimonial } from "@/lib/testimonial/model";
import { toast } from "@/lib/toast";

const formSchema = z.object({
	scholarshipId: z.uuidv4({ error: "Please select a scholarship" }),
	content: z
		.string()
		.min(1, "Testimonial is required")
		.max(2000, "Testimonial must be 2000 characters or less"),
	isSharedWithSponsor: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

type TestimonialFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	studentId: string;
	grantedApplications: Application[];
	editingTestimonial: Testimonial | null;
};

export function TestimonialFormDialog({
	open,
	onOpenChange,
	studentId,
	grantedApplications,
	editingTestimonial,
}: TestimonialFormDialogProps) {
	const isEdit = !!editingTestimonial;
	const queryClient = useQueryClient();
	const scholarshipFieldId = useId();
	const contentFieldId = useId();
	const sharedFieldId = useId();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			scholarshipId: "",
			content: "",
			isSharedWithSponsor: true,
		},
	});

	function onSuccess(message: string) {
		queryClient.invalidateQueries(getMyTestimonialsQuery());
		toast.success("Success", message);
		onOpenChange(false);
	}

	const createMutation = useMutation({
		mutationFn: createTestimonial,
		onSuccess: () => onSuccess("Testimonial submitted."),
		onError: (err) => toast.error("Error", err.message),
	});

	const updateMutation = useMutation({
		mutationFn: updateTestimonial,
		onSuccess: () => onSuccess("Testimonial updated."),
		onError: (err) => toast.error("Error", err.message),
	});

	const isPending = createMutation.isPending || updateMutation.isPending;

	function onSubmit(values: FormValues) {
		if (editingTestimonial) {
			updateMutation.mutate({
				id: editingTestimonial.id,
				content: values.content,
				isSharedWithSponsor: values.isSharedWithSponsor,
			});
			return;
		}

		createMutation.mutate({
			studentId,
			scholarshipId: values.scholarshipId,
			content: values.content,
			isSharedWithSponsor: values.isSharedWithSponsor,
		});
	}

	useEffect(() => {
		if (!open) return;

		form.reset({
			scholarshipId: editingTestimonial?.scholarship.id ?? "",
			content: editingTestimonial?.content ?? "",
			isSharedWithSponsor: editingTestimonial?.isSharedWithSponsor ?? true,
		});
	}, [open, editingTestimonial, form.reset]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Testimonial" : "Share Testimonial"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field data-invalid={!!form.formState.errors.scholarshipId}>
							<FieldLabel htmlFor={scholarshipFieldId}>Scholarship</FieldLabel>
							<Controller
								control={form.control}
								name="scholarshipId"
								render={({ field }) => (
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={isEdit}
									>
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

						<Field data-invalid={!!form.formState.errors.content}>
							<FieldLabel htmlFor={contentFieldId}>Your testimonial</FieldLabel>
							<Controller
								control={form.control}
								name="content"
								render={({ field }) => (
									<Textarea
										{...field}
										id={contentFieldId}
										rows={5}
										placeholder="Share how this scholarship impacted you..."
										aria-invalid={!!form.formState.errors.content}
									/>
								)}
							/>
							<FieldError errors={[form.formState.errors.content]} />
						</Field>

						<Field orientation="horizontal">
							<FieldContent>
								<FieldLabel htmlFor={sharedFieldId}>
									Share with sponsor
								</FieldLabel>
								<FieldDescription>
									Let your sponsor see this testimonial on their dashboard.
								</FieldDescription>
							</FieldContent>
							<Controller
								control={form.control}
								name="isSharedWithSponsor"
								render={({ field }) => (
									<Switch
										id={sharedFieldId}
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							/>
						</Field>
					</FieldGroup>

					<DialogFooter className="mt-6">
						<Button type="submit" disabled={isPending}>
							{isPending
								? "Saving..."
								: isEdit
									? "Save Changes"
									: "Submit Testimonial"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
