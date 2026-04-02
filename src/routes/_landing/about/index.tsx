import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import { LocalTimeClock } from "@/components/landing/LocalTimeClock";
import Navbar from "@/components/landing/Navbar";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const CompanyOverviewSection = lazy(
	() => import("@/components/landing/about/CompanyOverview"),
);
const MissionVisionSection = lazy(
	() => import("@/components/landing/about/MissionVision"),
);
const TeamSection = lazy(() => import("@/components/landing/about/Team"));
const Partnerships = lazy(() =>
	import("@/components/landing/about/Partnerships").then((m) => ({
		default: m.Partnerships,
	})),
);
const Footer = lazy(() =>
	import("@/components/landing/sections/Footer").then((m) => ({
		default: m.Footer,
	})),
);

export const Route = createFileRoute("/_landing/about/")({
	component: About,
});

function About() {
	useSmoothScroll();

	useEffect(() => {
		// Handle hash scrolling on initial load
		if (window.location.hash) {
			const element = document.querySelector(window.location.hash);
			if (element) {
				setTimeout(() => {
					element.scrollIntoView({ behavior: "smooth" });
				}, 100);
			}
		}
	}, []);

	return (
		<main className="relative min-h-screen bg-background text-secondary">
			<SEO
				title="About Us"
				description="Learn about iSkolar's mission, vision, and the team building the future of scholarship management."
				canonicalPath="/about"
			/>
			<Navbar />
			<AnimatedBackground />

			<div className="pt-20">
				<Suspense fallback={<div className="min-h-[50vh]" />}>
					<CompanyOverviewSection />
					<MissionVisionSection />
					<TeamSection />
					<Partnerships />
					<Footer />
				</Suspense>
			</div>
			<ScrollToTop />
			<LocalTimeClock />
		</main>
	);
}
