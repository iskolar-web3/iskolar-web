import { createFileRoute, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { JSX } from "react";
import { JsonLd } from "@/components/JsonLd";
import { SEO } from "@/components/SEO";
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
					url: "https://www.iskolar.io/privacy-policy",
					isPartOf: {
						"@type": "WebSite",
						name: "iSkolar",
						url: "https://www.iskolar.io",
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
									how we collect, use, share, and protect your information when
									you use the iSkolar platform (web application and related
									services). This policy is drafted in compliance with the Data
									Privacy Act of 2012 (RA 10173) of the Philippines.
								</p>
								<p className="text-[11px] sm:text-xs xl:text-sm text-[#8C8C8C]">
									Last updated: June 7, 2026.
								</p>
							</div>

							<div className="rounded-lg border border-[#C4CBD5] bg-white/60 px-5 py-4 max-h-[60vh] overflow-auto">
								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										1. Information We Collect
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										We collect the following types of data to facilitate
										scholarship matching, application management, identity
										verification, and disbursement:
									</p>

									<div className="space-y-2">
										<h3 className="text-xs sm:text-[11px] xl:text-sm font-semibold">
											(a) Personal Information
										</h3>
										<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
											<li>
												Students: full name (first, middle, last), gender, date
												of birth, civil status, nationality, contact number,
												email address, residential and birth-place address
												(region, province, city, barangay), profile image, and
												educational details such as school, course, year level,
												student ID number, and expected graduation date.
											</li>
											<li>
												Individual Sponsors: full name, email address, date of
												birth, gender, nationality, and employment or
												source-of-income details.
											</li>
											<li>
												Organization & Government Sponsors: organization or
												agency name and type, industry sector, registration
												number, Tax Identification Number (TIN), date of
												incorporation, country of registration, and authorized
												representative details.
											</li>
										</ul>
									</div>

									<div className="space-y-2">
										<h3 className="text-xs sm:text-[11px] xl:text-sm font-semibold">
											(b) Identity Verification Data
										</h3>
										<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
											<li>
												iSkolar uses Didit, a third-party identity verification
												(KYC) provider, to confirm the identity of students and
												individual sponsors. See Section 4 for how this works.
											</li>
											<li>
												When you start verification, we transmit your name and
												date of birth to Didit to pre-fill the verification
												session. The government-issued ID, selfie, and liveness
												check that Didit requires are submitted by you directly
												to Didit and are collected and processed on Didit's
												systems — not by iSkolar.
											</li>
											<li>
												iSkolar receives and stores only the verification
												outcome (pending, verified, rejected, or expired), a
												Didit session reference, the verification timestamp, and
												any rejection remarks. We do <strong>not</strong> store
												your ID document images or biometric data.
											</li>
										</ul>
									</div>

									<div className="space-y-2">
										<h3 className="text-xs sm:text-[11px] xl:text-sm font-semibold">
											(c) Sensitive Personal Information & Documents
										</h3>
										<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
											<li>
												To assess scholarship eligibility, students may upload
												documents such as Certificates of Registration (COR),
												Report of Grades (ROG), School IDs, Barangay
												Certificates, and household income information, along
												with answers to a sponsor's custom application form.
											</li>
											<li>
												Payment Details. For scholarship disbursement, students
												may provide payment method details such as the account
												holder name and account number, and parties may upload
												proof-of-disbursement documents.
											</li>
											<li>
												Academic Credentials. Where enabled, verified academic
												credentials and their metadata may be stored and issued
												through decentralized storage (IPFS) and the Lumen
												credential service (see Section 3).
											</li>
											<li>
												Account Credentials. We store your password in a hashed
												format (using bcrypt) for security. We never see your
												actual password. If you sign in with a Lumen wallet, we
												store your public wallet address.
											</li>
											<li>
												Usage Data. Information on how you use the platform,
												such as scholarship search history, application status
												tracking, login activity, and request logs (including
												timestamps and IP address) used for security and abuse
												prevention.
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
											For Students: to create your profile, match you with
											scholarships, submit your applications to Sponsors, and
											process disbursements.
										</li>
										<li>
											For Sponsors: to set up your account, verify identity or
											organization legitimacy, and allow you to review and
											select applicants.
										</li>
										<li>
											Identity Verification: to confirm that users are who they
											claim to be and to reduce fraud, via Didit (see Section
											4).
										</li>
										<li>
											For Admins: to monitor platform usage, generate reports,
											review verifications and credentials, and prevent fraud.
										</li>
										<li>
											System Operations: to authenticate users (login, JWT
											sessions, and OTP/email verification), reset passwords,
											send transactional notifications, and display application
											status updates.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										3. Data Sharing and Third-Party Service Providers
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										We do not sell your personal data. We share information only
										as described below:
									</p>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>
											With Sponsors. When a student applies for a scholarship
											("Apply Now"), their profile, application-form answers,
											and uploaded documents are shared directly with the
											specific Sponsor of that scholarship for evaluation.
										</li>
										<li>
											Didit — identity verification (KYC). Processes the
											identity data and documents you submit during
											verification.
										</li>
										<li>
											Microsoft Azure (Blob Storage) — secure cloud hosting and
											storage of uploaded files (profile images, scholarship
											images, application documents, and disbursement proofs),
											together with our PostgreSQL database.
										</li>
										<li>
											Google (Gmail API) — sending transactional emails such as
											email verification and password-reset messages.
										</li>
										<li>
											Lumen Wallet API and IPFS (via Pinata) — where the
											credential and wallet features are enabled, used to store
											academic credential files/metadata and to support
											wallet-based sign-in.
										</li>
										<li>
											Google Generative AI (Gemini) — where the document-assist
											and applicant-ranking features are enabled, used to
											extract text from submitted application documents to
											assist Sponsors in reviewing applicants.
										</li>
										<li>
											Legal Requirements. We may disclose your information if
											required by Philippine law or a valid court order.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										4. Identity Verification via Didit
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										To help keep the platform trustworthy, students and
										individual sponsors may be required to complete identity
										verification (KYC) through Didit before accessing certain
										features (for example, creating a scholarship). How it
										works:
									</p>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>
											We create a verification session with Didit and pass along
											your name and date of birth to pre-fill the session.
										</li>
										<li>
											You are redirected to Didit to complete verification,
											which typically includes presenting a government-issued ID
											and a selfie/liveness check. This information is provided
											by you directly to Didit and is governed by Didit's own
											privacy policy.
										</li>
										<li>
											Didit returns only a verification decision to iSkolar. We
											store the resulting status (pending, verified, rejected,
											or expired), a session reference, timestamps, and — if
											rejected — a reason. We do not receive or store your ID
											images or biometric data.
										</li>
										<li>
											If a verification is rejected, a short cooldown period may
											apply before you can try again. A verification badge may
											be shown on your profile to indicate that your identity
											has been verified.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										5. Data Storage and Security
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										Your data is stored in a PostgreSQL database and on cloud
										storage (Microsoft Azure). We use industry-standard measures
										to protect it, including password hashing (bcrypt),
										encrypted connections (HTTPS) in production, signed session
										tokens (JWT), rate limiting, and signature-verified webhooks
										for third-party callbacks. However, no method of
										transmission or storage is 100% secure, and while we strive
										to protect your data, we cannot guarantee absolute security.
									</p>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										6. Cookies and Local Storage
									</h2>
									<ul className="list-disc pl-5 text-xs sm:text-[11px] xl:text-sm space-y-1">
										<li>
											We use cookies to store authentication tokens that keep
											you signed in and secure your session.
										</li>
										<li>
											We use your browser's local storage for convenience
											features such as saving scholarship form drafts,
											remembering dismissed notices, and caching credential
											metadata. You can clear this at any time through your
											browser settings.
										</li>
									</ul>
								</section>

								<hr className="my-4 border-[#C4CBD5]" />

								<section className="space-y-3">
									<h2 className="text-sm sm:text-base xl:text-lg font-semibold text-[#3F58B2]">
										7. Retention of Data
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
										8. Your Rights (Data Privacy Act) Under RA 10173
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
										9. Contact Us
									</h2>
									<p className="text-xs sm:text-[11px] xl:text-sm">
										If you have questions about this Privacy Policy or wish to
										exercise your privacy rights, please contact us at:
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
