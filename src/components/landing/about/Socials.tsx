import {
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { socialIcons, solidSocialIds } from "@/components/landing/SocialIcon";
import { type Social, socials } from "@/components/landing/socials";

function SocialLogo({ social }: { social: Social }) {
	const Icon = socialIcons[social.id];
	return (
		<a
			href={social.href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${social.cta}: ${social.name}`}
			className="group relative flex rounded-3xl p-2 text-secondary outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 sm:p-3"
		>
			<Icon
				className="h-16 w-16 transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-focus-visible:-translate-y-2 group-focus-visible:scale-110 group-active:scale-100 sm:h-24 sm:w-24 lg:h-32 lg:w-32 xl:h-36 xl:w-36 motion-reduce:transition-none motion-reduce:group-hover:transform-none motion-reduce:group-focus-visible:transform-none"
				strokeWidth={2}
				fill={solidSocialIds.has(social.id) ? "currentColor" : "none"}
			/>

			{/* Name sits below the logo, out of the layout, and rises into view. Hover only exists with a pointer, so it is hidden on phones. */}
			<span
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-full hidden translate-y-1 flex-col items-center gap-2 whitespace-nowrap opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:flex motion-reduce:transition-none"
			>
				<span className="text-sm uppercase tracking-[0.22em] text-secondary">
					{social.name}
				</span>
				<span className="h-px w-10 origin-center scale-x-0 bg-secondary/40 transition-transform delay-75 duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" />
			</span>
		</a>
	);
}

export default function SocialsSection() {
	// The Facebook group goes last, after the accounts people can follow.
	const community = socials.find((s) => s.id === "community");
	const channels = socials.filter((s) => s.id !== "community");
	const logos = community ? [...channels, community] : channels;

	return (
		<section className="relative px-4 pt-16 pb-16 sm:px-12 lg:px-26 lg:pt-20 lg:pb-24">
			<MotionContainer
				className="relative z-30 mx-auto max-w-6xl"
				viewportMargin="-50px"
				staggerDelay={0.08}
			>
				<SectionHeader as="h1" title="Socials" className="mb-14 lg:mb-16" />

				{/* Four columns; the leftover three centre themselves on row two. */}
				<ul className="mx-auto flex max-w-4xl flex-wrap justify-center gap-y-12 sm:gap-y-16">
					{logos.map((social) => (
						<li key={social.id} className="flex w-1/4 justify-center">
							<MotionItem>
								<SocialLogo social={social} />
							</MotionItem>
						</li>
					))}
				</ul>
			</MotionContainer>
		</section>
	);
}
