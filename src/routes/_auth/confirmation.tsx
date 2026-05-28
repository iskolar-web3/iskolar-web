import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "@/lib/toast";
import type { JSX } from "react";
import { Loader2, MailCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/user/password";
import { SEO } from "@/components/SEO";

const confirmationSearchSchema = z.object({
	email: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/confirmation")({
	validateSearch: confirmationSearchSchema,
	component: ConfirmationPage,
});

/** Masks an email for display: "j***@example.com" */
function maskEmail(email: string): string {
	const atIndex = email.indexOf("@");
	if (atIndex <= 0) return email;
	const local = email.slice(0, atIndex);
	const domain = email.slice(atIndex);
	const visible = local.charAt(0);
	return `${visible}***${domain}`;
}

function ConfirmationPage(): JSX.Element {
	const navigate = useNavigate();
	const { email } = Route.useSearch();
	const [resendCooldown, setResendCooldown] = useState(0);

	const resendMutation = useMutation({
		mutationFn: () => {
			if (!email) throw new Error("No email address found. Please try again.");
			return requestPasswordReset(email);
		},
		onSuccess: () => {
			toast.success("Sent", "Reset link sent again. Please check your inbox.", 3000);
			// 60-second cooldown to prevent spam
			setResendCooldown(60);
			const interval = setInterval(() => {
				setResendCooldown((prev) => {
					if (prev <= 1) {
						clearInterval(interval);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		},
		onError: (err) => {
			toast.error("Error", err.message);
			console.error(err);
		},
	});

	const handleBackToLogin = async () => {
		await navigate({ to: "/login" });
	};

	return (
		<>
			<SEO title="Confirmation" noindex={true} />
			<motion.div
				className="rounded-xl py-8 px-10 md:py-10 md:px-12 lg:py-8 lg:px-10 sm:py-6 sm:px-6 shadow-[1px_1px_4px_1px_rgba(96,126,242,0.5)] bg-[#F0F7FF] w-full max-w-md mx-auto text-center"
				initial={{ opacity: 0, scale: 0.97 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.97 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				{/* Icon */}
				<div className="mx-auto w-16 h-16 sm:w-14 sm:h-14 xl:w-20 xl:h-20 rounded-full flex items-center justify-center">
					<MailCheck className="w-7 h-7 sm:w-6 sm:h-6 xl:w-9 xl:h-9 text-[#3A52A6]" />
				</div>

				<h1 className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl mb-2 text-[#3F58B2]">
					Check Your Email
				</h1>

				<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C]">
					We've sent a password reset link to
				</p>
				{email ? (
					<p className="text-xs sm:text-[11px] xl:text-sm font-medium text-primary mb-5">
						{maskEmail(email)}
					</p>
				) : (
					<p className="text-xs sm:text-[11px] xl:text-sm text-[#8C8C8C] mb-5">
						your email address.
					</p>
				)}

				<p className="text-[9px] sm:text-[11px] xl:text-[13px] text-[#8C8C8C] mb-6 max-w-xs mx-auto">
					The link expires in <span className="font-medium text-primary">15 minutes</span>.
                    <br />
					Check your spam folder if you don't see it.
				</p>

				{/* Resend */}
				<div className="mb-5">
					<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C] mb-2">
						Didn't receive it?
					</p>
					<button
						type="button"
						onClick={() => resendMutation.mutate()}
						disabled={resendMutation.isPending || resendCooldown > 0}
						className={`inline-flex items-center gap-1.5 cursor-pointer text-xs sm:text-[11px] xl:text-sm text-secondary hover:underline transition-colors ${
							(resendMutation.isPending || resendCooldown > 0) &&
							"opacity-50 cursor-not-allowed no-underline"
						}`}
					>
						{resendMutation.isPending ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : (
							<RefreshCw className="w-3.5 h-3.5" />
						)}
						{resendCooldown > 0
							? `Resend in ${resendCooldown}s`
							: "Resend email"}
					</button>
				</div>

				{/* Back to login */}
				<button
					type="button"
					onClick={handleBackToLogin}
					className="inline-flex items-center cursor-pointer gap-1.5 text-[#8C8C8C] hover:text-secondary text-[11px] sm:text-xs xl:text-sm transition-colors"
				>
					<ArrowLeft className="w-3.5 h-3.5" />
					Back to Login
				</button>
			</motion.div>
		</>
	);
}
