import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import type { JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "@/lib/user/password";

export const Route = createFileRoute("/_auth/forgot-password")({
	component: ForgotPasswordPage,
});

const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.regex(
			/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
			"Please enter a valid email address",
		),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordPage(): JSX.Element {
	usePageTitle("Forgot Password");

	const navigate = useNavigate();
	const { toast, showError } = useToast();

	const form = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		mode: "onBlur",
	});

	const mutation = useMutation({
		mutationFn: (data: ForgotPasswordFormData) =>
			requestPasswordReset(data.email),
		onSuccess: async (_res, variables) => {
			await navigate({
				to: "/confirmation",
				search: { email: variables.email },
			});
		},
		onError: (err) => {
			showError("Error", err.message);
			console.error(err);
		},
	});

	const onSubmit = (value: ForgotPasswordFormData) => {
		mutation.mutate(value);
	};

	return (
		<>
			{toast && <Toast {...toast} />}

			<motion.div
				className="rounded-2xl py-6 px-10 md:py-8 md:px-12 lg:py-6 lg:px-10 sm:py-5 sm:px-6 shadow-[1px_1px_4px_1px_rgba(96,126,242,0.5)] bg-[#F0F7FF] w-full max-w-md mx-auto"
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: 20 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				<div>
					{/* Back to login */}
					<Link
						to="/login"
						className="inline-flex items-center gap-1.5 text-[#8C8C8C] hover:text-secondary text-xs sm:text-[11px] xl:text-sm transition-colors mb-6"
					>
						<ArrowLeft className="w-3.5 h-3.5" />
						Back to Login
					</Link>

					<div className="text-center mb-8 sm:mb-6">
						{/* Icon */}
						<div className="mx-auto mb-4 w-12 h-12 sm:w-10 sm:h-10 xl:w-14 xl:h-14 rounded-full bg-[#E8EDFF] flex items-center justify-center">
							<Mail className="w-5 h-5 sm:w-4 sm:h-4 xl:w-6 xl:h-6 text-[#3A52A6]" />
						</div>
						<h1 className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl mb-1 text-[#3F58B2]">
							Forgot Password?
						</h1>
						<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C] max-w-xs mx-auto">
							Enter your email address and we'll send you a link to reset your
							password.
						</p>
					</div>

					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 sm:space-y-3"
					>
						<div>
							<label
								htmlFor="email"
								className="block text-xs sm:text-[11px] xl:text-sm text-primary mb-1.5"
							>
								Email Address
							</label>
							<input
								id="email"
								type="email"
								placeholder="Enter your email"
								{...form.register("email")}
								disabled={mutation.isPending}
								className={`w-full px-4 py-3 sm:px-3 sm:py-2.5 xl:py-3 rounded-lg text-xs sm:text-[11px] xl:text-sm focus:outline-none focus:ring-1 transition-all bg-transparent border text-primary placeholder:text-[#C4CBD5] ${
									form.formState.errors.email
										? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
										: "border-[#C4CBD5] focus:border-[#3A52A6] focus:ring-[#3A52A6]"
								}`}
							/>
							{form.formState.errors.email && (
								<p className="mt-1 text-[10px] sm:text-[9px] xl:text-xs text-[#EF4444]">
									{form.formState.errors.email.message}
								</p>
							)}
						</div>

						<button
							type="submit"
							className={`w-full py-3 sm:py-3 xl:py-3.5 mt-6 sm:mt-5 rounded-lg text-[#F0F7FF] text-xs sm:text-[11px] xl:text-sm cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md transition-all bg-[#3A52A6] ${
								mutation.isPending && "opacity-60 cursor-not-allowed"
							}`}
							disabled={mutation.isPending}
						>
							{mutation.isPending ? (
								<span className="flex items-center justify-center">
									<Loader2 className="w-4 h-4 animate-spin" />
								</span>
							) : (
								<span>Send Reset Link</span>
							)}
						</button>
					</form>
				</div>
			</motion.div>
		</>
	);
}
