import { Helmet } from "react-helmet-async";
import { SEO_DEFAULTS } from "@/lib/seo";

export interface SEOProps {
	title?: string;
	description?: string;
	image?: string;
	canonicalPath?: string;
	noindex?: boolean;
	ogType?: "website" | "article";
}

export function SEO({
	title,
	description = SEO_DEFAULTS.defaultDescription,
	image = SEO_DEFAULTS.defaultImage,
	canonicalPath,
	noindex = false,
	ogType = "website",
}: SEOProps) {
	const fullTitle = title
		? `${SEO_DEFAULTS.siteName} | ${title}`
		: SEO_DEFAULTS.defaultTitle;

	const absoluteImage = image.startsWith("http")
		? image
		: `${SEO_DEFAULTS.baseUrl}${image}`;

	const canonicalUrl = canonicalPath
		? `${SEO_DEFAULTS.baseUrl}${canonicalPath}`
		: undefined;

	if (noindex) {
		return (
			<Helmet>
				<title>{fullTitle}</title>
				<meta name="robots" content="noindex,nofollow" />
			</Helmet>
		);
	}

	return (
		<Helmet>
			<title>{fullTitle}</title>
			<meta name="description" content={description} />
			<meta name="robots" content="index,follow" />
			{canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
			<meta property="og:type" content={ogType} />
			<meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={absoluteImage} />
			{canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={absoluteImage} />
		</Helmet>
	);
}
