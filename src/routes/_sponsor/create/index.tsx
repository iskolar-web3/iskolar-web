import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth";
import { SEO } from "@/components/SEO";
import DescriptionModal from "@/components/sponsor/create-scholarship/DescriptionModal";
import Toast from "@/components/Toast";
import { useScholarshipForm } from "@/hooks/useScholarshipForm";
import { useScholarshipPreview } from "@/hooks/useScholarshipPreview";
import { useToast } from "@/hooks/useToast";
import { type ApiResponse, BACKEND_URL } from "@/lib/api";
import { getCookie } from "@/lib/cookie";
import {
	type CreateFormFieldRequest,
	type Scholarship,
	type ScholarshipFormData,
	ScholarshipStatus,
	ScholarshipType,
} from "@/lib/scholarship/model";
import { PRESET_CRITERIA, PRESET_DOCUMENTS } from "@/lib/scholarship/presets";
import type { ScholarshipTemplate } from "@/lib/scholarship/templates";
import type { AnySponsor } from "@/lib/sponsor/model";
import { ACCESS_TOKEN_KEY } from "@/lib/user/auth";
import type { AmountType } from "./-model";
import ConfirmationDialog from "./-components/ConfirmationDialog";
import TemplateSelectionStep from "./-components/TemplateSelectionStep";
import FormFieldsDialog from "./-components/application-form/FormFieldsDialog";
import AmountField from "./-components/fields/AmountField";
import ImageTitleDescriptionSection from "./-components/fields/ImageTitleDescriptionSection";
import ScholarshipTypeSelect from "./-components/fields/ScholarshipTypeSelect";
import DeadlineField from "./-components/fields/DeadlineField";
import SlotsField from "./-components/fields/SlotsField";
import TagsListField from "./-components/fields/TagsListField";
import ScholarshipFullPreviewModal from "./-components/preview/ScholarshipFullPreviewDrawer";
import ScholarshipPreviewCard from "./-components/preview/ScholarshipPreviewCard";

export const Route = createFileRoute("/_sponsor/create/")({
	component: CreateScholarship,
});

async function createScholarship(
	value: ScholarshipFormData,
): Promise<ApiResponse<Scholarship>> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	const response = await fetch(`${BACKEND_URL}/scholarships`, {
		method: "POST",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});
	const result: ApiResponse<Scholarship> = await response.json();
	if (!response.ok) throw new Error(result.message);
	return result;
}

const DEFAULT_SCHOLARSHIP_IMAGE = "/scholarship-banner-placeholder.png";

function CreateScholarship() {
	const auth = useAuth<AnySponsor>();
	const queryClient = useQueryClient();
	const {
		form,
		imagePreview,
		handleImageUpload,
		removeImage,
		removeCriterion,
		removeDocument,
		addCriterionDirect,
		addDocumentDirect,
		resetForm,
	} = useScholarshipForm(auth.profile.id);

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = form;
	const { toast, showSuccess, showError } = useToast();

	const [showDescriptionModal, setShowDescriptionModal] = useState(false);
	const [showFormFieldsDialog, setShowFormFieldsDialog] = useState(false);
	const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
	const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
	const [draftFormFields, setDraftFormFields] = useState<CreateFormFieldRequest[]>([]);
	const [showFullPreview, setShowFullPreview] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showAmount, setShowAmount] = useState(false);
	const [showSlots, setShowSlots] = useState(false);
	const [amountType, setAmountType] = useState<AmountType>("varies");
	const [unlimitedSlots, setUnlimitedSlots] = useState(true);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [pendingFormData, setPendingFormData] = useState<ScholarshipFormData | null>(null);
	const [step, setStep] = useState<"template" | "form">("template");
	const [selectedTemplate, setSelectedTemplate] = useState<ScholarshipTemplate | null>(null);
	const [formResetKey, setFormResetKey] = useState(0);

	const criteria = watch("criterias");
	const requiredDocuments = watch("requirements");
	const customFormFields = watch("formFields") || [];
	const description = watch("description");
	const title = watch("name");
	const totalAmount = watch("totalAmount");
	const totalAmountMin = watch("totalAmountMin");
	const totalAmountMax = watch("totalAmountMax");
	const totalSlot = watch("totalSlots");
	const applicationDeadline = watch("applicationDeadline");
	const scholarshipType = watch("scholarshipType");
	const imageUrl = watch("imageUrl");

	const { previewScholarship } = useScholarshipPreview({
		scholarshipType,
		name: title,
		description,
		imageUrl: imageUrl || DEFAULT_SCHOLARSHIP_IMAGE,
		totalAmount,
		totalAmountMin,
		totalAmountMax,
		totalSlots: totalSlot,
		applicationDeadline,
		criterias: criteria,
		requirements: requiredDocuments,
		formFields: customFormFields,
		sponsorId: auth.profile.id,
		status: ScholarshipStatus.Draft,
	});

	const resetCreateFormState = ({ step: nextStep = "form" }: { step?: "template" | "form" } = {}) => {
		resetForm();
		setFormResetKey((prev) => prev + 1);
		setShowAmount(false);
		setShowSlots(false);
		setAmountType("varies");
		setUnlimitedSlots(true);
		setDraftFormFields([]);
		setPendingFormData(null);
		setSelectedTemplate(null);
		setShowConfirmationModal(false);
		setStep(nextStep);
	}

	useEffect(() => {
		if (!selectedTemplate) return;
		form.reset({
			scholarshipType: selectedTemplate.scholarshipType,
			name: selectedTemplate.suggestedTitle,
			description: selectedTemplate.suggestedDescription,
			totalAmount: undefined,
			totalAmountMin: undefined,
			totalAmountMax: undefined,
			totalSlots: undefined,
			applicationDeadline: undefined,
			criterias: selectedTemplate.criterias,
			requirements: selectedTemplate.requirements,
			formFields: selectedTemplate.formFields,
			imageUrl: undefined,
			sponsorId: auth.profile.id,
			status: ScholarshipStatus.Draft,
		})
		setUnlimitedSlots(false);
		setAmountType(selectedTemplate.amountType);
		setDraftFormFields(selectedTemplate.formFields);
	}, [auth.profile.id, form, selectedTemplate]);

	const openFormFieldsDialog = () => {
		setDraftFormFields(customFormFields);
		setShowFormFieldsDialog(true);
	}

	const handleSaveFormFields = () => {
		setValue("formFields", draftFormFields, { shouldValidate: true });
		setShowFormFieldsDialog(false);
		setEditingFieldIndex(null);
	}

	const mutation = useMutation({
		mutationFn: createScholarship,
		onSuccess: async (res) => {
			console.log(res.data);
			await queryClient.invalidateQueries({ queryKey: ["scholarships"] });
			showSuccess("Success", res.message, 1250);
			resetCreateFormState();
			setLoading(false);
		},
		onError: (err) => {
			showError("Error", err.message);
			console.error(err);
			setLoading(false);
		},
	});

	const onSubmit = async (data: ScholarshipFormData) => {
		if (showAmount) {
			if (amountType === "fixed" && !data.totalAmount) {
				form.setError("totalAmount", { message: "Please enter a valid amount" });
				return
			}
			if (amountType === "range") {
				if (!data.totalAmountMin) {
					form.setError("totalAmountMin", { message: "Please enter a minimum amount" });
					return
				}
				if (!data.totalAmountMax) {
					form.setError("totalAmountMax", { message: "Please enter a maximum amount" });
					return
				}
				if (data.totalAmountMin >= data.totalAmountMax) {
					form.setError("totalAmountMax", { message: "Max must be greater than min" });
					return
				}
			}
		}
		if (showSlots && !unlimitedSlots && !data.totalSlots) {
			form.setError("totalSlots", { message: "Please enter the number of slots" });
			return
		}

		const amountPayload: Partial<ScholarshipFormData> = !showAmount
			? { totalAmount: undefined, totalAmountMin: undefined, totalAmountMax: undefined }
			: amountType === "fixed"
				? { totalAmountMin: undefined, totalAmountMax: undefined }
				: amountType === "range"
					? { totalAmount: undefined }
					: { totalAmount: undefined, totalAmountMin: undefined, totalAmountMax: undefined };

		const slotsPayload = !showSlots || unlimitedSlots ? { totalSlots: undefined } : {};
		const imageUrlValue = data.imageUrl || DEFAULT_SCHOLARSHIP_IMAGE;

		setPendingFormData({ ...data, ...amountPayload, ...slotsPayload, imageUrl: imageUrlValue } as ScholarshipFormData);
		setShowConfirmationModal(true);
	}

	const handleConfirmSubmit = () => {
		if (!pendingFormData) return;
		setLoading(true);
		try {
			mutation.mutate(pendingFormData);
			setShowConfirmationModal(false);
		} catch (err) {
			showError("Error", err instanceof Error ? err.message : "Something went wrong");
			setLoading(false);
		}
	}

	return (
		<div className="max-w-7xl mx-auto">
			<SEO title="Create Scholarship" noindex={true} />
			{toast && <Toast {...toast} />}

			{step === "template" ? (
				<TemplateSelectionStep
					onSelectTemplate={(template: ScholarshipTemplate) => {
						setSelectedTemplate(template);
						setStep("form")
					}}
					onStartFromScratch={() => resetCreateFormState()}
				/>
			) : (
				<>
					<button
						type="button"
						onClick={() => resetCreateFormState({ step: "template" })}
						className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-primary mb-4 cursor-pointer transition-colors"
					>
						<ArrowLeft size={16} />
						Back to templates
					</button>

					<div className="grid grid-cols-1 lg:grid-cols-15">
						{/* Scholarship Details */}
						<div className="space-y-4 lg:col-span-8">
							<div className="bg-[#F8F9FC] rounded-xl p-3 shadow-sm space-y-4">
								<ScholarshipTypeSelect
									value={scholarshipType}
									onValueChange={(v) =>
										setValue("scholarshipType", v as ScholarshipType, { shouldValidate: true })
									}
									disabled={loading}
									error={errors.scholarshipType?.message}
									formResetKey={formResetKey}
								/>

								<ImageTitleDescriptionSection
									imagePreview={imagePreview}
									handleImageUpload={handleImageUpload}
									removeImage={removeImage}
									control={control}
									errors={errors}
									description={description}
									disabled={loading}
									onOpenDescription={() => setShowDescriptionModal(true)}
								/>

								<div className="space-y-4">
									<DeadlineField
										control={control}
										errors={errors}
										disabled={loading}
									/>

									<AmountField
										show={showAmount}
										onShow={() => { setShowAmount(true); setAmountType("varies"); }}
										onHide={() => {
											setShowAmount(false);
											setAmountType("varies");
											setValue("totalAmount", undefined);
											setValue("totalAmountMin", undefined);
											setValue("totalAmountMax", undefined);
											form.clearErrors(["totalAmount", "totalAmountMin", "totalAmountMax"]);
										}}
										amountType={amountType}
										onAmountTypeChange={setAmountType}
										control={control}
										errors={errors}
										setValue={setValue}
										clearErrors={(fields) => form.clearErrors(fields)}
										disabled={loading}
									/>

									<SlotsField
										showSlots={showSlots}
										onShowSlots={() => setShowSlots(true)}
										onHideSlots={() => {
											setShowSlots(false);
											setUnlimitedSlots(true);
											setValue("totalSlots", undefined);
											form.clearErrors("totalSlots");
										}}
										unlimitedSlots={unlimitedSlots}
										onUnlimitedSlotsChange={setUnlimitedSlots}
										control={control}
										errors={errors}
										setValue={setValue}
										clearErrors={(field) => form.clearErrors(field)}
										disabled={loading}
									/>
								</div>
							</div>

							<TagsListField
								label="Eligibility Criteria"
								presets={PRESET_CRITERIA}
								selectedItems={criteria}
								onSelect={addCriterionDirect}
								onRemove={removeCriterion}
								disabled={loading}
								error={errors.criterias?.message}
								placeholder="Select eligibility criteria"
							/>

							<TagsListField
								label="Required Documents"
								presets={PRESET_DOCUMENTS}
								selectedItems={requiredDocuments}
								onSelect={addDocumentDirect}
								onRemove={removeDocument}
								disabled={loading}
								error={errors.requirements?.message}
								placeholder="Select required documents"
							/>

							{/* Custom Form Fields */}
							<div>
								<div className="mb-3">
									<label className="block text-sm text-[#4A5568] mb-1 ml-0.5">
										Application Form <span className="text-[#EF4444]">*</span>
									</label>
									<p className="text-xs text-[#6B7280] ml-0.5">
										Add questionnaires to collect information from applicants.
									</p>
								</div>
								<button
									type="button"
									disabled={loading}
									onClick={openFormFieldsDialog}
									className={`w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed ${
										errors.formFields ? "border-[#EF4444]" : "border-[#3A52A6]"
									} bg-[#E0ECFF] text-secondary text-sm rounded-lg hover:bg-[#D0DCFF] transition-colors`}
								>
									<Plus size={20} />
									{customFormFields.length === 0 ? "Add Form Field" : "Edit Form Field"}
								</button>
								{errors.formFields && (
									<p className="text-xs text-[#EF4444] mt-1">
										{errors.formFields.message}
									</p>
								)}
							</div>

							{/* Submit */}
							<button
								// @ts-expect-error it works but I get type error for some reason
								onClick={handleSubmit(onSubmit)}
								className={`w-full mt-2 mb-6 md:mb-0 py-3 bg-[#EFA508] text-tertiary cursor-pointer rounded-lg hover:bg-[#D89407] transition-colors ${
									loading && "opacity-60 cursor-not-allowed"
								}`}
								disabled={loading}
							>
								{loading ? (
									<span className="flex items-center justify-center">
										<Loader2 className="w-4 h-4 animate-spin" />
									</span>
								) : (
									<span>Create Scholarship</span>
								)}
							</button>
						</div>

						{/* Live Preview */}
						<div className="lg:sticky lg:col-span-7 lg:top-6 h-fit md:ml-24">
							<div className="flex items-center justify-start gap-3 mb-3">
								<h2 className="text-sm text-primary">Live Preview</h2>

								<p className="text-xs text-[#6B7280]">
									This is how students see your scholarship.
								</p>
							</div>
							<ScholarshipPreviewCard
								scholarship={previewScholarship}
								amountType={showAmount ? amountType : "varies"}
								unlimitedSlots={showSlots ? unlimitedSlots : true}
								onClick={() => setShowFullPreview(true)}
							/>
						</div>
					</div>
				</>
			)}

			<DescriptionModal
				isOpen={showDescriptionModal}
				onClose={() => setShowDescriptionModal(false)}
				description={description || ""}
				onSave={(desc) => setValue("description", desc)}
			/>

			<FormFieldsDialog
				open={showFormFieldsDialog}
				onOpenChange={(open) => {
					if (open) {
						openFormFieldsDialog();
					} else {
						setShowFormFieldsDialog(false);
						setShowCustomFieldModal(false);
						setEditingFieldIndex(null);
						setDraftFormFields(customFormFields);
					}
				}}
				draftFormFields={draftFormFields}
				setDraftFormFields={setDraftFormFields}
				onSave={handleSaveFormFields}
				loading={loading}
				hasError={!!errors.formFields}
				editingFieldIndex={editingFieldIndex}
				setEditingFieldIndex={setEditingFieldIndex}
				showCustomFieldModal={showCustomFieldModal}
				setShowCustomFieldModal={setShowCustomFieldModal}
			/>

			{showFullPreview && (
				<ScholarshipFullPreviewModal
					scholarship={previewScholarship}
					onClose={() => setShowFullPreview(false)}
					isPreview={true}
				/>
			)}

			<ConfirmationDialog
				open={showConfirmationModal}
				onOpenChange={setShowConfirmationModal}
				scholarshipTitle={title}
				onConfirm={handleConfirmSubmit}
				loading={loading}
			/>
		</div>
	)
}
