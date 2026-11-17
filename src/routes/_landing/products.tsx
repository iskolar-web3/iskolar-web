import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import Navbar from "@/components/landing/Navbar";
import { liveProducts } from "@/components/landing/products";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

const ProductsDirectory = lazy(
	() => import("@/components/landing/ProductsDirectory"),
);
const Footer = lazy(() =>
	import("@/components/landing/sections/Footer").then((m) => ({
		default: m.Footer,
	})),
);

export const Route = createFileRoute("/_landing/products")({
	component: ProductsPage,
});

const SITE = "https://www.iskolar.io";

const description =
	"Explore the live iSkolar products that support students on their way from senior high to their first job.";

function ProductsPage() {
	useSmoothScroll();

	return (
		<main className="cursor-academic relative isolate min-h-screen bg-background text-secondary">
			<SEO
				title="Products"
				description={description}
				canonicalPath="/products"
			/>
			<JsonLd
				data={{
					"@context": "https://schema.org",
					"@type": "CollectionPage",
					name: "iSkolar Products",
					url: `${SITE}/products`,
					description,
					isPartOf: {
						"@type": "WebSite",
						name: "iSkolar",
						url: SITE,
					},
					mainEntity: {
						"@type": "ItemList",
						itemListElement: liveProducts.map((p, index) => ({
							"@type": "ListItem",
							position: index + 1,
							name: p.name,
							description: p.tagline,
							url: p.href?.startsWith("http")
								? p.href
								: `${SITE}${p.href ?? `/#${p.id}`}`,
						})),
					},
				}}
			/>
			<Navbar />
			<AnimatedBackground />

			<div className="pt-20">
				<Suspense fallback={<div className="min-h-[50vh]" />}>
					<ProductsDirectory />
					<Footer />
				</Suspense>
			</div>
			<ScrollToTop />
		</main>
	);
}
