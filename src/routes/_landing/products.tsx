import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import Navbar from "@/components/landing/Navbar";
import { liveProducts } from "@/components/landing/products";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { breadcrumbJsonLd } from "@/lib/seo";

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

// Names come from products.ts, so the description follows what is live.
const liveNames = new Intl.ListFormat("en", {
	style: "long",
	type: "conjunction",
}).format(liveProducts.map((p) => p.name));

const description = `Explore ${liveNames}, the live iSkolar products that support Filipino students from senior high to their first job.`;

function ProductsPage() {
	useSmoothScroll();

	return (
		<main className="cursor-academic relative isolate min-h-screen bg-background text-secondary">
			<SEO
				title="Products for Filipino Students"
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
					breadcrumb: breadcrumbJsonLd([
						{ name: "Home", path: "/" },
						{ name: "Products", path: "/products" },
					]),
					mainEntity: {
						"@type": "ItemList",
						numberOfItems: liveProducts.length,
						itemListElement: liveProducts.map((p, index) => ({
							"@type": "ListItem",
							position: index + 1,
							item: {
								"@type": "SoftwareApplication",
								name: p.name,
								description: `${p.tagline} ${p.description}`,
								url: p.href?.startsWith("http")
									? p.href
									: `${SITE}${p.href ?? `/#${p.id}`}`,
								applicationCategory: "EducationalApplication",
								audience: { "@type": "Audience", audienceType: p.audience },
								provider: {
									"@type": "Organization",
									name: "iSkolar",
									url: SITE,
								},
							},
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
