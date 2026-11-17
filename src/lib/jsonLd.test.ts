import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_DESCRIPTION } from "./jsonLd";

// index.html is static and cannot import the constant, so this keeps its four
// copies (description, og, twitter, Organization JSON-LD) from drifting.
describe("site description", () => {
	it("matches every copy in index.html", () => {
		const html = readFileSync(resolve(process.cwd(), "index.html"), "utf-8");
		expect(html.split(SITE_DESCRIPTION).length - 1).toBe(4);
	});

	it("does not describe iSkolar as scholarship only", () => {
		expect(SITE_DESCRIPTION).not.toMatch(/scholarship platform/i);
	});
});
