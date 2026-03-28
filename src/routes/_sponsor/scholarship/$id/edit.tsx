import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Upload,
	X,
	Plus,
	Edit2,
	Trash2,
	CalendarIcon,
	Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Toast from "@/components/Toast";
import DescriptionModal from "@/components/sponsor/create-scholarship/DescriptionModal";
import CustomFormFieldModal from "@/components/sponsor/create-scholarship/CustomFormFieldModal";
import { useToast } from "@/hooks/useToast";
import { SEO } from "@/components/SEO";
import { handleError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import {
	FormFieldType,
	ScholarshipPurpose,
	ScholarshipStatus,
	ScholarshipType,
	updateScholarshipRequestSchema,
	type CreateFormFieldRequest,
	type EditScholarshipFormData,
	type Scholarship,
} from "@/lib/scholarship/model";
import {
	getFieldTypeLabel,
	renderFieldTypeIcon,
} from "@/utils/formField.utils";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
	getScholarshipByIdQuery,
	updateScholarship,
} from "@/lib/scholarship/api";

export const Route = createFileRoute("/_sponsor/scholarship/$id/edit")({
	// params: {
	//   parse: (params) => {
	//     const schema = z.object({
	//       id: z.string().uuid('Invalid ID format'),
	//     });
	//     return schema.parse(params);
	//   },
	//   stringify: (params) => ({
	//     id: params.id,
	//   }),
	// },
	component: EditScholarshipPage,
});

// const editScholarshipSchema = z.object({
//   type: z.enum(['merit_based', 'skill_based'], { message: 'Please select a scholarship type' }),
//   purpose: z.enum(['allowance', 'tuition'], { message: 'Please select a purpose' }),
//   status: z.enum(['active', 'closed'], { message: 'Please select a status' }),
//   title: z.string().min(1, 'Scholarship title is required').max(150, 'Title must be less than 150 characters'),
//   description: z.string().optional(),
//   imageUrl: z.string().min(1, 'Please upload a scholarship image'),
//   totalAmount: z.string()
//     .min(1, 'Total amount is required')
//     .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
//       message: 'Please enter a valid amount greater than 0',
//     }),
//   totalSlot: z.string()
//     .min(1, 'Total slot is required')
//     .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
//       message: 'Please enter a valid slot number greater than 0',
//     }),
//   applicationDeadline: z.date('Please select an application deadline'),
//   criteria: z.array(z.string()).min(1, 'At least one eligibility criterion is required'),
//   requiredDocuments: z.array(z.string()).min(1, 'At least one required document is required'),
//   formFields: z.array(z.object({
//     type: z.enum(customFieldTypes),
//     label: z.string().min(1, 'Field label is required'),
//     required: z.boolean(),
//     options: z.array(z.string()).optional(),
//   })).min(1, 'At least one form field is required'),
// });
//

function EditScholarshipPage() {

	const params = Route.useParams();

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
			totalAmount: scholarship.totalAmount,
			totalSlots: scholarship.totalSlots,
			scholarshipType: scholarship.scholarshipType.code,
			applicationDeadline: scholarship.applicationDeadline,
			purpose: scholarship.purpose.code,
		},
	});

	const [imagePreview, setImagePreview] = useState<string | null>(
		scholarship.imageUrl,
	);
	const [criteriaInput, setCriteriaInput] = useState("");
	const [documentsInput, setDocumentsInput] = useState("");
	const [showDescriptionModal, setShowDescriptionModal] = useState(false);
	const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
	const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const { toast, showSuccess, showError } = useToast();

	const criterias = form.watch("criterias") || [];
	const requiredDocuments = form.watch("requirements") || [];
	const formFields = form.watch("formFields") || [];
	const description = form.watch("description");
	const type = form.watch("scholarshipType");
	const purpose = form.watch("purpose");
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

			// if (USE_MOCK_DATA) {
			//   // Mock data path
			//   await mockApiDelay(2000);
			//   hydrateForm(mockScholarshipEdit);
			// } else {
			//   const response = await scholarshipManagementService.getScholarshipById(id);
			//   if (response.success && response.scholarship) {
			//     hydrateForm(response.scholarship);
			//   }
			// }
		} catch (error) {
			const handled = handleError(error, "Unable to load scholarship details.");
			logger.error("Failed to load scholarship:", handled.raw);
			showError(`Error ${handled.code}`, handled.message);
		} finally {
			setLoading(false);
		}
	}, [params.id, hydrateForm, showSuccess, showError]);

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

	const addCriterion = () => {
		const trimmed = criteriaInput.trim();
		if (trimmed) {
			form.setValue("criterias", [...(criterias || []), trimmed], {
				shouldValidate: true,
			});
			setCriteriaInput("");
		}
	};

	const removeCriterion = (index: number) => {
		form.setValue(
			"criterias",
			criterias?.filter((_, i) => i !== index),
			{ shouldValidate: true },
		);
	};

	const addDocument = () => {
		const trimmed = documentsInput.trim();
		if (trimmed) {
			form.setValue("requirements", [...(requiredDocuments || []), trimmed], {
				shouldValidate: true,
			});
			setDocumentsInput("");
		}
	};

	const removeDocument = (index: number) => {
		form.setValue(
			"requirements",
			requiredDocuments?.filter((_, i) => i !== index),
			{ shouldValidate: true },
		);
	};

	const openCustomFormModal = (index?: number) => {
		setEditingFieldIndex(typeof index === "number" ? index : null);
		setShowCustomFieldModal(true);
	};

	const handleSaveCustomField = (field: CreateFormFieldRequest) => {
		console.log(form.formState.errors);
		if (editingFieldIndex !== null) {
			const updatedFields = formFields.map((f, i) =>
				i === editingFieldIndex ? field : f,
			);
			form.setValue("formFields", updatedFields);
		} else {
			form.setValue("formFields", [...formFields, field]);
		}
		setEditingFieldIndex(null);
	};

	const removeCustomFormField = (index: number) => {
		form.setValue(
			"formFields",
			formFields.filter((_, i) => i !== index),
			{ shouldValidate: true },
		);
	};

	const mutation = useMutation({
		mutationFn: updateScholarship,
		onSuccess: async (res) => {
			console.log(res.data);
			showSuccess(`Success`, res.message, 1250);
			setLoading(false);
			setSaving(false);
		},
		onError: (err) => {
			showError("Error", err.message);
			console.error(err);
		},
	});

	const onSubmit = async (data: EditScholarshipFormData) => {
		setSaving(true);
		mutation.mutate(data);
	};

	if (loading) {
		return (
			<div className="min-h-screen">
				<div className="max-w-[40rem] mx-auto">
					<div className="space-y-4">
						{/* Status Skeleton */}
						<Skeleton className="w-full h-12 rounded-lg bg-muted" />

						{/* Type and Purpose Skeleton */}
						<div className="grid grid-cols-2 gap-4">
							<Skeleton className="w-full h-12 rounded-lg bg-muted" />
							<Skeleton className="w-full h-12 rounded-lg bg-muted" />
						</div>

						{/* Image and Form Skeleton */}
						<div className="bg-[#F8F9FC] rounded-xl p-4 shadow-sm">
							<div className="flex flex-col md:flex-row gap-4">
								{/* Image Skeleton */}
								<div className="md:w-[218px]">
									<Skeleton className="w-full aspect-square rounded-lg bg-muted-foreground" />
								</div>

								{/* Form Fields Skeleton */}
								<div className="md:flex-1 space-y-4">
									{/* Title Skeleton */}
									<Skeleton className="h-8 w-full bg-muted-foreground" />

									{/* Description Button Skeleton */}
									<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />

									{/* Amount and Slot Skeleton */}
									<div className="grid grid-cols-2 gap-4">
										<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />
										<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />
									</div>

									{/* Deadline Skeleton */}
									<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />
								</div>
							</div>
						</div>

						{/* Criteria Input Skeleton */}
						<div className="flex gap-2">
							<Skeleton className="flex-1 h-12 rounded-lg bg-muted-foreground" />
							<Skeleton className="w-11 h-11 rounded-lg bg-muted-foreground" />
						</div>
						<div className="flex flex-wrap gap-2">
							<Skeleton className="h-8 w-24 rounded-md bg-muted-foreground" />
							<Skeleton className="h-8 w-32 rounded-md bg-muted-foreground" />
							<Skeleton className="h-8 w-28 rounded-md bg-muted-foreground" />
						</div>

						{/* Documents Input Skeleton */}
						<div className="flex gap-2">
							<Skeleton className="flex-1 h-12 rounded-lg bg-muted-foreground" />
							<Skeleton className="w-11 h-11 rounded-lg bg-muted-foreground" />
						</div>
						<div className="flex flex-wrap gap-2">
							<Skeleton className="h-8 w-28 rounded-md bg-muted-foreground" />
							<Skeleton className="h-8 w-32 rounded-md bg-muted-foreground" />
						</div>

						{/* Form Fields Skeleton */}
						<div>
							<Skeleton className="h-4 w-32 mb-2 bg-muted-foreground" />
							<Skeleton className="h-3 w-64 mb-3 bg-muted-foreground" />
							<div className="space-y-2">
								<Skeleton className="w-full h-16 rounded-lg bg-muted-foreground" />
								<Skeleton className="w-full h-16 rounded-lg bg-muted-foreground" />
							</div>
							<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground mt-3" />
						</div>

						{/* Save Button Skeleton */}
						<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<SEO title="Edit Scholarship" noindex={true} />
			{toast && <Toast {...toast} />}

			<div className="max-w-[40rem] mx-auto">
				<div className="space-y-4">
					{/* Status */}
					<div>
						<Select
							value={status}
							onValueChange={(value) =>
								form.setValue("status", value as ScholarshipStatus, {
									shouldValidate: true,
								})
							}
						>
							<SelectTrigger
								disabled={saving}
								className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
									form.formState.errors.status
										? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
										: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
								}`}
							>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="closed">Closed</SelectItem>
							</SelectContent>
						</Select>
						{form.formState.errors.status && (
							<p className="text-xs text-[#EF4444] mt-1">
								{form.formState.errors.status.message}
							</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Select
								value={type}
								onValueChange={(value) =>
									form.setValue("scholarshipType", value as ScholarshipType, {
										shouldValidate: true,
									})
								}
							>
								<SelectTrigger
									disabled={saving}
									className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all data-[placeholder]:text-gray-400 ${
										form.formState.errors.scholarshipType
											? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
											: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
									}`}
								>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={ScholarshipType.MeritBased}>
										Merit-Based
									</SelectItem>
									<SelectItem value={ScholarshipType.SkillBased}>
										Skill-Based
									</SelectItem>
								</SelectContent>
							</Select>
							{form.formState.errors.scholarshipType && (
								<p className="text-xs text-[#EF4444] mt-1">
									{form.formState.errors.scholarshipType.message}
								</p>
							)}
						</div>

						<div>
							<Select
								value={purpose}
								onValueChange={(value) =>
									form.setValue("purpose", value as ScholarshipPurpose, {
										shouldValidate: true,
									})
								}
							>
								<SelectTrigger
									disabled={saving}
									className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all data-[placeholder]:text-gray-400 ${
										form.formState.errors.purpose
											? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
											: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
									}`}
								>
									<SelectValue placeholder="Select purpose" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="allowance">Allowance</SelectItem>
									<SelectItem value="tuition">Tuition</SelectItem>
								</SelectContent>
							</Select>
							{form.formState.errors.purpose && (
								<p className="text-xs text-[#EF4444] mt-1">
									{form.formState.errors.purpose.message}
								</p>
							)}
						</div>
					</div>

					<div className="bg-[#F8F9FC] rounded-xl p-4 shadow-sm">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="md:w-[218px]">
								<label className="block">
									{imagePreview ? (
										<div className="relative w-full aspect-square rounded-lg overflow-hidden">
											<img
												src={imagePreview}
												alt="Scholarship banner"
												className="w-full h-full object-cover"
											/>
											<button
												type="button"
												disabled={saving}
												onClick={() => {
													setImagePreview(null);
													form.setValue("imageUrl", "", {
														shouldValidate: true,
													});
												}}
												className="absolute top-2 right-2 bg-black/50 text-tertiary rounded-full p-1.5 hover:bg-black/70"
											>
												<X size={14} />
											</button>
										</div>
									) : (
										<div
											className={`border-2 border-dashed ${
												form.formState.errors.imageUrl
													? "border-[#EF4444]"
													: "border-[#3A52A6]"
											} rounded-lg text-center cursor-pointer hover:bg-[#F0F7FF] transition-colors flex flex-col items-center justify-center w-full aspect-square px-4`}
										>
											<Upload className="mb-3 text-[#5B7BA6]" size={40} />
											<p className="text-secondary text-sm opacity-70">
												Click to select an image
											</p>
											<input
												type="file"
												accept="image/*"
												onChange={handleImageUpload}
												className="hidden"
											/>
										</div>
									)}
								</label>
								{form.formState.errors.imageUrl && (
									<p className="text-xs text-[#EF4444] mt-1">
										{form.formState.errors.imageUrl.message}
									</p>
								)}
							</div>

							<div className="md:flex-1 space-y-4">
								<div>
									<Controller
										control={form.control}
										name="name"
										render={({ field }) => (
											<input
												{...field}
												placeholder="Scholarship Title"
												disabled={saving}
												className={`w-full text-2xl border-b-2 ${
													form.formState.errors.name
														? "border-[#EF4444]"
														: "border-transparent"
												} bg-transparent pb-2 focus:outline-none focus:border-[#3A52A6] text-primary`}
											/>
										)}
									/>
									{form.formState.errors.name && (
										<p className="text-xs text-[#EF4444] mt-1">
											{form.formState.errors.name.message}
										</p>
									)}
								</div>

								<button
									type="button"
									disabled={saving}
									onClick={() => setShowDescriptionModal(true)}
									className="w-full cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg border bg-[#F3F4F6] text-[#6B7280] text-sm hover:bg-muted transition-colors"
								>
									<span className="text-[#8B9CB5]">☰</span>
									{description ? "Edit Description" : "Add Description"}
								</button>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Controller
											control={form.control}
											name="totalAmount"
											render={({ field }) => (
												<input
													{...field}
													type="number"
													disabled={saving}
													placeholder="Total amount"
													className={`w-full px-4 py-3 rounded-lg border ${
														form.formState.errors.totalAmount
															? "border-[#EF4444]"
															: "border-[#C4CBD5]"
													} bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
												/>
											)}
										/>
										{form.formState.errors.totalAmount && (
											<p className="text-xs text-[#EF4444] mt-1">
												{form.formState.errors.totalAmount.message}
											</p>
										)}
									</div>

									<div>
										<Controller
											control={form.control}
											name="totalSlots"
											render={({ field }) => (
												<input
													{...field}
													type="number"
													disabled={saving}
													placeholder="Total slots"
													className={`w-full px-4 py-3 rounded-lg border ${
														form.formState.errors.totalSlots
															? "border-[#EF4444]"
															: "border-[#C4CBD5]"
													} bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
												/>
											)}
										/>
										{form.formState.errors.totalSlots && (
											<p className="text-xs text-[#EF4444] mt-1">
												{form.formState.errors.totalSlots.message}
											</p>
										)}
									</div>
								</div>

								<div>
									<Controller
										control={form.control}
										name="applicationDeadline"
										render={({ field }) => (
											<Popover>
												<PopoverTrigger asChild>
													<button
														type="button"
														disabled={saving}
														className={`w-full px-4 py-3 text-sm border rounded-lg bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] flex items-center justify-between ${
															field.value ? "text-primary" : "text-gray-400"
														} ${form.formState.errors.applicationDeadline ? "border-[#EF4444]" : "border-[#C4CBD5]"}`}
													>
														<span>
															{field.value
																? field.value.toLocaleDateString("en-US", {
																		month: "long",
																		day: "numeric",
																		year: "numeric",
																	})
																: "Application deadline"}
														</span>
														<CalendarIcon className="h-4 w-4 opacity-60" />
													</button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value ?? undefined}
														onSelect={(date) => {
															if (date) {
																field.onChange(date);
															}
														}}
														disabled={(date) => date < new Date()}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										)}
									/>
									{form.formState.errors.applicationDeadline && (
										<p className="text-xs text-[#EF4444] mt-1">
											{form.formState.errors.applicationDeadline.message}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>

					<div>
						<div className="flex gap-2">
							<input
								value={criteriaInput}
								disabled={saving}
								onChange={(event) => setCriteriaInput(event.target.value)}
								onKeyDown={(event) =>
									event.key === "Enter" &&
									(event.preventDefault(), addCriterion())
								}
								placeholder="Enter eligibility criterion"
								className={`flex-1 px-4 py-3 rounded-lg border ${
									form.formState.errors.criterias
										? "border-[#EF4444]"
										: "border-[#C4CBD5]"
								} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
							/>
							<button
								type="button"
								disabled={saving}
								onClick={addCriterion}
								className="w-11 h-11 bg-[#3A52A6] text-tertiary rounded-lg flex items-center justify-center hover:bg-[#2A4296] transition-colors"
							>
								<Plus size={20} />
							</button>
						</div>
						{form.formState.errors.criterias && (
							<p className="text-xs text-[#EF4444] mt-1">
								{form.formState.errors.criterias.message}
							</p>
						)}
						{criterias.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-3">
								{criterias.map((criterion, index) => (
									<span
										key={index}
										className="inline-flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] text-[#374151] text-xs rounded-md border border-[#E5E7EB]"
									>
										{criterion}
										<button
											disabled={saving}
											onClick={() => removeCriterion(index)}
											className="hover:text-[#2A4296]"
										>
											<X size={14} />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					<div>
						<div className="flex gap-2">
							<input
								value={documentsInput}
								disabled={saving}
								onChange={(event) => setDocumentsInput(event.target.value)}
								onKeyDown={(event) =>
									event.key === "Enter" &&
									(event.preventDefault(), addDocument())
								}
								placeholder="Enter required document"
								className={`flex-1 px-4 py-3 rounded-lg border ${
									form.formState.errors.requirements
										? "border-[#EF4444]"
										: "border-[#C4CBD5]"
								} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
							/>
							<button
								type="button"
								disabled={saving}
								onClick={addDocument}
								className="w-11 h-11 bg-[#3A52A6] text-tertiary rounded-lg flex items-center justify-center hover:bg-[#2A4296] transition-colors"
							>
								<Plus size={20} />
							</button>
						</div>
						{form.formState.errors.requirements && (
							<p className="text-xs text-[#EF4444] mt-1">
								{form.formState.errors.requirements.message}
							</p>
						)}
						{requiredDocuments.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-3">
								{requiredDocuments.map((doc, index) => (
									<span
										key={index}
										className="inline-flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] text-[#374151] text-xs rounded-md border border-[#E5E7EB]"
									>
										{doc}
										<button
											disabled={saving}
											onClick={() => removeDocument(index)}
											className="hover:text-[#2A4296]"
										>
											<X size={14} />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					<div>
						<div className="mb-3">
							<label className="block text-sm text-[#4A5568] mb-1 ml-0.5">
								Application Form
							</label>
							<p className="text-xs text-[#6B7280] ml-0.5">
								Maintain the form fields applicants complete when applying.
							</p>
						</div>

						{formFields.length > 0 && (
							<div className="space-y-2 mb-3">
								{formFields.map((field, index) => (
									<div
										key={index}
										className="flex items-center gap-3 p-3 bg-white border border-[#E0ECFF] rounded-lg"
									>
										<div className="w-9 h-9 bg-[#E0ECFF] rounded-lg flex items-center justify-center">
											{renderFieldTypeIcon(
												field.fieldType || FormFieldType.ShortAnswer,
											)}
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="text-sm text-primary">
													{field.label}
												</span>
												{field.isRequired && (
													<span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
														Required
													</span>
												)}
											</div>
											<p className="text-xs text-[#6B7280]">
												{getFieldTypeLabel(
													field.fieldType || FormFieldType.ShortAnswer,
												)}
											</p>
										</div>
										<button
											disabled={saving}
											onClick={() => openCustomFormModal(index)}
											className="p-1.5 hover:bg-gray-100 rounded"
										>
											<Edit2 size={16} className="text-secondary" />
										</button>
										<button
											disabled={saving}
											onClick={() => removeCustomFormField(index)}
											className="p-1.5 hover:bg-gray-100 rounded"
										>
											<Trash2 size={16} className="text-[#EF4444]" />
										</button>
									</div>
								))}
							</div>
						)}

						<button
							type="button"
							disabled={saving}
							onClick={() => openCustomFormModal()}
							className={`w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed ${
								form.formState.errors.formFields
									? "border-[#EF4444]"
									: "border-[#3A52A6]"
							} bg-[#E0ECFF] text-secondary text-sm rounded-lg hover:bg-[#D0DCFF] transition-colors`}
						>
							<Plus size={20} />
							{formFields.length === 0 ? "Add Form Field" : "Add Another Field"}
						</button>
						{form.formState.errors.formFields && (
							<p className="text-xs text-[#EF4444] mt-1">
								{form.formState.errors.formFields.message}
							</p>
						)}
					</div>

					<button
						// @ts-expect-error This works fine but it has TS error for some reason
						onClick={form.handleSubmit(onSubmit)}
						className={`w-full py-3 cursor-pointer bg-[#EFA508] my-2 text-tertiary rounded-lg hover:bg-[#D89407] transition-colors ${
							saving && "opacity-60 cursor-not-allowed"
						}`}
						disabled={saving}
					>
						{saving ? (
							<span className="flex items-center justify-center gap-2">
								<Loader2 className="w-4 h-4 animate-spin" />
							</span>
						) : (
							"Save"
						)}
					</button>
				</div>
			</div>

			<DescriptionModal
				isOpen={showDescriptionModal}
				onClose={() => setShowDescriptionModal(false)}
				description={description || ""}
				onSave={(desc) => form.setValue("description", desc)}
			/>

			<CustomFormFieldModal
				isOpen={showCustomFieldModal}
				onClose={() => {
					setShowCustomFieldModal(false);
					setEditingFieldIndex(null);
				}}
				onSave={handleSaveCustomField}
				// @ts-expect-error This works fine but it has TS error for some reason
				editingField={
					editingFieldIndex !== null ? formFields[editingFieldIndex] : null
				}
			/>
		</div>
	);
}
