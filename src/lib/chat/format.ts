// Parses the small Markdown subset the assistant is asked to write (see
// server/src/chat/prompt.ts) into blocks the chat widget renders:
// paragraphs, "- " bullets, "1. " numbered steps, **bold**, [label](url)
// links, and plain email addresses. Anything else stays plain text.
//
// Answers stream in a chunk at a time, so the parser must cope with partial
// input: an unclosed "**" is dropped instead of shown, and a half-typed list
// marker reads as text until its space arrives.

export type Inline =
	| { type: "text"; text: string }
	| { type: "bold"; children: Inline[] }
	| { type: "link"; label: string; href: string }
	| { type: "email"; address: string };

export type Block =
	| { type: "paragraph"; lines: Inline[][] }
	| { type: "bullets"; items: Inline[][] }
	| { type: "steps"; items: { number: number; content: Inline[] }[] };

const BULLET = /^\s*[-*•]\s+(.*)$/;
const STEP = /^\s*(\d{1,2})[.)]\s+(.*)$/;
// Headings aren't allowed by the prompt; if one slips through, show it as a
// bold line rather than with raw "#" marks.
const HEADING = /^\s*#{1,6}\s+(.*)$/;
const INLINE =
	/\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

export function parseInline(text: string): Inline[] {
	const out: Inline[] = [];
	const pushText = (raw: string): void => {
		// A lone "**" is an unfinished bold marker (still streaming) or a stray.
		const cleaned = raw.replaceAll("**", "");
		if (cleaned) out.push({ type: "text", text: cleaned });
	};

	let last = 0;
	for (const match of text.matchAll(INLINE)) {
		const index = match.index ?? 0;
		pushText(text.slice(last, index));
		if (match[1] !== undefined) {
			out.push({ type: "bold", children: parseInline(match[1]) });
		} else if (match[2] !== undefined && match[3] !== undefined) {
			out.push({ type: "link", label: match[2], href: match[3] });
		} else if (match[4] !== undefined) {
			out.push({ type: "email", address: match[4] });
		}
		last = index + match[0].length;
	}
	pushText(text.slice(last));
	return out;
}

export function parseAnswer(text: string): Block[] {
	const blocks: Block[] = [];
	let current: Block | null = null;

	const close = (): void => {
		if (current) blocks.push(current);
		current = null;
	};

	for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
		if (line.trim() === "") {
			close();
			continue;
		}

		const bullet = BULLET.exec(line);
		if (bullet) {
			if (current?.type !== "bullets") {
				close();
				current = { type: "bullets", items: [] };
			}
			current.items.push(parseInline(bullet[1]));
			continue;
		}

		const step = STEP.exec(line);
		if (step) {
			if (current?.type !== "steps") {
				close();
				current = { type: "steps", items: [] };
			}
			current.items.push({
				number: Number(step[1]),
				content: parseInline(step[2]),
			});
			continue;
		}

		const heading = HEADING.exec(line);
		if (heading) {
			close();
			blocks.push({
				type: "paragraph",
				lines: [[{ type: "bold", children: parseInline(heading[1]) }]],
			});
			continue;
		}

		if (current?.type !== "paragraph") {
			close();
			current = { type: "paragraph", lines: [] };
		}
		current.lines.push(parseInline(line));
	}

	close();
	return blocks;
}
