import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/auth";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { SEO } from "@/components/SEO";
import { toast } from "@/lib/toast";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getDefaultPathOfRole } from "@/lib/api";
import { createStudent } from "@/lib/student/api";
import {
	createStudentRequestSchema,
	EducationLevel,
	Gender,
    type CreateStudentRequest,
} from "@/lib/student/model";
import { ContactType } from "@/lib/user/model";
import type { JSX } from "react";

export const Route = createFileRoute("/_onboarding/profile-setup/student")({
	component: StudentProfileSetup,
});

function StudentProfileSetup(): JSX.Element {
	const navigate = useNavigate();
	const auth = useAuth();
	const form = useForm<CreateStudentRequest>({
		resolver: zodResolver(createStudentRequestSchema),
		mode: "onBlur",
		defaultValues: {
			userId: auth.user?.id,
			firstName: "",
			middleName: "",
			lastName: "",
			gender: undefined,
			birthDate: undefined,
			contact: {
				contactType: ContactType.Phone,
				value: "",
			},
			schoolName: "",
			educationLevel: undefined,
		},
	});

	const mutation = useMutation({
		mutationFn: createStudent,
		onSuccess: async () => {
			toast.success(
				"Success",
				"Your profile has been set up successfully!",
				1250,
			);
			const session = await auth.getSession();
			if (session) {
				await navigate({ to: getDefaultPathOfRole(session.user) });
			}
		},
		onError: (error: Error) => {
			toast.error("Error", error.message, 2500);
		},
	});

	return (
		<>
			<SEO title="Profile Setup" noindex={true} />
			<FeedbackWidget />
			<motion.div
				className="min-h-screen flex items-center justify-center py-8 sm:py-12"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
			>
				<div className="w-full max-w-md">
					<motion.div
						className="text-center mb-8 sm:mb-10"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<h1 className="text-3xl sm:text-4xl md:text-5xl text-secondary mb-1.5 sm:mb-2">
							Welcome to iSkolar
						</h1>
						<p className="text-base sm:text-lg text-secondary/80">
							Complete your profile to get started
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
					>
						<form
							onSubmit={form.handleSubmit((data) => {
								mutation.mutate(data);
							})}
							className="space-y-4 sm:space-y-5"
						>
							<div className="flex space-x-2">
								<div className="flex-1">
									<input
										type="text"
										{...form.register("firstName")}
										className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
											form.formState.errors.firstName
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
										}`}
										placeholder="First name"
									/>
									{form.formState.errors.firstName && (
										<p className="mt-1 text-xs text-destructive">
											{form.formState.errors.firstName.message}
										</p>
									)}
								</div>

								<div className="flex-1">
									<input
										type="text"
										{...form.register("middleName")}
										className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
											form.formState.errors.middleName
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
										}`}
										placeholder="Middle name"
									/>
									{form.formState.errors.middleName && (
										<p className="mt-1 text-xs text-destructive">
											{form.formState.errors.middleName.message}
										</p>
									)}
								</div>

								<div className="flex-1">
									<input
										type="text"
										{...form.register("lastName")}
										className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
											form.formState.errors.lastName
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
										}`}
										placeholder="Last name"
									/>
									{form.formState.errors.lastName && (
										<p className="mt-1 text-xs text-destructive">
											{form.formState.errors.lastName.message}
										</p>
									)}
								</div>
							</div>

							<div>
								<Select
									value={form.watch("gender")}
									onValueChange={(value) =>
										form.setValue("gender", value as Gender, {
											shouldValidate: true,
										})
									}
								>
									<SelectTrigger
										className={`w-full px-4 cursor-pointer text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all data-placeholder:text-gray-400 ${
											form.formState.errors.gender
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
										}`}
									>
										<SelectValue placeholder="Select your gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={Gender.Male}>Male</SelectItem>
										<SelectItem value={Gender.Female}>Female</SelectItem>
									</SelectContent>
								</Select>
								{form.formState.errors.gender && (
									<p className="mt-1 text-xs text-destructive">
										{form.formState.errors.gender.message}
									</p>
								)}
							</div>

							<div>
								<Popover>
									<PopoverTrigger asChild>
										<button
											type="button"
											className={`w-full cursor-pointer px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all text-left flex items-center justify-between ${
												form.watch("birthDate")
													? "text-primary"
													: "text-gray-400"
											} ${
												form.formState.errors.birthDate
													? "border-destructive focus:border-destructive focus:ring-destructive"
													: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20"
											}`}
										>
											<span>
												{form.watch("birthDate")
													? form
															.watch("birthDate")
															.toLocaleDateString("en-US", {
																month: "long",
																day: "numeric",
																year: "numeric",
															})
													: "Set birth date"}
											</span>
											<CalendarIcon className="h-4 w-4 opacity-50" />
										</button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={form.watch("birthDate")}
											onSelect={(date) => {
												if (date) {
													form.setValue("birthDate", date, {
														shouldValidate: true,
													});
												}
											}}
											captionLayout="dropdown"
											disabled={(date) => date > new Date()}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								{form.formState.errors.birthDate && (
									<p className="mt-1 text-xs text-destructive">
										{form.formState.errors.birthDate.message}
									</p>
								)}
							</div>

							<div>
								<input
									type="tel"
									{...form.register("contact.value")}
									className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
										form.formState.errors.contact?.value
											? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
											: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
									}`}
									placeholder="Enter contact number"
									inputMode="numeric"
									onChange={(e) => {
										form.setValue(
											"contact.value",
											e.target.value.replace(/\D/g, ""),
											{ shouldValidate: true },
										);
									}}
								/>
								{form.formState.errors.contact?.value && (
									<p className="mt-1 text-xs text-destructive">
										{form.formState.errors.contact.value.message}
									</p>
								)}
							</div>

							<div>
								<Select
									value={form.watch("educationLevel")}
									onValueChange={(value) =>
										form.setValue("educationLevel", value as EducationLevel, {
											shouldValidate: true,
										})
									}
								>
									<SelectTrigger
										className={`w-full px-4 cursor-pointer text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all data-[placeholder]:text-gray-400 ${
											form.formState.errors.educationLevel
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
										}`}
									>
										<SelectValue placeholder="Select your education level" />
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
								{form.formState.errors.educationLevel && (
									<p className="mt-1 text-xs text-destructive">
										{form.formState.errors.educationLevel.message}
									</p>
								)}
							</div>

							<div>
								<input
									type="text"
									{...form.register("schoolName")}
									className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
										form.formState.errors.schoolName
											? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
											: "border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary"
									}`}
									placeholder="What school are you from?"
								/>
								{form.formState.errors.schoolName && (
									<p className="mt-1 text-xs text-destructive">
										{form.formState.errors.schoolName.message}
									</p>
								)}
							</div>

							<motion.button
								type="submit"
								disabled={!form.formState.isValid || mutation.isPending}
								className={`w-full py-3 sm:py-3.5 px-6 rounded-lg transition-all duration-300 text-tertiary text-xs sm:text-sm mt-3 ${
									form.formState.isValid && !mutation.isPending
										? "bg-[#EFA508] hover:bg-[#D89407] shadow-md hover:shadow-lg cursor-pointer"
										: "bg-[#9CA3AF] cursor-not-allowed"
								}`}
								whileHover={form.formState.isValid ? { scale: 1.02 } : {}}
								whileTap={form.formState.isValid ? { scale: 0.98 } : {}}
							>
								{mutation.isPending ? (
									<span className="flex items-center justify-center">
										<Loader2 className="w-4 h-4 animate-spin" />
									</span>
								) : (
									<span>Complete</span>
								)}
							</motion.button>
						</form>
					</motion.div>
				</div>
			</motion.div>
		</>
	);
}
