// Shared partner data for the landing Ecosystem section and the About
// Partnerships section, so the two stay in sync. Logos live in
// /public/partnerships/.

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
	},
	{
		name: "QBO Innovation Hub",
		category: "Strategic Incubation Partner",
		logo: "/partnerships/qbo-innovation.png",
		description:
			"QBO Innovation Hub is the Philippines' first public private startup platform, giving iSkolar mentorship, investor access, and a national network of founders building for impact.",
		href: "https://www.qboinnovation.com/",
		linkLabel: "qbo.com.ph",
	},
	{
		name: "Tutorials Dojo",
		category: "Strategic Incubation Partner",
		logo: "/partnerships/tutorials-dojo.png",
		description:
			"Tutorials Dojo lends iSkolar its experience building learning products at scale, guiding how students discover scholarships and prepare for the opportunities that fit them.",
		href: "https://tutorialsdojo.com",
		linkLabel: "tutorialsdojo.com",
	},
	{
		name: "Cryptita Plays",
		category: "Community Partner",
		logo: "/partnerships/cryptita-plays.png",
		description:
			"Cryptita Plays runs an engaged Web3 and gaming community that helps iSkolar introduce transparent, blockchain backed scholarships to a wider student audience.",
		href: "https://cryptitaplays.org",
		linkLabel: "cryptitaplays.org",
	},
	{
		name: "Tech Kubo",
		category: "Community Partner",
		logo: "/partnerships/tech-kubo.png",
		description:
			"Tech Kubo brings together a grassroots community of student developers and builders, helping iSkolar reach the learners shaping the next wave of Filipino tech.",
		href: "https://techkubo.com/",
		linkLabel: "techkubo.com",
	},
	{
		name: "AWS Learning Club Heron",
		category: "Community Partner",
		logo: "/partnerships/aws-learning-club-heron.png",
		description:
			"The AWS Learning Club Heron is a student cloud community that connects iSkolar with learners pursuing cloud skills and certifications across partner campuses.",
		href: "https://www.facebook.com/awslearningclubheron",
		linkLabel: "awslearningclub.org",
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
