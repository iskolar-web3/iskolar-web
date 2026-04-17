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
	const [error, setError] = useState("");
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
		if (!isReturningFromDidit) return;
		if (record && record.status !== Status.Pending) return;
		// Don't restart if already polling
		if (pollRef.current) return;

		pollCountRef.current = 0;
		pollRef.current = setInterval(async () => {
			pollCountRef.current += 1;
			const result = await fetchStatus();

			if (
				(result && result.status !== Status.Pending) ||
				pollCountRef.current >= 12
			) {
				if (pollRef.current) {
					clearInterval(pollRef.current);
					pollRef.current = null;
				}
			}
		}, 5000);

		return () => {
			if (pollRef.current) {
				clearInterval(pollRef.current);
				pollRef.current = null;
			}
		};
	}, [isReturningFromDidit, record?.status]);

	async function handleVerify() {
		setError("");

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
			setError(
				err instanceof Error
					? err.message
					: "Failed to start verification.",
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

	// No record yet — show CTA
	if (!record) {
		return (
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
					className="bg-[#3B5AA8] hover:bg-[#2f4389] text-white"
				>
					{starting ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						"Verify Now"
					)}
				</Button>
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
		);
	}

	// Pending
	if (record.status === Status.Pending) {
		return (
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
								: "Your verification is being processed. Check back shortly."}
						</p>
					</div>
				</div>
				{isReturningFromDidit && pollCountRef.current < 12 && (
					<Loader2 className="w-4 h-4 animate-spin text-blue-600" />
				)}
			</div>
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
					className="border-red-300 text-red-700 hover:bg-red-100"
				>
					{starting ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						"Retry"
					)}
				</Button>
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
		);
	}

	// Expired
	return (
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
				className="bg-[#3B5AA8] hover:bg-[#2f4389] text-white"
			>
				{starting ? (
					<Loader2 className="w-4 h-4 animate-spin" />
				) : (
					"Start Again"
			)}
		</Button>
		{error && <p className="text-sm text-red-600">{error}</p>}
	</div>
);
}
