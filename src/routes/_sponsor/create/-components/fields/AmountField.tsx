import { Plus, X } from "lucide-react";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { ScholarshipFormData } from "@/lib/scholarship/model";
import type { AmountType } from "../../-model";

interface Props {
	show: boolean;
	onShow: () => void;
	onHide: () => void;
	amountType: AmountType;
	onAmountTypeChange: (type: AmountType) => void;
	control: Control<ScholarshipFormData, any, any>;
	errors: FieldErrors<ScholarshipFormData>;
	setValue: UseFormSetValue<ScholarshipFormData>;
	clearErrors: (fields: (keyof ScholarshipFormData)[]) => void;
	disabled: boolean;
}

const AMOUNT_TYPES: AmountType[] = ["varies", "range", "fixed"];

const numberInputProps = {
	type: "number" as const,
	onKeyDown: (e: React.KeyboardEvent) =>
		["e", "E", "+", "-"].includes(e.key) && e.preventDefault(),
};

const baseInputClass = (hasError: boolean) =>
	`w-full pl-7 py-3 rounded-lg border ${
		hasError ? "border-[#EF4444]" : "border-[#C4CBD5]"
	} bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`;

const fixedInputClass = (hasError: boolean) => `${baseInputClass(hasError)} pr-4`;
const rangeInputClass = (hasError: boolean) => `${baseInputClass(hasError)} pr-3`;

export default function AmountField({
	show,
	onShow,
	onHide,
	amountType,
	onAmountTypeChange,
	control,
	errors,
	setValue,
	clearErrors,
	disabled,
}: Props) {
	const handleTypeChange = (type: AmountType) => {
		onAmountTypeChange(type);
		setValue("totalAmount", undefined);
		setValue("totalAmountMin", undefined);
		setValue("totalAmountMax", undefined);
		clearErrors(["totalAmount", "totalAmountMin", "totalAmountMax"]);
	};

	if (!show) {
		return (
			<button
				type="button"
				disabled={disabled}
				onClick={onShow}
				className="flex items-center gap-1.5 text-xs text-[#3A52A6] hover:text-[#2a3d8a] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<Plus size={13} />
				Add Scholarship Amount
			</button>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-1.5">
				<div className="flex items-center gap-1">
					<span className="text-xs text-[#6B7280]">Scholarship Amount</span>
					<button
						type="button"
						disabled={disabled}
						onClick={onHide}
						className="text-[#9CA3AF] hover:text-[#EF4444] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Remove scholarship amount"
					>
						<X size={11} />
					</button>
				</div>
				<div className="flex rounded-sm overflow-hidden border border-[#C4CBD5] text-xs h-7">
					{AMOUNT_TYPES.map((t) => (
						<button
							key={t}
							type="button"
							disabled={disabled}
							onClick={() => handleTypeChange(t)}
							className={`px-3 capitalize cursor-pointer transition-colors ${
								amountType === t
									? "bg-[#3A52A6] text-white"
									: "bg-[#F8F9FC] text-[#6B7280] hover:bg-gray-100"
							}`}
						>
							{t}
						</button>
					))}
				</div>
			</div>

			{amountType === "fixed" && (
				<Controller
					control={control}
					name="totalAmount"
					render={({ field }) => (
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
								₱
							</span>
							<input
								{...field}
								{...numberInputProps}
								disabled={disabled}
								placeholder="Amount per scholar"
								className={fixedInputClass(!!errors.totalAmount)}
							/>
						</div>
					)}
				/>
			)}

			{amountType === "varies" && (
				<p className="text-xs text-[#6B7280] px-1 py-2.5">
					Amount varies — describe it in the description field.
				</p>
			)}

			{amountType === "range" && (
				<div className="flex items-center gap-2">
					<Controller
						control={control}
						name="totalAmountMin"
						render={({ field }) => (
							<div className="relative flex-1">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
									₱
								</span>
								<input
									{...field}
									{...numberInputProps}
									disabled={disabled}
									placeholder="Min"
									className={rangeInputClass(!!errors.totalAmountMin)}
								/>
							</div>
						)}
					/>
					<span className="text-xs text-[#6B7280] shrink-0">to</span>
					<Controller
						control={control}
						name="totalAmountMax"
						render={({ field }) => (
							<div className="relative flex-1">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
									₱
								</span>
								<input
									{...field}
									{...numberInputProps}
									disabled={disabled}
									placeholder="Max"
									className={rangeInputClass(!!errors.totalAmountMax)}
								/>
							</div>
						)}
					/>
				</div>
			)}

			{errors.totalAmount && (
				<p className="text-xs text-[#EF4444] mt-1">
					{errors.totalAmount.message}
				</p>
			)}
			{errors.totalAmountMin && (
				<p className="text-xs text-[#EF4444] mt-1">
					{errors.totalAmountMin.message}
				</p>
			)}
			{errors.totalAmountMax && (
				<p className="text-xs text-[#EF4444] mt-1">
					{errors.totalAmountMax.message}
				</p>
			)}
		</div>
	);
}
