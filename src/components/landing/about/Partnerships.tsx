import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"

const partners = [
	{ src: "/partnerships/byc-ventures.png", alt: "BYC Ventures" },
	{ src: "/partnerships/cryptita-plays.png", alt: "Cryptita Plays", size: "h-28" },
	{ src: "/partnerships/aws-learning-club-heron.png", alt: "AWS Learning Club - Heron", size: "h-28" },
	{ src: "/partnerships/finsharc.png", alt: "Finsharc", size: "h-28" },
]

export function Partnerships() {
	return (
		<section id="partnerships" className="pt-20 pb-40 lg:pt-30 lg:pb-60 px-5">
			<MotionContainer className="max-w-5xl mx-auto relative z-26">
				<MotionItem className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary mt-4 mb-6 text-balance">
						Partnered with Those Who Believe
					</h2>
				</MotionItem>

				<MotionItem className="flex flex-wrap justify-center items-center gap-12">
					{partners.map((partner) => (
						<img
							key={partner.src}
							src={partner.src}
							alt={partner.alt}
							className={`${partner.size ?? "h-20"} object-contain`}
						/>
					))}
				</MotionItem>
			</MotionContainer>
		</section>
	)
}
