import { useEffect, useRef, useState } from "react";
import {
	ShieldCheck,
	ShieldX,
	ShieldAlert,
	Clock,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	getVerificationStatus,
	startVerification,
} from "@/lib/verification/api";
import {
	VerificationStatus as Status,
	type VerificationRecord,
} from "@/lib/verification/model";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

type Props = {
	role: "students" | "sponsors";
	sponsorType?: "individual" | "organization" | "government";
	onEntityFormOpen?: () => void;
};

export default function VerificationStatus({
	role,
	sponsorType,
	onEntityFormOpen,
}: Props) {
	const [record, setRecord] = useState<VerificationRecord | null>(null);
	const [loading, setLoading] = useState(true);
	const [starting, setStarting] = useState(false);
	const { toast, showError } = useToast();
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const pollCountRef = useRef(0);

	// Check for ?verified=1 to enable polling mode
	const searchParams = new URLSearchParams(window.location.search);
	const isReturningFromDidit = searchParams.get("verified") === "1";

	async function fetchStatus() {
		const result = await getVerificationStatus(role);
		setRecord(result);
		setLoading(false);
		return result;
	}

	useEffect(() => {
		fetchStatus();
	}, []);

	useEffect(() => {
		if (record?.status !== Status.Pending) return;
		if (pollRef.current) return;

		const interval = isReturningFromDidit ? 5000 : 10000;
		const maxCount = isReturningFromDidit ? 12 : 18; // 60s fast, 3min slow

		pollCountRef.current = 0;
		pollRef.current = setInterval(async () => {
			pollCountRef.current += 1;
			const result = await fetchStatus();

			if (
				(result && result.status !== Status.Pending) ||
				pollCountRef.current >= maxCount
			) {
				if (pollRef.current) {
					clearInterval(pollRef.current);
					pollRef.current = null;
				}
			}
		}, interval);

		return () => {
			if (pollRef.current) {
				clearInterval(pollRef.current);
				pollRef.current = null;
			}
		};
	}, [isReturningFromDidit, record?.status]);

	async function handleVerify() {
		// Org/gov sponsors need the pre-form dialog
		if (
			role === "sponsors" &&
			(sponsorType === "organization" || sponsorType === "government")
		) {
			onEntityFormOpen?.();
			return;
		}

		setStarting(true);
		try {
			const result = await startVerification(role);
			window.location.href = result.verificationUrl;
		} catch (err) {
			showError(
				"Verification Error",
				err instanceof Error ? err.message : "Failed to start verification.",
			);
			setStarting(false);
		}
	}

	if (loading) {
		return (
			<div className="flex items-center gap-2 text-muted-foreground text-sm py-3">
				<Loader2 className="w-4 h-4 animate-spin" />
				Loading verification status...
			</div>
		);
	}

	const toastEl = toast && <Toast {...toast} />;

	// No record yet — show CTA
	if (!record) {
		return (
			<>
				{toastEl}
				<div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
					<div className="flex items-center gap-3">
						<ShieldAlert className="w-5 h-5 text-amber-600" />
						<div>
							<p className="text-sm font-medium text-amber-800">
								Identity not verified
							</p>
							<p className="text-xs text-amber-600">
								Verify your identity to build trust on the platform.
							</p>
						</div>
					</div>
					<Button
						onClick={handleVerify}
						disabled={starting}
						size="sm"
						className="cursor-pointer bg-[#3B5AA8] hover:bg-[#2f4389] text-white"
					>
						{starting ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							"Verify Now"
						)}
					</Button>
				</div>
			</>
		);
	}

	// Pending
	if (record.status === Status.Pending) {
		const hasActiveSession = !!record.diditSessionUrl;

		async function handleResume() {
			if (!record) return;
			setStarting(true);
			try {
				const result = await startVerification(role);
				window.location.href = result.verificationUrl;
			} catch (err) {
				showError(
					"Verification Error",
					err instanceof Error ? err.message : "Failed to resume verification.",
				);
				setStarting(false);
			}
		}

		return (
			<>
				{toastEl}
				<div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
					<div className="flex items-center gap-3">
						<Clock className="w-5 h-5 text-blue-600" />
						<div>
							<p className="text-sm font-medium text-blue-800">
								Verification in progress
							</p>
							<p className="text-xs text-blue-600">
								{isReturningFromDidit && pollCountRef.current < 12
									? "Waiting for confirmation..."
									: hasActiveSession
										? "Your session is still active. Continue where you left off."
										: "Your verification is being processed. Check back shortly."}
							</p>
						</div>
					</div>
					{isReturningFromDidit && pollCountRef.current < 12 ? (
						<Loader2 className="w-4 h-4 animate-spin text-blue-600" />
					) : hasActiveSession ? (
						<Button
							onClick={handleResume}
							disabled={starting}
							size="sm"
							className="cursor-pointer bg-[#3B5AA8] hover:bg-[#2f4389] text-white"
						>
							{starting ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								"Continue"
							)}
						</Button>
					) : null}
				</div>
			</>
		);
	}

	// Verified
	if (record.status === Status.Verified) {
		return (
			<div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
				<ShieldCheck className="w-5 h-5 text-green-600" />
				<div>
					<p className="text-sm font-medium text-green-800">
						Identity verified
					</p>
					{record.verifiedAt && (
						<p className="text-xs text-green-600">
							Verified on{" "}
							{new Date(record.verifiedAt).toLocaleDateString(undefined, {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					)}
				</div>
			</div>
		);
	}

	// Rejected
	if (record.status === Status.Rejected) {
		const cooldownActive =
			record.cooldownUntil && new Date(record.cooldownUntil) > new Date();

		return (
			<>
				{toastEl}
				<div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
					<div className="flex items-center gap-3">
						<ShieldX className="w-5 h-5 text-red-600" />
						<div>
							<p className="text-sm font-medium text-red-800">
								Verification rejected
							</p>
							<p className="text-xs text-red-600">
								{record.remarks || "Your verification was not approved."}
							</p>
							{cooldownActive && (
								<p className="text-xs text-red-500 mt-1">
									Retry available{" "}
									{new Date(record.cooldownUntil!).toLocaleString()}
								</p>
							)}
						</div>
					</div>
					<Button
						onClick={handleVerify}
						disabled={starting || !!cooldownActive}
						size="sm"
						variant="outline"
						className="cursor-pointer border-red-300 text-red-700 hover:bg-red-100"
					>
						{starting ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							"Retry"
						)}
					</Button>
				</div>
			</>
		);
	}

	// Expired
	return (
		<>
			{toastEl}
			<div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
				<div className="flex items-center gap-3">
					<ShieldAlert className="w-5 h-5 text-amber-600" />
					<div>
						<p className="text-sm font-medium text-amber-800">
							Verification session expired
						</p>
						<p className="text-xs text-amber-600">
							Your previous session has expired. Please start again.
						</p>
					</div>
				</div>
				<Button
					onClick={handleVerify}
					disabled={starting}
					size="sm"
					className="cursor-pointer bg-[#3B5AA8] hover:bg-[#2f4389] text-white"
				>
					{starting ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						"Start Again"
					)}
				</Button>
			</div>
		</>
	);
}
