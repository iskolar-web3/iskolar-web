import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Navbar from "@/components/landing/Navbar";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import { Hero } from "@/components/landing/sections/Hero";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { LocalTimeClock } from "@/components/landing/LocalTimeClock";
import { Suspense, lazy, useEffect } from "react";

// Lazy load below-the-fold sections
const HowItWorks = lazy(() =>
	import("@/components/landing/sections/HowItWorks").then((m) => ({
		default: m.HowItWorks,
	})),
);
const TargetUsers = lazy(() =>
	import("@/components/landing/sections/TargetUsers").then((m) => ({
		default: m.TargetUsers,
	})),
);
const Testimonials = lazy(() =>
	import("@/components/landing/sections/Testimonials").then((m) => ({
		default: m.Testimonials,
	})),
);
const Roadmap = lazy(() =>
	import("@/components/landing/sections/Roadmap").then((m) => ({
		default: m.Roadmap,
	})),
);
const CTA = lazy(() =>
	import("@/components/landing/sections/CTA").then((m) => ({ default: m.CTA })),
);
const FAQ = lazy(() =>
	import("@/components/landing/sections/FAQ").then((m) => ({ default: m.FAQ })),
);
const Footer = lazy(() =>
	import("@/components/landing/sections/Footer").then((m) => ({
		default: m.Footer,
	})),
);

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	useSmoothScroll();

	useEffect(() => {
		if (!window.location.hash) return;
		const hash = window.location.hash;
		let attempts = 0;
		const tryScroll = () => {
			const element = document.querySelector(hash);
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			} else if (attempts < 40) {
				attempts++;
				setTimeout(tryScroll, 50);
			}
		};

		tryScroll();
	}, []);

	return (
		<main className="relative min-h-screen bg-background">
			<SEO canonicalPath="/" />
			<Navbar />
			<AnimatedBackground />
			<Hero />
			<Suspense fallback={<div className="min-h-[50vh]" />}>
				<HowItWorks />
				<TargetUsers />
				<Roadmap />
				<Testimonials />
				<CTA />
				<FAQ />
				<Footer />
			</Suspense>
			<ScrollToTop />
			<LocalTimeClock />
		</main>
	);
}
