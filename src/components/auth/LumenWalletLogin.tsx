import {
	Check,
	Copy,
	ExternalLink,
	Loader2,
	RefreshCw,
	Wallet,
} from "lucide-react";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	initiateLumenLogin,
	type LumenLoginSession,
	type LumenStatusData,
	pollLumenStatus,
} from "@/lib/lumen/wallet-auth";

const POLL_INTERVAL_MS = 2_500;
const MAX_POLLS = 240; // 10 minutes at 2.5s intervals

type Props = {
	onAuthenticated: (
		data: Extract<LumenStatusData, { status: "authenticated" }>,
	) => void;
	className?: string;
};

type Phase =
	| "idle"
	| "initiating"
	| "waiting"
	| "authenticated"
	| "expired"
	| "rejected"
	| "error";

export function LumenWalletLogin({
	onAuthenticated,
	className,
}: Props): JSX.Element {
	const [open, setOpen] = useState(false);
	const [phase, setPhase] = useState<Phase>("idle");
	const [session, setSession] = useState<LumenLoginSession | null>(null);
	const [copied, setCopied] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string>("");

	const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pollCountRef = useRef(0);

	function stopPolling() {
		if (pollRef.current) {
			clearTimeout(pollRef.current);
			pollRef.current = null;
		}
	}

	async function startSession() {
		stopPolling();
		pollCountRef.current = 0;
		setPhase("initiating");
		setErrorMsg("");

		try {
			const s = await initiateLumenLogin();
			setSession(s);
			setPhase("waiting");
			scheduleNextPoll(s.sessionId);
		} catch (err) {
			setPhase("error");
			setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
		}
	}

	function scheduleNextPoll(sessionId: string) {
		pollRef.current = setTimeout(async () => {
			pollCountRef.current += 1;

			if (pollCountRef.current > MAX_POLLS) {
				setPhase("expired");
				return;
			}

			try {
				const result = await pollLumenStatus(sessionId);
				handlePollResult(result, sessionId);
			} catch {
				// Network hiccup — keep polling
				scheduleNextPoll(sessionId);
			}
		}, POLL_INTERVAL_MS);
	}

	function handlePollResult(result: LumenStatusData, sessionId: string) {
		if (result.status === "pending") {
			scheduleNextPoll(sessionId);
			return;
		}

		if (result.status === "authenticated") {
			stopPolling();
			setPhase("authenticated");
			onAuthenticated(result);
			setOpen(false);
			return;
		}

		stopPolling();
		setPhase(result.status); // "expired" | "rejected"
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: startSession/stopPolling are stable (only use refs and state setters)
	useEffect(() => {
		if (open) {
			startSession();
		} else {
			stopPolling();
			setPhase("idle");
			setSession(null);
			setCopied(false);
			setErrorMsg("");
		}
		return stopPolling;
	}, [open]);

	async function handleCopy() {
		if (!session?.loginUrl) return;
		await navigator.clipboard.writeText(session.loginUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	const isLoading = phase === "initiating";
	const isWaiting = phase === "waiting";
	const isTerminal =
		phase === "expired" || phase === "rejected" || phase === "error";

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-[#3A52A6] text-[#3A52A6] text-xs sm:text-[11px] xl:text-sm hover:bg-[#3A52A6] hover:text-white transition-all cursor-pointer ${className ?? ""}`}
			>
				<Wallet className="w-4 h-4" />
				Login with Lumen Wallet
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-sm bg-[#F0F7FF] border-0 shadow-[1px_1px_4px_1px_rgba(96,126,242,0.5)]">
					<DialogHeader>
						<DialogTitle className="text-[#3F58B2] text-base flex items-center gap-2">
							<Wallet className="w-5 h-5" />
							Lumen Wallet Login
						</DialogTitle>
						<DialogDescription className="text-[#8C8C8C] text-xs">
							{isWaiting
								? "Open the link below in your Lumen Wallet app to authenticate."
								: isLoading
									? "Setting up your login session…"
									: isTerminal
										? getTerminalMessage(phase, errorMsg)
										: ""}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{isLoading && (
							<div className="flex justify-center py-6">
								<Loader2 className="w-8 h-8 animate-spin text-[#3A52A6]" />
							</div>
						)}

						{isWaiting && session && (
							<>
								<div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#C4CBD5]">
									<span className="text-[10px] text-[#3A52A6] truncate flex-1 font-mono">
										{session.loginUrl}
									</span>
									<button
										type="button"
										onClick={handleCopy}
										className="shrink-0 text-[#8C8C8C] hover:text-[#3A52A6] transition-colors"
									>
										{copied ? (
											<Check className="w-4 h-4 text-green-500" />
										) : (
											<Copy className="w-4 h-4" />
										)}
									</button>
								</div>

								<a
									href={session.loginUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#3A52A6] text-white text-xs hover:opacity-90 transition-opacity"
								>
									<ExternalLink className="w-4 h-4" />
									Open in Lumen Wallet
								</a>

								<div className="flex items-center justify-center gap-2 text-[#8C8C8C] text-[10px]">
									<Loader2 className="w-3 h-3 animate-spin" />
									Waiting for wallet authentication…
								</div>
							</>
						)}

						{isTerminal && (
							<div className="space-y-3">
								<p className="text-xs text-[#EF4444] text-center">
									{getTerminalMessage(phase, errorMsg)}
								</p>
								<button
									type="button"
									onClick={startSession}
									className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#3A52A6] text-[#3A52A6] text-xs hover:bg-[#3A52A6] hover:text-white transition-all"
								>
									<RefreshCw className="w-3.5 h-3.5" />
									Try again
								</button>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

function getTerminalMessage(phase: Phase, errorMsg: string): string {
	switch (phase) {
		case "expired":
			return "The login session expired. Please try again.";
		case "rejected":
			return "Authentication was rejected by the wallet. Please try again.";
		case "error":
			return errorMsg || "An error occurred. Please try again.";
		default:
			return "";
	}
}
