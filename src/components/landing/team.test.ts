import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderProfileHtml } from "../../../scripts/prerenderTeam";
import { SITE_URL } from "../../lib/jsonLd";
import {
	memberDescription,
	memberTitle,
	memberUrl,
	profilePageJsonLd,
	teamOrganizationJsonLd,
} from "../../lib/teamSeo";
import { products } from "./products";
import { teamMembers } from "./team";

const publicDir = resolve(process.cwd(), "public");

describe("team data", () => {
	it("gives every member a unique, URL safe slug", () => {
		const slugs = teamMembers.map((m) => m.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
	});

	it("points every photo at a file that exists", () => {
		for (const m of teamMembers) {
			if (m.image)
				expect(existsSync(resolve(publicDir, `.${m.image}`))).toBe(true);
		}
	});

	it("ties product team members to a real product", () => {
		for (const m of teamMembers.filter((x) => x.group === "product")) {
			expect(products.some((p) => p.id === m.productId)).toBe(true);
		}
	});

	it("lists every profile page in the sitemap", () => {
		const sitemap = readFileSync(resolve(publicDir, "sitemap.xml"), "utf-8");
		for (const m of teamMembers) {
			expect(sitemap).toContain(`<loc>${memberUrl(m)}</loc>`);
		}
	});

	it("keeps dashes out of user facing copy", () => {
		for (const m of teamMembers) {
			expect(memberTitle(m)).not.toMatch(/[–—]/);
			expect(memberDescription(m)).not.toMatch(/[–—]/);
		}
	});
});

describe("team structured data", () => {
	it("describes each member as a Person who works for iSkolar", () => {
		for (const m of teamMembers) {
			const { mainEntity } = profilePageJsonLd(m);
			expect(mainEntity["@type"]).toBe("Person");
			expect(mainEntity.name).toBe(m.name);
			expect(mainEntity.jobTitle).toBe(m.role);
			expect(mainEntity.worksFor.name).toBe("iSkolar");
			if (m.linkedin) expect(mainEntity.sameAs).toEqual([m.linkedin]);
		}
	});

	it("lists founders and staff on the organization", () => {
		const org = teamOrganizationJsonLd();
		expect(org.founder).toHaveLength(
			teamMembers.filter((m) => m.group === "founders").length,
		);
		expect(org.founder.length + org.employee.length).toBe(teamMembers.length);
	});
});

describe("prerendered profile page", () => {
	const shell = `<!DOCTYPE html><html><head>
    <title>iSkolar</title>
    <meta name="description" content="generic" />
    <meta property="og:title" content="iSkolar" />
    <meta property="og:image" content="${SITE_URL}/preview.jpg" />
    <meta property="og:image:width" content="1920" />
  </head><body><div id="app"></div></body></html>`;
	const member = teamMembers[0];
	const html = renderProfileHtml(shell, member);

	it("swaps the generic head tags for the member's own", () => {
		expect(html).toContain(
			`<title data-rh="true">${memberTitle(member)}</title>`,
		);
		expect(html).toContain(`content="${memberDescription(member)}"`);
		expect(html).not.toContain('content="generic"');
		expect(html).toContain(`<link rel="canonical" href="${memberUrl(member)}"`);
		expect(html).toContain(`${SITE_URL}${member.image}`);
		// Only the matching tag is replaced, not og:image:width.
		expect(html).toContain('<meta property="og:image:width" content="1920" />');
	});

	it("embeds a ProfilePage that parses as JSON", () => {
		const match = html.match(
			/<script type="application\/ld\+json" data-rh="true">(.*?)<\/script>/s,
		);
		expect(match).not.toBeNull();
		expect(JSON.parse(match?.[1] ?? "")["@type"]).toBe("ProfilePage");
	});

	it("keeps a text summary for crawlers without JavaScript and leaves #app empty", () => {
		expect(html).toContain("<noscript><h1>");
		expect(html).toContain('<div id="app"></div>');
	});
});
