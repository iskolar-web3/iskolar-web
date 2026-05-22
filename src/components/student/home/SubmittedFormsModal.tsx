import { X, FileText, ExternalLink } from "lucide-react";
import { FormFieldType, type Application } from "@/lib/scholarship/model";
import { formatDate } from "@/utils/formatting.utils";

interface SubmittedFormsModalProps {
	application: Application;
	onClose: () => void;
}

function renderValue(
	fieldType: string,
	value: unknown,
): React.ReactNode {
	if (value === null || value === undefined || value === "") {
		return <span className="text-[#9CA3AF] italic">No answer</span>;
	}

	if (fieldType === FormFieldType.File) {
		const urls = Array.isArray(value) ? value : [value];
		return (
			<div className="flex flex-col gap-1.5">
				{urls.map((url: string, i: number) => (
					<a
						key={i}
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 underline text-xs break-all"
					>
						<ExternalLink size={12} className="shrink-0" />
						{`File ${urls.length > 1 ? i + 1 : ""}`}
					</a>
				))}
			</div>
		);
	}

	if (fieldType === FormFieldType.Checkbox) {
		const items = Array.isArray(value) ? value : [value];
		return (
			<ul className="list-disc list-inside space-y-0.5">
				{items.map((item: string, i: number) => (
					<li key={i} className="text-xs text-[#374151]">
						{item}
					</li>
				))}
			</ul>
		);
	}

	if (fieldType === FormFieldType.Date) {
		return (
			<span className="text-xs text-[#374151]">
				{formatDate(new Date(value as string))}
			</span>
		);
	}

	return <span className="text-xs text-[#374151]">{String(value)}</span>;
}

export default function SubmittedFormsModal({
	application,
	onClose,
}: SubmittedFormsModalProps) {
	const formFields = application.scholarship.formFields;
	const answers = application.application.formFieldAnswers;

	const answerMap = new Map(answers.map((a) => [a.formFieldId, a.value]));

	const hasFields = formFields.length > 0;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-xl bg-white shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
					<div className="flex items-center gap-2">
						<FileText size={18} className="text-[#6B7280]" />
						<h2 className="text-base text-[#111827]">Submitted Form</h2>
					</div>
					<button
						onClick={onClose}
						className="rounded-lg p-1 hover:bg-[#F3F4F6] transition-colors"
					>
						<X size={18} className="text-[#6B7280]" />
					</button>
				</div>

				{/* Scholarship name */}
				<div className="px-5 py-3 bg-[#F9FAFB] border-b border-border shrink-0">
					<p className="text-xs text-[#6B7280]">Scholarship</p>
					<p className="text-sm text-[#111827]">{application.scholarship.name}</p>
				</div>

				{/* Content */}
				<div
					className="overflow-y-auto flex-1 px-5 py-4 space-y-4"
					style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 #F1F5F9" }}
				>
					{!hasFields ? (
						<p className="text-sm text-[#9CA3AF] text-center py-6">
							This scholarship has no form fields.
						</p>
					) : (
						formFields.map((field) => {
							const value = answerMap.get(field.id);
							return (
								<div key={field.id} className="space-y-1">
									<div className="flex items-center gap-1.5">
										<p className="text-xs text-[#374151]">{field.label}</p>
										{field.isRequired && (
											<span className="text-[10px] text-[#EF4444]">*</span>
										)}
									</div>
									<div className="rounded-lg border border-border bg-[#F9FAFB] px-3 py-2 min-h-[36px] flex items-start">
										{renderValue(field.fieldType.code, value)}
									</div>
								</div>
							);
						})
					)}
				</div>

				{/* Footer */}
				<div className="border-t border-border px-5 py-3 shrink-0">
					<button
						onClick={onClose}
						className="w-full rounded-lg bg-[#F3F4F6] py-2 text-sm text-[#374151] hover:bg-[#E5E7EB] transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
