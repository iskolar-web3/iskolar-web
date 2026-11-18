import { BACKEND_URL } from "@/lib/api";

export interface ChatTurn {
	role: "user" | "assistant";
	content: string;
}

// Must match the server's limits in server/src/chat/model.ts.
export const CHAT_MAX_MESSAGES = 6;
export const CHAT_MAX_MESSAGE_LENGTH = 1000;

export class ChatError extends Error {}

const GENERIC_ERROR =
	"The assistant is unavailable right now. Please try again in a moment, or email hello@iskolar.io.";
const RATE_LIMIT_ERROR =
	"You're asking questions a bit too fast. Please wait a minute and try again.";

// POST the conversation to /chat and call `onDelta` with each text chunk as the
// server streams it (Server-Sent Events). EventSource can't send a POST body,
// so the stream is read and parsed by hand. Rejects with a ChatError whose
// message is safe to show to the visitor.
export async function streamChat(
	messages: ChatTurn[],
	onDelta: (text: string) => void,
	signal?: AbortSignal,
): Promise<void> {
	const response = await fetch(`${BACKEND_URL}/chat`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ messages }),
		signal,
	});

	if (response.status === 429) throw new ChatError(RATE_LIMIT_ERROR);
	if (!response.ok || !response.body) throw new ChatError(GENERIC_ERROR);

	const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
	let buffer = "";

	for (;;) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += value;

		// SSE events are separated by a blank line.
		let boundary = buffer.indexOf("\n\n");
		while (boundary !== -1) {
			const raw = buffer.slice(0, boundary);
			buffer = buffer.slice(boundary + 2);
			boundary = buffer.indexOf("\n\n");

			let event = "message";
			let data = "";
			for (const line of raw.split("\n")) {
				if (line.startsWith("event:")) event = line.slice(6).trim();
				else if (line.startsWith("data:")) data += line.slice(5).trim();
			}

			if (event === "delta") {
				const parsed = JSON.parse(data) as { text?: string };
				if (parsed.text) onDelta(parsed.text);
			} else if (event === "error") {
				throw new ChatError(GENERIC_ERROR);
			} else if (event === "done") {
				return;
			}
		}
	}

	// The connection closed before the server sent `done` (proxy timeout, server
	// restart, ...): the answer is missing or cut off, so surface an error rather
	// than resolving as if it had finished.
	throw new ChatError(GENERIC_ERROR);
}
