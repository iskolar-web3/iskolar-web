export const SEO_DEFAULTS = {
	siteName: "iSkolar",
	baseUrl: import.meta.env.VITE_BASE_URL || "https://iskolar.io",
	defaultTitle: "iSkolar | The Future of Scholarship Management",
	defaultDescription:
		"Find and apply for scholarships online. iSkolar helps students discover opportunities, submit applications, and track their progress, while enabling scholarship providers to create, manage, and award scholarship programs.",
	defaultImage: "/logo.jpg",
} as const;