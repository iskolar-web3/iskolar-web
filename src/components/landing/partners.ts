// Shared partner data for the landing Ecosystem section and the About
// Partnerships section, so the two stay in sync. Logos live in
// /public/partnerships/.

// Blue color treatments matched to the Hero trust strip, so partner logos
// read in the same brand blue everywhere they appear.
// BLUE_TINT flattens line/text logos to a solid blue silhouette.
export const BLUE_TINT =
	"brightness(0) saturate(100%) invert(27%) sepia(46%) saturate(1066%) hue-rotate(196deg) brightness(91%) contrast(88%)";
// BLUE_DUOTONE keeps internal detail for filled artwork while mapping it to blue.
export const BLUE_DUOTONE =
	"grayscale(1) sepia(1) hue-rotate(190deg) saturate(2.2) brightness(0.95)";

export type PartnerCategory =
	| "Strategic Incubation Partner"
	| "Community Partner";

export type Partner = {
	name: string;
	category: PartnerCategory;
	logo: string;
	description: string;
	href: string;
	linkLabel: string;
	// CSS filter that tints the logo to brand blue (BLUE_TINT or BLUE_DUOTONE).
	filter: string;
};

export const partners: Partner[] = [
	{
		name: "BYC Ventures",
		category: "Strategic Incubation Partner",
		logo: "/partnerships/byc-ventures.png",
		description:
			"BYC Ventures is a venture studio working with iSkolar to design and scale verifiable credential infrastructure, turning student records into portable, tamper proof proof of achievement.",
		href: "https://byc.ventures",
		linkLabel: "byc.ventures",
		filter: BLUE_TINT,
	},
	{
		name: "QBO Innovation Hub",
		category: "Strategic Incubation Partner",
		logo: "/partnerships/qbo-innovation.png",
		description:
			"QBO Innovation Hub is the Philippines' first public private startup platform, giving iSkolar mentorship, investor access, and a national network of founders building for impact.",
		href: "https://www.qboinnovation.com/",
		linkLabel: "qboinnovation.com",
		filter: BLUE_DUOTONE,
	},
	{
		name: "Tutorials Dojo",
		category: "Strategic Incubation Partner",
		logo: "/partnerships/tutorials-dojo.png",
		description:
			"Tutorials Dojo lends iSkolar its experience building learning products at scale, guiding how students discover scholarships and prepare for the opportunities that fit them.",
		href: "https://tutorialsdojo.com",
		linkLabel: "tutorialsdojo.com",
		filter: BLUE_TINT,
	},
	{
		name: "Cryptita Plays",
		category: "Community Partner",
		logo: "/partnerships/cryptita-plays.png",
		description:
			"Cryptita Plays runs an engaged Web3 and gaming community that helps iSkolar introduce transparent, blockchain backed scholarships to a wider student audience.",
		href: "https://cryptitaplays.org",
		linkLabel: "cryptitaplays.org",
		filter: BLUE_TINT,
	},
	{
		name: "Tech Kubo",
		category: "Community Partner",
		logo: "/partnerships/tech-kubo.png",
		description:
			"Tech Kubo brings together a grassroots community of student developers and builders, helping iSkolar reach the learners shaping the next wave of Filipino tech.",
		href: "https://techkubo.com/",
		linkLabel: "techkubo.com",
		filter: BLUE_DUOTONE,
	},
	{
		name: "AWS Learning Club Heron",
		category: "Community Partner",
		logo: "/partnerships/aws-learning-club-heron.png",
		description:
			"The AWS Learning Club Heron is a student cloud community that connects iSkolar with learners pursuing cloud skills and certifications across partner campuses.",
		href: "https://www.facebook.com/awslearningclubheron",
		linkLabel: "awslearningclub.org",
		filter: BLUE_DUOTONE,
	},
];

// Group-level copy used by the landing Ecosystem section.
export type PartnerGroup = {
	category: PartnerCategory;
	label: string;
	description: string;
	partners: Partner[];
};

export const partnerGroups: PartnerGroup[] = [
	{
		category: "Strategic Incubation Partner",
		label: "Strategic Incubation Partners",
		description:
			"The studios, hubs, and mentors who shape how iSkolar is built. They back our team with capital, technical guidance, and the networks that turn an idea into infrastructure students can rely on.",
		partners: partners.filter(
			(p) => p.category === "Strategic Incubation Partner",
		),
	},
	{
		category: "Community Partner",
		label: "Community Partners",
		description:
			"The communities that carry iSkolar to the students who need it. They open doors to learners, builders, and campuses across the Philippines, helping scholarships reach further than we could alone.",
		partners: partners.filter((p) => p.category === "Community Partner"),
	},
];
