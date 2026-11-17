// Build step: writes dist/about/team/<slug>/index.html for every team member.
//
// The app is a client rendered SPA, so its index.html says nothing about who a
// profile page is for. Crawlers that skip JavaScript (many answer engines) would
// only ever see the generic iSkolar tags. These files are the SPA shell with the
// member's own title, description, canonical URL, social tags, schema.org
// ProfilePage, and a plain text summary, so name and role are readable without
// running the app. At runtime react-helmet-async swaps the `data-rh` tags for
// its own, so nothing is duplicated.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import {
	groupLabel,
	productOf,
	type TeamMember,
	teamMembers,
} from "../src/components/landing/team";
import { SITE_URL } from "../src/lib/jsonLd";
import {
	memberDescription,
	memberTitle,
	memberUrl,
	profilePageJsonLd,
} from "../src/lib/teamSeo";

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

// `<` is escaped so a value can never close the script tag early.
const safeJson = (data: unknown) =>
	JSON.stringify(data).replace(/</g, "\\u003c");

/** Replace the first `<meta ...key...>` tag, or add one before `</head>` if the shell has none. */
function setMeta(html: string, attr: "name" | "property", key: string, content: string) {
	const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" data-rh="true" />`;
	const existing = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`);
	return existing.test(html)
		? html.replace(existing, () => tag)
		: html.replace("</head>", () => `    ${tag}\n  </head>`);
}

export function renderProfileHtml(shell: string, member: TeamMember) {
	const title = memberTitle(member);
	const description = memberDescription(member);
	const url = memberUrl(member);
	const image = member.image ? `${SITE_URL}${member.image}` : undefined;
	const product = productOf(member);

	let html = shell.replace(
		/<title>[^<]*<\/title>/,
		() => `<title data-rh="true">${escapeHtml(title)}</title>`,
	);

	html = setMeta(html, "name", "description", description);
	html = setMeta(html, "name", "robots", "index,follow");
	html = setMeta(html, "property", "og:type", "profile");
	html = setMeta(html, "property", "og:url", url);
	html = setMeta(html, "property", "og:title", title);
	html = setMeta(html, "property", "og:description", description);
	html = setMeta(html, "name", "twitter:url", url);
	html = setMeta(html, "name", "twitter:title", title);
	html = setMeta(html, "name", "twitter:description", description);
	if (image) {
		const alt = `${member.name}, ${member.role} at iSkolar`;
		html = setMeta(html, "property", "og:image", image);
		html = setMeta(html, "property", "og:image:secure_url", image);
		html = setMeta(html, "property", "og:image:alt", alt);
		html = setMeta(html, "name", "twitter:image", image);
		html = setMeta(html, "name", "twitter:image:alt", alt);
	}

	const head = [
		`<link rel="canonical" href="${url}" data-rh="true" />`,
		`<script type="application/ld+json" data-rh="true">${safeJson(profilePageJsonLd(member))}</script>`,
	].join("\n    ");
	html = html.replace("</head>", () => `    ${head}\n  </head>`);

	// Readable without JavaScript. The app mounts into #app and ignores this.
	const summary = [
		`<h1>${escapeHtml(member.name)}</h1>`,
		`<p>${escapeHtml(member.role)} at iSkolar</p>`,
		`<p>${escapeHtml(description)}</p>`,
		product ? `<p>${escapeHtml(groupLabel(member))}</p>` : "",
		member.linkedin
			? `<p><a href="${escapeHtml(member.linkedin)}">${escapeHtml(member.name)} on LinkedIn</a></p>`
			: "",
		`<p><a href="/about#team">Meet the whole iSkolar team</a></p>`,
	]
		.filter(Boolean)
		.join("");
	return html.replace("<body>", () => `<body>\n    <noscript>${summary}</noscript>`);
}

export function prerenderTeamProfiles(): Plugin {
	let outDir = "";
	return {
		name: "prerender-team-profiles",
		apply: "build",
		configResolved(config) {
			outDir = resolve(config.root, config.build.outDir);
		},
		async closeBundle() {
			const shell = await readFile(resolve(outDir, "index.html"), "utf-8");
			for (const member of teamMembers) {
				const dir = resolve(outDir, "about", "team", member.slug);
				await mkdir(dir, { recursive: true });
				await writeFile(
					resolve(dir, "index.html"),
					renderProfileHtml(shell, member),
				);
			}
		},
	};
}
