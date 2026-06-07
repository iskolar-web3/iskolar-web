import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { partnerGroups } from "@/components/landing/partners";

export function Ecosystem() {
	return (
		<section
			id="ecosystem"
			className="relative overflow-hidden py-20 lg:py-28 px-4 sm:px-12 lg:px-26"
		>
			<MotionContainer
				className="relative z-30"
				viewportMargin="-50px"
			>
				{/* Header */}
				<MotionItem className="text-center mb-16 lg:mb-24">
					<div className="inline-flex items-center gap-2 mb-4">
						<div
							className="w-1.5 h-1.5 bg-secondary rounded-full"
							style={{ animation: "soft-pulse 3s ease-in-out infinite" }}
						/>
						<span className="text-xs uppercase tracking-[0.2em] text-secondary/55">
							Ecosystem
						</span>
					</div>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary text-balance">
						The people building this with us
					</h2>
					<p className="text-base sm:text-lg text-secondary/70 max-w-xl mx-auto mt-4 text-pretty">
						Building with partners, reaching students through communities.
					</p>
					{/* Know more */}
					<MotionItem className="flex justify-end">
						<Link
							to="/about"
							hash="partnerships"
							className="group inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-secondary transition-colors hover:text-secondary/70"
						>
							Know more
							<ArrowUpRight
								className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
								strokeWidth={1.75}
							/>
						</Link>
					</MotionItem>
				</MotionItem>

				{/* Category groups */}
				<div className="space-y-12 lg:space-y-16">
					{partnerGroups.map((group) => (
						<MotionItem key={group.category}>
							<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-13 lg:gap-10">
								{/* Category label */}
								<h3 className="lg:col-span-4 text-md sm:text-lg uppercase leading-tight tracking-wide text-secondary text-balance">
									{group.label}
								</h3>

								{/* Logo card */}
								<div className="lg:col-span-5">
									<Link
										to="/about"
										hash="partnerships"
										aria-label={`Learn more about our ${group.label}`}
										className="ruled-paper flex flex-wrap items-center justify-center gap-x-10 gap-y-8 rounded-2xl bg-card border border-secondary/15 px-8 py-12 shadow-[0_18px_45px_-30px_rgba(58,82,166,0.55)] outline-none transition-all hover:border-secondary/30 hover:shadow-[0_18px_45px_-24px_rgba(58,82,166,0.7)] focus-visible:ring-2 focus-visible:ring-secondary/40"
									>
										{group.partners.map((partner) => (
											<img
												key={partner.name}
												src={partner.logo}
												alt={partner.name}
												loading="lazy"
												className={
													group.category === "Community Partner"
														? "max-h-20 max-w-52 object-contain"
														: "max-h-14 max-w-40 object-contain"
												}
											/>
										))}
									</Link>
								</div>

								{/* Group description */}
								<p className="lg:col-span-4 text-sm text-secondary/75 leading-relaxed text-pretty">
									{group.description}
								</p>
							</div>
						</MotionItem>
					))}
				</div>
			</MotionContainer>
		</section>
	);
}
