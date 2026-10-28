// Schools our students come from, shown as a row of seals in the Hero.
// Logos live in /public/schools/.

export type School = {
	id: string;
	name: string;
	// Label under the seal; the full name stays on the image and tooltip.
	shortName: string;
	logo: string;
};

export const schools: School[] = [
	{
		id: "up",
		name: "University of the Philippines",
		shortName: "UP",
		logo: "/schools/university-of-the-philippines.svg",
	},
	{
		id: "ateneo",
		name: "Ateneo de Manila University",
		shortName: "Ateneo",
		logo: "/schools/ateneo-de-manila-university.webp",
	},
	{
		id: "dlsu",
		name: "De La Salle University",
		shortName: "DLSU",
		logo: "/schools/de_la_salle_university.png",
	},
	{
		id: "ust",
		name: "University of Santo Tomas",
		shortName: "UST",
		logo: "/schools/university_of_santo_tomas.webp",
	},
	{
		id: "pup",
		name: "Polytechnic University of the Philippines",
		shortName: "PUP",
		logo: "/schools/polytechnic-university-of-the-philippines.png",
	},
	{
		id: "feu",
		name: "Far Eastern University",
		shortName: "FEU",
		logo: "/schools/far_eastern_university.webp",
	},
	{
		id: "adamson",
		name: "Adamson University",
		shortName: "Adamson",
		logo: "/schools/adamson_university.png",
	},
	{
		id: "umak",
		name: "University of Makati",
		shortName: "UMak",
		logo: "/schools/university-of-makati.png",
	},
	{
		id: "apc",
		name: "Asia Pacific College",
		shortName: "APC",
		logo: "/schools/asia-pacific-college.png",
	},
];
