import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useEffect } from "react";
import type { JSX } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	PaymentMethod,
	upsertPaymentMethodRequestSchema,
	type PaymentMethodDetail,
	type Student,
	type UpsertPaymentMethodRequest,
} from "@/lib/student/model";
import { Input } from "@/components/ui/input";

/**
 * Props for PaymentMethodForm component
 */
interface PaymentMethodFormProps {
	/** Initial profile data to populate form */
	profile: Student;
	payment?: PaymentMethodDetail;
	/** Whether the form is in edit mode */
	isEditing: boolean;
	/** Whether the form is currently submitting */
	isSaving: boolean;
	/** Callback when form is submitted */
	onSubmit: (data: UpsertPaymentMethodRequest) => Promise<void>;
}

/**
 * Student profile edit form component using react-hook-form
 * Handles validation and submission of student profile updates
 *
 * @param props - Component props
 * @returns Student profile form component
 */
const PaymentMethodForm = forwardRef<HTMLFormElement, PaymentMethodFormProps>(
	function PaymentMethodForm(
		{ profile, payment, isEditing, isSaving, onSubmit },
		ref,
	): JSX.Element {
		const {
			control,
			handleSubmit,
			formState: { errors },
			reset,
			watch,
		} = useForm<UpsertPaymentMethodRequest>({
			resolver: zodResolver(upsertPaymentMethodRequestSchema),
			mode: "onBlur",
			defaultValues: {
				studentId: profile.id,
				method: payment?.method.code,
				accountName: payment?.accountName,
				accountNumber: payment?.accountNumber,
			},
		});

		const selectedMethod = watch("method");
		const accountNumberLabel =
			selectedMethod === PaymentMethod.GCash ||
			selectedMethod === PaymentMethod.Maya
				? "Phone Number"
				: "Account Number";

		useEffect(() => {
			if (payment) {
				reset({
					studentId: profile.id,
					method: payment.method.code,
					accountName: payment.accountName,
					accountNumber: payment.accountNumber,
				});
			}
		}, [payment]);

		if (!isEditing) {
			// View mode
			return (
				<div className="grid grid-cols-1 gap-4 md:gap-6">
					<div>
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
								{[
									{ value: PaymentMethod.GCash, label: "GCash" },
									{ value: PaymentMethod.Maya, label: "Maya" },
									{ value: PaymentMethod.Maribank, label: "Maribank" },
									{ value: PaymentMethod.GoTyme, label: "GoTyme" },
								].find((opt) => opt.value === payment?.method.code)?.label ||
									payment?.method.name ||
									"—"}
							</p>
						</div>
					</div>

					<div>
						<label className="block text-xs text-[#6B7280] mb-1.5">
							Account Name
						</label>
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
								{payment?.accountName || "—"}
							</p>
						</div>
					</div>

					<div>
						<label className="block text-xs text-[#6B7280] mb-1.5">
							{accountNumberLabel}
						</label>
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
								{payment?.accountNumber || "—"}
							</p>
						</div>
					</div>
				</div>
			);
		}

		// Edit mode with form
		return (
			<form
				ref={ref}
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-4 md:space-y-6"
			>
				<div className="grid grid-cols-1 gap-4 md:gap-6">
					<Controller
						name="method"
						control={control}
						render={({ field }) => (
							<div>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isSaving}
								>
									<SelectTrigger
										className={`min-h-10 h-auto w-full px-4 bg-[#F9FAFB] border-border rounded-sm text-sm md:text-sm ${
											errors.method
												? "border-[#EF4444] focus:ring-[#EF4444]/20"
												: ""
										}`}
									>
										<SelectValue placeholder="Select payment method" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={PaymentMethod.GCash}>GCash</SelectItem>
										<SelectItem value={PaymentMethod.Maya}>Maya</SelectItem>
										<SelectItem value={PaymentMethod.Maribank}>
											Maribank
										</SelectItem>
										<SelectItem value={PaymentMethod.GoTyme}>GoTyme</SelectItem>
									</SelectContent>
								</Select>
								{errors.method && (
									<p className="mt-1 text-xs text-[#EF4444]">
										{errors.method.message}
									</p>
								)}
							</div>
						)}
					/>

					<Controller
						name="accountName"
						control={control}
						render={({ field }) => (
							<div>
								<label className="block text-xs text-[#6B7280] mb-1.5">
									Account Name
								</label>
								<Input
									{...field}
									disabled={isSaving}
									className={`min-h-10 h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-sm md:text-sm ${
										errors.accountName
											? "border-[#EF4444] focus-visible:ring-[#EF4444]/20"
											: ""
									}`}
									placeholder="Enter your account name"
								/>
								{errors.accountName && (
									<p className="mt-1 text-xs text-[#EF4444]">
										{errors.accountName.message}
									</p>
								)}
							</div>
						)}
					/>

					<Controller
						name="accountNumber"
						control={control}
						render={({ field }) => (
							<div>
								<label className="block text-xs text-[#6B7280] mb-1.5">
									{accountNumberLabel}
								</label>
								<Input
									{...field}
									disabled={isSaving}
									className={`min-h-10 h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-sm md:text-sm ${
										errors.accountNumber
											? "border-[#EF4444] focus-visible:ring-[#EF4444]/20"
											: ""
									}`}
									placeholder="Enter your account number"
								/>
								{errors.accountNumber && (
									<p className="mt-1 text-xs text-[#EF4444]">
										{errors.accountNumber.message}
									</p>
								)}
							</div>
						)}
					/>
				</div>

				{/* Form submit button is handled by parent component via EditHeader */}
				{isSaving && (
					<div className="text-center text-sm text-gray-500">
						Saving changes...
					</div>
				)}
			</form>
		);
	},
);

PaymentMethodForm.displayName = "PaymentMethodForm";

export default PaymentMethodForm;
