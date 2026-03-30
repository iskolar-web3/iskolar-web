import { Check, ChevronDown, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface PresetPickerPopoverProps {
	presets: readonly string[];
	selectedItems: string[];
	onSelect: (value: string) => void;
	disabled?: boolean;
	hasError?: boolean;
	placeholder?: string;
}

export default function PresetPickerPopover({
	presets,
	selectedItems,
	onSelect,
	disabled = false,
	hasError = false,
	placeholder = "Select an option",
}: PresetPickerPopoverProps) {
	const [open, setOpen] = useState(false);
	const [showCustomInput, setShowCustomInput] = useState(false);
	const [customValue, setCustomValue] = useState("");
	const customInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (showCustomInput && customInputRef.current) {
			customInputRef.current.focus();
		}
	}, [showCustomInput]);

	const handleSelectPreset = (value: string) => {
		if (!selectedItems.includes(value)) {
			onSelect(value);
		}
	};

	const handleAddCustom = () => {
		const trimmed = customValue.trim();
		if (trimmed) {
			onSelect(trimmed);
			setCustomValue("");
		}
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setShowCustomInput(false);
			setCustomValue("");
		}
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={`w-full cursor-pointer px-4 py-3 text-sm border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[#3A52A6]/20 flex items-center justify-between text-gray-400 ${
						hasError
							? "border-[#EF4444]"
							: "border-[#C4CBD5] focus:border-[#3A52A6]"
					}`}
				>
					<span>{placeholder}</span>
					<ChevronDown className="h-4 w-4 opacity-60" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-(--radix-popover-trigger-width) p-0"
				align="start"
			>
				<div className="max-h-64 overflow-y-auto p-1">
					{presets.map((preset) => {
						const isSelected = selectedItems.includes(preset);
						return (
							<button
								key={preset}
								type="button"
								disabled={isSelected}
								onClick={() => handleSelectPreset(preset)}
								className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors ${
									isSelected
										? "opacity-50 cursor-default text-[#6B7280]"
										: "cursor-pointer hover:bg-[#F3F4F6] text-primary"
								}`}
							>
								{isSelected && (
									<Check className="h-3.5 w-3.5 shrink-0 text-[#3A52A6]" />
								)}
								<span className={isSelected ? "ml-0" : "ml-5.5"}>{preset}</span>
							</button>
						);
					})}
				</div>

				<div className="border-t border-[#E5E7EB] p-1">
					{!showCustomInput ? (
						<button
							type="button"
							onClick={() => setShowCustomInput(true)}
							className="w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 cursor-pointer hover:bg-[#F3F4F6] text-[#3A52A6]"
						>
							<Plus className="h-3.5 w-3.5 shrink-0" />
							<span>Others (custom entry)</span>
						</button>
					) : (
						<div className="flex gap-1.5 px-1 py-1">
							<input
								ref={customInputRef}
								value={customValue}
								onChange={(e) => setCustomValue(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddCustom();
									}
									if (e.key === "Escape") {
										e.stopPropagation();
										setShowCustomInput(false);
										setCustomValue("");
									}
								}}
								placeholder="Please specify..."
								className="flex-1 px-3 py-1.5 text-sm border border-[#C4CBD5] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#3A52A6] bg-transparent"
							/>
							<button
								type="button"
								onClick={handleAddCustom}
								disabled={!customValue.trim()}
								className="px-2 py-1.5 bg-[#3A52A6] text-white rounded-sm hover:bg-[#2A4296] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Plus className="h-3.5 w-3.5" />
							</button>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
