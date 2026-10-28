import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { partnerGroups } from "@/components/landing/partners";
import { SectionHeader } from "@/components/landing/SectionHeader";

export function Ecosystem() {
	return (
		<section
			id="ecosystem"
			className="relative py-24 lg:py-36 px-4 sm:px-12 lg:px-26"
		>
			<MotionContainer
				className="relative z-30 mx-auto max-w-6xl"
				viewportMargin="-50px"
				staggerDelay={0.12}
			>
				<div className="mb-14 lg:mb-20 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<SectionHeader
						align="left"
						eyebrow="Ecosystem"
						title="The people building this with us"
						description="Building with partners, reaching students through communities."
					/>
					<MotionItem>
						<Link
							to="/about"
							hash="partnerships"
							className="group inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-card/70 px-4 py-2 text-sm font-medium text-secondary backdrop-blur transition-colors hover:border-secondary/40"
						>
							Know more
							<ArrowUpRight
								className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
								strokeWidth={1.75}
							/>
						</Link>
					</MotionItem>
				</div>

				{/* One card per partner group */}
				<div className="grid gap-4 lg:grid-cols-3">
					{partnerGroups.map((group) => (
						<MotionItem key={group.category}>
							<Link
								to="/about"
								hash="partnerships"
								aria-label={`Learn more about our ${group.label}`}
								className="group flex h-full flex-col rounded-3xl border border-secondary/10 bg-card/80 p-2 backdrop-blur outline-none transition-colors hover:border-secondary/25 focus-visible:ring-2 focus-visible:ring-secondary/40"
							>
								<div className="flex min-h-44 flex-wrap items-center justify-center gap-x-8 gap-y-6 rounded-[1.25rem] bg-linear-to-br from-secondary/[0.06] to-transparent px-6 py-10">
									{group.partners.map((partner) => (
										<img
											key={partner.name}
											src={partner.logo}
											alt={partner.name}
											loading="lazy"
											style={{ filter: partner.filter }}
											className={`object-contain transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none ${
												group.category === "Community Partner"
													? "max-h-16 max-w-28"
													: "max-h-11 max-w-32"
											}`}
										/>
									))}
								</div>
								<div className="px-4 pt-5 pb-4">
									<h3 className="text-xs font-medium uppercase tracking-[0.16em] text-secondary">
										{group.label}
									</h3>
									<p className="mt-2 text-sm text-secondary/60 leading-relaxed text-pretty">
										{group.description}
									</p>
								</div>
							</Link>
						</MotionItem>
					))}
				</div>
			</MotionContainer>
		</section>
	);
}
