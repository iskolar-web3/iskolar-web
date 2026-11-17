// Structured data helpers that need no Vite env or `@` alias, so the build
// time prerender in vite.config.ts can use them too.

// Matches the production URLs used by the other JSON-LD blocks.
export const SITE_URL = "https://www.iskolar.io";

/** Stable id of the iSkolar Organization node, so people and pages can point at it. */
export const ORG_ID = `${SITE_URL}/#organization`;

export const SITE_DESCRIPTION =
	"iSkolar is a scholarship platform connecting students with scholarship providers, making scholarships more accessible and transparent.";

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
