import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
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
	EducationLevel,
	Gender,
	updateStudentRequestSchema,
	type Student,
	type UpdateStudentRequest,
} from "@/lib/student/model";
import { format } from "date-fns";

/**
 * Props for StudentProfileForm component
 */
interface StudentProfileFormProps {
	/** Initial profile data to populate form */
	profile: Student;
	/** Whether the form is in edit mode */
	isEditing: boolean;
	/** Whether the form is currently submitting */
	isSaving: boolean;
	/** Callback when form is submitted */
	onSubmit: (data: UpdateStudentRequest) => Promise<void>;
}

/**
 * Student profile edit form component using react-hook-form
 * Handles validation and submission of student profile updates
 *
 * @param props - Component props
 * @returns Student profile form component
 */
const StudentProfileForm = forwardRef<HTMLFormElement, StudentProfileFormProps>(
	function StudentProfileForm(
		{ profile, isEditing, isSaving, onSubmit },
		ref,
	): JSX.Element {
        console.log(profile)
		const {
			control,
			handleSubmit,
			formState: { errors },
		} = useForm<UpdateStudentRequest>({
			resolver: zodResolver(updateStudentRequestSchema),
			mode: "onBlur",
			defaultValues: {
				id: profile.id,
				userId: profile.userId,
				firstName: profile.firstName,
				middleName: profile.middleName || "",
				lastName: profile.lastName,
				avatarUrl: profile.avatarUrl || "",
				birthDate: profile.birthDate,
				contact: {
					value: profile.contact.value,
					contactType: profile.contact.code,
				},
				gender: profile.gender.code,
				schoolName: profile.schoolName || "",
				educationLevel: profile.educationLevel?.code,
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
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
								{profile.firstName}
							</p>
						</div>
					</div>

					<div>
						<label className="block text-xs text-[#6B7280] mb-1.5">
							Middle Name
						</label>
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
								{profile.middleName}
							</p>
						</div>
					</div>

					<div>
						<label className="block text-xs text-[#6B7280] mb-1.5">
							Last Name
						</label>
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
								{profile.lastName}
							</p>
						</div>
					</div>

					<div>
						<label className="block text-xs text-[#6B7280] mb-1.5">
							Gender
						</label>
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
								{[
									{ value: Gender.Male, label: "Male" },
									{ value: Gender.Female, label: "Female" },
								].find((opt) => opt.value === profile.gender.code)?.label ||
									profile.gender.name ||
									"—"}
							</p>
						</div>
					</div>

					<div>
						<label className="block text-xs text-[#6B7280] mb-1.5">
							Date of Birth
						</label>
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
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
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-xs md:text-sm text-primary">
								{profile.contact.value || "—"}
							</p>
						</div>
					</div>

					<div>
						<label className="block text-xs text-[#6B7280] mb-1.5">
							School
						</label>
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
								{profile.schoolName || "—"}
							</p>
						</div>
					</div>

					<div>
						<label className="block text-xs text-[#6B7280] mb-1.5">
							Education Level
						</label>
						<div className="min-h-10 px-4 bg-[#F9FAFB] border border-border rounded-sm flex items-center gap-2">
							<p className="text-sm md:text-sm text-primary">
								{profile.educationLevel?.code === "secondary_education"
									? "Secondary Education (High School)"
									: profile.educationLevel?.code === "tertiary_education"
										? "Tertiary Education (Higher Education)"
										: "—"}
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
									className={`min-h-10 h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-sm md:text-sm ${
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
									className={`min-h-10 h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-sm md:text-sm ${
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
									className={`min-h-10 h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-sm md:text-sm ${
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
						name="gender"
						control={control}
						render={({ field }) => (
							<div>
								<label className="block text-xs text-[#6B7280] mb-1.5">
									Gender
								</label>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isSaving}
								>
									<SelectTrigger
										className={`min-h-10 h-auto w-full px-4 bg-[#F9FAFB] border-border rounded-sm text-sm md:text-sm ${
											errors.gender
												? "border-[#EF4444] focus:ring-[#EF4444]/20"
												: ""
										}`}
									>
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">Male</SelectItem>
										<SelectItem value="female">Female</SelectItem>
									</SelectContent>
								</Select>
								{errors.gender && (
									<p className="mt-1 text-xs text-[#EF4444]">
										{errors.gender.message}
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
												className={`w-full min-h-10 px-4 bg-[#F9FAFB] text-sm border border-border rounded-sm focus:outline-none focus:ring-2 transition-all text-left flex items-center justify-between ${
													field.value ? "text-primary" : "text-gray-400"
												} ${
													errors.birthDate
														? "border-[#EF4444] focus:ring-[#EF4444]/20 focus:border-[#EF4444]"
														: "focus:border-[#3A52A6] focus:ring-[#3A52A6]/20"
												} disabled:bg-gray-100 disabled:cursor-not-allowed`}
											>
												<span className="text-sm md:text-sm">
													{field.value
														? format(field.value, "MMMM d, yyyy")
														: "Set date"}
												</span>
												<CalendarIcon className="h-4 w-4 opacity-50" />
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
									className={`min-h-10 h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-xs md:text-sm ${
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

					<Controller
						name="schoolName"
						control={control}
						render={({ field }) => (
							<div>
								<label className="block text-xs text-[#6B7280] mb-1.5">
									School
								</label>
								<Input
									{...field}
									disabled={isSaving}
									className={`min-h-10 h-auto px-4 bg-[#F9FAFB] border-border rounded-sm text-sm md:text-sm ${
										errors.schoolName
											? "border-[#EF4444] focus-visible:ring-[#EF4444]/20"
											: ""
									}`}
									placeholder="Enter your school name"
								/>
								{errors.schoolName && (
									<p className="mt-1 text-xs text-[#EF4444]">
										{errors.schoolName.message}
									</p>
								)}
							</div>
						)}
					/>

					<Controller
						name="educationLevel"
						control={control}
						render={({ field }) => (
							<div>
								<label className="block text-xs text-[#6B7280] mb-1.5">
									Education Level
								</label>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isSaving}
								>
									<SelectTrigger
										className={`min-h-10 h-auto w-full px-4 bg-[#F9FAFB] border-border rounded-sm text-sm md:text-sm ${
											errors.educationLevel
												? "border-[#EF4444] focus:ring-[#EF4444]/20"
												: ""
										}`}
									>
										<SelectValue placeholder="Select education level" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={EducationLevel.Secondary}>
											Secondary Education (High School)
										</SelectItem>
										<SelectItem value={EducationLevel.Tertiary}>
											Tertiary Education (Higher Education)
										</SelectItem>
									</SelectContent>
								</Select>
								{errors.educationLevel && (
									<p className="mt-1 text-xs text-[#EF4444]">
										{errors.educationLevel.message}
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

StudentProfileForm.displayName = "StudentProfileForm";

export default StudentProfileForm;
