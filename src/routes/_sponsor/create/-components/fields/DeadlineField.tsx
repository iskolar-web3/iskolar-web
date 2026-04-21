import { CalendarIcon } from "lucide-react";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { ScholarshipFormData } from "@/lib/scholarship/model";

interface Props {
	control: Control<ScholarshipFormData, any, any>;
	errors: FieldErrors<ScholarshipFormData>;
	disabled: boolean;
}

export default function DeadlineField({
	control,
	errors,
	disabled,
}: Props) {
	return (
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
	);
}
