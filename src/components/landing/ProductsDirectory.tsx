import { ArrowUpRight } from "lucide-react";
import {
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { liveProducts, type Product } from "@/components/landing/products";
import { SectionHeader } from "@/components/landing/SectionHeader";

// Same graph paper as the page background. It fades in behind a row on hover,
// strongest at the left where the product mark sits.
const graphPaper = {
	backgroundImage:
		"linear-gradient(to right, rgba(58,82,166,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(58,82,166,0.07) 1px, transparent 1px)",
	backgroundSize: "18px 18px",
	maskImage: "linear-gradient(to right, black, transparent 80%)",
	WebkitMaskImage: "linear-gradient(to right, black, transparent 80%)",
} as const;

// Products without a site of their own point to their stop on the home journey.
function resolveLink(product: Product) {
	if (!product.href) {
		return {
			href: `/#${product.id}`,
			external: false,
		};
	}
	const external = product.href.startsWith("http");
	return {
		href: product.href,
		external,
	};
}

function ProductRow({ product }: { product: Product }) {
	const { href, external } = resolveLink(product);
	const cta = `Visit ${product.name}`;
	return (
		<li>
			<a
				href={href}
				{...(external && { target: "_blank", rel: "noopener noreferrer" })}
				aria-label={cta}
				className="group relative grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-5 px-5 py-6 outline-none transition-colors hover:bg-secondary/[0.03] focus-visible:bg-secondary/[0.05] focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-inset sm:px-8 sm:py-8 md:grid-cols-[auto_1fr_auto] md:gap-x-8 lg:px-10"
			>
				<span
					aria-hidden
					className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
					style={graphPaper}
				/>

				{/* Mark inside the dashed drafting ring used on the home journey */}
				<div className="relative flex h-24 w-24 items-center justify-center sm:h-36 sm:w-36">
					{/* Soft blue halo so the mark reads first */}
					<span
						aria-hidden
						className="absolute inset-1 rounded-full bg-secondary/15 opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:inset-2"
					/>
					<span
						aria-hidden
						className="absolute inset-0 rounded-full border border-dashed border-secondary/45 transition-transform duration-[1600ms] ease-out group-hover:rotate-90 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
					/>
					<span className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-card shadow-[0_22px_50px_-18px_rgba(58,82,166,0.75)] ring-2 ring-secondary/20 sm:h-28 sm:w-28">
						<img
							src={product.logo}
							alt=""
							aria-hidden
							decoding="async"
							loading="lazy"
							className="h-12 w-12 object-contain transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none sm:h-[4.75rem] sm:w-[4.75rem]"
						/>
					</span>
				</div>

				<div className="relative min-w-0">
					<h2 className="text-3xl text-secondary tracking-tight break-words lg:text-4xl">
						{product.name}
					</h2>
					<p className="mt-2 max-w-xl text-base text-secondary/65 leading-snug text-pretty">
						{product.tagline}
					</p>
				</div>

				<div className="relative col-start-2 flex md:col-start-auto md:justify-end">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 px-4 py-2 text-sm font-medium text-secondary transition-colors duration-300 group-hover:border-secondary group-hover:bg-secondary group-hover:text-tertiary">
						{cta}
						<ArrowUpRight
							className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
							strokeWidth={1.75}
						/>
					</span>
				</div>
			</a>
		</li>
	);
}

export default function ProductsDirectory() {
	return (
		<section className="relative px-4 pt-16 pb-16 sm:px-12 lg:px-26 lg:pt-20 lg:pb-20">
			<MotionContainer
				className="relative z-30 mx-auto max-w-5xl"
				viewportMargin="-50px"
				staggerDelay={0.1}
			>
				<SectionHeader
					as="h1"
					title="Products"
					description="Tools for every step of a student's journey, from choosing a course to proving a diploma."
					className="mb-14 lg:mb-16"
				/>

				<MotionItem className="overflow-hidden rounded-3xl border border-secondary/10 bg-card/80 backdrop-blur">
					<ul className="divide-y divide-secondary/10">
						{liveProducts.map((product) => (
							<ProductRow key={product.id} product={product} />
						))}
					</ul>

					<p className="border-t border-secondary/10 px-5 py-4 text-center text-sm text-secondary/60 text-balance sm:px-8 lg:px-10">
						More products are on the way.{" "}
						<a
							href="/#products"
							className="font-medium text-secondary underline decoration-secondary/30 underline-offset-4 transition-colors hover:decoration-secondary"
						>
							See the full journey
						</a>
					</p>
				</MotionItem>
			</MotionContainer>
		</section>
	);
}
