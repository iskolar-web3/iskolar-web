import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
	cardHoverLift,
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { SectionHeader } from "@/components/landing/SectionHeader";

type Coverage = {
	source: string;
	title: string;
	href: string;
	image: string;
};

const coverage: Coverage[] = [
	{
		source: "BitPinas",
		title:
			"iSkolar Powers BYC Ventures' Tomorrow Fund Pilot for NCR IT Students",
		href: "https://bitpinas.com/business/iskolar-byc-tomorrowfund/",
		image: "/press/bitpinas-tomorrowfund.png",
	},
	{
		source: "BitPinas",
		title:
			"These Filipino Students Built an AI and Blockchain Scholarship Platform to Fix Education Funding",
		href: "https://bitpinas.com/ai/iskolar-ai-launched/",
		image: "/press/bitpinas-iskolar.png",
	},
	{
		source: "BYC Ventures",
		title:
			"BYC Ventures and iSkolar Formalize Collaboration to Advance Verifiable Credential Infrastructure",
		href: "https://byc.ventures/news/byc-ventures-and-iskolar-formalize-collaboration-to-advance-verifiable-credential-infrastructure",
		image: "/press/byc-ventures-iskolar.png",
	},
	{
		source: "Startup Machine",
		title:
			"How iSkolar.io Could Change the Way Filipinos Discover and Receive Scholarships",
		href: "https://startupmachine.substack.com/p/featured-submission-how-iskolario",
		image: "/press/startup-machine-iskolar.jpg",
	},
];

export function Spotlight() {
	const reduce = useReducedMotion();
	const lift = reduce ? {} : cardHoverLift;

	return (
		<section
			id="in-the-news"
			className="relative py-24 lg:py-36 px-4 sm:px-12 lg:px-26"
		>
			<MotionContainer
				className="relative z-30 mx-auto max-w-6xl"
				viewportMargin="-50px"
				staggerDelay={0.1}
			>
				<SectionHeader
					eyebrow="Spotlight"
					title="iSkolar in the press"
					description="Coverage of the team and the partnerships we've built."
					className="mb-14 lg:mb-20"
				/>

				{/* Coverage cards */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{coverage.map((item) => (
						<MotionItem
							key={item.href}
							{...lift}
							className="will-change-transform"
						>
							<a
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex h-full flex-col rounded-3xl border border-secondary/10 bg-card/80 p-2 backdrop-blur outline-none transition-colors hover:border-secondary/25 focus-visible:ring-2 focus-visible:ring-secondary/40"
							>
								<div className="relative aspect-1200/630 overflow-hidden rounded-[1.25rem] bg-secondary/5">
									<img
										src={item.image}
										alt={`${item.source} coverage of iSkolar`}
										loading="lazy"
										className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
									/>
								</div>

								<div className="flex grow flex-col px-3 pt-4 pb-3">
									<span className="text-[11px] font-medium uppercase tracking-[0.16em] text-secondary/50">
										{item.source}
									</span>
									<h3 className="mt-2 text-sm font-medium text-secondary leading-snug text-pretty">
										{item.title}
									</h3>
									<span className="mt-auto inline-flex items-center gap-1 pt-5 text-xs text-secondary/60 transition-colors group-hover:text-secondary">
										Read on {item.source}
										<ArrowUpRight
											className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
											strokeWidth={1.75}
										/>
									</span>
								</div>
							</a>
						</MotionItem>
					))}
				</div>
			</MotionContainer>
		</section>
	);
}
