import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { ScholarshipFormData } from "@/lib/scholarship/model";

interface Props {
	unlimitedSlots: boolean;
	onUnlimitedSlotsChange: (unlimited: boolean) => void;
	control: Control<ScholarshipFormData, any, any>;
	errors: FieldErrors<ScholarshipFormData>;
	setValue: UseFormSetValue<ScholarshipFormData>;
	clearErrors: (field: keyof ScholarshipFormData) => void;
	disabled: boolean;
}

export default function SlotsField({
	unlimitedSlots,
	onUnlimitedSlotsChange,
	control,
	errors,
	setValue,
	clearErrors,
	disabled,
}: Props) {
	return (
		<div>
			<div className="flex items-center justify-between mb-1.5">
				<span className="text-xs text-[#6B7280]">Number of Slots</span>
				<label className="flex items-center gap-1.5 cursor-pointer">
					<input
						type="checkbox"
						checked={unlimitedSlots}
						disabled={disabled}
						onChange={(e) => {
							onUnlimitedSlotsChange(e.target.checked);
							if (e.target.checked) {
								setValue("totalSlots", undefined);
								clearErrors("totalSlots");
							}
						}}
						className="w-3.5 h-3.5 cursor-pointer accent-[#3A52A6]"
					/>
					<span className="text-xs text-[#6B7280]">No limit</span>
				</label>
			</div>

			{!unlimitedSlots && (
				<Controller
					control={control}
					name="totalSlots"
					render={({ field }) => (
						<input
							{...field}
							type="number"
							disabled={disabled}
							placeholder="Number of scholars"
							onKeyDown={(e) =>
								["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
							}
							className={`w-full px-4 py-3 rounded-lg border ${
								errors.totalSlots ? "border-[#EF4444]" : "border-[#C4CBD5]"
							} bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
						/>
					)}
				/>
			)}
			{errors.totalSlots && (
				<p className="text-xs text-[#EF4444] mt-1">
					{errors.totalSlots.message}
				</p>
			)}
		</div>
	);
}
