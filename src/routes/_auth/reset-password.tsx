import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import type { JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { validateResetToken, resetPassword } from "@/lib/user/password";
import { SEO } from "@/components/SEO";

const resetPasswordSearchSchema = z.object({
	token: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/reset-password")({
	validateSearch: resetPasswordSearchSchema,
	component: ResetPasswordPage,
});

const resetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(1, "Password is required")
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_\-+.,:;])/,
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
			),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPage(): JSX.Element {
	const navigate = useNavigate();
	const { token } = Route.useSearch();
	const { toast, showError } = useToast();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	// ── Token validation ──────────────────────────────────────────────────────
	const tokenQuery = useQuery({
		queryKey: ["reset-token", token],
		queryFn: () => validateResetToken(token),
		enabled: !!token,
		retry: false,
		staleTime: Number.POSITIVE_INFINITY,
	});

	// ── Form ──────────────────────────────────────────────────────────────────
	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		mode: "onBlur",
	});

	const mutation = useMutation({
		mutationFn: (data: ResetPasswordFormData) =>
			resetPassword(token, data.newPassword),
		onSuccess: () => {
			setIsSuccess(true);
		},
		onError: (err) => {
			showError("Error", err.message);
			console.error(err);
		},
	});

	const onSubmit = (value: ResetPasswordFormData) => {
		mutation.mutate(value);
	};

	const handleGoToLogin = async () => {
		await navigate({ to: "/login" });
	};

	// ── Render: no token in URL ───────────────────────────────────────────────
	if (!token) {
		return <InvalidTokenView />;
	}

	// ── Render: validating token ──────────────────────────────────────────────
	if (tokenQuery.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<Loader2 className="w-6 h-6 animate-spin text-[#3A52A6]" />
			</div>
		);
	}

	// ── Render: invalid / expired token ──────────────────────────────────────
	if (tokenQuery.isError) {
		return <InvalidTokenView />;
	}

	// ── Render: success ───────────────────────────────────────────────────────
	if (isSuccess) {
		return (
			<motion.div
				className="rounded-2xl py-8 px-10 md:py-10 md:px-12 lg:py-8 lg:px-10 sm:py-6 sm:px-6 shadow-[1px_1px_4px_1px_rgba(96,126,242,0.5)] bg-[#F0F7FF] w-full max-w-md mx-auto text-center"
				initial={{ opacity: 0, scale: 0.97 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				<div className="mx-auto w-16 h-16 sm:w-14 sm:h-14 xl:w-20 xl:h-20 rounded-full flex items-center justify-center">
					<ShieldCheck className="w-7 h-7 sm:w-6 sm:h-6 xl:w-9 xl:h-9 text-[#3A52A6]" />
				</div>
				<h1 className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl mb-2 text-[#3F58B2]">
					Password Reset!
				</h1>
				<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C] mb-6 max-w-xs mx-auto">
					Your password has been updated successfully. You can now log in with
					your new password.
				</p>
				<button
					type="button"
					onClick={handleGoToLogin}
					className="w-full py-3 sm:py-3 xl:py-3.5 rounded-lg text-[#F0F7FF] text-xs sm:text-[11px] xl:text-sm cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md transition-all bg-[#3A52A6]"
				>
					Go to Login
				</button>
			</motion.div>
		);
	}

	// ── Render: reset form ────────────────────────────────────────────────────
	return (
		<>
			<SEO title="Reset Password" noindex={true} />
			{toast && <Toast {...toast} />}

			<motion.div
				className="rounded-2xl py-6 px-10 md:py-8 md:px-12 lg:py-6 lg:px-10 sm:py-5 sm:px-6 shadow-[1px_1px_4px_1px_rgba(96,126,242,0.5)] bg-[#F0F7FF] w-full max-w-md mx-auto"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -20 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				<div>
					<div className="text-center mb-8 sm:mb-6">
						<div className="mx-auto mb-4 w-12 h-12 sm:w-10 sm:h-10 xl:w-14 xl:h-14 rounded-full bg-[#E8EDFF] flex items-center justify-center">
							<ShieldCheck className="w-5 h-5 sm:w-4 sm:h-4 xl:w-6 xl:h-6 text-[#3A52A6]" />
						</div>
						<h1 className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl mb-1 text-[#3F58B2]">
							Reset Password
						</h1>
						{tokenQuery.data?.maskedEmail && (
							<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C]">
								for{" "}
								<span className="font-medium text-primary">
									{tokenQuery.data.maskedEmail}
								</span>
							</p>
						)}
					</div>

					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 sm:space-y-3"
					>
						{/* New Password */}
						<div>
							<label
								htmlFor="newPassword"
								className="block text-xs sm:text-[11px] xl:text-sm text-primary mb-1.5"
							>
								New Password
							</label>
							<div className="relative">
								<input
									id="newPassword"
									type={showPassword ? "text" : "password"}
									placeholder="Enter new password"
									{...form.register("newPassword")}
									disabled={mutation.isPending}
									className={`w-full px-4 py-3 sm:px-3 sm:py-2.5 xl:py-3 pr-10 rounded-lg text-xs sm:text-[11px] xl:text-sm focus:outline-none focus:ring-1 transition-all bg-transparent border text-primary placeholder:text-[#C4CBD5] ${
										form.formState.errors.newPassword
											? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
											: "border-[#C4CBD5] focus:border-[#3A52A6] focus:ring-[#3A52A6]"
									}`}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-secondary transition-colors cursor-pointer"
									tabIndex={-1}
								>
									{showPassword ? (
										<EyeOff className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200" />
									) : (
										<Eye className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200" />
									)}
								</button>
							</div>
							{form.formState.errors.newPassword && (
								<p className="mt-1 text-[10px] sm:text-[9px] xl:text-xs text-[#EF4444]">
									{form.formState.errors.newPassword.message}
								</p>
							)}
						</div>

						{/* Confirm Password */}
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-xs sm:text-[11px] xl:text-sm text-primary mb-1.5"
							>
								Confirm Password
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm new password"
									{...form.register("confirmPassword")}
									disabled={mutation.isPending}
									className={`w-full px-4 py-3 sm:px-3 sm:py-2.5 xl:py-3 pr-10 rounded-lg text-xs sm:text-[11px] xl:text-sm focus:outline-none focus:ring-1 transition-all bg-transparent border text-primary placeholder:text-[#C4CBD5] ${
										form.formState.errors.confirmPassword
											? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
											: "border-[#C4CBD5] focus:border-[#3A52A6] focus:ring-[#3A52A6]"
									}`}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-secondary transition-colors cursor-pointer"
									tabIndex={-1}
								>
									{showConfirmPassword ? (
										<EyeOff className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200" />
									) : (
										<Eye className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200" />
									)}
								</button>
							</div>
							{form.formState.errors.confirmPassword && (
								<p className="mt-1 text-[10px] sm:text-[9px] xl:text-xs text-[#EF4444]">
									{form.formState.errors.confirmPassword.message}
								</p>
							)}
						</div>

						{/* Password requirements hint */}
						<p className="text-[10px] sm:text-[9px] xl:text-xs text-[#8C8C8C]">
							Use 8+ characters with uppercase, lowercase, a number, and a
							special character.
						</p>

						<button
							type="submit"
							className={`w-full py-3 sm:py-3 xl:py-3.5 mt-2 rounded-lg text-[#F0F7FF] text-xs sm:text-[11px] xl:text-sm cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md transition-all bg-[#3A52A6] ${
								mutation.isPending && "opacity-60 cursor-not-allowed"
							}`}
							disabled={mutation.isPending}
						>
							{mutation.isPending ? (
								<span className="flex items-center justify-center">
									<Loader2 className="w-4 h-4 animate-spin" />
								</span>
							) : (
								<span>Reset Password</span>
							)}
						</button>
					</form>
				</div>
			</motion.div>
		</>
	);
}

/** Shown when the reset token is missing, invalid, or expired. */
function InvalidTokenView(): JSX.Element {
	return (
		<motion.div
			className="rounded-2xl py-8 px-10 md:py-10 md:px-12 lg:py-8 lg:px-10 sm:py-6 sm:px-6 shadow-[1px_1px_4px_1px_rgba(96,126,242,0.5)] bg-[#F0F7FF] w-full max-w-md mx-auto text-center"
			initial={{ opacity: 0, scale: 0.97 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3, ease: "easeInOut" }}
		>
			<div className="mx-auto w-16 h-16 sm:w-14 sm:h-14 xl:w-20 xl:h-20 rounded-full flex items-center justify-center">
				<AlertCircle className="w-7 h-7 sm:w-6 sm:h-6 xl:w-9 xl:h-9 text-[#EF4444]" />
			</div>
			<h1 className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl mb-2 text-[#3F58B2]">
				Link Invalid or Expired
			</h1>
			<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C] mb-6 max-w-xs mx-auto">
				This password reset link is no longer valid. Reset links expire after
				15 minutes and can only be used once.
			</p>
			<Link
				to="/forgot-password"
				className="block w-full py-3 sm:py-3 xl:py-3.5 rounded-lg text-[#F0F7FF] text-xs sm:text-[11px] xl:text-sm cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md transition-all bg-[#3A52A6] text-center"
			>
				Request New Reset Link
			</Link>
			<Link
				to="/login"
				className="inline-flex items-center gap-1.5 mt-4 text-[#8C8C8C] hover:text-secondary text-[11px] sm:text-xs xl:text-sm transition-colors"
			>
				<ArrowLeft className="w-3.5 h-3.5" />
				Back to Login
			</Link>
		</motion.div>
	);
}
