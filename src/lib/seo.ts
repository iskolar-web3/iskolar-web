export const SEO_DEFAULTS = {
	siteName: "iSkolar",
	baseUrl: import.meta.env.VITE_BASE_URL || "https://www.iskolar.io",
	defaultTitle: "iSkolar",
	defaultDescription:
		"iSkolar is a scholarship platform connecting students with scholarship providers, making scholarships more accessible and transparent.",
	defaultImage: "/preview.jpg",
} as const;

// Matches the production URLs used by the other JSON-LD blocks.
const SITE_URL = "https://www.iskolar.io";

/** schema.org BreadcrumbList, ordered from the home page to the current page. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
	return {
		"@type": "BreadcrumbList",
		itemListElement: trail.map((crumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: crumb.name,
			item: `${SITE_URL}${crumb.path}`,
		})),
	};
}
