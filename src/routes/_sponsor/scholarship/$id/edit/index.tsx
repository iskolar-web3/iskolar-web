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
	ScholarshipStatus,
	updateScholarshipRequestSchema,
	type CreateFormFieldRequest,
	type EditScholarshipFormData,
	type Scholarship,
} from "@/lib/scholarship/model";
import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import {
	getScholarshipByIdQuery,
	updateScholarship,
} from "@/lib/scholarship/api";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_sponsor/scholarship/$id/edit/")({
	component: EditScholarshipPage,
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
	const [draftFormFields, setDraftFormFields] = useState<CreateFormFieldRequest[]>([]);
	const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
	const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
	const [pendingFormData, setPendingFormData] = useState<any>(null);
	const [amountType, setAmountType] = useState<AmountType>(() => {
		if (scholarship.totalAmountMin != null || scholarship.totalAmountMax != null) return 'range';
		if (scholarship.totalAmount != null) return 'fixed';
		return 'varies';
	});
	const [unlimitedSlots, setUnlimitedSlots] = useState(scholarship.totalSlots == null);

	const criterias = form.watch("criterias") || [];
	const requiredDocuments = form.watch("requirements") || [];
	const formFields = form.watch("formFields") || [];
	const status = form.watch("status");

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
		form.setValue(
			"requirements",
			requiredDocuments?.filter((_, i) => i !== index),
			{ shouldValidate: true },
		);
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
		form.setValue("formFields", draftFormFields as any, { shouldValidate: true });
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
		<div className="max-w-2xl mx-auto">
			<SEO title="Edit Scholarship" noindex={true} />
			{/* Go Back Button */}
			<button
				type="button"
				onClick={() => router.history.back()}
				className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-primary mb-4 cursor-pointer transition-colors"
			>
				<ArrowLeft size={16} />
				Back to My Scholarships
			</button>

			<div className="space-y-4 lg:col-span-8">
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
						disabled={saving}
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
							form.clearErrors(["totalAmount", "totalAmountMin", "totalAmountMax"] as any);
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
						{formFields.length === 0 ? "Add Form Field" : "Edit Form Fields"}
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
			<Dialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
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

			{/* Close Confirmation Dialog */}
			<Dialog open={showCloseConfirmation} onOpenChange={setShowCloseConfirmation}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Close Scholarship</DialogTitle>
						<DialogDescription>
							Are you sure you want to close this scholarship immediately? Once closed, students will no longer be able to apply.
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
