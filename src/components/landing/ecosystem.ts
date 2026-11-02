// Global ecosystem partners that back iSkolar with grants and support, shown
// as a card in the landing Ecosystem section. Marks live in /public/ecosystem/
// as single color SVGs, tinted to brand blue at render time. Add a partner by
// dropping its SVG in that folder and appending an entry here.

export type EcosystemPartner = {
	id: string;
	name: string;
	logo: string;
};

export const ecosystemGroup = {
	label: "Global Ecosystem Partners",
	description:
		"Global technology companies that back iSkolar with grants and support, helping our team build for Filipino students.",
};

export const ecosystemPartners: EcosystemPartner[] = [
	{ id: "claude", name: "Claude", logo: "/ecosystem/claude.svg" },
	{ id: "notion", name: "Notion", logo: "/ecosystem/notion.svg" },
	{ id: "linear", name: "Linear", logo: "/ecosystem/linear.svg" },
];
