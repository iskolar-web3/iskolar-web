import { createFileRoute } from "@tanstack/react-router";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Navbar from "@/components/landing/Navbar";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import { Hero } from "@/components/landing/sections/Hero";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { LocalTimeClock } from "@/components/landing/LocalTimeClock";
import { Suspense, lazy } from "react";

// Lazy load below-the-fold sections
const Problem = lazy(() => import("@/components/landing/sections/Problems").then(m => ({ default: m.Problem })));
const Solution = lazy(() => import("@/components/landing/sections/Solution").then(m => ({ default: m.Solution })));
const TargetUsers = lazy(() => import("@/components/landing/sections/TargetUsers").then(m => ({ default: m.TargetUsers })));
const Features = lazy(() => import("@/components/landing/sections/Feature").then(m => ({ default: m.Features })));
const Roadmap = lazy(() => import("@/components/landing/sections/Roadmap").then(m => ({ default: m.Roadmap })));
const FAQ = lazy(() => import("@/components/landing/sections/FAQ").then(m => ({ default: m.FAQ })));
const Footer = lazy(() => import("@/components/landing/sections/Footer").then(m => ({ default: m.Footer })));

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
  useSmoothScroll();

	return (
		<main className="relative min-h-screen bg-background">
			<SEO canonicalPath="/" />
			<Navbar/>
			<AnimatedBackground/>
			<Hero/>
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <Problem/>
        <Solution/>
        <TargetUsers/>
        <Features/>
        <Roadmap/>
        <FAQ/>
        <Footer/>
      </Suspense>
			<ScrollToTop />
			<LocalTimeClock />
		</main>
	);
}
