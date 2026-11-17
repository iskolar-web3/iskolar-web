import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Linkedin } from "lucide-react";
import {
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { SectionHeader } from "@/components/landing/SectionHeader";
import {
	groupLabel,
	productOf,
	productTeamSites,
	type TeamMember,
	teamMembers,
} from "@/components/landing/team";
import { memberDescription } from "@/lib/teamSeo";

const pillButton =
	"inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-secondary/40";

// Teammates are shown from the same group, so a visitor who lands on one profile
// can move to the next person, and crawlers get an internal link to each.
function Teammates({ member }: { member: TeamMember }) {
	const product = productOf(member);
	const mates = teamMembers.filter(
		(m) =>
			m.slug !== member.slug &&
			m.group === member.group &&
			m.productId === member.productId,
	);
	if (mates.length === 0) return null;

	return (
		<MotionItem className="mt-14">
			<h2 className="text-2xl text-secondary">
				More from {product ? `the ${product.name} team` : groupLabel(member)}
			</h2>
			<ul className="mt-6 grid gap-3 sm:grid-cols-2">
				{mates.map((mate) => (
					<li key={mate.slug}>
						<Link
							to="/about/team/$slug"
							params={{ slug: mate.slug }}
							className="group flex items-center gap-4 rounded-2xl border border-secondary/10 bg-card/80 p-3 pr-5 outline-none transition-colors hover:bg-secondary/[0.04] focus-visible:ring-2 focus-visible:ring-secondary/40"
						>
							{mate.image ? (
								<img
									src={mate.image}
									alt=""
									aria-hidden
									loading="lazy"
									decoding="async"
									className="h-14 w-14 shrink-0 rounded-full border border-secondary/20 object-cover"
								/>
							) : (
								<span
									aria-hidden
									className="h-14 w-14 shrink-0 rounded-full border border-dashed border-secondary/20 bg-secondary/5"
								/>
							)}
							<span className="min-w-0 flex-1">
								<span className="block truncate text-secondary">
									{mate.name}
								</span>
								<span className="block truncate text-sm text-secondary/70">
									{mate.role}
								</span>
							</span>
							<ArrowUpRight
								aria-hidden
								className="h-4 w-4 shrink-0 text-secondary/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
							/>
						</Link>
					</li>
				))}
			</ul>
		</MotionItem>
	);
}

export default function TeamProfile({ member }: { member: TeamMember }) {
	const product = productOf(member);
	const site = product ? productTeamSites[product.id] : undefined;

	return (
		<section className="w-full overflow-hidden px-4 py-16 text-secondary sm:px-12 sm:py-24 lg:px-26">
			<MotionContainer className="relative z-26 mx-auto max-w-5xl">
				<MotionItem>
					<Link
						to="/about"
						hash="team"
						className="inline-flex items-center gap-2 text-sm text-secondary/70 underline-offset-4 outline-none transition-colors hover:text-secondary hover:underline focus-visible:ring-2 focus-visible:ring-secondary/40"
					>
						<ArrowLeft aria-hidden className="h-4 w-4" />
						Meet the whole team
					</Link>
				</MotionItem>

				<MotionItem className="mt-6 rounded-3xl border border-secondary/10 bg-card/80 p-2 backdrop-blur">
					<div className="grid items-center gap-8 rounded-[1.25rem] p-6 sm:p-10 md:grid-cols-[auto_1fr]">
						{member.image ? (
							<img
								src={member.image}
								alt={`${member.name}, ${member.role} at iSkolar`}
								decoding="async"
								className="mx-auto h-44 w-44 rounded-full border-2 border-secondary/20 object-cover sm:h-56 sm:w-56"
							/>
						) : (
							<div
								aria-hidden
								className="mx-auto h-44 w-44 rounded-full border-2 border-dashed border-secondary/20 bg-secondary/5 sm:h-56 sm:w-56"
							/>
						)}

						<SectionHeader
							as="h1"
							align="left"
							eyebrow={groupLabel(member)}
							title={member.name}
							description={member.role}
							className="max-w-none text-center md:text-left"
						>
							<p className="mt-6 max-w-xl text-base leading-relaxed text-secondary/80 text-pretty">
								{memberDescription(member)}
							</p>

							{product && site && (
								<p className="mt-4 max-w-xl text-sm leading-relaxed text-secondary/70 text-pretty">
									{product.name}: {product.tagline}
								</p>
							)}

							<div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
								{member.linkedin && (
									<a
										href={member.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${member.name} on LinkedIn`}
										className={`${pillButton} bg-secondary text-tertiary hover:bg-secondary/85`}
									>
										<Linkedin aria-hidden className="h-4 w-4" />
										LinkedIn
									</a>
								)}
								{product && site && (
									<a
										href={`https://${site}`}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`Visit ${product.name} at ${site}`}
										className={`${pillButton} border border-secondary/20 bg-card text-secondary hover:bg-secondary/[0.04]`}
									>
										Visit {product.name}
										<ArrowUpRight aria-hidden className="h-4 w-4" />
									</a>
								)}
							</div>
						</SectionHeader>
					</div>
				</MotionItem>

				<Teammates member={member} />
			</MotionContainer>
		</section>
	);
}
