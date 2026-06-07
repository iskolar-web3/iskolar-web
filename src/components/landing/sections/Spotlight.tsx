import { useReducedMotion } from "framer-motion";
import { ArrowUpRight, BookOpen, GraduationCap, Newspaper } from "lucide-react";
import {
	cardHoverLift,
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";

type Coverage = {
	source: string;
	title: string;
	href: string;
	image: string;
};

// Press and partner coverage of iSkolar. Cards link out to the original
// publication (external sites block iframe embedding, so we open in a new tab).
// Featured images are mirrored into public/press so the cards never depend on
// the publishers' hotlink rules staying open.
const coverage: Coverage[] = [
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

// Faint scattered education doodles, matching the Voices section treatment.
const doodles = [
	{ icon: Newspaper, className: "top-[8%] left-[4%] w-10 h-10 -rotate-12" },
	{ icon: GraduationCap, className: "top-[14%] right-[6%] w-12 h-12 rotate-6" },
	{ icon: BookOpen, className: "bottom-[10%] left-[8%] w-11 h-11 rotate-6" },
];

export function Spotlight() {
	const reduce = useReducedMotion();
	const lift = reduce ? {} : cardHoverLift;

	return (
		<section
			id="in-the-news"
			className="relative overflow-hidden py-20 lg:py-28"
		>
			{/* Decorative doodles */}
			<div className="pointer-events-none absolute inset-0 hidden sm:block">
				{doodles.map((doodle) => (
					<doodle.icon
						key={doodle.className}
						className={`absolute text-secondary/[0.07] ${doodle.className}`}
						strokeWidth={1.5}
					/>
				))}
			</div>

			<MotionContainer
				className="relative z-30 px-4 sm:px-12 lg:px-26"
				viewportMargin="-50px"
			>
				{/* Header */}
				<MotionItem className="text-center mb-12 lg:mb-16">
					<div className="inline-flex items-center gap-2 mb-4">
						<div
							className="w-1.5 h-1.5 bg-secondary rounded-full"
							style={{ animation: "soft-pulse 3s ease-in-out infinite" }}
						/>
						<span className="text-xs uppercase tracking-[0.2em] text-secondary/55">
							Spotlight
						</span>
					</div>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary text-balance">
						iSkolar in the press
					</h2>
					<p className="text-base sm:text-lg text-secondary/70 max-w-xl mx-auto mt-4 text-pretty">
						Coverage of the team and the partnerships we've built.
					</p>
				</MotionItem>

				{/* Coverage cards */}
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
								className="ruled-paper group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card border border-secondary/15 shadow-[0_18px_45px_-30px_rgba(58,82,166,0.55)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-secondary/40"
							>
								{/* Featured image */}
								<div className="relative aspect-1200/630 overflow-hidden bg-secondary/5">
									<img
										src={item.image}
										alt={`${item.source} coverage of iSkolar`}
										loading="lazy"
										className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
									/>
								</div>

								<div className="flex grow flex-col p-7 lg:p-8">
									<div className="flex items-start justify-between gap-3">
										<h3 className="text-lg lg:text-xl text-secondary leading-snug text-balance">
											{item.title}
										</h3>
										<ArrowUpRight
											className="mt-0.5 w-5 h-5 shrink-0 text-secondary/40 transition-all group-hover:text-secondary group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
											strokeWidth={1.75}
										/>
									</div>

									<span className="inline-flex items-center gap-1.5 mt-auto pt-6 border-t border-secondary/10 text-sm text-secondary/60 transition-colors group-hover:text-secondary">
										Read on {item.source}
										<ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
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
