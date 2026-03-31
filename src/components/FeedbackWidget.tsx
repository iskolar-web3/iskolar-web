import { useState } from "react";
import type { JSX } from "react";
import { X, MessageCircle } from "lucide-react";

const DISCORD_URL =
	"https://discord.com/channels/1372918978158002226/1462425652232847391";

export function FeedbackWidget(): JSX.Element | null {
	const [dismissed, setDismissed] = useState(false);

	if (dismissed) return null;

	return (
		<div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-secondary pl-4 pr-2 py-2 shadow-lg border border-zinc-700 text-white text-sm">
			<MessageCircle className="size-4 shrink-0 text-background" />
			<a
				href={DISCORD_URL}
				target="_blank"
				rel="noopener noreferrer"
				className="hover:underline text-zinc-100 whitespace-nowrap"
			>
				Give Feedback
			</a>
			<button
				type="button"
				onClick={() => setDismissed(true)}
				className="ml-1 rounded-full p-1 hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white"
				aria-label="Dismiss feedback widget"
			>
				<X className="size-3" />
			</button>
		</div>
	);
}
