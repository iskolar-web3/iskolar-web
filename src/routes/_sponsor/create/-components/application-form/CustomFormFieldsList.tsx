import { Edit2, Trash2 } from "lucide-react";
import type { CreateFormFieldRequest } from "@/lib/scholarship/model";
import { getFieldTypeLabel, renderFieldTypeIcon } from "@/utils/formField.utils";

interface CustomFormFieldsListProps {
	fields: CreateFormFieldRequest[];
	onEdit: (index: number) => void;
	onRemove: (index: number) => void;
	disabled?: boolean;
}

export default function CustomFormFieldsList({
	fields,
	onEdit,
	onRemove,
	disabled = false,
}: CustomFormFieldsListProps) {
	if (fields.length === 0) return null;

	return (
		<div className="space-y-2 mb-3">
			{fields.map((field, index) => (
				<div
					key={index}
					className="flex items-center gap-3 p-3 bg-white border border-[#E0ECFF] rounded-lg"
				>
					<span className="text-xs text-[#6B7280] w-5 text-center shrink-0">
						{index + 1}
					</span>
					<div className="w-9 h-9 bg-[#E0ECFF] rounded-lg flex items-center justify-center">
						{renderFieldTypeIcon(field.fieldType)}
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<span className="text-sm text-primary">{field.label}</span>
							{field.isRequired && (
								<span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
									Required
								</span>
							)}
						</div>
						<p className="text-xs text-[#6B7280]">
							{getFieldTypeLabel(field.fieldType)}
						</p>
					</div>
					<button
						disabled={disabled}
						onClick={() => onEdit(index)}
						className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"
					>
						<Edit2 size={16} className="text-secondary" />
					</button>
					<button
						disabled={disabled}
						onClick={() => onRemove(index)}
						className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"
					>
						<Trash2 size={16} className="text-[#EF4444]" />
					</button>
				</div>
			))}
		</div>
	);
}
