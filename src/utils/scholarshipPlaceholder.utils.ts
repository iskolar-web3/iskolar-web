import { ScholarshipType } from "@/lib/scholarship/model";

/**
 * Derives a 2–4 character monogram from a scholarship title.
 * Uses the first letter of each of the first two words (uppercased).
 * Falls back to "SK" if the title is empty.
 */
function toMonogram(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return "SK";
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Generates a themed SVG placeholder image as a base64 data URL.
 * Used when a sponsor has not uploaded a banner image.
 *
 * @param name - Scholarship title
 * @param type - Scholarship type enum value
 * @returns Base64-encoded SVG data URL
 */
export function generateScholarshipPlaceholder(
	name: string,
	_type?: ScholarshipType,
): string {
	const monogram = toMonogram(name);

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#3A52A6"/>
  <circle cx="200" cy="200" r="90" fill="rgba(255,255,255,0.08)"/>
  <text
    x="200"
    y="200"
    font-family="system-ui, sans-serif"
    font-size="96"
    font-weight="700"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
    opacity="0.92"
  >${monogram}</text>
</svg>`;

	return `data:image/svg+xml;base64,${btoa(svg)}`;
}
