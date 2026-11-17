// Single source of truth for iSkolar's social channels. The Socials page, the
// footer icons and the page's structured data all read from here.

export type SocialId =
	| "facebook"
	| "community"
	| "instagram"
	| "linkedin"
	| "x"
	| "threads"
	| "substack";

export type Social = {
	id: SocialId;
	name: string;
	handle: string;
	href: string;
	description: string;
	cta: string;
	// Shown as an icon in the footer. Every channel except the Facebook
	// community, which is a group rather than an account to follow.
	inFooter?: boolean;
};

export const socials: Social[] = [
	{
		id: "community",
		name: "Facebook Community",
		handle: "iSkolar Community",
		href: "https://www.facebook.com/groups/1335360015313855/",
		description:
			"A place to ask questions, share opportunities, and learn from fellow students and scholars.",
		cta: "Join the group",
	},
	{
		id: "facebook",
		name: "Facebook",
		handle: "iskolar.io",
		href: "https://www.facebook.com/iskolar.io/",
		description:
			"Announcements, product updates, and scholarship news from the iSkolar team.",
		cta: "Follow the page",
		inFooter: true,
	},
	{
		id: "instagram",
		name: "Instagram",
		handle: "@iskolar_web3",
		href: "https://www.instagram.com/iskolar_web3",
		description:
			"Student stories and behind the scenes moments, told in pictures.",
		cta: "Follow on Instagram",
		inFooter: true,
	},
	{
		id: "linkedin",
		name: "LinkedIn",
		handle: "iskolarweb3",
		href: "https://www.linkedin.com/company/iskolarweb3/",
		description:
			"Company news, partnerships, and the work behind building iSkolar.",
		cta: "Follow on LinkedIn",
		inFooter: true,
	},
	{
		id: "x",
		name: "X",
		handle: "@iskolarweb3",
		href: "https://x.com/iskolarweb3",
		description: "Short updates, launches, and conversations as they happen.",
		cta: "Follow on X",
		inFooter: true,
	},
	{
		id: "threads",
		name: "Threads",
		handle: "@iskolar_web3",
		href: "https://www.threads.com/@iskolar_web3",
		description: "Casual conversations and quick takes from the team.",
		cta: "Follow on Threads",
		inFooter: true,
	},
	{
		id: "substack",
		name: "Substack",
		handle: "@iskolarofficial",
		href: "https://substack.com/@iskolarofficial",
		description:
			"Longer reads and updates from the team, straight to your inbox.",
		cta: "Read on Substack",
		inFooter: true,
	},
];
