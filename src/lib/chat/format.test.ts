import { describe, expect, it } from "vitest";
import { parseAnswer, parseInline } from "./format";

describe("parseInline", () => {
	it("parses bold, links, and email addresses", () => {
		expect(
			parseInline(
				"Tap **Apply Now**, see [products](https://www.iskolar.io/products), or email hello@iskolar.io.",
			),
		).toEqual([
			{ type: "text", text: "Tap " },
			{ type: "bold", children: [{ type: "text", text: "Apply Now" }] },
			{ type: "text", text: ", see " },
			{
				type: "link",
				label: "products",
				href: "https://www.iskolar.io/products",
			},
			{ type: "text", text: ", or email " },
			{ type: "email", address: "hello@iskolar.io" },
			{ type: "text", text: "." },
		]);
	});

	it("drops an unclosed bold marker while an answer is still streaming", () => {
		expect(parseInline("Tap **Apply")).toEqual([
			{ type: "text", text: "Tap Apply" },
		]);
	});

	it("leaves non-http links as plain text", () => {
		expect(parseInline("[x](javascript:alert(1))")).toEqual([
			{ type: "text", text: "[x](javascript:alert(1))" },
		]);
	});
});

describe("parseAnswer", () => {
	it("groups paragraphs, numbered steps, and bullets into blocks", () => {
		const blocks = parseAnswer(
			[
				"Here's how to apply:",
				"",
				"1. Create a free account",
				"2. Tap **Apply Now**",
				"",
				"You can also:",
				"- Track applications",
				"- Get funds in your wallet",
			].join("\n"),
		);

		expect(blocks.map((b) => b.type)).toEqual([
			"paragraph",
			"steps",
			"paragraph",
			"bullets",
		]);
		const steps = blocks[1];
		expect(steps.type === "steps" && steps.items.map((i) => i.number)).toEqual([
			1, 2,
		]);
		const bullets = blocks[3];
		expect(bullets.type === "bullets" && bullets.items.length).toBe(2);
	});

	it("keeps line breaks inside a paragraph", () => {
		const [block] = parseAnswer("Mission: access.\nVision: fairness.");
		expect(block.type === "paragraph" && block.lines.length).toBe(2);
	});

	it("does not treat a bold line as a bullet", () => {
		const [block] = parseAnswer("**Students** can apply for free.");
		expect(block.type).toBe("paragraph");
	});

	it("renders a stray heading as a bold paragraph", () => {
		expect(parseAnswer("## How it works")).toEqual([
			{
				type: "paragraph",
				lines: [
					[
						{
							type: "bold",
							children: [{ type: "text", text: "How it works" }],
						},
					],
				],
			},
		]);
	});
});
