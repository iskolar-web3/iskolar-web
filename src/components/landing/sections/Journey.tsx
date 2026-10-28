import {
	type MotionValue,
	motion,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { MotionContainer } from "@/components/landing/MotionContainer";
import {
	type Product,
	type ProductStatus,
	products,
} from "@/components/landing/products";
import { SectionHeader } from "@/components/landing/SectionHeader";

const statusStyles: Record<ProductStatus, string> = {
	Live: "bg-secondary text-tertiary border-secondary",
	Pilot: "bg-secondary/10 text-secondary border-secondary/30",
	Soon: "bg-card/80 text-secondary/55 border-dashed border-secondary/30",
};

// Gentle spring so scroll scrubbing feels smooth rather than mechanical.
const SPRING = { stiffness: 140, damping: 30, mass: 0.4 };

function StatusChip({ status }: { status: ProductStatus }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] ${statusStyles[status]}`}
		>
			{status === "Soon" ? "Coming soon" : status}
		</span>
	);
}

function ProductCard({ product }: { product: Product }) {
	return (
		<article className="group rounded-3xl border border-secondary/10 bg-card/80 p-2 shadow-[0_30px_60px_-40px_rgba(58,82,166,0.55)] backdrop-blur transition-colors hover:border-secondary/25">
			{/* Preview: screenshot, or the product mark until one is set */}
			<div className="relative aspect-16/10 overflow-hidden rounded-[1.25rem] bg-linear-to-br from-secondary/[0.07] via-secondary/[0.03] to-transparent">
				{product.image ? (
					<img
						src={product.image}
						alt={`${product.name} preview`}
						loading="lazy"
						className="h-full w-full object-cover object-top"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<img
							src={product.logo}
							alt=""
							aria-hidden
							loading="lazy"
							className="h-44 w-44 sm:h-52 sm:w-52 object-contain transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
						/>
					</div>
				)}
				<div className="absolute top-3 right-3">
					<StatusChip status={product.status} />
				</div>
			</div>

			<div className="px-4 pt-5 pb-4 sm:px-5">
				<div className="flex items-center gap-2">
					<img
						src={product.logo}
						alt=""
						aria-hidden
						loading="lazy"
						className="h-10 w-10 object-contain"
					/>
					<h3 className="text-xl text-secondary">{product.name}</h3>
				</div>
				<p className="mt-3 text-[15px] font-medium text-secondary text-pretty">
					{product.tagline}
				</p>
				<p className="mt-1.5 text-sm text-secondary/60 leading-relaxed text-pretty">
					{product.description}
				</p>

				<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-secondary/10 pt-4">
					<span className="text-xs text-secondary/50">{product.audience}</span>
					{product.href && (
						<a
							href={product.href}
							{...(product.href.startsWith("http") && {
								target: "_blank",
								rel: "noopener noreferrer",
							})}
							className="group/link inline-flex items-center gap-1 text-xs font-medium text-secondary transition-colors hover:text-secondary/70"
						>
							Visit {product.name}
							<ArrowUpRight
								className="h-3.5 w-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 motion-reduce:transition-none"
								strokeWidth={1.75}
							/>
						</a>
					)}
				</div>
			</div>
		</article>
	);
}

function JourneyStop({ product, index }: { product: Product; index: number }) {
	const reduce = useReducedMotion();
	const ref = useRef<HTMLLIElement>(null);
	const cardRight = index % 2 === 0;
	const number = String(index + 1).padStart(2, "0");

	// 0 when the stop enters from below, 1 once it reaches the reading line.
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 92%", "start 45%"],
	});
	const progress = useSpring(scrollYProgress, SPRING);

	const cardOpacity = useTransform(progress, [0, 0.7], [0, 1]);
	const cardY = useTransform(progress, [0, 1], [64, 0]);
	const cardScale = useTransform(progress, [0, 1], [0.96, 1]);
	const cardBlur = useTransform(progress, [0, 0.8], ["blur(6px)", "blur(0px)"]);
	const labelX = useTransform(progress, [0, 1], [cardRight ? -32 : 32, 0]);
	const labelOpacity = useTransform(progress, [0.15, 0.85], [0, 1]);
	const nodeFill = useTransform(
		progress,
		[0.75, 1],
		["rgba(254,254,253,1)", "rgba(58,82,166,1)"],
	);
	const nodeText = useTransform(
		progress,
		[0.75, 1],
		["rgba(58,82,166,1)", "rgba(240,247,255,1)"],
	);

	// Reduced motion renders every value at its final state.
	const pick = <T,>(value: MotionValue<T>, still: T) =>
		reduce ? still : value;

	return (
		<li
			id={product.id}
			ref={ref}
			className="relative scroll-mt-28 pl-14 lg:pl-0"
		>
			<div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-28">
				{/* Node on the spine, fills in once the stop is reached */}
				<motion.span
					style={{
						backgroundColor: pick(nodeFill, "rgba(58,82,166,1)"),
						color: pick(nodeText, "rgba(240,247,255,1)"),
					}}
					className="absolute left-5 top-1 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-secondary/30 text-xs font-medium shadow-sm lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2"
				>
					{number}
				</motion.span>

				{/* Stage label */}
				<motion.div
					style={{ x: pick(labelX, 0), opacity: pick(labelOpacity, 1) }}
					className={`mb-5 lg:mb-0 ${cardRight ? "lg:order-1 lg:text-right" : "lg:order-2"}`}
				>
					<span className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary/45">
						Step {number}
					</span>
					<p className="mt-2 text-2xl lg:text-[2.75rem] text-secondary leading-[1.1] tracking-tight text-balance">
						{product.stage}
					</p>
				</motion.div>

				{/* Product card */}
				<motion.div
					style={{
						opacity: pick(cardOpacity, 1),
						y: pick(cardY, 0),
						scale: pick(cardScale, 1),
						filter: pick(cardBlur, "blur(0px)"),
					}}
					className={`will-change-transform ${cardRight ? "lg:order-2" : "lg:order-1"}`}
				>
					<ProductCard product={product} />
				</motion.div>
			</div>
		</li>
	);
}

export function Journey() {
	const reduce = useReducedMotion();
	const pathRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: pathRef,
		offset: ["start 60%", "end 60%"],
	});
	// The spine draws as the reader moves down the path.
	const spineRaw = useSpring(scrollYProgress, SPRING);
	const spine = reduce ? 1 : spineRaw;

	return (
		<section
			id="products"
			className="relative py-24 lg:py-36 px-4 sm:px-12 lg:px-26"
		>
			<div className="relative z-30 mx-auto max-w-6xl">
				<MotionContainer className="mb-20 lg:mb-32" viewportMargin="-50px">
					<SectionHeader
						eyebrow="Our products"
						title="One path, six products"
						description="Each product meets students at a different step, from choosing a course to proving a diploma."
					/>
				</MotionContainer>

				<div ref={pathRef} className="relative">
					{/* Spine: faint track with the drawn line on top */}
					<div
						aria-hidden
						className="absolute top-0 bottom-0 left-5 w-px -translate-x-1/2 bg-secondary/10 lg:left-1/2"
					/>
					<motion.div
						aria-hidden
						style={{ scaleY: spine, transformOrigin: "top" }}
						className="absolute top-0 bottom-0 left-5 w-px -translate-x-1/2 bg-linear-to-b from-secondary/30 via-secondary/70 to-secondary lg:left-1/2"
					/>

					<ol className="relative space-y-20 lg:space-y-32">
						{products.map((product, index) => (
							<JourneyStop key={product.id} product={product} index={index} />
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
