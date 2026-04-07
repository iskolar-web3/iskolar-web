import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ScholarshipType } from "@/lib/scholarship/model";

interface Props {
	value: ScholarshipType | undefined;
	onValueChange: (value: ScholarshipType) => void;
	disabled: boolean;
	error?: string;
	formResetKey: number;
}

export default function ScholarshipTypeSelect({
	value,
	onValueChange,
	disabled,
	error,
	formResetKey,
}: Props) {
	return (
		<div>
			<label className="block text-xs text-[#6B7280] mb-1.5 ml-0.5">
				Scholarship Type <span className="text-[#EF4444]">*</span>
			</label>
			<Select
				key={`scholarship-type-${formResetKey}`}
				value={value}
				onValueChange={(v) => onValueChange(v as ScholarshipType)}
			>
				<SelectTrigger
					disabled={disabled}
					className={`w-full cursor-pointer px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all data-placeholder:text-gray-600 [&>span]:text-gray-500 ${
						error
							? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444] text-primary"
							: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
					}`}
				>
					<SelectValue placeholder="Select type" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ScholarshipType.MeritBased}>
						<span className="text-primary">Merit-Based</span>{" "}
						<span className="text-gray-500">
							(Awarded for grades, skills, or achievements)
						</span>
					</SelectItem>
					<SelectItem value={ScholarshipType.NeedBased}>
						<span className="text-primary">Need-Based</span>{" "}
						<span className="text-gray-500">
							(Awarded based on financial need or limited resources)
						</span>
					</SelectItem>
					<SelectItem value={ScholarshipType.Combined}>
						<span className="text-primary">
							Merit-Based and Need-Based Combined
						</span>{" "}
						<span className="text-gray-500">
							(Awarded using both merit and financial-need criteria)
						</span>
					</SelectItem>
				</SelectContent>
			</Select>
			{error && <p className="text-xs text-[#EF4444] mt-1">{error}</p>}
		</div>
	);
}
