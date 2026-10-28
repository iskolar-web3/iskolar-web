import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const ROTATING_LABELS = [
	"Get Started",
	"Be a scholar",
	"Be a sponsor",
	"Find Scholarships",
	"Create Programs",
];

export function CTA() {
	const reduce = useReducedMotion();
	const [labelIndex, setLabelIndex] = useState(0);

	useEffect(() => {
		if (reduce) return;
		const id = setInterval(() => {
			setLabelIndex((i) => (i + 1) % ROTATING_LABELS.length);
		}, 3000);
		return () => clearInterval(id);
	}, [reduce]);

	return (
		<section id="get-started" className="px-4 sm:px-12 lg:px-26 py-12 lg:py-20">
			<motion.div
				initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-100px" }}
				transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
				className="relative z-30 mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-secondary px-6 py-20 text-center sm:px-12 lg:py-28"
			>
				{/* Soft light and fine grid, recolored for the blue surface */}
				<div
					aria-hidden
					className="pointer-events-none absolute -top-1/2 left-1/2 h-full w-3/4 -translate-x-1/2 rounded-full blur-3xl"
					style={{
						background:
							"radial-gradient(closest-side, rgba(240,247,255,0.28), transparent)",
					}}
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(rgba(240,247,255,0.06) 1px, transparent 1px)," +
							"linear-gradient(90deg, rgba(240,247,255,0.06) 1px, transparent 1px)",
						backgroundSize: "48px 48px",
						maskImage:
							"radial-gradient(ellipse 70% 70% at 50% 40%, black, transparent 80%)",
						WebkitMaskImage:
							"radial-gradient(ellipse 70% 70% at 50% 40%, black, transparent 80%)",
					}}
				/>

				<div className="relative z-10">
					<span className="inline-flex items-center gap-2 rounded-full border border-tertiary/20 bg-tertiary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-tertiary/80">
						<span
							className="h-1.5 w-1.5 rounded-full bg-tertiary"
							style={{ animation: "soft-pulse 3s ease-in-out infinite" }}
						/>
						Get started
					</span>
					<h2 className="mx-auto mt-6 max-w-3xl text-4xl sm:text-5xl lg:text-6xl text-tertiary leading-[1.05] tracking-tight text-balance">
						Start wherever you are on the path
					</h2>
					<p className="mx-auto mt-6 mb-10 max-w-xl text-lg text-tertiary/75 text-pretty">
						Students, sponsors, and schools can join iSkolar today, with more
						products opening along the way.
					</p>
					<motion.a
						href="/login"
						whileHover={
							reduce
								? undefined
								: {
										y: -2,
										transition: { type: "spring", stiffness: 260, damping: 22 },
									}
						}
						whileTap={reduce ? undefined : { y: 0 }}
						className="group inline-flex items-center justify-center gap-2 rounded-full bg-tertiary px-7 py-3.5 font-medium text-secondary shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)] transition-colors hover:bg-white will-change-transform"
					>
						<span className="grid justify-items-center">
							{/* Invisible sizers reserve the widest label's width so the button never resizes */}
							{ROTATING_LABELS.map((label) => (
								<span
									key={label}
									aria-hidden
									className="col-start-1 row-start-1 invisible whitespace-nowrap"
								>
									{label}
								</span>
							))}
							<AnimatePresence mode="wait" initial={false}>
								<motion.span
									key={labelIndex}
									initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
									transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
									className="col-start-1 row-start-1 whitespace-nowrap"
								>
									{ROTATING_LABELS[labelIndex]}
								</motion.span>
							</AnimatePresence>
						</span>
						<ArrowRight
							className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
							strokeWidth={1.75}
						/>
					</motion.a>
				</div>
			</motion.div>
		</section>
	);
}
