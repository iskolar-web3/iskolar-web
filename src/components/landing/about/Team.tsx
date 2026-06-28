import {
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { Linkedin } from "lucide-react";

// Flex cells that keep the 1 / 2 / 4 column rhythm but let an incomplete
// final row (e.g. 3 cards under a 4-up layout) center instead of left-align,
// which CSS grid can't do on its own.
const cellClass =
	"w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] flex justify-center";

const Card = ({
	image,
	name,
	role,
	link,
}: {
	image: string;
	name: string;
	role: string;
	link: string;
}) => (
	<div
		className={`
    relative bg-background backdrop-blur-sm border border-secondary/10 shadow-lg rounded-xl
    flex flex-col items-center text-center p-6
    w-full min-w-60 max-w-[280px] h-[280px]
    transition-transform hover:-translate-y-1 duration-300 group
  `}
	>
		<img
			src={image}
			alt={`${name}, ${role} at iSkolar`}
			className="w-28 h-28 rounded-full mb-4 overflow-hidden object-cover border-2 border-secondary/20 group-hover:border-secondary/50 transition-colors"
		/>
		<h3 className="text-lg font-bold text-secondary mb-1">{name}</h3>
		<p className="text-sm text-secondary/85 mb-4 min-h-[2.5rem]">{role}</p>
		<a
			href={link}
			target="_blank"
			className="mt-auto p-2 text-secondary/80 hover:text-secondary rounded-full transition-all"
		>
			<Linkedin className="w-5 h-5" />
		</a>
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
								<MotionItem className={cellClass}>
									<Card
										image="/team/CEO.jpg"
										name="Justin Luzano"
										role="Chief Executive Officer"
										link="https://www.linkedin.com/in/justinluzano23/"
									/>
								</MotionItem>

								<MotionItem className={cellClass}>
									<Card
										image="/team/CTO.jpg"
										name="Louigie Caminoy"
										role="Chief Technology Officer"
										link="https://www.linkedin.com/in/louie1221"
									/>
								</MotionItem>

								<MotionItem className={cellClass}>
									<Card
										image="/team/COO.jpg"
										name="Adam Ruadilla"
										role="Chief Operating Officer"
										link="https://www.linkedin.com/in/adam-ruadilla/"
									/>
								</MotionItem>

								<MotionItem className={cellClass}>
									<Card
										image="/team/CFO.jpg"
										name="Jeselle Francisco"
										role="Chief Financial Officer"
										link="https://www.linkedin.com/in/maria-jeselle-francisco-736491369/"
									/>
								</MotionItem>
							</div>
						</div>

						{/* Core Team */}
						<div className="flex flex-col items-center gap-20">
							<div className="w-full">
								<h3 className="text-3xl text-center text-secondary mb-7">
									Core Team
								</h3>
								<div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl mx-auto">
									{/* Directors */}
									<MotionItem className={cellClass}>
										<Card
											image="/team/Director-of-Engineering.jpg"
											name="Giordan Nuez"
											role="Director of Engineering"
											link="https://www.linkedin.com/in/giordan-nuez-b8924838b/"
										/>
									</MotionItem>

									<MotionItem className={cellClass}>
										<Card
											image="/team/Director-of-Research-and-Compliance.jpg"
											name="Cristian Obida"
											role="Director of Research & Compliance"
											link="https://www.linkedin.com/in/cristian-r-obida-96a36b28a/"
										/>
									</MotionItem>

									<MotionItem className={cellClass}>
										<Card
											image="/team/Director-of-Community-and-Growth.jpg"
											name="Juliet Daphne Tariman"
											role="Director of Community & Growth"
											link="https://www.linkedin.com/in/juliet-daphne-e-tariman-2022b1236/"
										/>
									</MotionItem>

									<MotionItem className={cellClass}>
										<Card
											image="/team/Creative-Director.jpg"
											name="Arah Mejidana"
											role="Creative Director"
											link="https://www.linkedin.com/in/arah-mejidana-a12945398/"
										/>
									</MotionItem>

									{/* Technical & Operations */}
									{/* <MotionItem className={cellClass}>
										<Card
											image="/team/Partnerships-and-Outreach-Lead.jpg"
											name="Jabez Antinero"
											role="Partnerships & Outreach Lead"
											link="#"
										/>
									</MotionItem> */}

									<MotionItem className={cellClass}>
										<Card
											image="/team/Defensive-Security-Engineer.jpg"
											name="Emmanuel Mutas"
											role="Defensive Security Engineer"
											link="https://www.linkedin.com/in/manel04/"
										/>
									</MotionItem>

									<MotionItem className={cellClass}>
										<Card
											image="/team/Offensive-Security-Engineer.jpg"
											name="John Richie Campo"
											role="Offensive Security Engineer"
											link="https://www.linkedin.com/in/john-richie-campo/"
										/>
									</MotionItem>

									{/* <MotionItem className={cellClass}>
										<Card
											image="/team/DevOps-Engineer.jpg"
											name="Mathew Balanlay"
											role="DevOps Engineer"
											link="#"
										/>
									</MotionItem> */}

									<MotionItem className={cellClass}>
										<Card
											image="/team/Business-Operations-Associate.jpg"
											name="Aj Goze"
											role="Business Operations Associate"
											link="https://www.linkedin.com/in/aj-goze-6079ab365/"
										/>
									</MotionItem>
								</div>
							</div>
						</div>
					</div>
				</div>
			</MotionContainer>
		</section>
	);
}
