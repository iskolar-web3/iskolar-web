import { validateVerificationToken } from "@/lib/user/auth";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import type { JSX } from "react";
import { z } from "zod";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const searchSchema = z.object({
	token: z.string(),
});

export const Route = createFileRoute("/_auth/verify")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent(): JSX.Element {
	const search = Route.useSearch();
	const tokenQuery = useQuery({
		queryKey: ["email-verification-token", search.token],
		queryFn: () => validateVerificationToken(search.token),
		enabled: !!search.token,
		retry: false,
		staleTime: Number.POSITIVE_INFINITY,
	});

	return (
		<>
			<SEO title="Email Verification" noindex={true} />
			<motion.div
				className="rounded-xl py-10 px-10 md:py-12 md:px-12 lg:py-10 lg:px-10 sm:py-8 sm:px-6 shadow-[1px_1px_4px_1px_rgba(96,126,242,0.5)] bg-[#F0F7FF] w-full max-w-md mx-auto text-center"
				initial={{ opacity: 0, scale: 0.97 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.97 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				{tokenQuery.isLoading && (
					<div className="flex flex-col items-center gap-4 py-6">
						<Loader2 className="w-10 h-10 text-[#3A52A6] animate-spin" />
						<p className="text-sm sm:text-[13px] text-[#8C8C8C]">
							Verifying your email...
						</p>
					</div>
				)}

				{tokenQuery.isError && (
					<div className="flex flex-col items-center gap-3">
						<XCircle className="w-12 h-12 sm:w-10 sm:h-10 xl:w-14 xl:h-14 text-[#EF4444]" />
						<h1 className="text-lg sm:text-xl xl:text-2xl text-[#3F58B2]">
							Verification Failed
						</h1>
						<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C] max-w-xs">
							{tokenQuery.error?.message ||
								"This verification link is invalid or has expired."}
						</p>
						<div className="mt-4 flex flex-col items-center gap-2 w-full">
							<Link
								to="/verify-email"
								search={{ email: "" }}
								className="w-full py-3 sm:py-2.5 xl:py-3 rounded-lg text-[#F0F7FF] text-xs sm:text-[11px] xl:text-sm text-center cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md transition-all bg-[#3A52A6]"
							>
								Request New Link
							</Link>
							<Link
								to="/login"
								className="text-xs sm:text-[11px] xl:text-sm text-[#8C8C8C] hover:text-secondary transition-colors mt-1"
							>
								Back to Login
							</Link>
						</div>
					</div>
				)}

				{tokenQuery.isSuccess && (
					<div className="flex flex-col items-center gap-3">
						<CheckCircle className="w-12 h-12 sm:w-10 sm:h-10 xl:w-14 xl:h-14 text-[#3A52A6]" />
						<h1 className="text-lg sm:text-xl xl:text-2xl text-[#3F58B2]">
							Email Verified!
						</h1>
						<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C] max-w-xs">
							Your email has been successfully verified. You can now log in to
							your account.
						</p>
						<Link
							to="/login"
							className="mt-4 w-full py-3 sm:py-2.5 xl:py-3 rounded-lg text-[#F0F7FF] text-xs sm:text-[11px] xl:text-sm text-center cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:shadow-md transition-all bg-[#3A52A6]"
						>
							Go to Login
						</Link>
					</div>
				)}
			</motion.div>
		</>
	);
}
