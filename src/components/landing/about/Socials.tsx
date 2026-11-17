import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
	cardHoverLift,
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { filledSocialIds, socialIcons } from "@/components/landing/SocialIcon";
import { type Social, socials } from "@/components/landing/socials";

// Faint blueprint dots, fading out toward the lower right, so the tiles echo
// the graph paper in the page background.
const dotGrid = {
	backgroundImage:
		"radial-gradient(rgba(58, 82, 166, 0.2) 1px, transparent 1.2px)",
	backgroundSize: "16px 16px",
	maskImage: "linear-gradient(to bottom right, black, transparent 75%)",
	WebkitMaskImage: "linear-gradient(to bottom right, black, transparent 75%)",
} as const;

const cardBase =
	"group flex h-full rounded-3xl border border-secondary/10 bg-card/80 p-2 backdrop-blur outline-none transition-colors hover:border-secondary/25 focus-visible:ring-2 focus-visible:ring-secondary/40";

function CommunityCard({ social }: { social: Social }) {
	const Icon = socialIcons[social.id];
	return (
		<a
			href={social.href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${social.cta}: ${social.name}`}
			className={`${cardBase} flex-col lg:flex-row`}
		>
			{/* Rings echo the water ripple on the page background */}
			<div className="relative flex min-h-60 flex-1 items-center justify-center overflow-hidden rounded-[1.25rem] bg-linear-to-br from-secondary/[0.07] to-transparent lg:max-w-[44%]">
				<div aria-hidden className="absolute inset-0" style={dotGrid} />
				{[26, 19, 13].map((size, n) => (
					<span
						key={size}
						aria-hidden
						className="absolute rounded-full border border-secondary/15"
						style={{
							width: `${size}rem`,
							height: `${size}rem`,
							animation: `soft-pulse 4s ease-in-out ${n * 0.6}s infinite`,
						}}
					/>
				))}
				<span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-secondary/20 bg-card text-secondary shadow-[0_18px_45px_-24px_rgba(58,82,166,0.6)] transition-colors duration-300 group-hover:bg-secondary group-hover:text-tertiary">
					<Icon className="h-10 w-10" strokeWidth={1.5} />
				</span>
			</div>

			<div className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-8 lg:px-12">
				<span className="w-fit rounded-full border border-secondary/15 bg-card/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-secondary/70">
					{social.name}
				</span>
				<h3 className="mt-5 text-3xl text-secondary leading-[1.1] tracking-tight text-balance sm:text-4xl">
					Join the iSkolar community
				</h3>
				<p className="mt-4 max-w-md text-base text-secondary/65 leading-relaxed text-pretty">
					{social.description}
				</p>
				<span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-tertiary transition-colors group-hover:bg-secondary/90">
					{social.cta}
					<ArrowUpRight
						className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
						strokeWidth={1.75}
					/>
				</span>
			</div>
		</a>
	);
}

function ChannelCard({ social }: { social: Social }) {
	const Icon = socialIcons[social.id];
	return (
		<a
			href={social.href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${social.cta}: ${social.name}, ${social.handle}`}
			className={`${cardBase} flex-col`}
		>
			<div className="relative flex min-h-48 flex-col justify-between overflow-hidden rounded-[1.25rem] bg-linear-to-br from-secondary/[0.07] to-transparent p-5">
				<div aria-hidden className="absolute inset-0" style={dotGrid} />
				{/* Oversized mark cropped by the tile edge, like the footer wordmark */}
				<Icon
					className={`pointer-events-none absolute -right-6 -bottom-9 h-44 w-44 ${filledSocialIds.has(social.id) ? "text-secondary/[0.04]" : "text-secondary/[0.07]"} transition-transform duration-700 group-hover:-rotate-3 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none`}
					strokeWidth={1}
				/>

				<div className="relative flex items-start justify-between">
					<span className="flex h-11 w-11 items-center justify-center rounded-full border border-secondary/15 bg-card text-secondary transition-colors duration-300 group-hover:bg-secondary group-hover:text-tertiary">
						<Icon className="h-5 w-5" strokeWidth={1.75} />
					</span>
					<span className="flex h-8 w-8 items-center justify-center rounded-full border border-secondary/15 text-secondary/60 transition-colors duration-300 group-hover:border-secondary group-hover:text-secondary">
						<ArrowUpRight
							className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
							strokeWidth={1.75}
						/>
					</span>
				</div>

				<div className="relative">
					<p className="text-xs font-medium uppercase tracking-[0.16em] text-secondary/60">
						{social.name}
					</p>
					<p className="mt-1 text-2xl text-secondary break-words">
						{social.handle}
					</p>
				</div>
			</div>

			<div className="flex flex-1 flex-col px-4 pt-5 pb-4">
				<p className="text-sm text-secondary/60 leading-relaxed text-pretty">
					{social.description}
				</p>
				<span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-secondary">
					{social.cta}
				</span>
			</div>
		</a>
	);
}

export default function SocialsSection() {
	const reduce = useReducedMotion();
	const lift = reduce ? {} : cardHoverLift;

	const community = socials.find((s) => s.id === "community");
	const channels = socials.filter((s) => s.id !== "community");

	return (
		<section className="relative px-4 pt-16 pb-16 sm:px-12 lg:px-26 lg:pt-20 lg:pb-20">
			<MotionContainer
				className="relative z-30 mx-auto max-w-6xl"
				viewportMargin="-50px"
				staggerDelay={0.1}
			>
				<SectionHeader
					as="h1"
					title="Socials"
					description="Follow iSkolar for scholarship news and product updates, or join the community."
					className="mb-14 lg:mb-16"
				/>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{channels.map((social) => (
						<MotionItem
							key={social.id}
							{...lift}
							className="will-change-transform"
						>
							<ChannelCard social={social} />
						</MotionItem>
					))}
					{community && (
						<MotionItem
							{...lift}
							className="will-change-transform sm:col-span-2 lg:col-span-3"
						>
							<CommunityCard social={community} />
						</MotionItem>
					)}
				</div>
			</MotionContainer>
		</section>
	);
}
