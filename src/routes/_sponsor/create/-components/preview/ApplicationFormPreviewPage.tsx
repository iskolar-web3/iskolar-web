import {
	Calendar,
	Upload,
	AlertCircle,
	CalendarDays,
	UserIcon,
	ArrowLeft,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { SEO } from "@/components/SEO";
import {
	FormFieldType,
	type ScholarshipFormData,
} from "@/lib/scholarship/model";
import { useAuth } from "@/auth";
import { getSponsorName } from "@/lib/sponsor/api";
import type { AnySponsor } from "@/lib/sponsor/model";

interface ApplicationFormPreviewPageProps {
	scholarship: Partial<ScholarshipFormData>;
	onBack: () => void;
}

export default function ApplicationFormPreviewPage({
	scholarship,
	onBack,
}: ApplicationFormPreviewPageProps) {
	const { toast } = useToast();
	const auth = useAuth<AnySponsor>();

	const customFields = scholarship?.formFields || [];

	const formatDate = (dateString?: string | Date) => {
		if (!dateString) return "No deadline";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const renderFormField = (field: any, index: number) => {
		const fieldType = field?.fieldType?.code || field?.fieldType;
		const fieldId = field?.id || `field-${index}`;
		const fieldLabel = field?.label || `Field ${index + 1}`;

		return (
			<div key={fieldId} className="space-y-2">
				<label className="block text-xs md:text-sm text-primary">
					{fieldLabel}
					{field?.isRequired && <span className="text-[#EF4444] ml-1">*</span>}
				</label>

				{fieldType === FormFieldType.ShortAnswer && (
					<input
						type="text"
						disabled
						placeholder={`Enter ${fieldLabel.toLowerCase()}`}
						className="w-full px-4 py-3 rounded-lg border border-[#E0ECFF] bg-[#F6F9FF] text-xs md:text-sm focus:outline-none text-primary opacity-60 cursor-not-allowed"
					/>
				)}

				{fieldType === FormFieldType.Paragraph && (
					<textarea
						disabled
						placeholder={`Enter ${fieldLabel.toLowerCase()}`}
						rows={4}
						className="w-full px-4 py-3 rounded-lg border border-[#E0ECFF] bg-[#F6F9FF] text-xs md:text-sm focus:outline-none resize-none text-primary opacity-60 cursor-not-allowed"
					/>
				)}

				{fieldType === FormFieldType.Number && (
					<input
						type="number"
						disabled
						placeholder={`Enter ${fieldLabel.toLowerCase()}`}
						className="w-full px-4 py-3 rounded-lg border border-[#E0ECFF] bg-[#F6F9FF] text-xs md:text-sm focus:outline-none text-primary opacity-60 cursor-not-allowed"
					/>
				)}

				{fieldType === FormFieldType.Email && (
					<input
						type="email"
						disabled
						placeholder={`Enter ${fieldLabel.toLowerCase()}`}
						className="w-full px-4 py-3 rounded-lg border border-[#E0ECFF] bg-[#F6F9FF] text-xs md:text-sm focus:outline-none text-primary opacity-60 cursor-not-allowed"
					/>
				)}

				{fieldType === FormFieldType.Phone && (
					<input
						type="tel"
						disabled
						placeholder="09XX XXX XXXX"
						className="w-full px-4 py-3 rounded-lg border border-[#E0ECFF] bg-[#F6F9FF] text-xs md:text-sm focus:outline-none text-primary opacity-60 cursor-not-allowed"
					/>
				)}

				{fieldType === FormFieldType.Date && (
					<button
						type="button"
						disabled
						className="w-full px-4 py-3 text-xs md:text-sm border border-[#E0ECFF] rounded-lg bg-[#F6F9FF] flex items-center justify-between opacity-60 cursor-not-allowed text-[#9CA3AF]"
					>
						<span>Select {fieldLabel.toLowerCase()}</span>
						<Calendar className="h-4 w-4 opacity-60" />
					</button>
				)}

				{fieldType === FormFieldType.Dropdown && field?.options && (
					<Select disabled>
						<SelectTrigger className="w-full px-4 py-3 text-xs md:text-sm border border-[#E0ECFF] rounded-lg focus:outline-none focus:ring-2 transition-all data-placeholder:text-[#9CA3AF] bg-[#F6F9FF] opacity-60 cursor-not-allowed text-[#9CA3AF]">
							<SelectValue
								placeholder={`Select ${fieldLabel.toLowerCase()}`}
							/>
						</SelectTrigger>
						<SelectContent>
							{field.options?.map((option: any) => (
								<SelectItem
									key={`${fieldId}-${option?.value}`}
									value={option?.value || ""}
								>
									{option?.value || "Option"}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}

				{fieldType === FormFieldType.MultipleChoice && field?.options && (
					<div className="space-y-1">
						{field.options?.map((option: any, idx: number) => (
							<label
								key={`${fieldId}-${option?.value}-${idx}`}
								className="flex items-center gap-2 cursor-not-allowed p-1.5 opacity-60"
							>
								<input
									type="radio"
									name={fieldId}
									disabled
									className="w-3 h-3 md:w-4 md:h-4 border-[#C4CBD5] text-secondary focus:ring-2 focus:ring-[#3A52A6] accent-[#3A52A6] cursor-not-allowed"
								/>
								<span className="text-xs md:text-sm text-primary">
									{option?.value || "Option"}
								</span>
							</label>
						))}
					</div>
				)}

				{fieldType === FormFieldType.Checkbox && field?.options && (
					<div className="space-y-1">
						{field.options?.map((option: any, idx: number) => (
							<label
								key={`${fieldId}-${option?.value}-${idx}`}
								className="flex items-center gap-2 cursor-not-allowed p-1.5 opacity-60"
							>
								<input
									type="checkbox"
									disabled
									className="w-3 h-3 md:w-4 md:h-4 rounded border-[#C4CBD5] text-secondary focus:ring-2 focus:ring-[#3A52A6] accent-[#3A52A6] cursor-not-allowed"
								/>
								<span className="text-xs md:text-sm text-primary">
									{option?.value || "Option"}
								</span>
							</label>
						))}
					</div>
				)}

				{fieldType === FormFieldType.File && (
					<label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#3A52A6] bg-[#E0ECFF] text-secondary rounded-lg opacity-60 cursor-not-allowed">
						<Upload size={16} />
						<span className="text-[11px] md:text-xs">Upload File</span>
					</label>
				)}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-[#F8F9FC]">
			<SEO title="Application Form Preview" noindex={true} />
			{toast && <Toast {...toast} />}

			<div className="max-w-160 mx-auto space-y-4">
				{/* Back Button */}
				<button
					onClick={onBack}
					className="flex items-center gap-1 py-2 text-primary cursor-pointer hover:text-[#3A52A6] transition-colors"
				>
					<ArrowLeft size={16} />
					<span className="text-xs md:text-sm">Back</span>
				</button>

				{/* Preview Banner */}
				<div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4 flex items-start gap-3">
					<AlertCircle
						size={24}
						className="text-[#D97706] shrink-0 mt-0.5"
					/>
					<div>
						<p className="text-xs text-[#B45309]">
							This shows exactly how your application form will appear to students
							when they apply. All fields are read-only for preview purposes.
						</p>
					</div>
				</div>

				{/* Scholarship Details */}
				<div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-[#E0ECFF]">
					<h1 className="text-xl md:text-2xl text-primary mb-3">
						{scholarship?.name || "Scholarship Title"}
					</h1>
					<div className="flex items-center gap-2 text-xs md:text-sm text-[#6B7280] mb-2">
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 rounded-full bg-card flex items-center justify-center shrink-0">
								{auth.profile.avatarUrl ? (
									<img
										src={auth.profile.avatarUrl}
										alt={getSponsorName(auth.profile)}
										className="w-full h-full rounded-full object-cover"
									/>
								) : (
									<UserIcon className="w-full h-full text-secondary" />
								)}
							</div>
							<span>{getSponsorName(auth.profile) || "iSkolar"}</span>
						</div>
					</div>
					<div className="flex items-center gap-2 text-xs md:text-sm text-[#6B7280]">
						<CalendarDays size={16} />
						<span>{formatDate(scholarship?.applicationDeadline)}</span>
					</div>
				</div>

				{/* Application Form */}
				{customFields.length > 0 ? (
					<div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-[#E0ECFF]">
						<h2 className="text-base md:text-lg text-primary mb-1">
							Application Form
						</h2>
						<p className="text-xs md:text-sm text-[#6B7280] mb-6 md:mb-8">
							Please provide the following information requested.
						</p>

						<div className="space-y-5">
							{customFields.map((field: any, index: number) =>
								renderFormField(field, index),
							)}
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-[#E0ECFF] text-center">
						<p className="text-sm text-[#6B7280]">
							No form fields added yet. Add form fields to see the preview.
						</p>
					</div>
				)}

				{/* Submit Button - Disabled */}
				<button
					type="button"
					disabled
					className="w-full py-3 cursor-not-allowed text-sm bg-[#EFA508] text-tertiary rounded-md opacity-60 flex items-center justify-center gap-2"
				>
					<span>Submit Application</span>
				</button>
			</div>
		</div>
	);
}
