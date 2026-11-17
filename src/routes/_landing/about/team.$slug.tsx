import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import Navbar from "@/components/landing/Navbar";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { findMember, memberPath } from "@/components/landing/team";
import { NotFoundPage } from "@/components/NotFound";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import {
	memberDescription,
	memberTitle,
	profilePageJsonLd,
} from "@/lib/teamSeo";

const TeamProfile = lazy(
	() => import("@/components/landing/about/TeamProfile"),
);
const Footer = lazy(() =>
	import("@/components/landing/sections/Footer").then((m) => ({
		default: m.Footer,
	})),
);

export const Route = createFileRoute("/_landing/about/team/$slug")({
	loader: ({ params }) => {
		const member = findMember(params.slug);
		if (!member) throw notFound();
		return member;
	},
	component: TeamMemberPage,
	// An unknown slug still answers 200 on the static host, so keep it out of the index.
	notFoundComponent: () => (
		<>
			<SEO title="Team member not found" noindex />
			<NotFoundPage />
		</>
	),
});

function TeamMemberPage() {
	const member = Route.useLoaderData();
	useSmoothScroll();

	return (
		<main className="cursor-academic relative isolate min-h-screen bg-background text-secondary">
			<SEO
				title={memberTitle(member)}
				absoluteTitle
				description={memberDescription(member)}
				canonicalPath={memberPath(member)}
				image={member.image}
				ogType="profile"
			/>
			<JsonLd data={profilePageJsonLd(member)} />
			<Navbar />
			<AnimatedBackground />

			<div className="pt-20">
				<Suspense fallback={<div className="min-h-[50vh]" />}>
					<TeamProfile member={member} />
					<Footer />
				</Suspense>
			</div>
			<ScrollToTop />
		</main>
	);
}
