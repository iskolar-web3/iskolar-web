// Rough device-capability check shared by the landing page and the chat widget.
// "Low-end" means few CPU cores, little memory, or a visitor who asked the
// browser to save data. Those visitors get the same layout and features with
// lighter effects: native scrolling, a cheaper background, no backdrop blur.

type NavigatorWithHints = Navigator & {
	deviceMemory?: number;
	connection?: { saveData?: boolean };
};

let cached: boolean | undefined;

export function isLowEndDevice(): boolean {
	if (cached !== undefined) return cached;
	if (typeof navigator === "undefined") return false;
	const nav = navigator as NavigatorWithHints;
	cached =
		(nav.hardwareConcurrency || 8) <= 4 ||
		(nav.deviceMemory || 8) <= 4 ||
		nav.connection?.saveData === true;
	return cached;
}

export function prefersReducedMotion(): boolean {
	return (
		globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
	);
}

// Adds `low-end` to <html> so CSS can drop effects that are costly on weak
// GPUs (see `html.low-end` rules in styles.css). Call once at startup.
export function markLowEndDevice(): void {
	if (typeof document !== "undefined" && isLowEndDevice()) {
		document.documentElement.classList.add("low-end");
	}
}
