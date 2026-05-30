import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LockKeyhole, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useAuth } from "@/auth";
import { SEO } from "@/components/SEO";
import { toast } from "@/lib/toast";
import {
	DEFAULT_APPLICATION_QUESTION,
	generateDocumentFileFields,
	useScholarshipForm,
} from "@/hooks/useScholarshipForm";
import { useScholarshipPreview } from "@/hooks/useScholarshipPreview";
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
import { SponsorType, type AnySponsor } from "@/lib/sponsor/model";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { VerificationStatus } from "@/lib/verification/model";
import { ACCESS_TOKEN_KEY } from "@/lib/user/auth";
import type { AmountType } from "./-model";
import ConfirmationDialog from "./-components/ConfirmationDialog";
import TemplateSelectionStep from "./-components/TemplateSelectionStep";
import FormFieldsDialog from "./-components/application-form/FormFieldsDialog";
import AmountField from "./-components/fields/AmountField";
import CardColorPicker from "./-components/fields/CardColorPicker";
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

	const verificationEnabled = import.meta.env.VITE_ENABLE_IDENTITY_VERIFICATION === "true";
	const isIndividualSponsor = auth.profile?.sponsorType?.code === SponsorType.Individual;
	const verificationQuery = useVerificationStatus("sponsors", verificationEnabled && isIndividualSponsor);
	const isVerified =
		!verificationEnabled ||
		!isIndividualSponsor ||
		verificationQuery.isLoading ||
		verificationQuery.data?.status === VerificationStatus.Verified;
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

	const [showFormFieldsDialog, setShowFormFieldsDialog] = useState(false);
	const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
	const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
	const [draftFormFields, setDraftFormFields] = useState<CreateFormFieldRequest[]>([]);
	const [showFullPreview, setShowFullPreview] = useState(false);
	const [loading, setLoading] = useState(false);
	const [amountType, setAmountType] = useState<AmountType>("varies");
	const [unlimitedSlots, setUnlimitedSlots] = useState(true);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [pendingFormData, setPendingFormData] = useState<ScholarshipFormData | null>(null);
	const [step, setStep] = useState<"template" | "form">("template");
	const [selectedTemplate, setSelectedTemplate] = useState<ScholarshipTemplate | null>(null);
	const [formResetKey, setFormResetKey] = useState(0);
	const [showPreview, setShowPreview] = useState(false);

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
	const cardColor = watch("cardColor");

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
		status: ScholarshipStatus.Active,
		cardColor: cardColor ?? "#3A52A6",
	});

	const resetCreateFormState = ({ step: nextStep = "form" }: { step?: "template" | "form" } = {}) => {
		resetForm();
		setFormResetKey((prev) => prev + 1);
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
		const mergedFormFields = generateDocumentFileFields(
			selectedTemplate.requirements as string[],
			selectedTemplate.formFields as CreateFormFieldRequest[],
		);
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
			formFields: mergedFormFields,
			imageUrl: undefined,
			sponsorId: auth.profile.id,
			status: ScholarshipStatus.Active,
		})
		setUnlimitedSlots(false);
		setAmountType(selectedTemplate.amountType);
		setDraftFormFields(mergedFormFields);
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
			toast.success("Success", res.message, 1250);
			resetCreateFormState();
			setLoading(false);
		},
		onError: (err) => {
			toast.error("Error", err.message);
			console.error(err);
			setLoading(false);
		},
	});

	const onSubmit = async (data: ScholarshipFormData) => {
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
		if (!unlimitedSlots && !data.totalSlots) {
			form.setError("totalSlots", { message: "Please enter the number of slots" });
			return
		}

		const amountPayload: Partial<ScholarshipFormData> =
			amountType === "fixed"
				? { totalAmountMin: undefined, totalAmountMax: undefined }
				: amountType === "range"
					? { totalAmount: undefined }
					: { totalAmount: undefined, totalAmountMin: undefined, totalAmountMax: undefined };

		const slotsPayload = unlimitedSlots ? { totalSlots: undefined } : {};
		const imageUrlValue = data.imageUrl || DEFAULT_SCHOLARSHIP_IMAGE;

		const formFieldsPayload: CreateFormFieldRequest[] =
			data.formFields.length > 0
				? data.formFields
				: [DEFAULT_APPLICATION_QUESTION];

		setPendingFormData({
			...data,
			...amountPayload,
			...slotsPayload,
			imageUrl: imageUrlValue,
			formFields: formFieldsPayload,
		} as ScholarshipFormData);
		setShowConfirmationModal(true);
	}

	const handleConfirmSubmit = () => {
		if (!pendingFormData) return;
		setLoading(true);
		try {
			mutation.mutate(pendingFormData);
			setShowConfirmationModal(false);
		} catch (err) {
			toast.error("Error", err instanceof Error ? err.message : "Something went wrong");
			setLoading(false);
		}
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<SEO title="Create Scholarship" noindex={true} />


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
					<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<button
							type="button"
							onClick={() => resetCreateFormState({ step: "template" })}
							className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-primary cursor-pointer transition-colors w-fit"
						>
							<ArrowLeft size={16} />
							Back to templates
						</button>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="preview-toggle"
								checked={showPreview}
								onChange={(e) => setShowPreview(e.target.checked)}
								className="w-4 h-4 rounded border-[#D1D5DB] cursor-pointer"
							/>
							<label htmlFor="preview-toggle" className="text-sm text-[#4A5568] cursor-pointer whitespace-nowrap">
								Show Live Preview
							</label>
						</div>
					</div>

					{!isVerified && (
						<div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
							<LockKeyhole size={16} className="text-amber-600 shrink-0" />
							<p className="text-xs text-amber-700 leading-relaxed flex-1">
								Verify your identity on your profile to create a scholarship.
							</p>
						</div>
					)}

					<div className={`grid grid-cols-1 gap-6 ${showPreview ? "lg:grid-cols-15" : ""}`}>
						{/* Scholarship Details */}
						<div className={`space-y-4 ${showPreview ? "lg:col-span-8" : "w-full lg:max-w-2xl lg:mx-auto"}`}>
							<div className="bg-[#F8F9FC] rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
								<Controller
									control={control}
									name="cardColor"
									render={({ field }) => (
										<CardColorPicker
											value={field.value ?? "#3A52A6"}
											onChange={field.onChange}
											disabled={loading}
										/>
									)}
								/>

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
									disabled={loading}
								/>

								<div className="space-y-4">
									<DeadlineField
										control={control}
										errors={errors}
										disabled={loading}
									/>

									<AmountField
										amountType={amountType}
										onAmountTypeChange={setAmountType}
										control={control}
										errors={errors}
										setValue={setValue}
										clearErrors={(fields) => form.clearErrors(fields)}
										disabled={loading}
									/>

									<SlotsField
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
								placeholder="Select eligibility criteria"
							/>

							<TagsListField
								label="Required Documents"
								presets={PRESET_DOCUMENTS}
								selectedItems={requiredDocuments}
								onSelect={addDocumentDirect}
								onRemove={removeDocument}
								disabled={loading}
								placeholder="Select required documents"
							/>

							{/* Custom Form Fields */}
							<div>
								<div className="mb-3">
									<label className="block text-sm text-[#4A5568] mb-1 ml-0.5">
										Application Form
									</label>
									<p className="text-xs text-[#6B7280] ml-0.5">
										Optional. Add questionnaires to collect information from applicants. If left blank, applicants will be asked why they're applying.
									</p>
								</div>
								<button
									type="button"
									disabled={loading}
									onClick={openFormFieldsDialog}
									className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-[#3A52A6] bg-[#E0ECFF] text-secondary text-sm rounded-lg hover:bg-[#D0DCFF] transition-colors"
								>
									<Plus size={20} />
									{customFormFields.length === 0 ? "Add Form Field" : "Edit Form Field"}
								</button>
							</div>

							{/* Submit */}
							<button
								type="button"
								onClick={handleSubmit(
									// @ts-expect-error it works but I get type error for some reason
									onSubmit,
									(validationErrors) => {
										const firstMessage = Object.values(validationErrors)
											.map((e) => e?.message)
											.find((m): m is string => typeof m === "string" && m.length > 0);
										toast.error(
											"Please complete the required fields",
											firstMessage ?? "Some fields need attention before you can publish.",
										);
									},
								)}
								className={`w-full mt-4 py-3 font-medium bg-[#EFA508] text-tertiary cursor-pointer rounded-lg hover:bg-[#D89407] transition-colors ${
									(loading || !isVerified) && "opacity-60 cursor-not-allowed"
								}`}
								disabled={loading || !isVerified}
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

						{/* Live Preview - Bottom on mobile/tablet, right side on desktop */}
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
				</>
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
