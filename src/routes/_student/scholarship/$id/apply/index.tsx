import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Calendar,
	Upload,
	X,
	Loader2,
	AlertCircle,
	CalendarDays,
	UserIcon,
	ArrowLeft,
	CheckCircle,
} from "lucide-react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
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
import { toast } from "@/lib/toast";
import { SEO } from "@/components/SEO";
import SubmitConfirmationModal from "./-components/SubmitConfirmationModal";
import { compressFile } from "@/utils/fileCompression.utils";
import { handleError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import {
	FormFieldType,
	type CreateApplicationRequest,
	type FormField,
} from "@/lib/scholarship/model";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	createApplication,
	getMyApplicationStatus,
	getScholarshipByIdQuery,
} from "@/lib/scholarship/api";
import { useAuth } from "@/auth";
import { getSponsorName } from "@/lib/sponsor/api";
import { getValidatedApplicationSchema } from "@/lib/scholarship/helper";
import { uploadFile } from "@/lib/api";
import type { Student } from "@/lib/student/model";

export const Route = createFileRoute("/_student/scholarship/$id/apply/")({
	component: ApplyScholarshipPage,
	loader: async ({ params }) => {
		const applicationStatus = await getMyApplicationStatus(params.id);
		return { applicationStatus };
	},
});

function ApplyScholarshipPage() {

	const [showConfirmation, setShowConfirmation] = useState(false);
	const [pendingData, setPendingData] = useState<CreateApplicationRequest>();
	const [customFiles, setCustomFiles] = useState<Record<string, File[]>>({});

	const auth = useAuth<Student>();
	const navigate = useNavigate();
	const params = Route.useParams();
	const { applicationStatus } = Route.useLoaderData();
	const scholarshipQuery = useSuspenseQuery(getScholarshipByIdQuery(params.id));
	const scholarship = scholarshipQuery.data;

	const customFields = scholarship?.formFields || [];

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm({
		resolver: zodResolver(getValidatedApplicationSchema(customFields)),
		mode: "onBlur",
		defaultValues: {
			studentId: auth.profile.id,
			scholarshipId: params.id,
			formFieldAnswers: customFields.map((f) => ({
				formFieldId: f.id,
				value: "",
			})),
		},
	});

	const formatDate = (dateString?: string | Date) => {
		if (!dateString) return "No deadline";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	}

	const handleFileUpload = async (
		fieldId: string,
		index: number,
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = Array.from(event.target.files || []);

		if (files.length === 0) return;

		const file = files[0];

		// Validate file size
		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error("File Too Large", `Maximum file size is 10MB.`, 2500);
			event.target.value = "";
			return
		}

		// Validate file type
		const allowedTypes = [
			"application/pdf",
			"image/jpeg",
			"image/jpg",
			"image/png",
		]

		if (!allowedTypes.includes(file.type)) {
			toast.error(
				"Invalid File Type",
				"Only PDF and image files are allowed",
				2500,
			)
			event.target.value = "";
			return
		}

		const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
		const fileExtension = file.name
			.toLowerCase()
			.substring(file.name.lastIndexOf("."));

		if (!allowedExtensions.includes(fileExtension)) {
			toast.error(
				"Invalid File Extension",
				"File extension does not match allowed types",
				2500,
			)
			event.target.value = "";
			return
		}

		try {
			// Compress the file
			const compressedFile = await compressFile(file);

			setValue(`formFieldAnswers.${index}.value`, compressedFile, {
				shouldValidate: true,
				shouldDirty: true,
			})

			setCustomFiles((prev) => ({
				...prev,
				[fieldId]: [compressedFile],
			}))
		} catch (error) {
			logger.error("File compression error:", error);
			toast.error("Compression Failed", "Using original file", 2000);

			setCustomFiles((prev) => ({
				...prev,
				[fieldId]: [file],
			}))
		}

		event.target.value = "";
	}

	const removeFile = (fieldLabel: string, index: number) => {
		setCustomFiles((prev) => ({
			...prev,
			[fieldLabel]: (prev[fieldLabel] || []).filter((_, i) => i !== index),
		}))
	}

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
	}

	// const fileToBase64 = (file: File): Promise<string> => {
	// 	return new Promise((resolve, reject) => {
	// 		const reader = new FileReader();
	// 		reader.onload = () => {
	// 			const result = reader.result as string;
	// 			resolve(result.split(",")[1]);
	// 		};
	// 		reader.onerror = reject;
	// 		reader.readAsDataURL(file);
	// 	});
	// };

	const onSubmit = (data: CreateApplicationRequest) => {
		const fileErrors: string[] = [];
		customFields.forEach((field) => {
			if (field.fieldType.code === FormFieldType.File && field.isRequired) {
				const files = customFiles[field.id] || [];
				if (files.length === 0) {
					fileErrors.push(`${field.label} is required`);
				}
			}
		})

		if (fileErrors.length > 0) {
			toast.error("Missing Required Files", fileErrors.join(", "), 2500);
			return
		}

		const normalizedData: CreateApplicationRequest = {
			...data,
			formFieldAnswers: data.formFieldAnswers.map((answer) => {
				const fieldId = answer.formFieldId;

				// If this fieldId exists in our customFiles state, attach the file(s)
				if (customFiles[fieldId]) {
					return {
						...answer,
						value: customFiles[fieldId],
					}
				}
				return answer;
			}),
		}

		setPendingData(normalizedData);
		setShowConfirmation(true);
	}

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: createApplication,
		onSuccess: async (res) => {
			console.log(res);
			toast.success(`Success`, res.message, 1250);
			await queryClient.invalidateQueries({
				queryKey: ["scholarships", "applications"],
				refetchType: "all",
			})
			await navigate({ to: "/home" });
		},
		onError: (err) => {
			toast.error("Error", err.message);
			console.error(err);
		},
	});

	const processSubmission = async () => {
		if (!pendingData) return;

		setShowConfirmation(false);

		try {
			const updatedAnswers = await Promise.all(
				pendingData.formFieldAnswers.map(async (answer) => {
					const fieldDef = customFields.find(
						(f) => f.id === answer.formFieldId,
					)

					if (fieldDef?.fieldType.code === FormFieldType.File) {
						const files = customFiles[fieldDef.id] || [];

						if (files.length > 0) {
							// TODO: Handle multiple files
							const file = files[0];
							const uploadRes = await uploadFile(
								file,
								auth.sessionToken,
								"application-files",
							)

							// Store the full response object (url, mimeType, extractedText)
							return {
								...answer,
								value: uploadRes.data.url,
							}
						}
					}
					return answer
				}),
			)

			const finalData = {
				...pendingData,
				formFieldAnswers: updatedAnswers,
			}

			mutation.mutate(finalData);
			toast.success("Success", "Application submitted successfully", 2000);
		} catch (error) {
			const handled = handleError(error, "Failed to submit application.");
			logger.error("Submission error:", handled.raw);
			toast.error(`Error ${handled.code}`, handled.message, 2500);
		}
	}

	const renderFormField = (field: FormField, index: number) => {
		const fieldName = `formFieldAnswers.${index}.value` as const;
		const fieldError = errors.formFieldAnswers?.[index]?.value;

		return (
			<div key={field.id} className="space-y-2">
				<label className="block text-xs md:text-sm text-primary">
					<span className="text-[#6B7280] mr-1">{index + 1}.</span>
					{field.label}
					{field.isRequired && <span className="text-[#EF4444] ml-1">*</span>}
				</label>

				{field.fieldType.code === FormFieldType.ShortAnswer && (
					<Controller
						control={control}
						name={fieldName}
						render={({ field: { onChange, onBlur, value } }) => (
							<input
								type="text"
								value={value}
								onChange={onChange}
								onBlur={onBlur}
								placeholder={`Enter ${field.label.toLowerCase()}`}
								className={`w-full px-4 py-3 rounded-lg border ${
									fieldError ? "border-[#EF4444]" : "border-[#E0ECFF]"
								} bg-[#F6F9FF] text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6] text-primary`}
							/>
						)}
					/>
				)}

				{field.fieldType.code === FormFieldType.Paragraph && (
					<Controller
						control={control}
						name={fieldName}
						render={({ field: { onChange, onBlur, value } }) => (
							<textarea
								value={value}
								onChange={onChange}
								onBlur={onBlur}
								placeholder={`Enter ${field.label.toLowerCase()}`}
								rows={4}
								className={`w-full px-4 py-3 rounded-lg border ${
									fieldError ? "border-[#EF4444]" : "border-[#E0ECFF]"
								} bg-[#F6F9FF] text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6] resize-none text-primary`}
							/>
						)}
					/>
				)}

				{field.fieldType.code === FormFieldType.Number && (
					<Controller
						control={control}
						name={fieldName}
						render={({ field: { onChange, onBlur, value } }) => (
							<input
								type="number"
								step="0.01"
								value={value}
								onChange={onChange}
								onBlur={onBlur}
								placeholder={`Enter ${field.label.toLowerCase()}`}
								className={`w-full px-4 py-3 rounded-lg border ${
									fieldError ? "border-[#EF4444]" : "border-[#E0ECFF]"
								} bg-[#F6F9FF] text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6] text-primary`}
							/>
						)}
					/>
				)}

				{field.fieldType.code === FormFieldType.Email && (
					<Controller
						control={control}
						name={fieldName}
						render={({ field: { onChange, onBlur, value } }) => (
							<input
								type="email"
								value={value}
								onChange={onChange}
								onBlur={onBlur}
								placeholder={`Enter ${field.label.toLowerCase()}`}
								className={`w-full px-4 py-3 rounded-lg border ${
									fieldError ? "border-[#EF4444]" : "border-[#E0ECFF]"
								} bg-[#F6F9FF] text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6] text-primary`}
							/>
						)}
					/>
				)}

				{field.fieldType.code === FormFieldType.Phone && (
					<Controller
						control={control}
						name={fieldName}
						render={({ field: { onChange, onBlur, value } }) => (
							<input
								type="tel"
								value={value}
								onChange={onChange}
								onBlur={onBlur}
								placeholder="09XX XXX XXXX"
								className={`w-full px-4 py-3 rounded-lg border ${
									fieldError ? "border-[#EF4444]" : "border-[#E0ECFF]"
								} bg-[#F6F9FF] text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6] text-primary`}
							/>
						)}
					/>
				)}

				{field.fieldType.code === FormFieldType.Date && (
					<Controller
						control={control}
						name={fieldName}
						render={({ field: { onChange, value } }) => (
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className={`w-full px-4 py-3 text-xs md:text-sm border rounded-lg bg-[#F6F9FF] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] flex items-center justify-between ${
											value ? "text-primary" : "text-[#9CA3AF]"
										} ${fieldError ? "border-[#EF4444]" : "border-[#E0ECFF]"}`}
									>
										<span>
											{value
												? formatDate(value)
												: `Select ${field.label.toLowerCase()}`}
										</span>
										<Calendar className="h-4 w-4 opacity-60" />
									</button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<CalendarPicker
										mode="single"
										selected={value ? new Date(value) : undefined}
										onSelect={(date) => {
											if (date) {
												onChange(date.toISOString().split("T")[0]);
											}
										}}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						)}
					/>
				)}

				{field.fieldType.code === FormFieldType.Dropdown && field.options && (
					<Controller
						control={control}
						name={fieldName}
						render={({ field: { onChange, value } }) => (
							<Select value={value} onValueChange={onChange}>
								<SelectTrigger
									className={`w-full px-4 py-3 text-xs md:text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all data-[placeholder]:text-[#9CA3AF] ${
										fieldError
											? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
											: "border-[#E0ECFF] focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
									} bg-[#F6F9FF]`}
								>
									<SelectValue
										placeholder={`Select ${field.label.toLowerCase()}`}
									/>
								</SelectTrigger>
								<SelectContent>
									{field.options?.map((option, idx) => (
										<SelectItem key={idx} value={option.value}>
											{option.value}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				)}

				{field.fieldType.code === FormFieldType.MultipleChoice &&
					field.options && (
						<Controller
							control={control}
							name={fieldName}
							render={({ field: { onChange, value } }) => (
								<div className="space-y-1">
									{field.options?.map((option, idx) => {
										const isSelected = value === option.value;

										return (
											<label
												key={idx}
												className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-[#F0F7FF] rounded-lg transition-colors"
											>
												<input
													type="radio"
													name={field.id}
													checked={isSelected}
													onChange={() => onChange(option.value)}
													className="w-3 h-3 md:w-4 md:h-4 border-[#C4CBD5] text-secondary focus:ring-2 focus:ring-[#3A52A6] accent-[#3A52A6]"
												/>
												<span className="text-xs md:text-sm text-primary">
													{option.value}
												</span>
											</label>
										)
									})}
								</div>
							)}
						/>
					)}

				{field.fieldType.code === FormFieldType.Checkbox && field.options && (
					<Controller
						control={control}
						name={fieldName}
						render={({ field: { onChange, value } }) => (
							<div className="space-y-1">
								{field.options?.map((option, idx) => {
									const selectedValues = Array.isArray(value) ? value : [];
									const isChecked = selectedValues.includes(option.value);

									return (
										<label
											key={idx}
											className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-[#F0F7FF] rounded-lg transition-colors"
										>
											<input
												type="checkbox"
												checked={isChecked}
												onChange={() => {
													const currentValues = Array.isArray(value)
														? [...value]
														: []
													if (isChecked) {
														onChange(
															currentValues.filter((v) => v !== option.value),
														)
													} else {
														onChange([...currentValues, option.value]);
													}
												}}
												className="w-3 h-3 md:w-4 md:h-4 rounded border-[#C4CBD5] text-secondary focus:ring-2 focus:ring-[#3A52A6] accent-[#3A52A6]"
											/>
											<span className="text-xs md:text-sm text-primary">
												{option.value}
											</span>
										</label>
									)
								})}
							</div>
						)}
					/>
				)}

				{field.fieldType.code === FormFieldType.File && (
					<div className="space-y-3">
						<label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#3A52A6] bg-[#E0ECFF] text-secondary rounded-lg cursor-pointer hover:bg-[#D0DCFF] transition-colors">
							<Upload size={16} />
							<span className="text-[11px] md:text-xs">Upload File</span>
							<input
								type="file"
								accept=".pdf,.jpg,.jpeg,.png,"
								onChange={(e) => handleFileUpload(field.id, index, e)}
								className="hidden"
							/>
						</label>

						{customFiles[field.id] && customFiles[field.id].length > 0 && (
							<div className="space-y-2">
								{/* Only show the single file */}
								<div className="flex items-center gap-3 px-4 py-2 bg-[#F6F9FF] border border-[#E0ECFF] rounded-lg">
									<div className="flex-1 min-w-0">
										<p className="text-xs text-primary truncate">
											{customFiles[field.id][0].name}
										</p>
										<p className="text-[11px] text-[#6B7280]">
											{formatFileSize(customFiles[field.id][0].size)}
										</p>
									</div>
									<button
										type="button"
										onClick={() => removeFile(field.id, 0)}
										className="p-1 hover:bg-[#EF4444]/10 rounded transition-colors"
									>
										<X size={16} className="text-[#EF4444]" />
									</button>
								</div>
							</div>
						)}
					</div>
				)}

				{fieldError && (
					<p className="text-xs text-[#EF4444] flex items-center gap-1">
						<AlertCircle size={12} />
						{fieldError.message as string}
					</p>
				)}
			</div>
		)
	}

	// if (loading) {
	//   return (
	//     <div className="min-h-screen bg-[#F8F9FC]">
	//       <div className="max-w-[40rem] mx-auto space-y-4">
	//         {/* Scholarship Details Skeleton */}
	//         <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#E0ECFF]">
	//           {/* Title Skeleton */}
	//           <Skeleton className="h-7 w-full md:h-8 mb-3 bg-muted-foreground" />
	//
	//           {/* Sponsor Info Skeleton */}
	//           <div className="flex items-center gap-2 mb-2">
	//             <Skeleton className="w-4 h-4 rounded-full bg-muted-foreground" />
	//             <Skeleton className="h-4 w-48 md:h-5 md:w-56 bg-muted-foreground" />
	//           </div>
	//
	//           {/* Deadline Skeleton */}
	//           <div className="flex items-center gap-2">
	//             <Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
	//             <Skeleton className="h-4 w-40 md:h-5 md:w-48 bg-muted-foreground" />
	//           </div>
	//         </div>
	//
	//         {/* Application Form Skeleton */}
	//         <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-[#E0ECFF]">
	//           {/* Form Header Skeleton */}
	//           <Skeleton className="h-5 w-36 md:h-6 md:w-40 mb-1 bg-muted-foreground" />
	//           <Skeleton className="h-4 w-64 md:h-5 md:w-72 mb-6 md:mb-8 bg-muted-foreground" />
	//
	//           {/* Form Fields Skeleton */}
	//           <div className="space-y-5">
	//             {/* Text Field Skeleton */}
	//             <div className="space-y-2">
	//               <Skeleton className="h-4 w-24 md:h-5 md:w-28 bg-muted-foreground" />
	//               <Skeleton className="h-11 w-full rounded-lg bg-muted-foreground" />
	//             </div>
	//
	//             {/* Email Field Skeleton */}
	//             <div className="space-y-2">
	//               <Skeleton className="h-4 w-32 md:h-5 md:w-36 bg-muted-foreground" />
	//               <Skeleton className="h-11 w-full rounded-lg bg-muted-foreground" />
	//             </div>
	//
	//             {/* File Upload Field Skeleton */}
	//             <div className="space-y-2">
	//               <Skeleton className="h-4 w-48 md:h-5 md:w-56 bg-muted-foreground" />
	//               <Skeleton className="h-12 w-full rounded-lg border-2 border-dashed bg-muted-foreground" />
	//             </div>
	//           </div>
	//         </div>
	//
	//         <Skeleton className="h-10 md:h-12 w-full rounded-lg bg-muted-foreground" />
	//       </div>
	//     </div>
	//   );
	// }
	//
	// if (error) {
	//   return (
	//     <div className="min-h-screen flex items-center justify-center p-4">
	//       <div className="text-center max-w-md">
	//         <AlertCircle className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
	//         <h3 className="text-lg text-primary mb-2">Something went wrong</h3>
	//         <p className="text-[#5D6673] mb-6">{error}</p>
	//         <button
	//           onClick={() => queryClient.refetchQueries(getScholarshipByIdQuery(auth.sessionToken, params.id))}
	//           className="px-6 py-2.5 bg-[#3A52A6] text-tertiary rounded-lg hover:bg-[#2A4296] transition-colors"
	//         >
	//           Try Again
	//         </button>
	//       </div>
	//     </div>
	//   );
	// }
	//
	if (applicationStatus !== null) {
		return (
			<div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-4">
				<SEO title="Already Applied" noindex={true} />
				<div className="bg-white rounded-lg p-8 shadow-sm border border-[#E0ECFF] max-w-md w-full text-center">
					<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
					<h1 className="text-xl text-primary mb-2">Already Applied</h1>
					<p className="text-sm text-[#6B7280] mb-6">
						You have already submitted an application for{" "}
						<span className="text-primary">{scholarship?.name}</span>.
					</p>
					<button
						onClick={() => navigate({ to: "/discover" })}
						className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3A52A6] text-white rounded-lg text-sm hover:bg-[#2F4189] transition-colors"
					>
						<ArrowLeft size={16} />
						Back to Discover
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#F8F9FC]">
			<SEO title="Apply" noindex={true} />
			<div className="max-w-160 mx-auto space-y-4">
				{/* Back Button */}
				<button
					onClick={() => navigate({ to: "/discover" })}
					className="flex items-center gap-1 py-2 text-primary cursor-pointer"
				>
					<ArrowLeft size={16} />
					<span className="text-xs md:text-sm">Back</span>
				</button>

				{/* Scholarship Details */}
				<div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-[#E0ECFF]">
					<h1 className="text-xl md:text-2xl text-primary mb-3">
						{scholarship?.name}
					</h1>
					<div className="flex items-center gap-2 text-xs md:text-sm text-[#6B7280] mb-2">
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded-full bg-card flex items-center justify-center flex-shrink-0">
								{scholarship?.sponsor?.avatarUrl ? (
									<img
										src={scholarship?.sponsor?.avatarUrl}
										alt={getSponsorName(scholarship.sponsor)}
										className="w-full h-full rounded-full object-cover"
									/>
								) : (
									<UserIcon className="w-full h-full text-secondary" />
								)}
							</div>
							<span>
								{getSponsorName(scholarship.sponsor) || "Unknown Sponsor"}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2 text-xs md:text-sm text-[#6B7280]">
						<CalendarDays size={16} />
						<span>{formatDate(scholarship?.applicationDeadline)}</span>
					</div>
				</div>

				{/* Application Form */}
				{customFields.length > 0 && (
					<div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-[#E0ECFF]">
						<h2 className="text-base md:text-lg text-primary mb-1">
							Application Form
						</h2>
						<p className="text-xs md:text-sm text-[#6B7280] mb-6 md:mb-8">
							Please provide the following information requested.
						</p>

						<div className="space-y-5">
							{customFields.map((field, index) =>
								renderFormField(field, index),
							)}
						</div>
					</div>
				)}

				{/* Submit Button */}
				<button
					onClick={handleSubmit(onSubmit)}
					disabled={mutation.isPending}
					className={`w-full py-3 cursor-pointer text-sm bg-[#EFA508] text-tertiary rounded-md hover:bg-[#D89407] transition-colors flex items-center justify-center gap-2 ${
						mutation.isPending && "opacity-60 cursor-not-allowed"
					}`}
				>
					{mutation.isPending ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : (
						<span>Submit Application</span>
					)}
				</button>
			</div>

			<SubmitConfirmationModal
				isOpen={showConfirmation}
				onCancel={() => setShowConfirmation(false)}
				onConfirm={processSubmission}
				isLoading={mutation.isPending}
			/>
		</div>
	)
}
