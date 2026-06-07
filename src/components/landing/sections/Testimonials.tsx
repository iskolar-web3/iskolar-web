import { useReducedMotion } from "framer-motion";
import {
	Atom,
	BookOpen,
	ChevronLeft,
	ChevronRight,
	Compass,
	GraduationCap,
	Linkedin,
	Palette,
	PenTool,
	Quote,
	Sparkles,
} from "lucide-react";
import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import {
	cardHoverLift,
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Testimonial = {
	quote: string;
	name: string;
	role: string;
	initials: string;
	// When present, the card opens a modal with the embedded LinkedIn post.
	// embedUrl is the exact src from LinkedIn's "Embed this post" code
	// (the URN type varies per post: urn:li:activity vs urn:li:share).
	postUrl?: string;
	embedUrl?: string;
};

// Quotes are pulled verbatim from each scholar's public LinkedIn post.
// Placeholder entries (no postUrl) stay until real voices replace them.
const testimonials: Testimonial[] = [
	{
		quote:
			"Knowing that an organization like BYC Ventures and iSkolar believes in my vision and potential fuels my drive to keep innovating, engineering, and giving back to our local tech community.",
		name: "Clarisse",
		role: "Tech student leader · Tomorrow Fund scholar",
		initials: "CS",
		postUrl:
			"https://www.linkedin.com/posts/clarisse-jem-salazar_bycventures-iskolar-tomorrowfund-activity-7466476500649701377-TUg5",
		embedUrl:
			"https://www.linkedin.com/embed/feed/update/urn:li:activity:7466476500649701377",
	},
	{
		quote:
			"Shoutout to iSkolar for an incredibly smooth and straightforward application process. More than the financial backing, the trust behind this initiative motivates me to keep building, learning, and pushing forward.",
		name: "Jade Delovino",
		role: "BSIT, PUP · Tomorrow Fund scholar",
		initials: "JD",
		postUrl:
			"https://www.linkedin.com/posts/jade-delovino-8905b6373_iskolar-bycventures-share-7467173644046110720-e5ba/",
		embedUrl:
			"https://www.linkedin.com/embed/feed/update/urn:li:share:7467173644046110720",
	},
	{
		quote:
			"Unlike traditional scholarships where you wait months and constantly follow up, this process was fast, professional, and transparent. The funding hit my account exactly when I needed it.",
		name: "Angelo Laus",
		role: "BS Computer Science · Tomorrow Fund scholar",
		initials: "AL",
		embedUrl:
			"https://www.linkedin.com/embed/feed/update/urn:li:share:7466325865480605696",
	},
	{
		quote:
			"the process was clear. the application was straightforward. the disbursement was fast. no endless follow-ups. no confusing steps. no feeling like you’re just waiting in the dark.",
		name: "Alexi",
		role: "BS Computer Science, Ateneo · Tomorrow Fund scholar",
		initials: "AC",
		embedUrl:
			"https://www.linkedin.com/embed/feed/update/urn:li:share:7466481381368594432",
	},
	{
		quote:
			"I also appreciate how simple and smooth the whole process was. From application to receiving the scholarship, everything was clear and easy to follow. It didn’t feel complicated or stressful, which I really liked.",
		name: "Aurold John Sadullo",
		role: "BSIT, PUP · Tomorrow Fund scholar",
		initials: "AS",
		embedUrl:
			"https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7466462989563502592",
	},
	{
		quote:
			"What stood out to me about iSkolar was how simple, transparent, and accessible the entire experience was, from sign-up to application and disbursement.",
		name: "Sonya Lee",
		role: "BS Computer Science, NU Manila · Tomorrow Fund scholar",
		initials: "SL",
		embedUrl:
			"https://www.linkedin.com/embed/feed/update/urn:li:share:7466447829515866112",
	},
	{
		quote:
			"What I liked about iSkolar was how simple and clear the whole process was. The application was straightforward, the updates were easy to follow, and the experience felt smooth from start to finish.",
		name: "Lance Josh Corpuz",
		role: "Tech student · Tomorrow Fund scholar",
		initials: "LC",
		embedUrl:
			"https://www.linkedin.com/embed/feed/update/urn:li:share:7466496062808227841",
	},
];

// Faint scattered education doodles in the background.
const doodles = [
	{ icon: GraduationCap, className: "top-[6%] left-[3%] w-10 h-10 -rotate-12" },
	{ icon: Atom, className: "top-[10%] right-[8%] w-12 h-12 rotate-6" },
	{ icon: PenTool, className: "top-[2%] left-[28%] w-7 h-7 rotate-12" },
	{ icon: Sparkles, className: "top-[24%] right-[3%] w-9 h-9" },
	{ icon: BookOpen, className: "bottom-[10%] left-[6%] w-11 h-11 rotate-6" },
	{ icon: Compass, className: "bottom-[6%] right-[10%] w-9 h-9 -rotate-12" },
	{ icon: Palette, className: "top-[44%] left-[1%] w-8 h-8 rotate-3" },
	{ icon: Sparkles, className: "bottom-[20%] right-[28%] w-6 h-6 -rotate-6" },
];

export function Testimonials() {
	const reduce = useReducedMotion();
	const lift = reduce ? {} : cardHoverLift;
	const scrollerRef = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState<Testimonial | null>(null);

	const scrollByCards = (dir: number) => {
		scrollerRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
	};

	return (
		<section
			id="testimonials"
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
				className="relative z-30 mx-auto max-w-7xl px-4 sm:px-12 lg:px-26"
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
							Scholar Stories
						</span>
					</div>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary text-balance">
						Real students, real funding
					</h2>
					<p className="text-base sm:text-lg text-secondary/70 max-w-xl mx-auto mt-4 text-pretty">
						Early feedback from the students using iSkolar.
					</p>
				</MotionItem>
			</MotionContainer>

			{/* Horizontal scroll carousel */}
			<div className="relative z-30 mx-auto max-w-7xl">
				{/* Edge fades to hint there is more to scroll */}
				<div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 sm:w-16 bg-linear-to-r from-background to-transparent" />
				<div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 sm:w-16 bg-linear-to-l from-background to-transparent" />

				{/* Desktop arrow controls */}
				<button
					type="button"
					onClick={() => scrollByCards(-1)}
					aria-label="Previous testimonials"
					className="hidden md:grid place-items-center absolute left-2 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-card border border-secondary/20 text-secondary shadow-md transition-colors hover:bg-secondary hover:text-tertiary"
				>
					<ChevronLeft className="w-5 h-5" />
				</button>
				<button
					type="button"
					onClick={() => scrollByCards(1)}
					aria-label="Next testimonials"
					className="hidden md:grid place-items-center absolute right-2 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-card border border-secondary/20 text-secondary shadow-md transition-colors hover:bg-secondary hover:text-tertiary"
				>
					<ChevronRight className="w-5 h-5" />
				</button>

				<div
					ref={scrollerRef}
					className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory px-4 sm:px-12 lg:px-26 pt-2 pb-6"
				>
					{testimonials.map((item) => {
						const hasPost = Boolean(item.embedUrl);
						return (
							<MotionItem
								key={item.name}
								{...lift}
								onClick={hasPost ? () => setActive(item) : undefined}
								role={hasPost ? "button" : undefined}
								tabIndex={hasPost ? 0 : undefined}
								onKeyDown={
									hasPost
										? (e: KeyboardEvent) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setActive(item);
												}
											}
										: undefined
								}
								className={`ruled-paper group relative flex flex-col shrink-0 w-[290px] sm:w-[340px] snap-start overflow-hidden rounded-2xl bg-card border border-secondary/15 p-7 lg:p-8 shadow-[0_18px_45px_-30px_rgba(58,82,166,0.55)] will-change-transform${
									hasPost
										? " cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
										: ""
								}`}
								initial={reduce ? "visible" : "hidden"}
								whileInView="visible"
								viewport={{ once: true, margin: "-40px" }}
								variants={{
									hidden: { opacity: 0, y: 24 },
									visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
								}}
							>
								<Quote
									className="w-9 h-9 text-secondary fill-secondary mb-4"
									strokeWidth={1}
								/>

								<p className="text-[15px] text-secondary leading-relaxed grow">
									{item.quote}
								</p>

								<div className="border-t border-secondary/10 mt-6 pt-5 flex items-center justify-between gap-3">
									<p className="text-secondary leading-tight truncate">
										{item.name}
									</p>
									{hasPost && (
										<span className="inline-flex items-center gap-1.5 shrink-0 text-xs text-secondary/60 transition-colors group-hover:text-secondary">
											<Linkedin className="w-3.5 h-3.5" strokeWidth={1.75} />
											View post
										</span>
									)}
								</div>
							</MotionItem>
						);
					})}
				</div>
			</div>

			{/* Embedded LinkedIn post modal */}
			<Dialog
				open={Boolean(active)}
				onOpenChange={(open) => !open && setActive(null)}
			>
				<DialogContent className="max-w-[540px] gap-0 overflow-hidden p-0">
					<DialogTitle className="sr-only">
						{active ? `${active.name} on LinkedIn` : "LinkedIn post"}
					</DialogTitle>
					{active?.embedUrl && (
						<iframe
							key={active.embedUrl}
							title={`${active.name} on LinkedIn`}
							src={active.embedUrl}
							className="h-[70vh] max-h-[946px] w-full border-0"
							loading="lazy"
							allowFullScreen
						/>
					)}
				</DialogContent>
			</Dialog>
		</section>
	);
}
