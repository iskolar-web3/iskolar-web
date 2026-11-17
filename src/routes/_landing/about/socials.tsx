import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import Navbar from "@/components/landing/Navbar";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { socials } from "@/components/landing/socials";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { breadcrumbJsonLd } from "@/lib/seo";

const SocialsSection = lazy(() => import("@/components/landing/about/Socials"));
const Footer = lazy(() =>
	import("@/components/landing/sections/Footer").then((m) => ({
		default: m.Footer,
	})),
);

export const Route = createFileRoute("/_landing/about/socials")({
	component: SocialsPage,
});

// The Facebook group is a community, not an iSkolar profile, so it stays out of
// sameAs, which should only list accounts the organization itself runs.
const officialProfiles = socials.filter((s) => s.id !== "community");

const description = `Follow iSkolar on ${new Intl.ListFormat("en", {
	style: "long",
	type: "conjunction",
}).format(
	officialProfiles.map((s) => s.name),
)}, or join our community of students and scholars.`;

function SocialsPage() {
	useSmoothScroll();

	return (
		<main className="cursor-academic relative isolate min-h-screen bg-background text-secondary">
			<SEO
				title="Social Media and Community"
				description={description}
				canonicalPath="/about/socials"
			/>
			<JsonLd
				data={{
					"@context": "https://schema.org",
					"@type": "WebPage",
					name: "iSkolar Socials",
					url: "https://www.iskolar.io/about/socials",
					description,
					isPartOf: {
						"@type": "WebSite",
						name: "iSkolar",
						url: "https://www.iskolar.io",
					},
					breadcrumb: breadcrumbJsonLd([
						{ name: "Home", path: "/" },
						{ name: "About", path: "/about" },
						{ name: "Socials", path: "/about/socials" },
					]),
					mainEntity: {
						"@type": "Organization",
						name: "iSkolar",
						url: "https://www.iskolar.io",
						sameAs: officialProfiles.map((s) => s.href),
					},
				}}
			/>
			<Navbar />
			<AnimatedBackground />

			<div className="pt-20">
				<Suspense fallback={<div className="min-h-[50vh]" />}>
					<SocialsSection />
					<Footer />
				</Suspense>
			</div>
			<ScrollToTop />
		</main>
	);
}
