import { useReducedMotion } from "framer-motion"
import { Link2 } from "lucide-react"
import {
	cardHoverLift,
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer"
import { partners } from "@/components/landing/partners"

export function Partnerships() {
	const reduce = useReducedMotion()
	const lift = reduce ? {} : cardHoverLift

	return (
		<section
			id="partnerships"
			className="py-36 text-secondary w-full overflow-hidden"
		>
			<MotionContainer className="relative z-26 px-4 sm:px-12 lg:px-26">
				<MotionItem className="text-center mb-16 lg:mb-20">
					<h2 className="text-4xl md:text-5xl text-secondary text-balance">
						iSkolar Partner Ecosystem
					</h2>
					<p className="text-base sm:text-lg text-secondary/70 max-w-2xl mx-auto mt-4 text-pretty">
						Strategic incubation partners that back how we build, and
						communities that help us reach the students who need it.
					</p>
				</MotionItem>

				<div className="divide-y divide-secondary/10">
					{partners.map((partner) => (
						<MotionItem key={partner.name}>
							<div className="grid grid-cols-1 items-start gap-8 py-12 lg:grid-cols-12 lg:gap-10 lg:py-16">
								{/* Name + category */}
								<div className="lg:col-span-3">
									<h3 className="text-lg sm:text-xl uppercase tracking-wide text-secondary">
										{partner.name}
									</h3>
									<p className="mt-1 text-sm italic text-secondary/55">
										{partner.category}
									</p>
								</div>

								{/* Logo card */}
								<MotionItem
									{...lift}
									className="will-change-transform lg:col-span-4"
								>
									<div className="ruled-paper flex aspect-[16/10] items-center justify-center rounded-2xl bg-background border border-secondary/15 p-8 shadow-[0_18px_45px_-30px_rgba(58,82,166,0.55)]">
										<img
											src={partner.logo}
											alt={partner.name}
											loading="lazy"
											style={{ filter: partner.filter }}
											className={`object-contain ${
												partner.category === "Community Partner"
													? "max-h-32 max-w-[280px]"
													: "max-h-24 max-w-[220px]"
											}`}
										/>
									</div>
								</MotionItem>

								{/* Description + link */}
								<div className="lg:col-span-5">
									<p className="text-base text-secondary/75 leading-relaxed text-pretty">
										{partner.description}
									</p>
									<a
										href={partner.href}
										target="_blank"
										rel="noopener noreferrer"
										className="group mt-5 inline-flex items-center gap-2 text-sm text-secondary/60 transition-colors hover:text-secondary"
									>
										<Link2
											className="w-4 h-4 transition-transform group-hover:-rotate-12"
											strokeWidth={1.75}
										/>
										{partner.linkLabel}
									</a>
								</div>
							</div>
						</MotionItem>
					))}
				</div>
			</MotionContainer>
		</section>
	)
}
