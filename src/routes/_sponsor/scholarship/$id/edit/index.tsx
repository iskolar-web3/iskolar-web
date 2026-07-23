import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Loader2 } from "lucide-react";
import EditScholarshipSkeleton from "./-components/EditScholarshipSkeleton";
import { toast } from "@/lib/toast";
import CustomFormFieldModal from "@/components/sponsor/create-scholarship/application-form/CustomFormFieldModal";
import FormFieldsDialog from "@/routes/_sponsor/create/-components/application-form/FormFieldsDialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { PRESET_CRITERIA, PRESET_DOCUMENTS } from "@/lib/scholarship/presets";
import TagsListField from "@/routes/_sponsor/create/-components/fields/TagsListField";
import ImageTitleDescriptionSection from "@/routes/_sponsor/create/-components/fields/ImageTitleDescriptionSection";
import CardColorPicker from "@/routes/_sponsor/create/-components/fields/CardColorPicker";
import AmountField from "@/routes/_sponsor/create/-components/fields/AmountField";
import SlotsDeadlineFields from "@/routes/_sponsor/create/-components/fields/SlotsDeadlineFields";
import type { AmountType } from "@/routes/_sponsor/create/-model";
import { SEO } from "@/components/SEO";
import { handleError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import {
	FormFieldType,
	ScholarshipStatus,
	updateScholarshipRequestSchema,
	type CreateFormFieldRequest,
	type EditScholarshipFormData,
	type Scholarship,
	type ScholarshipFormData,
} from "@/lib/scholarship/model";
import {
	useMutation,
	useSuspenseQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	endScholarship,
	getScholarshipByIdQuery,
	updateScholarship,
} from "@/lib/scholarship/api";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useScholarshipPreview } from "@/hooks/useScholarshipPreview";
import ScholarshipPreviewCard from "@/routes/_sponsor/create/-components/preview/ScholarshipPreviewCard";
import ScholarshipFullPreviewModal from "@/routes/_sponsor/create/-components/preview/ScholarshipFullPreviewDrawer";

export const Route = createFileRoute("/_sponsor/scholarship/$id/edit/")({
	component: EditScholarshipPage,
	pendingComponent: EditScholarshipSkeleton,
});

function EditScholarshipPage() {
	const params = Route.useParams();
	const router = useRouter();
	const queryClient = useQueryClient();

	const scholarshipQuery = useSuspenseQuery(getScholarshipByIdQuery(params.id));
	const scholarship = scholarshipQuery.data;

	const form = useForm<EditScholarshipFormData>({
		// @ts-expect-error This works fine but it has TS error for some reason
		resolver: zodResolver(updateScholarshipRequestSchema),
		mode: "onBlur",
		defaultValues: {
			id: params.id,
			criterias: scholarship.criterias,
			formFields: scholarship.formFields.map((field) => {
				return {
					fieldType: field.fieldType.code,
					id: field.id,
					isRequired: field.isRequired,
					label: field.label,
					options: field.options.map((opt) => ({
						id: opt.id,
						value: opt.value,
					})),
				};
			}),
			imageUrl: scholarship.imageUrl || "",
			description: scholarship.description || "",
			name: scholarship.name,
			requirements: scholarship.requirements,
			status: scholarship.status.code,
			totalAmount: scholarship.totalAmount ?? undefined,
			totalAmountMin: scholarship.totalAmountMin ?? undefined,
			totalAmountMax: scholarship.totalAmountMax ?? undefined,
			totalSlots: scholarship.totalSlots ?? undefined,
			scholarshipType: scholarship.scholarshipType.code,
			applicationDeadline: scholarship.applicationDeadline,
			cardColor: scholarship.cardColor ?? "#3A52A6",
		},
	});

	const [imagePreview, setImagePreview] = useState<string | null>(
		scholarship.imageUrl,
	);
	const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
	const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [showFormFieldsDialog, setShowFormFieldsDialog] = useState(false);
	const [draftFormFields, setDraftFormFields] = useState<
		CreateFormFieldRequest[]
	>([]);
	const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
	const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
	const [showEndConfirmation, setShowEndConfirmation] = useState(false);
	const [ending, setEnding] = useState(false);
	const [pendingFormData, setPendingFormData] = useState<any>(null);
	const [amountType, setAmountType] = useState<AmountType>(() => {
		if (
			scholarship.totalAmountMin != null ||
			scholarship.totalAmountMax != null
		)
			return "range";
		if (scholarship.totalAmount != null) return "fixed";
		return "varies";
	});
	const [unlimitedSlots, setUnlimitedSlots] = useState(
		scholarship.totalSlots == null,
	);
	const [showPreview, setShowPreview] = useState(false);
	const [showFullPreview, setShowFullPreview] = useState(false);

	const criterias = form.watch("criterias") || [];
	const requiredDocuments = form.watch("requirements") || [];
	const formFields = form.watch("formFields") || [];
	const status = form.watch("status");
	const name = form.watch("name");
	const description = form.watch("description");
	const totalAmount = form.watch("totalAmount");
	const totalAmountMin = form.watch("totalAmountMin");
	const totalAmountMax = form.watch("totalAmountMax");
	const totalSlots = form.watch("totalSlots");
	const applicationDeadline = form.watch("applicationDeadline");
	const scholarshipType = form.watch("scholarshipType");
	const imageUrl = form.watch("imageUrl");
	const cardColor = form.watch("cardColor");

	const { previewScholarship } = useScholarshipPreview({
		scholarshipType,
		name,
		description,
		imageUrl: imageUrl || "/scholarship-banner-placeholder.png",
		totalAmount,
		totalAmountMin,
		totalAmountMax,
		totalSlots,
		applicationDeadline,
		criterias,
		requirements: requiredDocuments,
		formFields,
		sponsorId: scholarship.sponsor.id,
		status,
		cardColor: cardColor ?? "#3A52A6",
	} as unknown as ScholarshipFormData);

	const hydrateForm = useCallback(
		(scholarship: Scholarship) => {
			form.reset();
			setImagePreview(scholarship.imageUrl);
		},
		[form.reset],
	);

	const loadScholarshipDetails = useCallback(async () => {
		try {
			setLoading(true);
		} catch (error) {
			const handled = handleError(error, "Unable to load scholarship details.");
			logger.error("Failed to load scholarship:", handled.raw);
			toast.error(`Error ${handled.code}`, handled.message);
		} finally {
			setLoading(false);
		}
	}, [params.id, hydrateForm]);

	useEffect(() => {
		loadScholarshipDetails();
	}, [loadScholarshipDetails]);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const result = reader.result as string;
				setImagePreview(result);
				form.setValue("imageUrl", result, { shouldValidate: true });
			};
			reader.readAsDataURL(file);
		}
	};

	const removeCriterion = (index: number) => {
		form.setValue(
			"criterias",
			criterias?.filter((_, i) => i !== index),
			{ shouldValidate: true },
		);
	};

	const removeDocument = (index: number) => {
		const removedDoc = requiredDocuments[index];
		form.setValue(
			"requirements",
			requiredDocuments?.filter((_, i) => i !== index),
			{ shouldValidate: true },
		);
		// Remove the auto-generated file-upload field tied to this document.
		if (removedDoc) {
			const currentFields = form.getValues("formFields") || [];
			form.setValue(
				"formFields",
				currentFields.filter(
					(f) =>
						!(f.label === removedDoc && f.fieldType === FormFieldType.File),
				),
				{ shouldValidate: true },
			);
		}
	};

	const addCriterionDirect = (value: string) => {
		const trimmed = value.trim();
		if (trimmed && !criterias?.includes(trimmed)) {
			form.setValue("criterias", [...(criterias || []), trimmed], {
				shouldValidate: true,
			});
		}
	};

	const addDocumentDirect = (value: string) => {
		const trimmed = value.trim();
		if (trimmed && !requiredDocuments?.includes(trimmed)) {
			form.setValue("requirements", [...(requiredDocuments || []), trimmed], {
				shouldValidate: true,
			});
			// Auto-generate a required file-upload field for the new document.
			const currentFields = form.getValues("formFields") || [];
			const alreadyExists = currentFields.some(
				(f) => f.label === trimmed && f.fieldType === FormFieldType.File,
			);
			if (!alreadyExists) {
				form.setValue(
					"formFields",
					[
						...currentFields,
						{
							label: trimmed,
							fieldType: FormFieldType.File,
							isRequired: true,
							options: [],
						},
					],
					{ shouldValidate: true },
				);
			}
		}
	};

	const handleSaveCustomField = (field: CreateFormFieldRequest) => {
		if (editingFieldIndex !== null) {
			const updatedFields = draftFormFields.map((f, i) =>
				i === editingFieldIndex ? field : f,
			);
			setDraftFormFields(updatedFields);
		} else {
			setDraftFormFields([...draftFormFields, field]);
		}
		setEditingFieldIndex(null);
	};

	const handleSaveFormFields = () => {
		// Baseline: the file fields that existed when the dialog was opened.
		const previousFileLabels = new Set(
			(form.getValues("formFields") || [])
				.filter((f) => f.fieldType === FormFieldType.File)
				.map((f) => f.label),
		);
		form.setValue("formFields", draftFormFields as any, {
			shouldValidate: true,
		});
		// Keep "Required Documents" in sync: drop a document only if its backing
		// file field existed before this edit and was removed/renamed in the
		// dialog. Documents that never had a file field are left untouched.
		const newFileLabels = new Set(
			draftFormFields
				.filter((f) => f.fieldType === FormFieldType.File)
				.map((f) => f.label),
		);
		const syncedRequirements = requiredDocuments.filter(
			(doc) => !(previousFileLabels.has(doc) && !newFileLabels.has(doc)),
		);
		if (syncedRequirements.length !== requiredDocuments.length) {
			form.setValue("requirements", syncedRequirements, {
				shouldValidate: true,
			});
		}
		setShowFormFieldsDialog(false);
		setEditingFieldIndex(null);
	};

	const openFormFieldsDialog = () => {
		setDraftFormFields(formFields as any);
		setShowFormFieldsDialog(true);
	};

	const handleCloseScholarship = () => {
		setSaving(true);
		mutation.mutate({
			...form.getValues(),
			status: "closed" as ScholarshipStatus,
		});
	};

	const mutation = useMutation({
		mutationFn: updateScholarship,
		onSuccess: async (res) => {
			console.log(res.data);
			// Invalidate and refetch the scholarship data
			await queryClient.invalidateQueries({
				queryKey: ["scholarship", params.id],
			});
			await queryClient.invalidateQueries({
				queryKey: ["scholarships"],
			});
			toast.success(`Success`, res.message, 1250);
			setLoading(false);
			setSaving(false);
			if (showCloseConfirmation) {
				setShowCloseConfirmation(false);
			}
			// Redirect back to scholarships after a short delay
			setTimeout(() => {
				router.history.back();
			}, 1500);
		},
		onError: (err) => {
			toast.error("Error", err.message);
			console.error(err);
			setSaving(false);
		},
	});

	const endMutation = useMutation({
		mutationFn: () => endScholarship(params.id),
		onSuccess: async (res) => {
			await queryClient.invalidateQueries({
				queryKey: ["scholarship", params.id],
			});
			await queryClient.invalidateQueries({ queryKey: ["scholarships"] });
			toast.success("Scholarship ended", res.message, 1250);
			setEnding(false);
			setShowEndConfirmation(false);
			setTimeout(() => router.history.back(), 1500);
		},
		onError: (err: Error) => {
			toast.error("Error", err.message);
			setEnding(false);
		},
	});

	const handleEndScholarship = () => {
		setEnding(true);
		endMutation.mutate();
	};

	const onSubmit = (data: any) => {
		// Clean up amount fields based on amountType
		const amountPayload: any = {};
		if (amountType === "fixed") {
			amountPayload.totalAmountMin = undefined;
			amountPayload.totalAmountMax = undefined;
		} else if (amountType === "range") {
			amountPayload.totalAmount = undefined;
		} else if (amountType === "varies") {
			amountPayload.totalAmount = undefined;
			amountPayload.totalAmountMin = undefined;
			amountPayload.totalAmountMax = undefined;
		}

		// Clean up slots if unlimited
		const slotsPayload: any = {};
		if (unlimitedSlots) {
			slotsPayload.totalSlots = undefined;
		}

		setPendingFormData({ ...data, ...amountPayload, ...slotsPayload });
		setShowSaveConfirmation(true);
	};

	const handleConfirmSave = () => {
		if (pendingFormData) {
			setSaving(true);
			mutation.mutate(pendingFormData);
			setShowSaveConfirmation(false);
		}
	};

	if (loading) {
		return <EditScholarshipSkeleton />;
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<SEO title="Edit Scholarship" noindex={true} />

			<div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				{/* Go Back Button */}
				<button
					type="button"
					onClick={() => router.history.back()}
					className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-primary cursor-pointer transition-colors w-fit"
				>
					<ArrowLeft size={16} />
					Back to My Scholarships
				</button>

				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="preview-toggle"
						checked={showPreview}
						onChange={(e) => setShowPreview(e.target.checked)}
						className="w-4 h-4 rounded border-[#D1D5DB] cursor-pointer"
					/>
					<label
						htmlFor="preview-toggle"
						className="text-sm text-[#4A5568] cursor-pointer whitespace-nowrap"
					>
						Show Live Preview
					</label>
				</div>
			</div>

			<div
				className={`grid grid-cols-1 gap-6 ${showPreview ? "lg:grid-cols-15" : ""}`}
			>
				<div
					className={`space-y-4 ${showPreview ? "lg:col-span-8" : "w-full lg:max-w-2xl lg:mx-auto"}`}
				>
					{/* Card Color */}
					<div className="bg-[#F8F9FC] rounded-xl p-3 shadow-sm">
						<Controller
							control={form.control as any}
							name="cardColor"
							render={({ field }) => (
								<CardColorPicker
									value={field.value ?? "#3A52A6"}
									onChange={field.onChange}
									disabled={saving}
								/>
							)}
						/>
					</div>

					{/* Close Button */}
					{status === "active" && (
						<button
							type="button"
							disabled={saving || ending}
							onClick={() => setShowCloseConfirmation(true)}
							className="w-full px-4 py-3 bg-white border border-[#EF4444] text-[#EF4444] text-sm rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
						>
							Close Scholarship
						</button>
					)}
					{status === "closed" && (
						<div className="w-full px-4 py-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-sm rounded-lg">
							This scholarship is closed
						</div>
					)}

					{/* End Scholarship Button */}
					{status !== ScholarshipStatus.Archived ? (
						<button
							type="button"
							disabled={saving || ending}
							onClick={() => setShowEndConfirmation(true)}
							className="w-full px-4 py-3 bg-[#7F1D1D] text-white text-sm rounded-lg hover:bg-[#6B1A1A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
						>
							End Scholarship
						</button>
					) : (
						<div className="w-full px-4 py-3 bg-[#F3F4F6] border border-[#D1D5DB] text-[#6B7280] text-sm rounded-lg">
							This scholarship has ended
						</div>
					)}

					{/* Image, Title, Description Section */}
					<div className="bg-[#F8F9FC] rounded-xl p-3 shadow-sm">
						<ImageTitleDescriptionSection
							imagePreview={imagePreview}
							handleImageUpload={handleImageUpload}
							removeImage={() => {
								setImagePreview(null);
								form.setValue("imageUrl", "", { shouldValidate: true });
							}}
							control={form.control as any}
							errors={form.formState.errors as any}
							disabled={saving}
						/>
					</div>

					{/* Amount and Slots/Deadline Section */}
					<div className="bg-[#F8F9FC] rounded-xl p-3 shadow-sm space-y-4">
						<AmountField
							amountType={amountType}
							onAmountTypeChange={(type) => {
								setAmountType(type);
								form.setValue("totalAmount", undefined);
								form.setValue("totalAmountMin", undefined);
								form.setValue("totalAmountMax", undefined);
								form.clearErrors([
									"totalAmount",
									"totalAmountMin",
									"totalAmountMax",
								] as any);
							}}
							control={form.control as any}
							errors={form.formState.errors as any}
							setValue={form.setValue as any}
							clearErrors={(fields) => form.clearErrors(fields as any)}
							disabled={saving}
						/>

						<SlotsDeadlineFields
							showSlots={true}
							onShowSlots={() => {}}
							onHideSlots={() => {}}
							unlimitedSlots={unlimitedSlots}
							onUnlimitedSlotsChange={(unlimited) => {
								setUnlimitedSlots(unlimited);
								if (unlimited) {
									form.setValue("totalSlots", undefined);
									form.clearErrors("totalSlots");
								}
							}}
							control={form.control as any}
							errors={form.formState.errors as any}
							setValue={form.setValue as any}
							clearErrors={(field) => form.clearErrors([field] as any)}
							disabled={saving}
						/>
					</div>

					{/* Eligibility Criteria */}
					<TagsListField
						label="Eligibility Criteria"
						presets={PRESET_CRITERIA}
						selectedItems={criterias || []}
						onSelect={addCriterionDirect}
						onRemove={removeCriterion}
						disabled={saving}
						error={form.formState.errors.criterias?.message}
						placeholder="Select eligibility criteria"
					/>

					{/* Required Documents */}
					<TagsListField
						label="Required Documents"
						presets={PRESET_DOCUMENTS}
						selectedItems={requiredDocuments || []}
						onSelect={addDocumentDirect}
						onRemove={removeDocument}
						disabled={saving}
						error={form.formState.errors.requirements?.message}
						placeholder="Select required documents"
					/>

					{/* Application Form */}
					<div>
						<div className="mb-3">
							<label className="block text-sm text-[#4A5568] mb-1 ml-0.5">
								Application Form <span className="text-[#EF4444]">*</span>
							</label>
							<p className="text-xs text-[#6B7280] ml-0.5">
								Maintain the form fields applicants complete when applying.
							</p>
						</div>

						<button
							type="button"
							disabled={saving}
							onClick={openFormFieldsDialog}
							className={`w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed ${
								form.formState.errors.formFields
									? "border-[#EF4444]"
									: "border-[#3A52A6]"
							} bg-[#E0ECFF] text-secondary text-sm rounded-lg hover:bg-[#D0DCFF] transition-colors`}
						>
							<Edit2 size={20} />
							{formFields.length === 0
								? "Add Form Field"
								: `Edit Form Fields (${formFields.length})`}
						</button>
						{form.formState.errors.formFields && (
							<p className="text-xs text-[#EF4444] mt-1">
								{form.formState.errors.formFields.message}
							</p>
						)}
					</div>

					{/* Save Button */}
					<button
						onClick={form.handleSubmit(onSubmit)}
						className={`w-full py-3 bg-[#EFA508] text-tertiary cursor-pointer rounded-lg hover:bg-[#D89407] transition-colors ${
							saving && "opacity-60 cursor-not-allowed"
						}`}
						disabled={saving}
					>
						{saving ? (
							<span className="flex items-center justify-center">
								<Loader2 className="w-4 h-4 animate-spin" />
							</span>
						) : (
							<span>Save</span>
						)}
					</button>
				</div>

				{showPreview && (
					<>
						{/* Mobile and tablet preview - shown at bottom */}
						<div className="col-span-1 lg:hidden">
							<div className="flex items-center justify-start gap-3 mb-3">
								<h2 className="text-sm text-primary">Live Preview</h2>
								<p className="text-xs text-[#6B7280]">
									This is how students see your scholarship.
								</p>
							</div>
							<ScholarshipPreviewCard
								scholarship={previewScholarship}
								amountType={amountType}
								unlimitedSlots={unlimitedSlots}
								onClick={() => setShowFullPreview(true)}
							/>
						</div>

						{/* Desktop preview - shown on the right side */}
						<div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-6 h-fit">
							<div className="flex items-center justify-start gap-3 mb-3">
								<h2 className="text-sm text-primary">Live Preview</h2>
								<p className="text-xs text-[#6B7280]">
									This is how students see your scholarship.
								</p>
							</div>
							<ScholarshipPreviewCard
								scholarship={previewScholarship}
								amountType={amountType}
								unlimitedSlots={unlimitedSlots}
								onClick={() => setShowFullPreview(true)}
							/>
						</div>
					</>
				)}
			</div>

			{showFullPreview && (
				<ScholarshipFullPreviewModal
					scholarship={previewScholarship}
					onClose={() => setShowFullPreview(false)}
					isPreview={true}
				/>
			)}

			<FormFieldsDialog
				open={showFormFieldsDialog}
				onOpenChange={(open) => {
					if (open) {
						openFormFieldsDialog();
					} else {
						setShowFormFieldsDialog(false);
						setShowCustomFieldModal(false);
						setEditingFieldIndex(null);
						setDraftFormFields(formFields as any);
					}
				}}
				draftFormFields={draftFormFields}
				setDraftFormFields={setDraftFormFields}
				onSave={handleSaveFormFields}
				loading={saving}
				hasError={!!form.formState.errors.formFields}
				editingFieldIndex={editingFieldIndex}
				setEditingFieldIndex={setEditingFieldIndex}
				showCustomFieldModal={showCustomFieldModal}
				setShowCustomFieldModal={setShowCustomFieldModal}
			/>

			<CustomFormFieldModal
				isOpen={showCustomFieldModal}
				onClose={() => {
					setShowCustomFieldModal(false);
					setEditingFieldIndex(null);
				}}
				onSave={handleSaveCustomField}
				editingField={
					editingFieldIndex !== null ? draftFormFields[editingFieldIndex] : null
				}
			/>

			{/* Save Confirmation Dialog */}
			<Dialog
				open={showSaveConfirmation}
				onOpenChange={setShowSaveConfirmation}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="font-normal">Save Changes</DialogTitle>
						<DialogDescription className="text-[#4A5568] text-sm">
							Are you sure you want to save these changes to the scholarship?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<button
							type="button"
							disabled={saving}
							onClick={() => setShowSaveConfirmation(false)}
							className="cursor-pointer px-4 py-2 rounded-md border border-[#C4CBD5] text-primary text-sm hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="button"
							disabled={saving}
							onClick={handleConfirmSave}
							className="cursor-pointer px-4 py-2 rounded-md bg-[#EFA508] text-tertiary text-sm hover:bg-[#D89407] transition-colors disabled:opacity-60"
						>
							{saving ? "Saving..." : "Save Changes"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* End Confirmation Dialog */}
			<Dialog open={showEndConfirmation} onOpenChange={setShowEndConfirmation}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="font-normal">End Scholarship</DialogTitle>
						<DialogDescription>
							This will permanently end the {scholarship.name} scholarship and
							notify all applicants. Selected applicants will receive a
							congratulatory message; others will receive a closing notice. This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<button
							type="button"
							disabled={ending}
							onClick={() => setShowEndConfirmation(false)}
							className="px-4 py-2 rounded-md border border-[#C4CBD5] text-primary text-sm hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="button"
							disabled={ending}
							onClick={handleEndScholarship}
							className="px-4 py-2 rounded-md bg-[#7F1D1D] text-white text-sm hover:bg-[#6B1A1A] transition-colors disabled:opacity-60"
						>
							{ending ? "Ending..." : "End Scholarship"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Close Confirmation Dialog */}
			<Dialog
				open={showCloseConfirmation}
				onOpenChange={setShowCloseConfirmation}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Close Scholarship</DialogTitle>
						<DialogDescription>
							Are you sure you want to close this scholarship immediately? Once
							closed, students will no longer be able to apply.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<button
							type="button"
							disabled={saving}
							onClick={() => setShowCloseConfirmation(false)}
							className="px-4 py-2 rounded-md border border-[#C4CBD5] text-primary text-sm hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="button"
							disabled={saving}
							onClick={handleCloseScholarship}
							className="px-4 py-2 rounded-md bg-[#EF4444] text-white text-sm hover:bg-[#DC2626] transition-colors disabled:opacity-60"
						>
							{saving ? "Closing..." : "Close Scholarship"}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
