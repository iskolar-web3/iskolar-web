export const SEO_DEFAULTS = {
	siteName: "iSkolar",
	baseUrl: import.meta.env.VITE_BASE_URL || "https://iskolar.io",
	defaultTitle: "iSkolar | The Future of Scholarship Management",
	defaultDescription:
		"A digital ecosystem transforming how scholarships are discovered, applied for, received, and managed. Join iSkolar today.",
	defaultImage: "/preview.jpg",
} as const;