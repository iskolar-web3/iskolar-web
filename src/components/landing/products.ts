export type ProductStatus = "Live" | "Pilot" | "Soon";

export type Product = {
	id: string;
	name: string;
	/** Transparent product mark in `public/products/` (iSkolar uses the main logo). */
	logo: string;
	/** The step of the student path this product covers. */
	stage: string;
	tagline: string;
	description: string;
	audience: string;
	status: ProductStatus;
	href?: string;
	/** Screenshot in `public/products/`, e.g. `/products/verity-preview.png`. */
	image?: string;
};

// Ordered along the student path, senior high to first job.
// Single source for the Journey section, navbar, footer, and FAQ.
export const products: Product[] = [
	{
		id: "pathfinder",
		name: "PathFinder",
		logo: "/products/pathfinder.svg",
		stage: "Choose a course",
		tagline: "Find the college course that fits who you are.",
		description:
			"A short visual survey matches you with five courses, each with a match score, starting salary, and board exam indicator.",
		audience: "Senior high students",
		status: "Soon",
	},
	{
		id: "review",
		name: "Review",
		logo: "/products/review.svg",
		stage: "Pass the entrance exam",
		tagline: "Prepare for UPCAT, ACET, DCAT, and USTET with real mock exams.",
		description:
			"Timed and review modes, courses from trusted review centers, and certification prep for tech careers.",
		audience: "Senior high and college students",
		status: "Soon",
	},
	{
		id: "iskolar",
		name: "iSkolar",
		logo: "/logo.png",
		stage: "Fund your studies",
		tagline: "Discover, apply for, and track scholarships in one place.",
		description:
			"Sponsors post programs, students apply online, and every disbursement is recorded transparently.",
		audience: "Students, sponsors, and schools",
		status: "Live",
		href: "/register",
	},
	{
		id: "academy",
		name: "Academy",
		logo: "/products/academy.svg",
		stage: "Build what you learn",
		tagline: "Show your projects to the people looking for them.",
		description:
			"Ship a working MVP, pass a quality review, and get discovered by sponsors, recruiters, and investors. Thesis grants help early ideas start.",
		audience: "College builders and sponsors",
		status: "Live",
		href: "https://academy.iskolar.io",
	},
	{
		id: "vocation",
		name: "Vocation",
		logo: "/products/vocation.svg",
		stage: "Land your first internship",
		tagline: "Find internships and OJT, and book time with career coaches.",
		description:
			"A verified company directory, one click apply, and coaching programs built for students.",
		audience: "Students, coaches, and employers",
		status: "Live",
	},
	{
		id: "verity",
		name: "Verity",
		logo: "/products/verity.svg",
		stage: "Prove what you earned",
		tagline: "Tamper proof diplomas and transcripts anyone can verify.",
		description:
			"Registrars issue credentials anchored on the blockchain. Only a fingerprint goes on chain, never personal data.",
		audience: "Registrars, students, and employers",
		status: "Pilot",
	},
];
