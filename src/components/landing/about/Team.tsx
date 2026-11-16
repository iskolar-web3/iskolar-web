import { Linkedin, User } from "lucide-react";
import {
	MotionContainer,
	MotionItem,
} from "@/components/landing/MotionContainer";
import { products } from "@/components/landing/products";

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

type TeamMember = {
	name: string;
	role: string;
	image?: string;
	link?: string;
};

// Placeholder card for a seat that has no announced member yet.
const tba: TeamMember = { name: "Name TBA", role: "Role TBA" };

// Per product team: the product's website and its members, ordered by rank
// (left to right). Replace a `tba` seat with a real member (name, role, image,
// link) as each team is announced.
const productTeamConfig: Record<
	string,
	{ site: string; members: TeamMember[] }
> = {
	academy: {
		site: "academy.iskolar.io",
		members: [
			{
				name: "Mathew Angelo Balanlay",
				role: "Full Stack Developer",
				image: "/team/Academy_Full-Stack-Developer.jpg",
				link: "https://www.linkedin.com/in/mathew-angelo-balanlay-14b703357/",
			},
			tba,
		],
	},
	vocation: {
		site: "vocation.iskolar.io",
		members: [tba, tba, tba],
	},
};

const productTeams = products
	.filter((product) => product.id in productTeamConfig)
	.map((product) => {
		const { site, members } = productTeamConfig[product.id];
		return {
			product,
			site,
			members: members.map((member, n) => ({
				...member,
				key: `${product.id}-member-${n + 1}`,
			})),
		};
	});

// Product teams still have placeholder seats, so the block is hidden unless
// VITE_ENABLE_PRODUCT_TEAMS=true. Leave it unset/false on prod until the teams
// are filled in.
const showProductTeams = import.meta.env.VITE_ENABLE_PRODUCT_TEAMS === "true";

// `image` and `link` are optional so a card can render as a placeholder
// (generic avatar, no LinkedIn) until the member's details are available.
const Card = ({
	image,
	name,
	role,
	link,
}: {
	image?: string;
	name: string;
	role: string;
	link?: string;
}) => (
	<div
		className={`
    relative bg-background backdrop-blur-sm border border-secondary/10 shadow-lg rounded-xl
    flex flex-col items-center text-center p-6
    w-full min-w-60 max-w-[280px] h-[280px]
    transition-transform hover:-translate-y-1 duration-300 group
  `}
	>
		{image ? (
			<img
				src={image}
				alt={`${name}, ${role} at iSkolar`}
				className="w-28 h-28 rounded-full mb-4 overflow-hidden object-cover border-2 border-secondary/20 group-hover:border-secondary/50 transition-colors"
			/>
		) : (
			<div
				aria-hidden
				className="w-28 h-28 rounded-full mb-4 flex items-center justify-center bg-secondary/5 text-secondary/40 border-2 border-dashed border-secondary/20 group-hover:border-secondary/50 transition-colors"
			>
				<User className="w-12 h-12" />
			</div>
		)}
		<h3 className="text-lg font-bold text-secondary mb-1">{name}</h3>
		<p className="text-sm text-secondary/85 mb-4 min-h-[2.5rem]">{role}</p>
		{link ? (
			<a
				href={link}
				target="_blank"
				rel="noreferrer"
				aria-label={`${name} on LinkedIn`}
				className="mt-auto p-2 text-secondary/80 hover:text-secondary rounded-full transition-all"
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
									{/* Chiefs */}
									<MotionItem className={cellClass}>
										<Card
											image="/team/CGO.jpg"
											name="Chrysler Añonuevo"
											role="Chief Growth Officer"
											link="https://www.linkedin.com/in/hryscript/"
										/>
									</MotionItem>

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
											image="/team/Director-of-Creatives.jpg"
											name="Arah Mejidana"
											role="Director of Creatives"
											link="https://www.linkedin.com/in/arah-mejidana-a12945398/"
										/>
									</MotionItem>

									{/* Technical & Operations */}
									<MotionItem className={cellClass}>
										<Card
											image="/team/Principal-Software-Engineer.jpg"
											name="Joshua Armojallas"
											role="Principal Software Engineer"
											link="https://www.linkedin.com/in/clbjsh/"
										/>
									</MotionItem>

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

						{/* Product Teams */}
						{showProductTeams && (
							<div className="w-full flex flex-col items-center gap-12">
								<div className="text-center">
									<h3 className="text-3xl text-secondary mb-3">
										Product Teams
									</h3>
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
											{members.map(({ key, ...member }) => (
												<MotionItem key={key} className={productCellClass}>
													<Card {...member} />
												</MotionItem>
											))}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</MotionContainer>
		</section>
	);
}
