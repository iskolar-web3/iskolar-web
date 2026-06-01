import { createFileRoute, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { JSX } from "react";
import { SEO } from "@/components/SEO";
import { UserRole } from "@/lib/user/model";

export const Route = createFileRoute("/terms-conditions")({
	component: TermsConditionsPage,
	beforeLoad: async ({ context }) => {
		let currentUser = context.auth.user;

		if (!currentUser) {
			const ses = await context.auth.getSession();
			if (!ses) return;
			currentUser = ses.user;
		}

		switch (currentUser.role?.code) {
			case UserRole.Student:
				throw redirect({ to: "/home" });
			case UserRole.Sponsor:
				throw redirect({ to: "/scholarships" });
			default:
				throw redirect({ to: "/role-selection" });
		}
	},
});

function TermsConditionsPage(): JSX.Element {
	return (
		<>
			<SEO title="Terms and Conditions" canonicalPath="/terms-conditions" />

			<div
				className="min-h-screen flex items-center justify-center px-6 py-12"
				style={{
					backgroundImage: "url('/background.jpg')",
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
			>
				<div className="w-full max-w-3xl">
					<motion.div
						className="rounded-xl py-6 px-8 md:py-8 md:px-10 shadow-[1px_1px_4px_1px_rgba(96,126,242,0.5)] bg-[#F0F7FF] w-full"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 20 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<div className="flex items-center justify-between gap-4 mb-6">
							<button
								type="button"
								onClick={() => window.history.back()}
								className="inline-flex items-center gap-1.5 text-[#8C8C8C] hover:text-secondary text-xs sm:text-[11px] xl:text-sm transition-colors cursor-pointer"
							>
								<ArrowLeft className="w-3.5 h-3.5" />
								Back
							</button>
						</div>

						<div className="space-y-4 text-primary">
							<div className="space-y-1">
								<h1 className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl text-[#3F58B2]">
									Terms and Conditions
								</h1>
								<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C]">
									Acceptance of Terms. By downloading, installing, or using the
									iSkolar mobile application, you agree to be bound by these Terms and
									Conditions. If you do not agree, please do not use the app.
								</p>
							</div>

							<div className="rounded-lg border border-[#C4CBD5] bg-white/60 px-5 py-4 max-h-[60vh] overflow-auto">
								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										1. User Accounts
									</h2>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>
											Registration. You must provide accurate, current, and complete
											information during registration (Email, Name, Organization
											details).
										</li>
										<li>
											Security. You are responsible for maintaining the confidentiality
											of your login credentials. You agree not to share your password or
											OTP with others.
										</li>
										<li>
											Eligibility. You must be a bona fide student or a legitimate
											representative of a scholarship-providing organization.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										2. User Roles and Responsibilities
									</h2>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>
											Students: You agree to submit authentic documents (grades, IDs,
											etc.). You may only submit one application per scholarship.
											Falsification of documents may result in a permanent ban.
										</li>
										<li>
											Sponsors: You agree to post only legitimate scholarship programs.
											You must not use applicant data for any purpose other than
											evaluating scholarship eligibility. You are responsible for
											fulfilling the financial obligations of the scholarships you post.
											iSkolar is not the funding provider.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										3. Acceptable Use
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										You agree not to:
									</p>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>Post false, misleading, or fraudulent scholarship listings.</li>
										<li>
											Upload content that is offensive, illegal, or violates the rights
											of others.
										</li>
										<li>
											Attempt to hack, reverse engineer, or disrupt the iSkolar system.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										4. Platform Role and Disclaimers
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										We provide the platform to connect Students and Sponsors. We are
										not a scholarship provider (unless explicitly stated) and we do not
										guarantee that a student will receive a scholarship. iSkolar is not
										liable for any Sponsor failing to disburse funds to a selected
										scholar. While we allow Admins to flag and remove suspicious posts,
										we do not guarantee the accuracy of every listing.
									</p>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										5. Account Termination
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										Admin Rights. iSkolar Administrators reserve the right to suspend,
										deactivate, or delete your account if you violate these Terms,
										particularly regarding fraudulent posts or fake applications.
										Deactivated accounts are restricted from logging in.
									</p>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										6. Intellectual Property
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										The design, source code, and "iSkolar" branding are the property of
										the University of Makati / Project Team (Group 5). You retain
										ownership of the documents and images you upload, but you grant
										iSkolar a license to display and process them for the purpose of
										the app's services.
									</p>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										7. Limitation of Liability
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										To the fullest extent permitted by law, iSkolar and its developers
										shall not be liable for any indirect, incidental, or consequential
										damages arising from your use of the app, including but not limited
										to loss of data or loss of scholarship opportunities.
									</p>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										8. Governing Law
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										These Terms are governed by the laws of the Republic of the
										Philippines. Any disputes shall be resolved in the courts of Makati
										City.
									</p>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										9. Changes to Terms
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										We reserve the right to modify these Terms at any time. Continued
										use of the app after changes constitutes acceptance of the new
										Terms.
									</p>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-2">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										10. Contact Us
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										If you have questions about this Privacy Policy or wish to exercise
										your privacy rights, please contact our Data Protection Officer at:
									</p>
									<p className="text-xs sm:text-[11px] xl:text-sm font-medium">
										scholarpass23@gmail.com
									</p>
								</section>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</>
	);
}
