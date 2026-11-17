import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
	cardHoverLift,
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import {
	liveProducts,
	type Product,
	type ProductStatus,
} from "@/components/landing/products";
import { SectionHeader } from "@/components/landing/SectionHeader";

// Same blueprint dots as the Socials tiles, fading toward the lower right.
const dotGrid = {
	backgroundImage:
		"radial-gradient(rgba(58, 82, 166, 0.2) 1px, transparent 1.2px)",
	backgroundSize: "16px 16px",
	maskImage: "linear-gradient(to bottom right, black, transparent 75%)",
	WebkitMaskImage: "linear-gradient(to bottom right, black, transparent 75%)",
} as const;

// Blue tints only: the filled pill means it is live, the outlines step down.
const statusStyles: Record<ProductStatus, string> = {
	Live: "border-secondary bg-secondary text-tertiary",
	Pilot: "border-secondary/30 bg-card/70 text-secondary",
	Soon: "border-secondary/15 bg-card/70 text-secondary/60",
};

// Products without a site of their own point to their stop on the home journey.
function resolveLink(product: Product) {
	if (!product.href) {
		return {
			href: `/#${product.id}`,
			external: false,
			cta: "See in the journey",
		};
	}
	const external = product.href.startsWith("http");
	return {
		href: product.href,
		external,
		cta: external ? `Visit ${product.name}` : "Get started",
	};
}

function ProductCard({ product }: { product: Product }) {
	const { href, external, cta } = resolveLink(product);
	return (
		<a
			href={href}
			{...(external && { target: "_blank", rel: "noopener noreferrer" })}
			aria-label={`${cta}: ${product.name}`}
			className="group flex h-full flex-col rounded-3xl border border-secondary/10 bg-card/80 p-2 backdrop-blur outline-none transition-colors hover:border-secondary/25 focus-visible:ring-2 focus-visible:ring-secondary/40"
		>
			<div className="relative flex min-h-48 flex-col justify-between overflow-hidden rounded-[1.25rem] bg-linear-to-br from-secondary/[0.07] to-transparent p-5">
				<div aria-hidden className="absolute inset-0" style={dotGrid} />

				<div className="relative flex items-start justify-between">
					<span className="flex h-20 w-20 items-center justify-center rounded-full border border-secondary/15 bg-card shadow-[0_18px_40px_-22px_rgba(58,82,166,0.6)]">
						<img
							src={product.logo}
							alt=""
							aria-hidden
							decoding="async"
							loading="lazy"
							className="h-12 w-12 object-contain transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
						/>
					</span>
					<span className="flex h-8 w-8 items-center justify-center rounded-full border border-secondary/15 text-secondary/60 transition-colors duration-300 group-hover:border-secondary group-hover:text-secondary">
						<ArrowUpRight
							className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
							strokeWidth={1.75}
						/>
					</span>
				</div>

				<div className="relative">
					<p className="text-xs font-medium uppercase tracking-[0.16em] text-secondary/60">
						{product.stage}
					</p>
					<h3 className="mt-1 text-2xl text-secondary break-words">
						{product.name}
					</h3>
				</div>
			</div>

			<div className="flex flex-1 flex-col px-4 pt-5 pb-4">
				<p className="text-sm text-secondary/60 leading-relaxed text-pretty">
					{product.tagline}
				</p>
				<div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
					<span className="inline-flex items-center text-sm font-medium text-secondary">
						{cta}
					</span>
					<span
						className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${statusStyles[product.status]}`}
					>
						{product.status}
					</span>
				</div>
			</div>
		</a>
	);
}

export default function ProductsDirectory() {
	const reduce = useReducedMotion();
	const lift = reduce ? {} : cardHoverLift;

	return (
		<section className="relative px-4 pt-16 pb-16 sm:px-12 lg:px-26 lg:pt-20 lg:pb-20">
			<MotionContainer
				className="relative z-30 mx-auto max-w-6xl"
				viewportMargin="-50px"
				staggerDelay={0.1}
			>
				<SectionHeader
					as="h1"
					title="Products"
					description="Tools for every step of a student's journey, from choosing a course to proving a diploma."
					className="mb-14 lg:mb-16"
				/>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{liveProducts.map((product) => (
						<MotionItem
							key={product.id}
							{...lift}
							className="will-change-transform"
						>
							<ProductCard product={product} />
						</MotionItem>
					))}
				</div>
			</MotionContainer>
		</section>
	);
}
