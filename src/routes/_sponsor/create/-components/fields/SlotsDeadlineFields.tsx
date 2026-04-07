import { CalendarIcon } from "lucide-react";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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

export default function SlotsDeadlineFields({
	unlimitedSlots,
	onUnlimitedSlotsChange,
	control,
	errors,
	setValue,
	clearErrors,
	disabled,
}: Props) {
	return (
		<>
			{/* Available Slots */}
			<div>
				<div className="flex items-center justify-between mb-1.5">
					<span className="text-xs text-[#6B7280]">Available Slots</span>
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

			{/* Application Deadline */}
			<div>
				<label className="block text-xs text-[#6B7280] mb-1.5 ml-0.5">
					Application Deadline <span className="text-[#EF4444]">*</span>
				</label>
				<Controller
					control={control}
					name="applicationDeadline"
					render={({ field }) => (
						<Popover>
							<PopoverTrigger asChild>
								<button
									type="button"
									disabled={disabled}
									className={`w-full cursor-pointer px-4 py-3 text-sm border rounded-lg bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] flex items-center justify-between ${
										field.value ? "text-primary" : "text-gray-400"
									} ${errors.applicationDeadline ? "border-[#EF4444]" : "border-[#C4CBD5]"}`}
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
										if (date) field.onChange(date);
									}}
									disabled={(date) => date < new Date()}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					)}
				/>
				{errors.applicationDeadline && (
					<p className="text-xs text-[#EF4444] mt-1">
						{errors.applicationDeadline.message}
					</p>
				)}
			</div>
		</>
	);
}
