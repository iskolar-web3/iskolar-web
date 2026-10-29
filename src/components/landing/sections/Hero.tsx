import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
	type Variants,
} from "framer-motion";
import { ArrowDown, ArrowRight, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import { BLUE_DUOTONE, BLUE_TINT } from "@/components/landing/partners";
import { SchoolSeals } from "@/components/landing/SchoolSeals";

const trustLogos = [
	{
		src: "/partnerships/byc-ventures.png",
		alt: "BYC Ventures",
		size: "h-11",
		filter: BLUE_TINT,
	},
	{
		src: "/partnerships/qbo-innovation.png",
		alt: "QBO Innovation",
		size: "h-13",
		filter: BLUE_DUOTONE,
	},
	{
		src: "/partnerships/tutorials-dojo.png",
		alt: "Tutorials Dojo",
		size: "h-11",
		filter: BLUE_TINT,
	},
	{
		src: "/partnerships/jia-whitecloak.png",
		alt: "Jia Talent Vault",
		size: "h-8",
		filter: BLUE_TINT,
	},
	{
		src: "/partnerships/cryptita-plays.png",
		alt: "Cryptita Plays",
		size: "h-16",
		filter: BLUE_TINT,
	},
	{
		src: "/partnerships/aws-learning-club-heron.png",
		alt: "AWS Learning Club Heron",
		size: "h-16",
		filter: BLUE_DUOTONE,
	},
	{
		src: "/partnerships/tech-kubo.png",
		alt: "Tech Kubo",
		size: "h-16",
		filter: BLUE_DUOTONE,
	},
];

const EASE = [0.22, 1, 0.36, 1] as const;

const stagger: Variants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

// Soft focus pull: rises a little and sharpens into place.
const rise: Variants = {
	hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.9, ease: EASE },
	},
};

type CtaLinkProps = {
	href: string;
	label: string;
	icon: LucideIcon;
	direction: "down" | "right";
	variant: "primary" | "secondary";
};

// Plain pill: label with a trailing arrow that nudges in its direction on
// hover. The primary also gets a one way light sweep, and both lift a little.
function CtaLink({
	href,
	label,
	icon: Icon,
	direction,
	variant,
}: CtaLinkProps) {
	const primary = variant === "primary";
	const nudge =
		direction === "down"
			? "group-hover:translate-y-0.5"
			: "group-hover:translate-x-0.5";
	return (
		<a
			href={href}
			className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-medium outline-none transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-6 sm:text-[15px] lg:min-w-52 ${
				primary
					? "bg-secondary text-tertiary shadow-[0_14px_32px_-14px_rgba(58,82,166,0.8)] hover:shadow-[0_20px_40px_-14px_rgba(58,82,166,0.9)]"
					: "border border-secondary/20 bg-card/80 text-secondary backdrop-blur hover:border-secondary/45 hover:bg-card"
			}`}
		>
			{primary && (
				<span
					aria-hidden
					className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/20 to-transparent duration-700 ease-out group-hover:translate-x-[300%] group-hover:transition-transform motion-reduce:hidden"
				/>
			)}
			<span className="relative">{label}</span>
			<Icon
				aria-hidden
				className={`relative h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${nudge}`}
				strokeWidth={1.75}
			/>
		</a>
	);
}

export function Hero({ ready = true }: { ready?: boolean }) {
	const sectionRef = useRef<HTMLElement>(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end start"],
	});
	// Headline eases back as the reader scrolls into the Journey.
	const fadeRaw = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
	const liftRaw = useTransform(scrollYProgress, [0, 1], [0, -80]);
	const fade = reduce ? 1 : fadeRaw;
	const lift = reduce ? 0 : liftRaw;

	const state = reduce || ready ? "visible" : "hidden";

	return (
		<section
			ref={sectionRef}
			id="home"
			className="relative flex min-h-dvh flex-col items-center justify-center px-3 sm:px-6 pt-24 pb-12"
		>
			{/* Same width and inset as the navbar pill, so the copy lines up with
			    the logo and the buttons line up with Get Started. */}
			<motion.div
				style={{ opacity: fade, y: lift }}
				className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6"
				initial={reduce ? "visible" : "hidden"}
				animate={state}
				variants={stagger}
			>
				{/* Query container: from lg the headline sizes to this column's width,
				    so it always runs right up to the CTAs with no dead gap. */}
				<div className="@container text-center lg:text-left">
					<motion.h1
						variants={rise}
						className="text-[3.25rem] sm:text-[4.25rem] lg:text-[clamp(3.5rem,7.45cqw,5.5rem)] text-secondary leading-[1.04] tracking-[-0.035em] text-balance lg:whitespace-nowrap"
					>
						Empowering Students
						<span className="block text-secondary/45">
							from Education to Career.
						</span>
					</motion.h1>

					<motion.p
						variants={rise}
						className="mx-auto mt-6 max-w-xl text-lg sm:text-xl lg:max-w-2xl text-secondary/70 leading-relaxed text-pretty lg:mx-0"
					>
						iSkolar helps Filipino students choose a course, get funded, build
						real work, and prove what they earned.
					</motion.p>
				</div>

				{/* One row on small screens, stacked and equal width on desktop */}
				<motion.div
					variants={rise}
					className="flex flex-row items-center justify-center gap-3 lg:flex-col lg:items-stretch"
				>
					<CtaLink
						href="#products"
						label="Explore the path"
						icon={ArrowDown}
						direction="down"
						variant="primary"
					/>
					<CtaLink
						href="/login"
						label="Get Started"
						icon={ArrowRight}
						direction="right"
						variant="secondary"
					/>
				</motion.div>
			</motion.div>

			{/* Where our students come from: one centred row of logos */}
			<motion.div
				className="relative z-10 mt-12 w-full max-w-6xl px-4 sm:px-6"
				initial={reduce ? "visible" : "hidden"}
				animate={state}
				variants={{
					hidden: { opacity: 0 },
					visible: { opacity: 1, transition: { delay: 0.6, duration: 0.8 } },
				}}
			>
				<SchoolSeals />
			</motion.div>

			{/* Trusted by: slow marquee, static row for reduced motion */}
			<motion.div
				className="relative z-10 mt-10 w-full max-w-6xl px-4 sm:px-6"
				initial={reduce ? "visible" : "hidden"}
				animate={state}
				variants={{
					hidden: { opacity: 0 },
					visible: { opacity: 1, transition: { delay: 0.75, duration: 0.8 } },
				}}
			>
				<p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-secondary/45">
					Trusted by
				</p>
				{reduce ? (
					<div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
						{trustLogos.map((logo) => (
							<img
								key={logo.src}
								src={logo.src}
								alt={logo.alt}
								className={`${logo.size} w-auto object-contain`}
								style={{ filter: logo.filter }}
							/>
						))}
					</div>
				) : (
					<div className="marquee-mask overflow-hidden">
						<div className="marquee-track flex w-max items-center">
							{[0, 1].map((copy) => (
								<div
									key={copy}
									aria-hidden={copy === 1}
									className="flex shrink-0 items-center gap-14 pr-14"
								>
									{trustLogos.map((logo) => (
										<img
											key={logo.src}
											src={logo.src}
											alt={copy === 0 ? logo.alt : ""}
											className={`${logo.size} w-auto object-contain opacity-80`}
											style={{ filter: logo.filter }}
										/>
									))}
								</div>
							))}
						</div>
					</div>
				)}
			</motion.div>

			{/* Start of the path, handing off to the Journey spine below */}
			<div
				aria-hidden
				className="absolute bottom-0 left-1/2 h-20 w-px -translate-x-1/2 bg-linear-to-b from-transparent to-secondary/40"
			/>
		</section>
	);
}
