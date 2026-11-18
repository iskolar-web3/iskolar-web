import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Maximize2, Minimize2, X } from "lucide-react";
import type { FormEvent, JSX, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { SiClaude } from "react-icons/si";
import { ChatAnswer } from "@/components/ChatAnswer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatPanelSize } from "@/hooks/useChatPanelSize";
import { useCornerWidgetVisible } from "@/hooks/useCornerWidgets";
import {
	CHAT_MAX_MESSAGE_LENGTH,
	CHAT_MAX_MESSAGES,
	ChatError,
	type ChatTurn,
	streamChat,
} from "@/lib/chat/api";
import { cn } from "@/lib/utils";

interface ChatMessage {
	id: number;
	role: "user" | "bot";
	text: string;
}

const GREETING =
	"Hi! I'm the iSkolar assistant. Ask me about iSkolar and our products, from choosing a course to landing your first job, in English, Filipino, Bisaya, or other Philippine languages.";
const GREETING_ID = 0;

const FALLBACK_ERROR =
	"Something went wrong. Please try again in a moment, or email hello@iskolar.io.";

// Starter prompts surfaced as clickable chips until the visitor asks something.
const SUGGESTED_QUESTIONS: string[] = [
	"What is iSkolar?",
	"Which product is right for me?",
	"Are the products free for students?",
];

// Conversation sent to the server: everything after the static greeting, the
// last few turns only, starting with a user turn as the API requires.
function toHistory(messages: ChatMessage[]): ChatTurn[] {
	const turns: ChatTurn[] = messages
		.filter((m) => m.id !== GREETING_ID && m.text.trim() !== "")
		.slice(-CHAT_MAX_MESSAGES)
		.map((m) => ({
			role: m.role === "user" ? "user" : "assistant",
			content: m.text.slice(0, CHAT_MAX_MESSAGE_LENGTH),
		}));
	while (turns.length > 0 && turns[0].role !== "user") turns.shift();
	return turns;
}

export function ChatWidget(): JSX.Element {
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ id: GREETING_ID, role: "bot", text: GREETING },
	]);
	// Id of the bot message currently being streamed, until the answer finishes.
	const [streamingId, setStreamingId] = useState<number | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const nextId = useRef(1);
	const bottomRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	// When another bottom-right widget is showing (the landing scroll-to-top
	// arrow or the feedback pill), lift the launcher above it so they don't
	// overlap in the corner.
	const cornerWidgetVisible = useCornerWidgetVisible();
	const reduceMotion = useReducedMotion();
	const panel = useChatPanelSize();

	// Stop an in-flight answer when the panel closes or the widget unmounts, so
	// the server stops generating (and billing) tokens nobody will read.
	useEffect(() => {
		if (!open) abortRef.current?.abort();
	}, [open]);
	useEffect(() => () => abortRef.current?.abort(), []);

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

	const chat = useMutation({
		mutationFn: async ({
			history,
			botId,
		}: {
			history: ChatTurn[];
			botId: number;
		}) => {
			const controller = new AbortController();
			abortRef.current = controller;
			setStreamingId(botId);
			await streamChat(
				history,
				(delta) => appendToBot(botId, delta),
				controller.signal,
			);
		},
		onError: (error, { botId }) => {
			if (error instanceof DOMException && error.name === "AbortError") return;
			const text = error instanceof ChatError ? error.message : FALLBACK_ERROR;
			setMessages((prev) =>
				prev.some((m) => m.id === botId)
					? prev.map((m) =>
							m.id === botId ? { ...m, text: `${m.text}\n\n${text}` } : m,
						)
					: [...prev, { id: botId, role: "bot", text }],
			);
		},
		onSettled: () => {
			abortRef.current = null;
			setStreamingId(null);
		},
	});

	const loading = chat.isPending;
	// "Thinking…" shows until the first chunk of the answer arrives.
	const awaitingFirstChunk =
		loading && !messages.some((m) => m.id === streamingId);
	const hasAsked = messages.some((m) => m.role === "user");

	// Keep the latest message in view whenever messages or loading state change.
	// biome-ignore lint/correctness/useExhaustiveDependencies: deps are the change triggers, not values read in the effect
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, loading]);

	// Return focus to the input after the chat opens and after each answer, so the
	// user can keep typing without clicking the box again. (Sending disables the
	// input while loading, which blurs it; refocus once it's re-enabled.)
	useEffect(() => {
		if (open && !loading) inputRef.current?.focus();
	}, [open, loading]);

	// Append a streamed chunk to the bot message, creating it on the first chunk.
	function appendToBot(botId: number, delta: string): void {
		setMessages((prev) =>
			prev.some((m) => m.id === botId)
				? prev.map((m) => (m.id === botId ? { ...m, text: m.text + delta } : m))
				: [...prev, { id: botId, role: "bot", text: delta }],
		);
	}

	function send(question: string): void {
		const trimmed = question.trim().slice(0, CHAT_MAX_MESSAGE_LENGTH);
		if (!trimmed || loading) return;

		const userMessage: ChatMessage = {
			id: nextId.current++,
			role: "user",
			text: trimmed,
		};
		const botId = nextId.current++;
		const history = toHistory([...messages, userMessage]);

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		chat.mutate({ history, botId });
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>): void {
		e.preventDefault();
		send(input);
	}

	// Tilt the launcher a few degrees toward a mouse pointer for a 3D feel.
	// Touch and pen skip it: there is no hover to follow.
	function tiltLauncher(e: ReactPointerEvent<HTMLButtonElement>): void {
		if (e.pointerType !== "mouse" || reduceMotion) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		e.currentTarget.style.setProperty("--rx", `${(-y * 14).toFixed(2)}deg`);
		e.currentTarget.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
	}

	function resetTilt(e: ReactPointerEvent<HTMLButtonElement>): void {
		e.currentTarget.style.setProperty("--rx", "0deg");
		e.currentTarget.style.setProperty("--ry", "0deg");
	}

	return (
		<div className="chat-ui">
			{!open && (
				<button
					type="button"
					onClick={() => setOpen(true)}
					onPointerMove={tiltLauncher}
					onPointerLeave={resetTilt}
					aria-label="Open the iSkolar assistant"
					className={cn(
						"chat-launcher fixed right-2 z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						cornerWidgetVisible ? "bottom-24 md:bottom-22" : "bottom-2",
					)}
				>
					<span aria-hidden="true" className="chat-launcher-shadow" />
					<span className="chat-launcher-body">
						<img
							src="/chatbot.png"
							alt=""
							className="chat-launcher-img size-20 object-contain"
						/>
						<span aria-hidden="true" className="chat-launcher-gloss" />
					</span>
				</button>
			)}

			<AnimatePresence>
				{open && (
					<motion.div
						key="chat-panel"
						ref={panelRef}
						data-lenis-prevent
						initial={
							reduceMotion
								? { opacity: 0 }
								: { opacity: 0, y: 16, scale: 0.94, rotateX: 8 }
						}
						animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
						exit={
							reduceMotion
								? { opacity: 0 }
								: { opacity: 0, y: 10, scale: 0.96, rotateX: 4 }
						}
						transition={{
							type: "spring",
							stiffness: 380,
							damping: 32,
							mass: 0.8,
						}}
						style={{
							width: panel.size.width,
							height: panel.size.height,
							transformOrigin: "bottom right",
							transformPerspective: 1200,
						}}
						className={cn(
							"chat-panel fixed bottom-6 right-5 z-50 flex max-h-[calc(100dvh-2.25rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden",
							// Ease size changes from the keyboard and the expand button,
							// but follow the pointer 1:1 while dragging.
							panel.resizing
								? "select-none"
								: "transition-[width,height] duration-300 ease-out motion-reduce:transition-none",
						)}
					>
						{/* Resize hit areas: the panel is pinned bottom-right, so it
						    grows from its top edge, left edge, and top-left corner. */}
						<div
							aria-hidden="true"
							className="absolute inset-x-8 top-0 z-20 h-2 cursor-ns-resize touch-none"
							{...panel.resizeHandlers("top")}
						/>
						<div
							aria-hidden="true"
							className="absolute inset-y-8 left-0 z-20 w-3 cursor-ew-resize touch-none"
							{...panel.resizeHandlers("left")}
						/>
						<div
							aria-hidden="true"
							className="absolute top-0 left-0 z-30 size-7 cursor-nwse-resize touch-none"
							{...panel.resizeHandlers("corner")}
						/>

						{/* Header */}
						<div className="chat-header flex items-center gap-3 px-4 pt-4 pb-3">
							{/* Grab bar: the visible handle, easy to hit on touch screens. */}
							<button
								type="button"
								aria-label="Resize the chat. Drag, or use the arrow keys."
								onKeyDown={panel.onResizeKey}
								className="chat-grip absolute top-0 left-1/2 z-30 flex h-5 w-20 -translate-x-1/2 cursor-ns-resize touch-none justify-center pt-1.5"
								{...panel.resizeHandlers("top")}
							>
								<span aria-hidden="true" className="chat-grip-bar" />
							</button>
							<span className="chat-avatar grid size-9 shrink-0 place-items-center rounded-full bg-white">
								<img
									src="/chatbot.png"
									alt=""
									className="size-7 object-contain"
								/>
							</span>
							<div className="min-w-0 flex-1 leading-tight">
								<p className="text-sm font-semibold">iSkolar Assistant</p>
								<p className="text-[11px] text-white/70">
									Ask about iSkolar and its products
								</p>
							</div>
							<button
								type="button"
								onClick={panel.toggleMaximize}
								aria-label={
									panel.isMaximized
										? "Restore the chat size"
										: "Expand the chat"
								}
								className="chat-icon-btn rounded-full p-1.5"
							>
								{panel.isMaximized ? (
									<Minimize2 className="size-4" />
								) : (
									<Maximize2 className="size-4" />
								)}
							</button>
							<button
								type="button"
								onClick={() => setOpen(false)}
								aria-label="Close the iSkolar assistant"
								className="chat-icon-btn rounded-full p-1.5"
							>
								<X className="size-4" />
							</button>
						</div>

						{/* Messages */}
						<ScrollArea className="min-h-0 flex-1 px-4 py-4">
							<div className="flex flex-col gap-3">
								{messages.map((m) => (
									<div
										key={m.id}
										className={cn(
											"chat-msg-in max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
											m.role === "user"
												? "chat-bubble-user self-end rounded-br-md"
												: "chat-bubble-bot self-start rounded-bl-md text-foreground",
										)}
									>
										{m.role === "bot" ? <ChatAnswer text={m.text} /> : m.text}
									</div>
								))}

								{awaitingFirstChunk && (
									<div
										aria-live="polite"
										className="chat-bubble-bot chat-msg-in chat-dots flex items-center gap-1 self-start rounded-2xl rounded-bl-md px-3.5 py-3.5"
									>
										<span className="sr-only">The assistant is typing</span>
										<i aria-hidden="true" />
										<i aria-hidden="true" />
										<i aria-hidden="true" />
									</div>
								)}

								{/* Suggested questions, shown until the user asks something */}
								{!hasAsked && !loading && (
									<div className="mt-1 flex flex-col items-start gap-2.5">
										{SUGGESTED_QUESTIONS.map((q) => (
											<button
												key={q}
												type="button"
												onClick={() => send(q)}
												className="chat-chip chat-msg-in rounded-full px-3.5 py-1.5 text-left text-xs font-medium"
											>
												{q}
											</button>
										))}
									</div>
								)}

								<div ref={bottomRef} />
							</div>
						</ScrollArea>

						{/* Composer */}
						<form onSubmit={handleSubmit} className="px-3 pt-1 pb-2">
							<div className="chat-composer flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-4">
								<input
									ref={inputRef}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Ask a question…"
									aria-label="Type your question"
									maxLength={CHAT_MAX_MESSAGE_LENGTH}
									disabled={loading}
									className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
								/>
								<button
									type="submit"
									disabled={loading || !input.trim()}
									aria-label="Send message"
									className="chat-send grid size-8 shrink-0 place-items-center rounded-full"
								>
									<ArrowUp className="size-4" />
								</button>
							</div>
						</form>

						<p className="flex flex-wrap items-center justify-center gap-x-1 px-3 pb-2.5 text-[10px] text-muted-foreground">
							<span>Powered by</span>
							<a
								href="https://www.anthropic.com/claude"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-0.5 font-medium text-foreground/70 transition-colors hover:text-foreground"
							>
								<SiClaude
									aria-hidden="true"
									className="size-3 text-[#D97757]"
								/>
								Claude
							</a>
							<span
								aria-hidden="true"
								className="text-xs leading-none font-black text-foreground/50"
							>
								·
							</span>
							<span>AI answers may be inaccurate.</span>
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
