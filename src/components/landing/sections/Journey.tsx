import {
	type MotionValue,
	motion,
	useMotionValueEvent,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "framer-motion";
import type Lenis from "lenis";
import { ArrowUpRight, Users } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MotionContainer } from "@/components/landing/MotionContainer";
import { type Product, products } from "@/components/landing/products";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { onLenisChange } from "@/hooks/useSmoothScroll";

// Gentle spring so scroll scrubbing feels smooth rather than mechanical.
const SPRING = { stiffness: 140, damping: 30, mass: 0.4 };

const LAST = products.length - 1;

// Same graph paper as the page background, drawn small inside each plate.
const BLUEPRINT = {
	backgroundImage:
		"linear-gradient(to right, rgba(58,82,166,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(58,82,166,0.08) 1px, transparent 1px)",
	backgroundSize: "18px 18px",
	backgroundPosition: "center",
};

// Registration marks pinned to the plate corners, like a drafting sheet.
const CORNERS = [
	"top-3 left-3 border-t border-l",
	"top-3 right-3 border-t border-r",
	"bottom-3 left-3 border-b border-l",
	"bottom-3 right-3 border-b border-r",
];

function ProductCard({ product }: { product: Product }) {
	return (
		<article className="group flex flex-col overflow-hidden rounded-3xl border border-secondary/10 bg-card/95 p-2 shadow-[0_30px_60px_-40px_rgba(58,82,166,0.55)] transition-colors [contain:layout_paint] hover:border-secondary/25 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
			{/* Blueprint plate: screenshot, or the product mark drafted on grid */}
			<div
				style={product.image ? undefined : BLUEPRINT}
				className="relative flex aspect-16/10 items-center justify-center overflow-hidden rounded-[1.25rem] bg-secondary/[0.04] md:aspect-auto md:min-h-60 lg:min-h-64"
			>
				{product.image ? (
					<img
						src={product.image}
						alt={`${product.name} preview`}
						decoding="async"
						className="absolute inset-0 h-full w-full object-cover object-top"
					/>
				) : (
					<>
						{CORNERS.map((corner) => (
							<span
								key={corner}
								aria-hidden
								className={`absolute h-3 w-3 border-secondary/40 ${corner}`}
							/>
						))}
						{/* Guide lines crossing at the mark */}
						<span
							aria-hidden
							className="absolute inset-x-0 top-1/2 h-px bg-secondary/10"
						/>
						<span
							aria-hidden
							className="absolute inset-y-0 left-1/2 w-px bg-secondary/10"
						/>
						<div className="relative flex h-32 w-32 items-center justify-center lg:h-40 lg:w-40">
							<span
								aria-hidden
								className="absolute inset-0 rounded-full border border-dashed border-secondary/30 transition-transform duration-[1600ms] ease-out group-hover:rotate-90 motion-reduce:transition-none"
							/>
							<span className="relative flex h-22 w-22 items-center justify-center rounded-full bg-card shadow-[0_18px_40px_-20px_rgba(58,82,166,0.6)] ring-1 ring-secondary/10 lg:h-28 lg:w-28">
								<img
									src={product.logo}
									alt=""
									aria-hidden
									decoding="async"
									className="h-14 w-14 object-contain transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none lg:h-[4.5rem] lg:w-[4.5rem]"
								/>
							</span>
						</div>
					</>
				)}
			</div>

			<div className="flex flex-col px-3 pt-4 pb-3 md:justify-center md:px-7 md:py-6">
				<h3 className="text-2xl text-secondary tracking-tight lg:text-[2rem] lg:leading-tight">
					{product.name}
				</h3>
				<p className="mt-2 text-base text-secondary/65 leading-snug text-pretty lg:text-lg">
					{product.tagline}
				</p>

				<div className="mt-5 flex flex-wrap items-center justify-between gap-3 lg:mt-6">
					<span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/[0.06] px-3 py-1.5 text-xs text-secondary/70">
						<Users className="h-3.5 w-3.5" strokeWidth={1.75} />
						{product.audience}
					</span>
					{product.href && (
						<a
							href={product.href}
							{...(product.href.startsWith("http") && {
								target: "_blank",
								rel: "noopener noreferrer",
							})}
							aria-label={`Visit ${product.name}`}
							className="group/link inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-medium text-tertiary transition-colors hover:bg-secondary/90"
						>
							Visit
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

function JourneySlide({
	product,
	index,
	progress,
}: {
	product: Product;
	index: number;
	progress: MotionValue<number>;
}) {
	const reduce = useReducedMotion();
	// Peaks at 1 while this slide is the one in focus, falls off on either side.
	const at = index / LAST;
	const span = 1 / LAST;
	const focus = useTransform(progress, [at - span, at, at + span], [0, 1, 0], {
		clamp: true,
	});
	const opacity = useTransform(focus, [0, 1], [0.45, 1]);
	const scale = useTransform(focus, [0, 1], [0.94, 1]);
	const nodeFill = useTransform(progress, [at - span * 0.5, at], [0, 1]);

	const pick = <T,>(value: MotionValue<T>, still: T) =>
		reduce ? still : value;

	return (
		<li className="relative w-[calc(100vw-5rem)] shrink-0 sm:w-[30rem] md:w-[36rem] lg:w-[46rem]">
			{/* Node on the rail; the blue fill fades in rather than repainting */}
			<span
				aria-hidden
				className="absolute top-5 left-0 z-10 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-secondary/40 bg-card shadow-[0_0_0_4px_rgba(240,247,255,0.9)]"
			>
				<motion.span
					style={{ opacity: pick(nodeFill, 1) }}
					className="absolute inset-0 rounded-full bg-secondary will-change-[opacity]"
				/>
			</span>

			{/* Stage and card fade and settle together as one layer */}
			<motion.div
				style={{ opacity: pick(opacity, 1), scale: pick(scale, 1) }}
				className="origin-top-left pl-5 will-change-transform"
			>
				<p className="flex h-10 items-center">
					<span className="rounded-full bg-tertiary px-3 py-1 text-lg text-secondary leading-tight tracking-tight lg:text-xl">
						{product.stage}
					</span>
				</p>
				<div className="mt-4 -ml-5">
					<ProductCard product={product} />
				</div>
			</motion.div>
		</li>
	);
}

export function Journey() {
	const reduce = useReducedMotion();
	const pinRef = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const lenisRef = useRef<Lenis | null>(null);
	// Horizontal distance the track travels, which is also the vertical
	// distance the section stays pinned for.
	const [travel, setTravel] = useState(0);
	const [active, setActive] = useState(0);

	useEffect(
		() =>
			onLenisChange((lenis) => {
				lenisRef.current = lenis;
			}),
		[],
	);

	useLayoutEffect(() => {
		const viewport = viewportRef.current;
		const track = trackRef.current;
		if (!viewport || !track) return;
		const measure = () =>
			setTravel(Math.max(0, track.scrollWidth - viewport.clientWidth));
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(viewport);
		observer.observe(track);
		return () => observer.disconnect();
	}, []);

	const { scrollYProgress } = useScroll({
		target: pinRef,
		offset: ["start start", "end end"],
	});
	const smooth = useSpring(scrollYProgress, SPRING);
	const progress = reduce ? scrollYProgress : smooth;
	const x = useTransform(progress, (p) => -p * travel);

	const activeRef = useRef(0);
	useMotionValueEvent(progress, "change", (p) => {
		const next = Math.min(LAST, Math.max(0, Math.round(p * LAST)));
		if (next === activeRef.current) return;
		activeRef.current = next;
		setActive(next);
	});

	// Jump to a slide by scrolling the page to the matching point of the pin.
	const goTo = (index: number) => {
		const pin = pinRef.current;
		if (!pin) return;
		const top =
			pin.getBoundingClientRect().top +
			window.scrollY +
			(travel * index) / LAST;
		if (lenisRef.current) lenisRef.current.scrollTo(top);
		else window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
	};

	return (
		<section id="products" className="relative pt-24 lg:pt-36">
			<div className="relative z-30 mx-auto max-w-6xl px-4 sm:px-12 lg:px-0">
				<MotionContainer className="mb-6 lg:mb-10" viewportMargin="-50px">
					<SectionHeader
						eyebrow="Our products"
						title="One path, six products"
						description="Each product meets students at a different step, from choosing a course to proving a diploma."
					/>
				</MotionContainer>
			</div>

			{/* Pin: tall enough that vertical scroll drives the full horizontal
			    run before the page moves on to the next section. */}
			<div
				ref={pinRef}
				className="relative"
				style={{ height: `calc(100svh + ${travel}px)` }}
			>
				{/* Hash anchors at the scroll point where each slide is in focus */}
				{products.map((product, index) => (
					<span
						key={product.id}
						id={product.id}
						aria-hidden
						className="pointer-events-none absolute left-0 h-px w-px"
						style={{ top: (travel * index) / LAST }}
					/>
				))}

				<div className="sticky top-0 flex h-svh flex-col justify-center-safe overflow-clip pt-24 pb-5 sm:pt-28">
					{/* Window matches the navbar and section header width, so slides
					    enter and leave at the same edges the rest of the page uses. */}
					<div className="mx-auto w-full max-w-6xl shrink-0 px-4 sm:px-12 lg:px-0">
						<div ref={viewportRef} className="overflow-x-clip">
							<motion.div
								ref={trackRef}
								style={{ x }}
								className="relative w-max will-change-transform"
							>
								{/* Rail through the step nodes, drawn as the reader advances */}
								<div
									aria-hidden
									className="absolute top-5 right-0 left-0 h-px bg-secondary/10"
								/>
								<motion.div
									aria-hidden
									style={{ scaleX: progress, transformOrigin: "left" }}
									className="absolute top-5 right-0 left-0 h-px bg-linear-to-r from-secondary/30 via-secondary/70 to-secondary will-change-transform"
								/>
								<ol className="relative flex items-start gap-6 sm:gap-10 lg:gap-14">
									{products.map((product, index) => (
										<JourneySlide
											key={product.id}
											product={product}
											index={index}
											progress={progress}
										/>
									))}
								</ol>
							</motion.div>
						</div>
					</div>

					{/* Progress dock: counter, bar, and a jump list of the six stops */}
					<div className="mx-auto mt-5 flex w-full max-w-6xl shrink-0 items-center gap-4 px-4 sm:mt-6 sm:px-12 lg:px-0">
						<span className="shrink-0 font-medium tabular-nums text-secondary text-sm">
							{String(active + 1).padStart(2, "0")}
							<span className="text-secondary/35">
								{" "}
								/ {String(products.length).padStart(2, "0")}
							</span>
						</span>
						<div className="relative h-1 flex-1 overflow-hidden rounded-full bg-secondary/10">
							<motion.div
								style={{ scaleX: progress, transformOrigin: "left" }}
								className="absolute inset-0 rounded-full bg-secondary will-change-transform"
							/>
						</div>
						<nav
							aria-label="Jump to product"
							className="hidden shrink-0 items-center gap-1 md:flex"
						>
							{products.map((product, index) => (
								<button
									key={product.id}
									type="button"
									onClick={() => goTo(index)}
									aria-current={active === index ? "step" : undefined}
									className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
										active === index
											? "bg-secondary text-tertiary"
											: "text-secondary/55 hover:bg-secondary/10 hover:text-secondary"
									}`}
								>
									{product.name}
								</button>
							))}
						</nav>
					</div>
				</div>
			</div>
		</section>
	);
}
