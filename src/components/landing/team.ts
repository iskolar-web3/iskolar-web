// Single source for the Team section, each member's profile page, their
// structured data, the sitemap check, and the FAQ. Relative imports only: the
// Vite config pulls this file in for build time prerendering, where the `@`
// alias does not exist.
import { type Product, products } from "./products";

export type TeamGroup = "founders" | "core" | "product";

export type TeamMember = {
	/** URL segment for the profile page, /about/team/<slug>. Never change one once published. */
	slug: string;
	name: string;
	role: string;
	group: TeamGroup;
	/** Photo in `public/team/`. Cards fall back to a generic avatar without it. */
	image?: string;
	linkedin?: string;
	/** Product team the member builds for, matching an id in products.ts. */
	productId?: string;
	/** Optional first person or third person bio. Shown on the profile page and in search snippets. */
	bio?: string;
};

// Ordered by rank (left to right on the About page).
export const teamMembers: TeamMember[] = [
	// Founders
	{
		slug: "justin-luzano",
		name: "Justin Luzano",
		role: "Chief Executive Officer",
		group: "founders",
		image: "/team/CEO.jpg",
		linkedin: "https://www.linkedin.com/in/justinluzano23/",
	},
	{
		slug: "louigie-caminoy",
		name: "Louigie Caminoy",
		role: "Chief Technology Officer",
		group: "founders",
		image: "/team/CTO.jpg",
		linkedin: "https://www.linkedin.com/in/louie1221",
	},
	{
		slug: "adam-ruadilla",
		name: "Adam Ruadilla",
		role: "Chief Operating Officer",
		group: "founders",
		image: "/team/COO.jpg",
		linkedin: "https://www.linkedin.com/in/adam-ruadilla/",
	},
	{
		slug: "jeselle-francisco",
		name: "Jeselle Francisco",
		role: "Chief Financial Officer",
		group: "founders",
		image: "/team/CFO.jpg",
		linkedin: "https://www.linkedin.com/in/maria-jeselle-francisco-736491369/",
	},

	// Core team
	{
		slug: "chrysler-anonuevo",
		name: "Chrysler Añonuevo",
		role: "Chief Growth Officer",
		group: "core",
		image: "/team/CGO.jpg",
		linkedin: "https://www.linkedin.com/in/hryscript/",
	},
	{
		slug: "giordan-nuez",
		name: "Giordan Nuez",
		role: "Director of Engineering",
		group: "core",
		image: "/team/Director-of-Engineering.jpg",
		linkedin: "https://www.linkedin.com/in/giordan-nuez-b8924838b/",
	},
	{
		slug: "cristian-obida",
		name: "Cristian Obida",
		role: "Director of Research & Compliance",
		group: "core",
		image: "/team/Director-of-Research-and-Compliance.jpg",
		linkedin: "https://www.linkedin.com/in/cristian-r-obida-96a36b28a/",
	},
	{
		slug: "juliet-daphne-tariman",
		name: "Juliet Daphne Tariman",
		role: "Director of Community & Growth",
		group: "core",
		image: "/team/Director-of-Community-and-Growth.jpg",
		linkedin: "https://www.linkedin.com/in/juliet-daphne-e-tariman-2022b1236/",
	},
	{
		slug: "arah-mejidana",
		name: "Arah Mejidana",
		role: "Director of Creatives",
		group: "core",
		image: "/team/Director-of-Creatives.jpg",
		linkedin: "https://www.linkedin.com/in/arah-mejidana-a12945398/",
	},
	{
		slug: "joshua-armojallas",
		name: "Joshua Armojallas",
		role: "Principal Software Engineer",
		group: "core",
		image: "/team/Principal-Software-Engineer.jpg",
		linkedin: "https://www.linkedin.com/in/clbjsh/",
	},
	// Hidden until Jabez Antinero's profile is ready to publish:
	// { slug: "jabez-antinero", name: "Jabez Antinero", role: "Partnerships & Outreach Lead",
	//   group: "core", image: "/team/Partnerships-and-Outreach-Lead.jpg" },
	{
		slug: "emmanuel-mutas",
		name: "Emmanuel Mutas",
		role: "Defensive Security Engineer",
		group: "core",
		image: "/team/Defensive-Security-Engineer.jpg",
		linkedin: "https://www.linkedin.com/in/manel04/",
	},
	{
		slug: "john-richie-campo",
		name: "John Richie Campo",
		role: "Offensive Security Engineer",
		group: "core",
		image: "/team/Offensive-Security-Engineer.jpg",
		linkedin: "https://www.linkedin.com/in/john-richie-campo/",
	},
	{
		slug: "mathew-angelo-balanlay",
		name: "Mathew Angelo Balanlay",
		role: "DevOps Engineer",
		group: "core",
		image: "/team/Devops-Engineer.jpg",
		linkedin: "https://www.linkedin.com/in/mathew-angelo-balanlay-14b703357/",
	},
	{
		slug: "aj-goze",
		name: "Aj Goze",
		role: "Business Operations Associate",
		group: "core",
		image: "/team/Business-Operations-Associate.jpg",
		linkedin: "https://www.linkedin.com/in/aj-goze-6079ab365/",
	},

	// Product teams
	{
		slug: "geinel-dungao",
		name: "Geinel Dungao",
		role: "Full Stack Developer",
		group: "product",
		productId: "academy",
		image: "/team/Academy_Full-Stack-Developer.jpg",
		linkedin: "https://www.linkedin.com/in/geineldungao/",
	},
	{
		slug: "alexandre-nevero",
		name: "Alexandre Nevero",
		role: "Product Manager",
		group: "product",
		productId: "vocation",
		image: "/team/Vocation_Product-Manager.jpg",
		linkedin: "https://www.linkedin.com/in/alexandre-andrei-nevero/",
	},
	{
		slug: "clarisse-salazar",
		name: "Clarisse Salazar",
		role: "Frontend Developer",
		group: "product",
		productId: "vocation",
		image: "/team/Vocation_Frontend-Developer.jpg",
		linkedin: "https://www.linkedin.com/in/clarisse-jem-salazar/",
	},
	{
		slug: "jimuelle-patron",
		name: "Jimuelle Patron",
		role: "Backend Developer",
		group: "product",
		productId: "vocation",
		image: "/team/Vocation_Backend-Developer.jpg",
		linkedin: "https://www.linkedin.com/in/jimuellepatron/",
	},
];

// Website of each product team shown under its name on the About page.
export const productTeamSites: Record<string, string> = {
	academy: "academy.iskolar.io",
	vocation: "vocation.iskolar.io",
};

export const founders = teamMembers.filter((m) => m.group === "founders");
export const coreTeam = teamMembers.filter((m) => m.group === "core");

export const productTeams = products
	.filter((product) => product.id in productTeamSites)
	.map((product) => ({
		product,
		site: productTeamSites[product.id],
		members: teamMembers.filter((m) => m.productId === product.id),
	}));

export const findMember = (slug: string) =>
	teamMembers.find((m) => m.slug === slug);

export const productOf = (member: TeamMember): Product | undefined =>
	member.productId
		? products.find((p) => p.id === member.productId)
		: undefined;

export const memberPath = (member: TeamMember) => `/about/team/${member.slug}`;

/** Short label for the group a member belongs to, e.g. "Founder" or "Vocation Team". */
export function groupLabel(member: TeamMember) {
	if (member.group === "founders") return "Founder";
	if (member.group === "core") return "Core Team";
	return `${productOf(member)?.name ?? "Product"} Team`;
}
