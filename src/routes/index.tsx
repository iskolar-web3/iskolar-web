import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Navbar from "@/components/landing/Navbar";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import { Hero } from "@/components/landing/sections/Hero";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { IntroSplash } from "@/components/landing/IntroSplash";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";

// Lazy load below-the-fold sections
const Journey = lazy(() =>
	import("@/components/landing/sections/Journey").then((m) => ({
		default: m.Journey,
	})),
);
const Spotlight = lazy(() =>
	import("@/components/landing/sections/Spotlight").then((m) => ({
		default: m.Spotlight,
	})),
);
const Ecosystem = lazy(() =>
	import("@/components/landing/sections/Ecosystem").then((m) => ({
		default: m.Ecosystem,
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
	const [introDone, setIntroDone] = useState(false);
	const handleIntroDone = useCallback(() => setIntroDone(true), []);

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
		<main className="cursor-academic relative isolate min-h-screen bg-background">
			<SEO
				canonicalPath="/"
				description="iSkolar is a Philippine EdTech company building six connected products that support students from senior high to their first job: PathFinder, Review, iSkolar, Academy, Vocation, and Verity."
			/>
			<Navbar />
			<AnimatedBackground />
			<IntroSplash onDone={handleIntroDone} />
			<Hero ready={introDone} />
			<Suspense fallback={<div className="min-h-[50vh]" />}>
				<Journey />
				<Ecosystem />
				<Spotlight />
				<CTA />
				<FAQ />
				<Footer />
			</Suspense>
			<ScrollToTop />
		</main>
	);
}
