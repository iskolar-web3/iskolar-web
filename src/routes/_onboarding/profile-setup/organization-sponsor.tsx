import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/auth";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { SEO } from "@/components/SEO";
import Toast from "@/components/Toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { getDefaultPathOfRole } from "@/lib/api";
import { createOrganizationSponsor } from "@/lib/sponsor/api";
import {
	createOrganizationSponsorRequestSchema,
	OrganizationType,
	SponsorType,
	type CreateOrganizationSponsorRequest,
} from "@/lib/sponsor/model";
import { ContactType } from "@/lib/user/model";
import type { JSX } from "react";

export const Route = createFileRoute(
	"/_onboarding/profile-setup/organization-sponsor",
)({
	component: OrganizationSponsorProfileSetup,
});

function OrganizationSponsorProfileSetup(): JSX.Element {
	const navigate = useNavigate();
	const auth = useAuth();
	const { toast, showSuccess, showError } = useToast();

	const form = useForm<CreateOrganizationSponsorRequest>({
		resolver: zodResolver(createOrganizationSponsorRequestSchema),
		mode: "onBlur",
		defaultValues: {
			userId: auth.user?.id,
			sponsorType: SponsorType.Organization,
			name: "",
			organizationType: undefined,
			contact: {
				contactType: ContactType.Phone,
				value: "",
			},
		},
	});

	const mutation = useMutation({
		mutationFn: createOrganizationSponsor,
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
							<div>
								<input
									type="text"
									disabled={mutation.isPending}
									{...form.register("name")}
									className={`w-full px-4 py-3 sm:py-3.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
										form.formState.errors.name
											? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
											: "border-gray-300 focus:border-secondary focus:ring-secondary/20 text-primary"
									}`}
									placeholder="What's your organization name?"
								/>
								{form.formState.errors.name && (
									<p className="mt-1 text-xs text-destructive">
										{form.formState.errors.name.message}
									</p>
								)}
							</div>

							<div>
								<Select
									value={form.watch("organizationType")}
									disabled={mutation.isPending}
									onValueChange={(value) =>
										form.setValue(
											"organizationType",
											value as OrganizationType,
											{ shouldValidate: true },
										)
									}
								>
									<SelectTrigger
										className={`w-full text-sm cursor-pointer px-4 border rounded-lg focus:outline-none focus:ring-2 transition-all data-placeholder:text-gray-400 ${
											form.formState.errors.organizationType
												? "border-destructive focus:border-destructive focus:ring-destructive text-primary"
												: "border-gray-300 focus:border-secondary focus:ring-secondary/20 text-primary"
										}`}
									>
										<SelectValue placeholder="Select your organization type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={OrganizationType.PrivateCompany}>
											Private Company
										</SelectItem>
										<SelectItem
											value={OrganizationType.NonGovernmentalOrganization}
										>
											Non-Governmental Organization
										</SelectItem>
										<SelectItem value={OrganizationType.EducationalInstitution}>
											Educational Institution
										</SelectItem>
									</SelectContent>
								</Select>
								{form.formState.errors.organizationType && (
									<p className="mt-1 text-xs text-destructive">
										{form.formState.errors.organizationType.message}
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
