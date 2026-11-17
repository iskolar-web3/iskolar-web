import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { JsonLd } from "@/components/JsonLd";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import Navbar from "@/components/landing/Navbar";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { breadcrumbJsonLd } from "@/lib/seo";
import { teamOrganizationJsonLd } from "@/lib/teamSeo";

const CompanyOverviewSection = lazy(
	() => import("@/components/landing/about/CompanyOverview"),
);
const MissionVisionSection = lazy(
	() => import("@/components/landing/about/MissionVision"),
);
const TeamSection = lazy(() => import("@/components/landing/about/Team"));
const PartnershipsSection = lazy(() =>
	import("@/components/landing/about/Partnerships").then((m) => ({
		default: m.Partnerships,
	})),
);
const Footer = lazy(() =>
	import("@/components/landing/sections/Footer").then((m) => ({
		default: m.Footer,
	})),
);

const description =
	"Learn about iSkolar's mission, vision, and the team building technology that supports Filipino students from senior high to their first job.";

export const Route = createFileRoute("/_landing/about/")({
	component: About,
});

function About() {
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
		<main className="cursor-academic relative isolate min-h-screen bg-background text-secondary">
			<SEO title="About Us" description={description} canonicalPath="/about" />
			<JsonLd
				data={{
					"@context": "https://schema.org",
					"@type": "AboutPage",
					name: "About iSkolar",
					url: "https://www.iskolar.io/about",
					description,
					isPartOf: {
						"@type": "WebSite",
						name: "iSkolar",
						url: "https://www.iskolar.io",
					},
					breadcrumb: breadcrumbJsonLd([
						{ name: "Home", path: "/" },
						{ name: "About", path: "/about" },
					]),
					mainEntity: teamOrganizationJsonLd(),
				}}
			/>
			<Navbar />
			<AnimatedBackground />

			<div className="pt-20">
				<Suspense fallback={<div className="min-h-[50vh]" />}>
					<CompanyOverviewSection />
					<MissionVisionSection />
					<PartnershipsSection />
					<TeamSection />
					<Footer />
				</Suspense>
			</div>
			<ScrollToTop />
		</main>
	);
}
