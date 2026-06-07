import { createFileRoute, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { JSX } from "react";
import { SEO } from "@/components/SEO";
import { JsonLd } from "@/components/JsonLd";
import { UserRole } from "@/lib/user/model";

export const Route = createFileRoute("/privacy-policy")({
	component: PrivacyPolicyPage,
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

function PrivacyPolicyPage(): JSX.Element {
	return (
		<>
			<SEO title="Privacy Policy" canonicalPath="/privacy-policy" />
			<JsonLd
				data={{
					"@context": "https://schema.org",
					"@type": "WebPage",
					name: "Privacy Policy",
					url: "https://iskolar.io/privacy-policy",
					isPartOf: {
						"@type": "WebSite",
						name: "iSkolar",
						url: "https://iskolar.io",
					},
				}}
			/>

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
									Privacy Policy
								</h1>
								<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C]">
									Welcome to iSkolar ("we," "us," or "our"). We are committed to
									protecting your personal data. This Privacy Policy explains
									how we collect, use, and protect your information when you use
									the iSkolar platform. This policy is drafted in compliance
									with the Data Privacy Act of 2012 (RA 10173) of the
									Philippines.
								</p>
							</div>

							<div className="rounded-lg border border-[#C4CBD5] bg-white/60 px-5 py-4 max-h-[60vh] overflow-auto">
								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										1. Information We Collect
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										We collect the following types of data to facilitate
										scholarship matching and management:
									</p>

									<div className="space-y-2">
										<h3 className="text-xs sm:text-[11px] xl:text-sm font-semibold">
											(a) Personal Information
										</h3>
										<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
											<li>
												Students: Full name, gender, date of birth, contact
												number, email address, and profile image.
											</li>
											<li>
												Sponsors: Organization name, organization type, official
												email, contact number, and representative details.
											</li>
										</ul>
									</div>

									<div className="space-y-2">
										<h3 className="text-xs sm:text-[11px] xl:text-sm font-semibold">
											(b) Sensitive Personal Information & Documents
										</h3>
										<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
											<li>
												To assess scholarship eligibility, students may upload
												documents such as Certificates of Registration (COR),
												Report of Grades (ROG), School IDs, Barangay
												Certificates, and household income information.
											</li>
											<li>
												Account Credentials. We store your password in a hashed
												format (using bcrypt) for security. We do not see your
												actual password.
											</li>
											<li>
												Usage Data. Information on how you use the app, such as
												scholarship search history and application status
												tracking.
											</li>
										</ul>
									</div>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										2. How We Use Your Information
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										We use your data for the following purposes:
									</p>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>
											For Students: To create your profile, match you with
											scholarships, and submit your applications to Sponsors.
										</li>
										<li>
											For Sponsors: To verify your organization and allow you to
											review applicants.
										</li>
										<li>
											For Admins: To monitor platform usage, generate reports,
											and prevent fraud.
										</li>
										<li>
											System Operations: To authenticate users (Login/OTP),
											reset passwords, and display application status updates.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										3. Data Sharing and Disclosure
									</h2>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>
											When a student applies for a scholarship ("Apply Now"),
											their profile, application form, and uploaded documents
											are shared directly with the specific Sponsor of that
											scholarship.
										</li>
										<li>
											Service Providers. We use third-party services like
											Microsoft Azure and PostgreSQL for cloud hosting and
											database management.
										</li>
										<li>
											Legal Requirements. We may disclose your information if
											required by Philippine law or a court order.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										4. Data Storage and Security
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										Your data is stored securely on cloud servers (Microsoft
										Azure). We use industry-standard encryption and password
										hashing to protect your account. However, no method of
										transmission over the internet is 100% secure. While we
										strive to protect your data, we cannot guarantee absolute
										security.
									</p>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										5. Retention of Data
									</h2>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>
											We retain your personal data only as long as necessary to
											provide the iSkolar services or as required by law.
										</li>
										<li>
											Deactivation. If an Admin deactivates a user, the data is
											restricted but not immediately permanently deleted to
											allow for reactivation if needed.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										6. Your Rights (Data Privacy Act) Under RA 10173
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										You have the right to:
									</p>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>Know what data we collect and how it is used.</li>
										<li>Request a copy of your personal data.</li>
										<li>
											Correct any inaccurate data (e.g., editing your profile).
										</li>
										<li>
											Request the deletion of your account and data (subject to
											administrative policies).
										</li>
										<li>
											Be indemnified for damages due to inaccurate, incomplete,
											outdated, false, unlawfully obtained, or unauthorized use
											of personal data.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-2">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										7. Contact Us
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										If you have questions about this Privacy Policy or wish to
										exercise your privacy rights, please contact our Data
										Protection Officer at:
									</p>
									<p className="text-xs sm:text-[11px] xl:text-sm font-medium">
										hello@iskolar.io
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
