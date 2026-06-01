import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "@/components/SEO";
import { JsonLd } from "@/components/JsonLd";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Navbar from "@/components/landing/Navbar";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import { Hero } from "@/components/landing/sections/Hero";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { LocalTimeClock } from "@/components/landing/LocalTimeClock";
import { Suspense, lazy, useEffect } from "react";

// Lazy load below-the-fold sections
const Problem = lazy(() =>
	import("@/components/landing/sections/Problems").then((m) => ({
		default: m.Problem,
	})),
);
const Solution = lazy(() =>
	import("@/components/landing/sections/Solution").then((m) => ({
		default: m.Solution,
	})),
);
const TargetUsers = lazy(() =>
	import("@/components/landing/sections/TargetUsers").then((m) => ({
		default: m.TargetUsers,
	})),
);
const Features = lazy(() =>
	import("@/components/landing/sections/Feature").then((m) => ({
		default: m.Features,
	})),
);
const Roadmap = lazy(() =>
	import("@/components/landing/sections/Roadmap").then((m) => ({
		default: m.Roadmap,
	})),
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

	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "iSkolar",
		url: "https://iskolar.io",
	};

	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "iSkolar",
		url: "https://iskolar.io",
		logo: "https://iskolar.io/logo.jpg",
		description:
			"iSkolar is a scholarship platform connecting students with scholarship providers, making scholarships more accessible and transparent.",
		sameAs: [
			"https://www.facebook.com/profile.php?id=61575967087555",
			"https://www.linkedin.com/company/107364901",
			"https://discord.gg/Jw8xDA8Hnx",
		],
	};

	return (
		<main className="relative min-h-screen bg-background">
			<SEO canonicalPath="/" />
			<JsonLd data={websiteSchema} />
			<JsonLd data={organizationSchema} />
			<Navbar />
			<AnimatedBackground />
			<Hero />
			<Suspense fallback={<div className="min-h-[50vh]" />}>
				<Problem />
				<Solution />
				<TargetUsers />
				<Features />
				<Roadmap />
				<FAQ />
				<Footer />
			</Suspense>
			<ScrollToTop />
			<LocalTimeClock />
		</main>
	);
}
