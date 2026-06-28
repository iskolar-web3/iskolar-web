import { describe, expect, it } from "vitest";
import { isGibberish } from "./faqBot";

describe("isGibberish", () => {
	it("flags keyboard-mashing and random letters", () => {
		const mash = [
			"asdf", // keyboard walk
			"asdfasdf",
			"asdfgh",
			"asdfghjkl",
			"qwerty",
			"qwertyuiop",
			"poiuyt",
			"lkjhgfdsa",
			"zxcvbnm", // no vowels
			"jkljkl",
			"hjkl",
			"wjdkalf", // vowel-starved
			"fjdksla",
			"aaaa", // repeated
			"xyzxyz",
		];
		for (const q of mash) {
			expect(isGibberish(q), q).toBe(true);
		}
	});

	it("does not flag real English questions or words", () => {
		const real = [
			"how do I apply for a scholarship?",
			"is it free",
			"who made iSkolar",
			"how does it work",
			"what is iSkolar",
			"is my data safe",
			"iskolar",
			"scholarship",
			"apply",
			"sponsor",
			"student",
		];
		for (const q of real) {
			expect(isGibberish(q), q).toBe(false);
		}
	});

	it("does not flag real Tagalog questions", () => {
		const real = [
			"paano mag-apply",
			"libre ba ito",
			"ano ang iSkolar",
			"sino kayo",
			"ano ang magagawa ng estudyante",
		];
		for (const q of real) {
			expect(isGibberish(q), q).toBe(false);
		}
	});

	it("defers to the matcher for non-alphabetic input", () => {
		expect(isGibberish("12345")).toBe(false);
		expect(isGibberish("???")).toBe(false);
		expect(isGibberish("")).toBe(false);
	});
});
