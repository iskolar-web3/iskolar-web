import { X } from "lucide-react";
import PresetPickerPopover from "@/components/sponsor/create-scholarship/PresetPickerPopover";

interface Props {
	label: string;
	presets: readonly string[];
	selectedItems: string[];
	onSelect: (item: string) => void;
	onRemove: (index: number) => void;
	disabled: boolean;
	error?: string;
	placeholder: string;
}

export default function TagsListField({
	label,
	presets,
	selectedItems,
	onSelect,
	onRemove,
	disabled,
	error,
	placeholder,
}: Props) {
	return (
		<div>
			<label className="block text-xs text-[#6B7280] mb-1.5 ml-0.5">
				{label} <span className="text-[#EF4444]">*</span>
			</label>
			<PresetPickerPopover
				presets={presets}
				selectedItems={selectedItems}
				onSelect={onSelect}
				disabled={disabled}
				hasError={!!error}
				placeholder={placeholder}
			/>
			{error && <p className="text-xs text-[#EF4444] mt-1">{error}</p>}
			{selectedItems.length > 0 && (
				<div className="flex flex-wrap gap-2 mt-3">
					{selectedItems.map((item, index) => (
						<span
							key={index}
							className="inline-flex items-center gap-2 px-3 py-2 border border-border bg-[#F9FAFB] text-primary text-xs rounded-md"
						>
							{item}
							<button
								disabled={disabled}
								onClick={() => onRemove(index)}
								className="cursor-pointer hover:text-[#2A4296]"
							>
								<X size={14} />
							</button>
						</span>
					))}
				</div>
			)}
		</div>
	);
}
