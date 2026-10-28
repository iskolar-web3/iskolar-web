import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
	type Variants,
} from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { BLUE_DUOTONE, BLUE_TINT } from "@/components/landing/partners";

const trustLogos = [
	{
		src: "/partnerships/byc-ventures.png",
		alt: "BYC Ventures",
		size: "h-9",
		filter: BLUE_TINT,
	},
	{
		src: "/partnerships/qbo-innovation.png",
		alt: "QBO Innovation",
		size: "h-11",
		filter: BLUE_DUOTONE,
	},
	{
		src: "/partnerships/tutorials-dojo.png",
		alt: "Tutorials Dojo",
		size: "h-9",
		filter: BLUE_TINT,
	},
	{
		src: "/partnerships/jia-whitecloak.png",
		alt: "Jia Talent Vault",
		size: "h-7",
		filter: BLUE_TINT,
	},
	{
		src: "/partnerships/cryptita-plays.png",
		alt: "Cryptita Plays",
		size: "h-12",
		filter: BLUE_TINT,
	},
	{
		src: "/partnerships/aws-learning-club-heron.png",
		alt: "AWS Learning Club Heron",
		size: "h-12",
		filter: BLUE_DUOTONE,
	},
	{
		src: "/partnerships/tech-kubo.png",
		alt: "Tech Kubo",
		size: "h-12",
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
			className="relative flex min-h-dvh flex-col items-center justify-center px-4 sm:px-12 lg:px-26 pt-32 pb-24"
		>
			<motion.div
				style={{ opacity: fade, y: lift }}
				className="relative z-10 mx-auto max-w-5xl text-center"
				initial={reduce ? "visible" : "hidden"}
				animate={state}
				variants={stagger}
			>
				<motion.h1
					variants={rise}
					className="text-[2.75rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] text-secondary leading-[1.02] tracking-tight text-balance"
				>
					Empowering Students
					<span className="block text-secondary/45">
						from Education to Career.
					</span>
				</motion.h1>

				<motion.p
					variants={rise}
					className="mx-auto mt-8 max-w-xl text-lg sm:text-xl text-secondary/70 leading-relaxed text-pretty"
				>
					iSkolar helps Filipino students choose a course, get funded, build
					real work, and prove what they earned.
				</motion.p>

				<motion.div
					variants={rise}
					className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
				>
					<a
						href="#products"
						className="group inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-medium text-tertiary shadow-[0_12px_30px_-12px_rgba(58,82,166,0.7)] transition-colors hover:bg-secondary/90"
					>
						Explore the path
						<ArrowDown
							className="h-4 w-4 transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none"
							strokeWidth={1.75}
						/>
					</a>
					<a
						href="/login"
						className="group inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-card/70 px-6 py-3 text-sm font-medium text-secondary backdrop-blur transition-colors hover:border-secondary/40"
					>
						Get Started
						<ArrowRight
							className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
							strokeWidth={1.75}
						/>
					</a>
				</motion.div>
			</motion.div>

			{/* Trusted by: slow marquee, static row for reduced motion */}
			<motion.div
				className="relative z-10 mt-20 w-full max-w-5xl"
				initial={reduce ? "visible" : "hidden"}
				animate={state}
				variants={{
					hidden: { opacity: 0 },
					visible: { opacity: 1, transition: { delay: 0.7, duration: 0.8 } },
				}}
			>
				<p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-secondary/45">
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
