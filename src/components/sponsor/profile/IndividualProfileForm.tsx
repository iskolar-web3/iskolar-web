import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef } from "react";
import type { JSX } from "react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	EmploymentType,
	updateIndividualSponsorRequestSchema,
	type IndividualSponsor,
	type UpdateIndividualSponsorRequest,
} from "@/lib/sponsor/model";
import { format } from "date-fns";

/**
 * Props for IndividualSponsorProfileForm component
 */
interface IndividualSponsorProfileFormProps {
	/** Initial profile data to populate form */
	profile: IndividualSponsor;
	/** Whether the form is in edit mode */
	isEditing: boolean;
	/** Whether the form is currently submitting */
	isSaving: boolean;
	/** Callback when form is submitted */
	onSubmit: (data: UpdateIndividualSponsorRequest) => Promise<void>;
}

/**
 * Individual sponsor profile edit form component using react-hook-form
 * Handles validation and submission of individual sponsor profile updates
 *
 * @param props - Component props
 * @returns Individual sponsor profile form component
 */
const IndividualSponsorProfileForm = forwardRef<
	HTMLFormElement,
	IndividualSponsorProfileFormProps
>(function IndividualSponsorProfileForm(
	{ profile, isEditing, isSaving, onSubmit },
	ref,
): JSX.Element {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<UpdateIndividualSponsorRequest>({
		resolver: zodResolver(updateIndividualSponsorRequestSchema),
		mode: "onBlur",
		defaultValues: {
			id: profile.id,
			userId: profile.userId,
			firstName: profile.firstName,
			middleName: profile.middleName || "",
			lastName: profile.lastName,
			birthDate: profile.birthDate,
			contact: {
				value: profile.contact.value,
				contactType: profile.contact.code,
			},
			avatarUrl: profile.avatarUrl || "",
			employmentType: profile.employmentType.code,
			sponsorType: profile.sponsorType.code,
		},
	});

	if (!isEditing) {
		// View mode
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
				<div>
					<label className="block text-xs text-[#6B7280] mb-1.5">
						First Name
					</label>
					<div className="min-h-[40px] px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center">
						<p className="text-xs md:text-sm text-primary">
							{profile.firstName || "—"}
						</p>
					</div>
				</div>

				<div>
					<label className="block text-xs text-[#6B7280] mb-1.5">
						Middle Name
					</label>
					<div className="min-h-[40px] px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center">
						<p className="text-xs md:text-sm text-primary">
							{profile.middleName || "—"}
						</p>
					</div>
				</div>

				<div>
					<label className="block text-xs text-[#6B7280] mb-1.5">
						Last Name
					</label>
					<div className="min-h-[40px] px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center">
						<p className="text-xs md:text-sm text-primary">
							{profile.lastName || "—"}
						</p>
					</div>
				</div>

				<div>
					<label className="block text-xs text-[#6B7280] mb-1.5">
						Employment Type
					</label>
					<div className="min-h-[40px] px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center">
						<p className="text-xs md:text-sm text-primary">
							{[
								{ value: EmploymentType.Employed, label: "Employed" },
								{ value: EmploymentType.SelfEmployed, label: "Self Employed" },
								{ value: EmploymentType.Freelancer, label: "Freelancer" },
								{
									value: EmploymentType.OFW,
									label: "Overseas Filipino Worker",
								},
								{
									/* { value: "student", label: "Student" }, */
								},
							].find((opt) => opt.value === profile.employmentType.code)
								?.label ||
								profile.employmentType.name ||
								"—"}
						</p>
					</div>
				</div>
				<div>
					<label className="block text-xs text-[#6B7280] mb-1.5">
						Date of Birth
					</label>
					<div className="min-h-[40px] px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center">
						<p className="text-xs md:text-sm text-primary">
							{profile.birthDate
								? format(profile.birthDate, "MMMM d, yyyy")
								: "—"}
						</p>
					</div>
				</div>
				<div>
					<label className="block text-xs text-[#6B7280] mb-1.5">
						Contact Number
					</label>
					<div className="min-h-[40px] px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center">
						<p className="text-xs md:text-sm text-primary">
							{profile.contact.value || "—"}
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
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
				<Controller
					name="firstName"
					control={control}
					render={({ field }) => (
						<div>
							<label className="block text-xs text-[#6B7280] mb-1.5">
								First Name
							</label>
							<Input
								{...field}
								disabled={isSaving}
								className={`min-h-[40px] h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-xs md:text-sm ${
									errors.firstName
										? "border-[#EF4444] focus-visible:ring-[#EF4444]/20"
										: ""
								}`}
							/>
							{errors.firstName && (
								<p className="mt-1 text-xs text-[#EF4444]">
									{errors.firstName.message}
								</p>
							)}
						</div>
					)}
				/>

				<Controller
					name="middleName"
					control={control}
					render={({ field }) => (
						<div>
							<label className="block text-xs text-[#6B7280] mb-1.5">
								Middle Name
							</label>
							<Input
								{...field}
								disabled={isSaving}
								className={`min-h-[40px] h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-xs md:text-sm ${
									errors.middleName
										? "border-[#EF4444] focus-visible:ring-[#EF4444]/20"
										: ""
								}`}
							/>
							{errors.middleName && (
								<p className="mt-1 text-xs text-[#EF4444]">
									{errors.middleName.message}
								</p>
							)}
						</div>
					)}
				/>

				<Controller
					name="lastName"
					control={control}
					render={({ field }) => (
						<div>
							<label className="block text-xs text-[#6B7280] mb-1.5">
								Last Name
							</label>
							<Input
								{...field}
								disabled={isSaving}
								className={`min-h-[40px] h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-xs md:text-sm ${
									errors.lastName
										? "border-[#EF4444] focus-visible:ring-[#EF4444]/20"
										: ""
								}`}
							/>
							{errors.lastName && (
								<p className="mt-1 text-xs text-[#EF4444]">
									{errors.lastName.message}
								</p>
							)}
						</div>
					)}
				/>

				<Controller
					name="employmentType"
					control={control}
					render={({ field }) => (
						<div>
							<label className="block text-xs text-[#6B7280] mb-1.5">
								Employment Type
							</label>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isSaving}
							>
								<SelectTrigger
									className={`min-h-[40px] h-auto w-full px-4 bg-[#F9FAFB] border-border rounded-sm text-xs md:text-sm ${
										errors.employmentType
											? "border-[#EF4444] focus:ring-[#EF4444]/20"
											: ""
									}`}
								>
									<SelectValue placeholder="Select employment type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={EmploymentType.Employed}>
										Employed
									</SelectItem>
									<SelectItem value={EmploymentType.SelfEmployed}>
										Self Employed
									</SelectItem>
									<SelectItem value={EmploymentType.Freelancer}>
										Freelancer
									</SelectItem>
									<SelectItem value={EmploymentType.OFW}>
										Overseas Filipino Worker
									</SelectItem>
									{/* <SelectItem value="student">Student</SelectItem> */}
								</SelectContent>
							</Select>
							{errors.employmentType && (
								<p className="mt-1 text-xs text-[#EF4444]">
									{errors.employmentType.message}
								</p>
							)}
						</div>
					)}
				/>

				<Controller
					name="birthDate"
					control={control}
					render={({ field }) => {
						return (
							<div>
								<label className="block text-xs text-[#6B7280] mb-1.5">
									Date of Birth
								</label>
								<Popover>
									<PopoverTrigger asChild>
										<button
											type="button"
											disabled={isSaving}
											className={`w-full min-h-[40px] px-4 bg-[#F9FAFB] text-sm border border-border rounded-sm focus:outline-none focus:ring-2 transition-all text-left flex items-center justify-between ${
												field.value ? "text-primary" : "text-gray-400"
											} ${
												errors.birthDate
													? "border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]"
													: "focus:border-[#3A52A6] focus:ring-[#3A52A6]/20"
											} disabled:bg-gray-100 disabled:cursor-not-allowed`}
										>
											<span className="text-xs md:text-sm">
												{field.value
													? format(field.value, "MMMM d, yyyy")
													: "Set date"}
											</span>
										</button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											captionLayout="dropdown"
											disabled={(date) => date > new Date()}
										/>
									</PopoverContent>
								</Popover>
								{errors.birthDate && (
									<p className="mt-1 text-xs text-[#EF4444]">
										{errors.birthDate.message}
									</p>
								)}
							</div>
						);
					}}
				/>

				<Controller
					name="contact.value"
					control={control}
					render={({ field }) => (
						<div>
							<label className="block text-xs text-[#6B7280] mb-1.5">
								Contact Number
							</label>
							<Input
								{...field}
								type="tel"
								disabled={isSaving}
								className={`min-h-[40px] h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-xs md:text-sm ${
									errors.contact?.value
										? "border-[#EF4444] focus-visible:ring-[#EF4444]/20"
										: ""
								}`}
							/>
							{errors.contact?.value && (
								<p className="mt-1 text-xs text-[#EF4444]">
									{errors.contact.value?.message}
								</p>
							)}
						</div>
					)}
				/>
			</div>

			{/* Form submit button is handled by parent component */}
			{isSaving && (
				<div className="text-center text-sm text-gray-500">
					Saving changes...
				</div>
			)}
		</form>
	);
});

IndividualSponsorProfileForm.displayName = "IndividualSponsorProfileForm";

export default IndividualSponsorProfileForm;