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
	| "Company Partner"
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
			"BYC Ventures is working with iSkolar to design and scale verifiable credential infrastructure, turning student records into portable, tamper-proof achievement.",
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
		category: "Company Partner",
		logo: "/partnerships/tutorials-dojo.png",
		description:
			"Tutorials Dojo lends iSkolar its experience building learning products at scale, guiding how students discover scholarships and prepare for the opportunities that fit them.",
		href: "https://tutorialsdojo.com",
		linkLabel: "tutorialsdojo.com",
		filter: BLUE_TINT,
	},
	{
		name: "Jia Talent Vault",
		category: "Company Partner",
		logo: "/partnerships/jia-whitecloak.png",
		description:
			"Jia Talent Vault by WhiteCloak is a talent and internship platform built for the same vocation students iSkolar serves, giving them a place to turn verified scholarship achievements into internship and career opportunities.",
		href: "https://talentvault.hellojia.ai",
		linkLabel: "talentvault.hellojia.ai",
		filter: BLUE_TINT,
	},
	{
		name: "PDYN Technologies",
		category: "Community Partner",
		logo: "/partnerships/pdyn-technologies.webp",
		description:
			"PDYN Technologies is a technology company that has joined iSkolar's circle of partners, supporting the platform as it builds scholarship infrastructure for students and sponsors across the Philippines.",
		href: "https://www.facebook.com/profile.php?id=61595269470373",
		linkLabel: "PDYN Technologies on Facebook",
		filter: BLUE_TINT,
	},
	{
		name: "Cryptita Plays",
		category: "Community Partner",
		logo: "/partnerships/cryptita-plays.webp",
		description:
			"Cryptita Plays runs an engaged Web3 community that helps iSkolar introduce transparent, blockchain backed scholarships to a wider student audience.",
		href: "https://cryptitaplays.org",
		linkLabel: "cryptitaplays.org",
		filter: BLUE_TINT,
	},
	{
		name: "Tech Kubo",
		category: "Community Partner",
		logo: "/partnerships/tech-kubo.webp",
		description:
			"Tech Kubo extends iSkolar's reach to student developers through its free hands-on labs platform, connecting scholarship opportunities with learners actively building technical skills and portfolios.",
		href: "https://techkubo.com/",
		linkLabel: "techkubo.com",
		filter: BLUE_DUOTONE,
	},
	{
		name: "AWS Learning Club Heron",
		category: "Community Partner",
		logo: "/partnerships/aws-learning-club-heron.webp",
		description:
			"AWS Learning Club Heron is a student-led cloud community, founded alongside iSkolar, that connects the platform with learners building practical AWS skills and cloud expertise.",
		href: "https://www.facebook.com/awslearningclubheron",
		linkLabel: "awslearningclub.org",
		filter: BLUE_DUOTONE,
	},
	{
		name: "AWS Student Builder Group UP Mindanao",
		category: "Community Partner",
		logo: "/partnerships/aws-up-mindanao.webp",
		description:
			"AWS Student Builder Group UP Mindanao is a student-led cloud community in Davao City, bringing iSkolar to University of the Philippines Mindanao learners who are building hands-on AWS skills.",
		href: "https://www.facebook.com/awscc.up",
		linkLabel: "facebook.com/awscc.up",
		filter: BLUE_DUOTONE,
	},
	{
		name: "AWS Student Builder Group Tempest",
		category: "Community Partner",
		logo: "/partnerships/aws-sbg-tempest.webp",
		description:
			"AWS Student Builder Group Tempest is a student cloud community in Muntinlupa City, connecting iSkolar with learners who are building hands-on AWS skills.",
		href: "https://www.facebook.com/AWSSBG.Tempest",
		linkLabel: "facebook.com/AWSSBG.Tempest",
		filter: BLUE_DUOTONE,
	},
	{
		name: "AWS User Group e:Novators",
		category: "Community Partner",
		logo: "/partnerships/aws-user-group-enovators.webp",
		description:
			"AWS User Group e:Novators is a student community under AWS User Group Philippines that grows young innovators and technopreneurs, opening iSkolar to student builders through cloud learning and community events.",
		href: "https://www.facebook.com/awsugenovatorsph",
		linkLabel: "facebook.com/awsugenovatorsph",
		filter: BLUE_DUOTONE,
	},
	{
		name: "Seekers Guild",
		category: "Community Partner",
		logo: "/partnerships/seekers-guild-mark.png",
		description:
			"Seekers Guild is a community of students, builders, and young professionals that gathers through meetups and events, helping iSkolar reach learners who are looking for their next opportunity.",
		href: "https://www.linkedin.com/company/seekersguildcommunity/",
		linkLabel: "linkedin.com/company/seekersguildcommunity",
		filter: BLUE_TINT,
	},
	{
		name: "WorkFlow PH",
		category: "Community Partner",
		logo: "/partnerships/workflow-ph-mark.png",
		description:
			"WorkFlow PH is a volunteer driven community building the automation landscape of the Philippines, introducing iSkolar to learners and builders who are putting automation to work.",
		href: "https://www.facebook.com/WorkFlowPH",
		linkLabel: "facebook.com/WorkFlowPH",
		filter: BLUE_TINT,
	},
	{
		name: "Startup Machine",
		category: "Community Partner",
		logo: "/partnerships/startup-machine.webp",
		description:
			"Startup Machine is a startup community and publication that featured iSkolar in its newsletter, helping the platform reach founders, builders, and students.",
		href: "https://www.facebook.com/startupmachine",
		linkLabel: "facebook.com/startupmachine",
		filter: BLUE_TINT,
	},
	{
		name: "StellarPH",
		category: "Community Partner",
		logo: "/partnerships/stellarph.webp",
		description:
			"StellarPH is a Cebu based startup enabler that inspires, educates, and supports Filipino entrepreneurs through mentorship, training, and community, opening iSkolar to student founders and schools.",
		href: "https://stellarph.io/",
		linkLabel: "stellarph.io",
		filter: BLUE_TINT,
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
		category: "Company Partner",
		label: "Company Partners",
		description:
			"The companies that put iSkolar's verified credentials to work beyond the classroom, turning scholarship achievements into opportunities in the job market.",
		partners: partners.filter((p) => p.category === "Company Partner"),
	},
	{
		category: "Community Partner",
		label: "Community Partners",
		description:
			"The communities that carry iSkolar to the students who need it. They open doors to learners, builders, and campuses across the Philippines, helping scholarships reach further than we could alone.",
		partners: partners.filter((p) => p.category === "Community Partner"),
	},
];
