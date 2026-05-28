import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/auth";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { SEO } from "@/components/SEO";
import Toast from "@/components/Toast";
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
import { useToast } from "@/hooks/useToast";
import { getDefaultPathOfRole } from "@/lib/api";
import { createIndividualSponsor } from "@/lib/sponsor/api";
import {
	createIndividualSponsorRequestSchema,
	EmploymentType,
	SponsorType,
	type CreateIndividualSponsorRequest,
} from "@/lib/sponsor/model";
import { ContactType } from "@/lib/user/model";

export const Route = createFileRoute(
	"/_onboarding/profile-setup/individual-sponsor",
)({
	component: IndividualSponsorProfileSetup,
});

function IndividualSponsorProfileSetup() {
	const navigate = useNavigate();
	const auth = useAuth();
	const { toast, showSuccess, showError } = useToast();

	const form = useForm<CreateIndividualSponsorRequest>({
		resolver: zodResolver(createIndividualSponsorRequestSchema),
		mode: "onBlur",
		defaultValues: {
			userId: auth.user?.id,
			firstName: "",
			middleName: "",
			lastName: "",
			employmentType: undefined,
			birthDate: undefined,
			contact: {
				contactType: ContactType.Phone,
				value: "",
			},
			sponsorType: SponsorType.Individual,
		},
	});

	const mutation = useMutation({
		mutationFn: createIndividualSponsor,
		onSuccess: async () => {
			showSuccess(
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
			showError("Error", error.message, 2500);
		},
	});

	return (
		<>
			<SEO title="Profile Setup" noindex={true} />
			<FeedbackWidget />
			{toast && <Toast {...toast} />}

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
										disabled={mutation.isPending}
										{...form.register("firstName")}
										className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
											form.formState.errors.firstName
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-secondary focus:ring-secondary/20 text-primary"
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
										disabled={mutation.isPending}
										{...form.register("middleName")}
										className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
											form.formState.errors.middleName
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-secondary focus:ring-secondary/20 text-primary"
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
										disabled={mutation.isPending}
										{...form.register("lastName")}
										className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
											form.formState.errors.lastName
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-secondary focus:ring-secondary/20 text-primary"
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
									value={form.watch("employmentType")}
									disabled={mutation.isPending}
									onValueChange={(value) =>
										form.setValue("employmentType", value as EmploymentType, {
											shouldValidate: true,
										})
									}
								>
									<SelectTrigger
										className={`w-full cursor-pointer text-sm px-4 border rounded-lg focus:outline-none focus:ring-2 transition-all data-placeholder:text-gray-400 ${
											form.formState.errors.employmentType
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-secondary focus:ring-secondary/20 text-primary"
										}`}
									>
										<SelectValue placeholder="Select your employment type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={EmploymentType.Employed}>
											Employed
										</SelectItem>
										<SelectItem value={EmploymentType.SelfEmployed}>
											Self-Employed
										</SelectItem>
										<SelectItem value={EmploymentType.Freelancer}>
											Freelancer
										</SelectItem>
										<SelectItem value={EmploymentType.OFW}>
											Overseas Filipino Worker
										</SelectItem>
									</SelectContent>
								</Select>
								{form.formState.errors.employmentType && (
									<p className="mt-1 text-xs text-destructive">
										{form.formState.errors.employmentType.message}
									</p>
								)}
							</div>

							<div>
								<Popover>
									<PopoverTrigger asChild>
										<button
											type="button"
											className={`w-full px-4 cursor-pointer py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all text-left flex items-center justify-between ${
												form.watch("birthDate")
													? "text-primary"
													: "text-gray-400"
											} ${
												form.formState.errors.birthDate
													? "border-destructive focus:border-destructive focus:ring-destructive"
													: "border-gray-300 focus:border-secondary focus:ring-secondary/20"
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
											disabled={(date) =>
												date > new Date() || mutation.isPending
											}
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
									disabled={mutation.isPending}
									{...form.register("contact.value")}
									className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
										form.formState.errors.contact?.value
											? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
											: "border-gray-300 focus:border-secondary focus:ring-secondary/20 text-primary"
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

							<motion.button
								type="submit"
								disabled={!form.formState.isValid || mutation.isPending}
								className={`w-full py-3 sm:py-3.5 px-6 rounded-lg transition-all duration-300 text-tertiary text-xs sm:text-sm mt-3 ${
									form.formState.isValid && !mutation.isPending
										? "bg-[#EFA508] hover:bg-[#D89407] shadow-md hover:shadow-lg cursor-pointer"
										: "bg-muted-foreground cursor-not-allowed"
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
