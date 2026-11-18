import type { JSX, ReactNode } from "react";
import { type Inline, parseAnswer } from "@/lib/chat/format";

const LINK_CLASS =
	"font-medium text-[#3a52a6] underline decoration-[#3a52a6]/30 underline-offset-2 transition-colors hover:decoration-[#3a52a6] dark:text-indigo-200 dark:decoration-indigo-200/40";

function renderInline(parts: Inline[]): ReactNode[] {
	return parts.map((part, i) => {
		switch (part.type) {
			case "text":
				return part.text;
			case "bold":
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: parts are positional and never reorder
					<strong key={i} className="font-semibold text-foreground">
						{renderInline(part.children)}
					</strong>
				);
			case "link":
				return (
					<a
						// biome-ignore lint/suspicious/noArrayIndexKey: parts are positional and never reorder
						key={i}
						href={part.href}
						target={part.href.startsWith("mailto:") ? undefined : "_blank"}
						rel="noopener noreferrer"
						className={LINK_CLASS}
					>
						{part.label}
					</a>
				);
			case "email":
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: parts are positional and never reorder
					<a key={i} href={`mailto:${part.address}`} className={LINK_CLASS}>
						{part.address}
					</a>
				);
			default:
				return null;
		}
	});
}

// A bot answer laid out for scanning: short paragraphs, bulleted lists, and
// numbered steps with badges. Block and item keys are positions: a streamed
// answer only ever grows at the end, so existing nodes keep their identity.
export function ChatAnswer({ text }: { text: string }): JSX.Element {
	const blocks = parseAnswer(text);

	return (
		<div className="space-y-2.5">
			{blocks.map((block, b) => {
				if (block.type === "paragraph") {
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: blocks are positional and append-only
						<p key={b}>
							{block.lines.map((line, l) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: lines are positional and append-only
								<span key={l}>
									{l > 0 && <br />}
									{renderInline(line)}
								</span>
							))}
						</p>
					);
				}

				if (block.type === "bullets") {
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: blocks are positional and append-only
						<ul key={b} className="space-y-1.5">
							{block.items.map((item, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: items are positional and append-only
								<li key={i} className="flex gap-2.5">
									<span
										aria-hidden="true"
										className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-[#3a52a6]/70 dark:bg-indigo-200/70"
									/>
									<span className="min-w-0">{renderInline(item)}</span>
								</li>
							))}
						</ul>
					);
				}

				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: blocks are positional and append-only
					<ol key={b} className="space-y-2">
						{block.items.map((item, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: items are positional and append-only
							<li key={i} className="flex gap-2.5">
								<span
									aria-hidden="true"
									className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-[#3a52a6]/10 text-[11px] font-semibold text-[#3a52a6] dark:bg-indigo-200/15 dark:text-indigo-200"
								>
									{item.number}
								</span>
								<span className="min-w-0">
									<span className="sr-only">{`Step ${item.number}: `}</span>
									{renderInline(item.content)}
								</span>
							</li>
						))}
					</ol>
				);
			})}
		</div>
	);
}
