import { Loader2, Send, X } from "lucide-react";
import type { FormEvent, JSX, ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCornerWidgetVisible } from "@/hooks/useCornerWidgets";
import { SUGGESTED_QUESTIONS } from "@/lib/faq";
import { askFaqBot, isFaqBotReady, warmUpFaqBot } from "@/lib/faqBot";
import { cn } from "@/lib/utils";

interface ChatMessage {
	id: number;
	role: "user" | "bot";
	text: string;
}

const GREETING =
	"Hi! I'm the iSkolar assistant. Ask me anything about scholarships and how iSkolar works in English or Tagalog.";

// Parse a tiny subset of markdown — [label](url) links — within a single line.
function renderInline(text: string): ReactNode[] {
	const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
	const parts: ReactNode[] = [];
	let lastIndex = 0;
	for (
		let match = linkPattern.exec(text);
		match !== null;
		match = linkPattern.exec(text)
	) {
		if (match.index > lastIndex) {
			parts.push(text.slice(lastIndex, match.index));
		}
		parts.push(
			<a
				key={match.index}
				href={match[2]}
				target="_blank"
				rel="noopener noreferrer"
				className="font-medium underline underline-offset-2 hover:opacity-80"
			>
				{match[1]}
			</a>,
		);
		lastIndex = linkPattern.lastIndex;
	}
	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex));
	}
	return parts;
}

// Render a bot answer with light structure: each newline is its own line, and a
// "- " prefix becomes a bullet. Links inside any line become anchors.
function renderAnswer(text: string): ReactNode {
	const nodes: ReactNode[] = [];
	const lines = text.split("\n");
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.trim() === "") continue;
		if (line.trimStart().startsWith("- ")) {
			nodes.push(
				<div key={i} className="flex gap-2">
					<span aria-hidden="true" className="select-none">
						•
					</span>
					<span>{renderInline(line.trimStart().slice(2))}</span>
				</div>,
			);
		} else {
			nodes.push(<p key={i}>{renderInline(line)}</p>);
		}
	}
	return <div className="space-y-1.5">{nodes}</div>;
}

export function ChatWidget(): JSX.Element {
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ id: 0, role: "bot", text: GREETING },
	]);
	// First-open loading: show a full-panel loading screen while the model and FAQ
	// embeddings download/build. Initialised from the shared bot state so reopening
	// after the first load skips the screen entirely.
	const [botReady, setBotReady] = useState(() => isFaqBotReady());
	const [botError, setBotError] = useState(false);

	const nextId = useRef(1);
	const bottomRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	// When another bottom-right widget is showing (the landing scroll-to-top
	// arrow or the feedback pill), lift the launcher above it so they don't
	// overlap in the corner.
	const cornerWidgetVisible = useCornerWidgetVisible();

	// Reveal instantly if the model finished loading (e.g. via the hover preload)
	// before the panel opened, so reopening never flashes the loading screen.
	useLayoutEffect(() => {
		if (open && !botReady && isFaqBotReady()) setBotReady(true);
	}, [open, botReady]);

	// On first open, load the model and build the FAQ index, then reveal the chat.
	useEffect(() => {
		if (!open || botReady || isFaqBotReady()) return;
		let cancelled = false;
		setBotError(false);
		warmUpFaqBot().then(
			() => {
				if (!cancelled) setBotReady(true);
			},
			() => {
				if (!cancelled) setBotError(true);
			},
		);
		return () => {
			cancelled = true;
		};
	}, [open, botReady]);

	// Keep the latest message in view whenever messages or loading state change.
	// biome-ignore lint/correctness/useExhaustiveDependencies: deps are the change triggers, not values read in the effect
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, loading]);

	// Return focus to the input after the chat opens and after each answer, so the
	// user can keep typing without clicking the box again. (Sending disables the
	// input while loading, which blurs it; refocus once it's re-enabled.)
	useEffect(() => {
		if (open && botReady && !loading) inputRef.current?.focus();
	}, [open, botReady, loading]);

	// Close the chat when the user clicks (or taps) anywhere outside the panel.
	useEffect(() => {
		if (!open) return;
		function handlePointerDown(event: PointerEvent): void {
			if (!panelRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [open]);

	const hasAsked = messages.some((m) => m.role === "user");

	async function send(question: string): Promise<void> {
		const trimmed = question.trim();
		if (!trimmed || loading) return;

		setMessages((prev) => [
			...prev,
			{ id: nextId.current++, role: "user", text: trimmed },
		]);
		setInput("");
		setLoading(true);

		try {
			const result = await askFaqBot(trimmed);
			setMessages((prev) => [
				...prev,
				{ id: nextId.current++, role: "bot", text: result.answer },
			]);
		} catch {
			setMessages((prev) => [
				...prev,
				{
					id: nextId.current++,
					role: "bot",
					text: "Something went wrong loading the assistant. Please try again in a moment.",
				},
			]);
		} finally {
			setLoading(false);
		}
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>): void {
		e.preventDefault();
		void send(input);
	}

	function retryLoad(): void {
		setBotError(false);
		warmUpFaqBot().then(
			() => setBotReady(true),
			() => setBotError(true),
		);
	}

	if (!open) {
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open the iSkolar assistant"
				className={cn(
					"fixed right-2 z-50 rounded-full transition-transform duration-300 ease-out hover:scale-105 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
					cornerWidgetVisible ? "bottom-24 md:bottom-22" : "bottom-2",
				)}
			>
				<img
					src="/chatbot.png"
					alt=""
					className="size-20 object-contain drop-shadow-lg"
				/>
			</button>
		);
	}

	return (
		<div
			ref={panelRef}
			data-lenis-prevent
			className="fixed bottom-6 right-5 z-50 flex h-[34rem] max-h-[calc(100vh-3rem)] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
		>
			{/* Header */}
			<div className="flex items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-3 text-secondary-foreground">
				<span className="text-sm font-medium">iSkolar Assistant</span>
				<button
					type="button"
					onClick={() => setOpen(false)}
					aria-label="Close the iSkolar assistant"
					className="rounded-full p-1 transition-colors hover:bg-black/10"
				>
					<X className="size-4" />
				</button>
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1 min-h-0 px-4 py-3">
				<div className="flex flex-col gap-3">
					{messages.map((m) => (
						<div
							key={m.id}
							className={cn(
								"max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
								m.role === "user"
									? "self-end bg-blue-600 text-white rounded-br-sm"
									: "self-start bg-muted text-foreground rounded-bl-sm",
							)}
						>
							{m.role === "bot" ? renderAnswer(m.text) : m.text}
						</div>
					))}

					{loading && (
						<div className="self-start flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							Thinking…
						</div>
					)}

					{/* Suggested questions, shown until the user asks something */}
					{!hasAsked && !loading && (
						<div className="mt-1 flex flex-col items-start gap-2">
							{SUGGESTED_QUESTIONS.map((q) => (
								<button
									key={q}
									type="button"
									onClick={() => void send(q)}
									className="rounded-full bg-blue-600 px-3 py-1.5 text-left text-xs text-white transition-colors hover:bg-blue-700"
								>
									{q}
								</button>
							))}
						</div>
					)}

					<div ref={bottomRef} />
				</div>
			</ScrollArea>

			{/* Input */}
			<form
				onSubmit={handleSubmit}
				className="flex items-center gap-2 border-t border-border bg-card p-3"
			>
				<Input
					ref={inputRef}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask a question…"
					aria-label="Type your question"
					disabled={loading}
					className="flex-1"
				/>
				<Button
					type="submit"
					size="icon"
					disabled={loading || !input.trim()}
					aria-label="Send message"
					className="bg-blue-600 text-white hover:bg-blue-700"
				>
					<Send className="size-4" />
				</Button>
			</form>

			<p className="bg-card px-3 pb-2 text-center text-[10px] text-muted-foreground">
				Answers may not cover everything.
			</p>

			{/* Full-panel loading screen shown until the model is ready. */}
			{!botReady && (
				<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-card px-6 text-center">
					<button
						type="button"
						onClick={() => setOpen(false)}
						aria-label="Close the iSkolar assistant"
						className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted"
					>
						<X className="size-4" />
					</button>

					{botError ? (
						<>
							<p className="text-sm text-muted-foreground">
								The assistant could not load. Check your connection and try
								again.
							</p>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={retryLoad}
							>
								Try again
							</Button>
						</>
					) : (
						<>
							<img
								src="/chatbot.png"
								alt=""
								className="size-16 animate-pulse object-contain"
							/>
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
							<div className="space-y-1">
								<p className="text-sm font-medium text-foreground">
									Loading the assistant…
								</p>
								<p className="text-xs text-muted-foreground">
									This can take a moment the first time.
								</p>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
