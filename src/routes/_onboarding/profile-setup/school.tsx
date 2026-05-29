import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { SEO } from "@/components/SEO";

export const Route = createFileRoute("/_onboarding/profile-setup/school")({
	component: SchoolProfileSetup,
});

function SchoolProfileSetup() {
	const navigate = useNavigate();

	return (
		<>
			<SEO title="Profile Setup" noindex={true} />
			<FeedbackWidget />

			<motion.div
				className="min-h-screen flex items-center justify-center py-8 sm:py-12"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
			>
				<div className="w-full max-w-md text-center">
					<h1 className="text-3xl sm:text-4xl text-secondary mb-4">
						School Role Unavailable
					</h1>
					<p className="text-base text-secondary/80 mb-6">
						The school role is not available yet. Please select a different
						role.
					</p>
					<button
						type="button"
						onClick={() => navigate({ to: "/role-selection" })}
						className="px-6 py-3 bg-[#EFA508] hover:bg-[#D89407] text-tertiary rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
					>
						Back to Role Selection
					</button>
				</div>
			</motion.div>
		</>
	);
}
