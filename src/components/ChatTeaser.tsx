import { X } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useState } from "react";

// Rotating prompts shown beside the closed chat launcher.
const TEASERS = [
	"Have questions? Ask me!",
	"Want to know about iSkolar?",
	"Not sure which product fits you?",
	"Are the products free? Ask me.",
	"Pwede ka ring magtanong sa Filipino!",
];

// Wait for the page to settle before drawing attention to the launcher, so the
// bubble never competes with the first paint of the hero.
const SHOW_AFTER_MS = 3000;
const ROTATE_EVERY_MS = 4500;
const DISMISS_KEY = "iskolar-chat-teaser-dismissed";

function readDismissed(): boolean {
	try {
		return window.sessionStorage.getItem(DISMISS_KEY) === "1";
	} catch {
		return false;
	}
}

export function markTeaserDismissed(): void {
	try {
		window.sessionStorage.setItem(DISMISS_KEY, "1");
	} catch {
		// Storage blocked: the teaser simply returns on the next page load.
	}
}

// Speech bubble that cycles through short prompts next to the chat launcher.
// It costs one timer every few seconds, which pauses while the tab is hidden;
// the text swap is a single short CSS animation.
export function ChatTeaser({
	onOpen,
}: {
	onOpen: () => void;
}): JSX.Element | null {
	const [dismissed, setDismissed] = useState(readDismissed);
	const [visible, setVisible] = useState(false);
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (dismissed) return;
		const timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
		return () => window.clearTimeout(timer);
	}, [dismissed]);

	useEffect(() => {
		if (!visible || dismissed) return;
		let timer: number | undefined;
		const start = (): void => {
			window.clearInterval(timer);
			timer = window.setInterval(
				() => setIndex((i) => (i + 1) % TEASERS.length),
				ROTATE_EVERY_MS,
			);
		};
		const onVisibility = (): void => {
			if (document.hidden) window.clearInterval(timer);
			else start();
		};
		start();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [visible, dismissed]);

	if (dismissed || !visible) return null;

	function dismiss(): void {
		markTeaserDismissed();
		setDismissed(true);
	}

	return (
		<div className="chat-teaser relative">
			<button
				type="button"
				onClick={onOpen}
				aria-label="Open the iSkolar assistant"
				className="chat-teaser-bubble block max-w-[13rem] rounded-2xl px-3.5 py-2 text-left text-xs font-medium sm:max-w-none sm:whitespace-nowrap"
			>
				{/* aria-hidden: the rotating text would be noisy for screen readers;
				    the button's label already says what it does. */}
				<span key={index} aria-hidden="true" className="chat-teaser-text block">
					{TEASERS[index]}
				</span>
			</button>
			<button
				type="button"
				onClick={dismiss}
				aria-label="Hide this message"
				className="chat-teaser-close absolute -top-2 -left-2 grid size-5 place-items-center rounded-full"
			>
				<X className="size-3" />
			</button>
		</div>
	);
}
