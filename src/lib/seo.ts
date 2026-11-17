import { SITE_DESCRIPTION } from "./jsonLd";

export { breadcrumbJsonLd } from "./jsonLd";

export const SEO_DEFAULTS = {
	siteName: "iSkolar",
	baseUrl: import.meta.env.VITE_BASE_URL || "https://www.iskolar.io",
	defaultTitle: "iSkolar",
	defaultDescription: SITE_DESCRIPTION,
	defaultImage: "/preview.jpg",
} as const;
