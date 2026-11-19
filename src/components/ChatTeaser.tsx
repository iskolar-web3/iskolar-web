import { X } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Prompts shown one at a time beside the closed chat launcher.
const TEASERS = [
	"Have questions? Ask me!",
	"Want to know about iSkolar?",
	"Not sure which product fits you?",
	"Are the products free? Ask me.",
	"Pwede ka ring magtanong sa Filipino!",
];

// Let the page settle before the first bubble, so it never competes with the
// first paint of the hero.
const FIRST_SHOW_MS = 2500;
// Each message stays up this long...
const VISIBLE_MS = 5000;
// ...then the bubble hides for this long before the next message appears.
const PAUSE_MS = 3000;

// Speech bubble beside the chat launcher. It loops forever while the chat is
// closed: show a message, hide for a pause, show the next one. Closing it with
// the X only skips to the pause. The loop is one timer that stops while the tab
// is in the background, and showing or hiding is a CSS transition.
export function ChatTeaser({ onOpen }: { onOpen: () => void }): JSX.Element {
	const [shown, setShown] = useState(false);
	const [index, setIndex] = useState(0);
	// Lets the X button reach the timer loop that lives inside the effect.
	const skipRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		let timer: number | undefined;
		let isShown = false;
		let shownBefore = false;

		const schedule = (delay: number): void => {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				if (isShown) {
					isShown = false;
					setShown(false);
					schedule(PAUSE_MS);
				} else {
					// Move to the next message as it fades in (not as it fades out,
					// which would show the text changing while it disappears).
					if (shownBefore) setIndex((i) => (i + 1) % TEASERS.length);
					shownBefore = true;
					isShown = true;
					setShown(true);
					schedule(VISIBLE_MS);
				}
			}, delay);
		};

		const onVisibility = (): void => {
			if (document.hidden) {
				window.clearTimeout(timer);
			} else {
				// Resume from wherever the loop was.
				schedule(isShown ? VISIBLE_MS : PAUSE_MS);
			}
		};

		// The X button hides the bubble early; restart the pause from there.
		const onSkip = (): void => {
			isShown = false;
			setShown(false);
			schedule(PAUSE_MS);
		};

		skipRef.current = onSkip;
		schedule(FIRST_SHOW_MS);
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			window.clearTimeout(timer);
			document.removeEventListener("visibilitychange", onVisibility);
			skipRef.current = null;
		};
	}, []);

	return (
		<div
			className={cn("chat-teaser relative", !shown && "chat-teaser-hidden")}
			// Hidden bubbles are skipped by screen readers and the Tab key.
			aria-hidden={!shown}
			inert={!shown}
		>
			<button
				type="button"
				onClick={onOpen}
				aria-label="Open the iSkolar assistant"
				className="chat-teaser-bubble block max-w-[13rem] rounded-2xl px-3.5 py-2 text-left text-xs font-medium sm:max-w-none sm:whitespace-nowrap"
			>
				{/* aria-hidden: changing text would be noisy for screen readers; the
				    button's label already says what it does. */}
				<span aria-hidden="true" className="block">
					{TEASERS[index]}
				</span>
			</button>
			<button
				type="button"
				onClick={() => skipRef.current?.()}
				aria-label="Hide this message"
				className="chat-teaser-close absolute -top-2 -left-2 grid size-5 place-items-center rounded-full"
			>
				<X className="size-3" />
			</button>
		</div>
	);
}
