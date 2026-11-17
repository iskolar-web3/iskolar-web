import { Link } from "@tanstack/react-router";
import { Linkedin, User } from "lucide-react";
import {
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import {
	coreTeam,
	founders,
	productTeams,
	type TeamMember,
} from "@/components/landing/team";

// Flex cells that keep the 1 / 2 / 4 column rhythm but let an incomplete
// final row (e.g. 3 cards under a 4-up layout) center instead of left-align,
// which CSS grid can't do on its own.
const cellClass =
	"w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] flex justify-center";

// Product team rows: 1 / 2 / 3 per line while wrapped, then a fixed 3-column
// grid from xl so every team's cards sit in the same columns and stay the same
// size no matter how many members a team has.
const productCellClass =
	"w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-auto flex justify-center";

// `image` and `linkedin` are optional so a card can render as a placeholder
// (generic avatar, no LinkedIn) until the member's details are available.
// The whole card opens the member's profile page: the name link stretches over
// the card, and the LinkedIn link sits above it.
const Card = ({ slug, image, name, role, linkedin }: TeamMember) => (
	<div
		className={`
    relative bg-background backdrop-blur-sm border border-secondary/10 shadow-lg rounded-xl
    flex flex-col items-center text-center p-6
    w-full min-w-60 max-w-[280px] min-h-[330px]
    transition-transform hover:-translate-y-1 duration-300 group
  `}
	>
		{image ? (
			<img
				src={image}
				alt={`${name}, ${role} at iSkolar`}
				loading="lazy"
				decoding="async"
				className="w-28 h-28 shrink-0 rounded-full mb-4 overflow-hidden object-cover border-2 border-secondary/20 group-hover:border-secondary/50 transition-colors"
			/>
		) : (
			<div
				aria-hidden
				className="w-28 h-28 shrink-0 rounded-full mb-4 flex items-center justify-center bg-secondary/5 text-secondary/40 border-2 border-dashed border-secondary/20 group-hover:border-secondary/50 transition-colors"
			>
				<User className="w-12 h-12" />
			</div>
		)}
		<h3 className="text-lg font-bold text-secondary mb-1">
			<Link
				to="/about/team/$slug"
				params={{ slug }}
				className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-secondary/40"
			>
				{name}
			</Link>
		</h3>
		<p className="text-sm text-secondary/85 mb-4 min-h-[2.5rem]">{role}</p>
		{linkedin ? (
			<a
				href={linkedin}
				target="_blank"
				rel="noreferrer"
				aria-label={`${name} on LinkedIn`}
				className="relative z-10 mt-auto p-2 text-secondary/80 hover:text-secondary rounded-full transition-all"
			>
				<Linkedin className="w-5 h-5" />
			</a>
		) : (
			<span aria-hidden className="mt-auto p-2 w-9 h-9 shrink-0" />
		)}
	</div>
);

export default function TeamSection() {
	return (
		<section
			id="team"
			className="py-36 pb-24 text-secondary w-full overflow-hidden"
		>
			<MotionContainer>
				<div className="px-4 sm:px-12 lg:px-26 max-w-8xl mx-auto relative z-26">
					<h2 className="text-4xl md:text-5xl mb-4 text-center text-secondary">
						Meet Our Team
					</h2>
					<p className="text-center text-secondary/80 mb-16 max-w-2xl mx-auto text-lg">
						The dreamers and builders behind iSkolar.
					</p>

					<div className="flex flex-col items-center gap-16">
						{/* Founders */}
						<div className="w-full">
							<h3 className="text-3xl text-center text-secondary mb-7">
								Founders
							</h3>
							<div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl mx-auto">
								{founders.map((member) => (
									<MotionItem key={member.slug} className={cellClass}>
										<Card {...member} />
									</MotionItem>
								))}
							</div>
						</div>

						{/* Core Team */}
						<div className="flex flex-col items-center gap-20">
							<div className="w-full">
								<h3 className="text-3xl text-center text-secondary mb-7">
									Core Team
								</h3>
								<div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl mx-auto">
									{coreTeam.map((member) => (
										<MotionItem key={member.slug} className={cellClass}>
											<Card {...member} />
										</MotionItem>
									))}
								</div>
							</div>
						</div>

						{/* Product Teams */}
						<div className="w-full flex flex-col items-center gap-12">
							<div className="text-center">
								<h3 className="text-3xl text-secondary mb-3">Product Teams</h3>
								<p className="text-secondary/80 max-w-2xl mx-auto">
									The people building each iSkolar product.
								</p>
							</div>

							{productTeams.map(({ product, site, members }) => (
								<div
									key={product.id}
									className="w-full max-w-6xl mx-auto grid gap-8 xl:grid-cols-[14rem_1fr] xl:items-center"
								>
									<div className="flex flex-col items-center gap-3 text-center">
										<span className="flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-[0_18px_40px_-20px_rgba(58,82,166,0.6)] ring-1 ring-secondary/10">
											<img
												src={product.logo}
												alt=""
												aria-hidden
												decoding="async"
												className="h-12 w-12 object-contain"
											/>
										</span>
										<h4 className="text-2xl text-secondary">
											{product.name} Team
										</h4>
										<a
											href={`https://${site}`}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={`Visit ${product.name} at ${site}`}
											className="text-sm text-secondary/80 underline underline-offset-4 transition-colors hover:text-secondary"
										>
											{site}
										</a>
									</div>
									<div className="flex flex-wrap justify-center gap-8 w-full xl:grid xl:grid-cols-3">
										{members.map((member) => (
											<MotionItem
												key={member.slug}
												className={productCellClass}
											>
												<Card {...member} />
											</MotionItem>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</MotionContainer>
		</section>
	);
}
