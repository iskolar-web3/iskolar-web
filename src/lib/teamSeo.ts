// SEO and AEO content for team members: titles, descriptions, and schema.org
// nodes. Shared by the profile route and the build time prerender, so relative
// imports only (no Vite env, no `@` alias).
import {
	founders,
	memberPath,
	productOf,
	type TeamMember,
	teamMembers,
} from "../components/landing/team";
import { breadcrumbJsonLd, ORG_ID, SITE_DESCRIPTION, SITE_URL } from "./jsonLd";

const ORG_BLURB =
	"a scholarship platform connecting students with scholarship providers";

export const memberUrl = (member: TeamMember) =>
	`${SITE_URL}${memberPath(member)}`;

/** Name first, so a search result reads "Justin Luzano, Chief Executive Officer at iSkolar". */
export const memberTitle = (member: TeamMember) =>
	`${member.name}, ${member.role} at iSkolar`;

export function memberDescription(member: TeamMember) {
	if (member.bio) return member.bio;
	if (member.group === "founders") {
		return `${member.name} is a founder of iSkolar, ${ORG_BLURB}, and serves as ${member.role}.`;
	}
	const product = productOf(member);
	if (product) {
		return `${member.name} serves as ${member.role} on the ${product.name} team at iSkolar, ${ORG_BLURB}.`;
	}
	return `${member.name} serves as ${member.role} at iSkolar, ${ORG_BLURB}.`;
}

const orgNode = {
	"@type": "Organization",
	"@id": ORG_ID,
	name: "iSkolar",
	url: SITE_URL,
};

/** schema.org Person for one member, tied to the iSkolar Organization by `worksFor`. */
export function personJsonLd(member: TeamMember) {
	return {
		"@type": "Person",
		"@id": `${memberUrl(member)}#person`,
		name: member.name,
		jobTitle: member.role,
		description: memberDescription(member),
		url: memberUrl(member),
		...(member.image && { image: `${SITE_URL}${member.image}` }),
		...(member.linkedin && { sameAs: [member.linkedin] }),
		worksFor: orgNode,
	};
}

/** Full JSON-LD document for a member's profile page. */
export function profilePageJsonLd(member: TeamMember) {
	return {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		"@id": memberUrl(member),
		url: memberUrl(member),
		name: memberTitle(member),
		description: memberDescription(member),
		isPartOf: { "@type": "WebSite", name: "iSkolar", url: SITE_URL },
		breadcrumb: breadcrumbJsonLd([
			{ name: "Home", path: "/" },
			{ name: "About", path: "/about" },
			{ name: "Team", path: "/about#team" },
			{ name: member.name, path: memberPath(member) },
		]),
		mainEntity: personJsonLd(member),
	};
}

/** The Organization with its founders and team, for the About page. */
export function teamOrganizationJsonLd() {
	const staff = teamMembers.filter((m) => m.group !== "founders");
	return {
		...orgNode,
		logo: `${SITE_URL}/logo.jpg`,
		description: SITE_DESCRIPTION,
		founder: founders.map(personJsonLd),
		employee: staff.map(personJsonLd),
	};
}
