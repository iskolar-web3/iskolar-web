import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
// import { SiGoogle } from "react-icons/si";
import type { JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL, type ApiResponse } from "@/lib/api";
import type { User } from "@/lib/user/model";

export const Route = createFileRoute("/_auth/register")({
	component: RegisterPage,
});

// Registration Validation
const registerSchema = z
	.object({
		email: z
			.string()
			.min(1, "Email is required")
			.regex(
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
				"Please enter a valid email address",
			),
		password: z
			.string()
			.min(1, "Password is required")
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#_\-+.,:;])/,
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
			),
		confirmPassword: z.string().min(1, "Please confirm your password"),
		agreeToPolicies: z
			.boolean()
			.refine((v) => v === true, "You must agree to continue"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type RegisterFormData = z.infer<typeof registerSchema>;

async function register(value: RegisterFormData): Promise<User> {
	const { email, password, confirmPassword } = value;
	const response = await fetch(`${BACKEND_URL}/register`, {
		method: "POST",
		body: JSON.stringify({ email, password, confirmPassword }),
		headers: { "Content-Type": "application/json" },
	});
	const result: ApiResponse<User> = await response.json();
	if (!response.ok) {
		throw new Error(result.message || "Login failed");
	}

	return result.data;
}

function RegisterPage(): JSX.Element {
	const navigate = useNavigate();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { toast, showSuccess, showError } = useToast();

	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		mode: "onBlur",
		defaultValues: {
			agreeToPolicies: false,
		},
	});

	const mutation = useMutation({
		mutationFn: register,
		onSuccess: async () => {
			showSuccess(`Success`, "Registration successful", 1250);
			setTimeout(() => {
				navigate({ to: "/login" });
			}, 1250);
		},
		onError: (err) => {
			showError("Error", err.message);
			console.error(err);
		},
	});

	const onSubmit = async (value: RegisterFormData) => {
		mutation.mutate(value);
	};

	const agreed = form.watch("agreeToPolicies");

	// const handleGoogleSignUp = () => {
	// 	showError(`Error`, "Google Auth is not available at the moment.", 2500);

	// 	// Handle Google sign up
	// };

	return (
		<>
			<SEO title="Sign Up" noindex={true} />
			{toast && <Toast {...toast} />}

			<motion.div
				className="rounded-2xl py-6 px-10 md:py-8 md:px-12 lg:py-6 lg:px-10 sm:py-5 sm:px-6 shadow-[1px_1px_4px_1px_rgba(96,126,242,0.5)] bg-[#F0F7FF] min-h-[520px] sm:min-h-[480px] w-full max-w-md mx-auto"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -20 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				<div>
					<div className="text-center mb-8 sm:mb-6">
						<h1 className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl mb-1 text-[#3F58B2]">
							Create an Account
						</h1>
						<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C]">
							Already have an account?{" "}
							<Link to="/login" className="text-secondary hover:underline">
								Sign in
							</Link>
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
								Email
							</label>
							<input
								id="email"
								type="email"
								placeholder="Enter Email"
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

						<div>
							<label
								htmlFor="password"
								className="block text-xs sm:text-[11px] xl:text-sm text-primary mb-1.5"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter Password"
									{...form.register("password")}
									disabled={mutation.isPending}
									className={`w-full px-4 py-3 sm:px-3 sm:py-2.5 xl:py-3 pr-10 rounded-lg text-xs sm:text-[11px] xl:text-sm focus:outline-none focus:ring-1 transition-all bg-transparent border text-primary placeholder:text-[#C4CBD5] ${
										form.formState.errors.password
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
							{form.formState.errors.password && (
								<p className="mt-1 text-[10px] sm:text-[9px] xl:text-xs text-[#EF4444]">
									{form.formState.errors.password.message}
								</p>
							)}
							<p className="mt-1 text-[10px] sm:text-[9px] xl:text-xs text-[#8C8C8C]">
								Must be 8 characters, including uppercase, lowercase, number, and
								special character.
							</p>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-xs sm:text-[11px] xl:text-sm  text-primary mb-1.5"
							>
								Confirm Password
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm Password"
									{...form.register("confirmPassword")}
									disabled={mutation.isPending}
									className={`w-full px-4 py-3 sm:px-3 sm:py-2.5 xl:py-3 pr-10 rounded-lg text-xs sm:text-[11px] xl:text-sm  focus:outline-none focus:ring-1 transition-all bg-transparent border text-primary placeholder:text-[#C4CBD5] ${
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

						<div className="pt-1">
							<label className="flex items-start gap-2 cursor-pointer">
								<input
									type="checkbox"
									{...form.register("agreeToPolicies")}
									disabled={mutation.isPending}
									className="mt-0.5 w-3.5 h-3.5 xl:w-4 xl:h-4 rounded border-[#C4CBD5] text-secondary focus:ring-[#3A52A6] cursor-pointer"
								/>
								<span className="text-[11px] sm:text-[10px] xl:text-sm text-[#8C8C8C] leading-snug">
									I agree to the{" "}
									<Link
										to="/terms-conditions"
										className="text-secondary hover:underline"
									>
										Terms &amp; Conditions
									</Link>{" "}
									and{" "}
									<Link
										to="/privacy-policy"
										className="text-secondary hover:underline"
									>
										Privacy Policy
									</Link>
									.
								</span>
							</label>
							{form.formState.errors.agreeToPolicies && (
								<p className="mt-1 text-[10px] sm:text-[9px] xl:text-xs text-[#EF4444]">
									{form.formState.errors.agreeToPolicies.message}
								</p>
							)}
						</div>

						<button
							type="submit"
							className={`w-full py-3 sm:py-3 xl:py-3.5 mt-6 sm:mt-5 rounded-lg text-[#F0F7FF] text-xs sm:text-[11px] xl:text-sm cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md transition-all bg-[#3A52A6] ${
								(mutation.isPending || !agreed) && "opacity-60 cursor-not-allowed"
							}`}
							disabled={mutation.isPending || !agreed}
						>
							{mutation.isPending ? (
								<span className="flex items-center justify-center">
									<Loader2 className="w-4 h-4 animate-spin" />
								</span>
							) : (
								<span>Sign Up</span>
							)}
						</button>
					</form>

					{/* Divider */}
					{/* <div className="flex items-center my-5 sm:my-4">
						<div className="flex-1 border-t border-dashed border-[#3A52A6] opacity-50"></div>
						<span className="px-2 text-[10px] sm:text-[9px] xl:text-xs text-[#8C8C8C]">
							Or sign up with
						</span>
						<div className="flex-1 border-t border-dashed border-[#3A52A6] opacity-50"></div>
					</div> */}

					{/* Google sign up button */}
					{/* <div className="flex justify-center">
						<button
							onClick={handleGoogleSignUp}
							type="button"
							className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.25)] transition-all bg-[#F0F7FF] shadow-[0_2px_4px_0_rgba(0,0,0,0.25)] cursor-pointer"
						>
							<SiGoogle size={24} className="text-secondary sm:w-6 sm:h-6" />
						</button>
					</div> */}
				</div>
			</motion.div>
		</>
	);
}
