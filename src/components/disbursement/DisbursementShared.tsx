import { useRef, useState, type ReactNode } from "react";
import {
	Check,
	Clock,
	Copy,
	FileUp,
	ImageIcon,
	Info,
	Loader2,
} from "lucide-react";
import { DisbursementStatus } from "@/lib/disbursement/model";
import { uploadFile } from "@/lib/api";
import { getCookie } from "@/lib/cookie";
import { ACCESS_TOKEN_KEY } from "@/lib/user/auth";
import { handleFileSelection, validateFile } from "@/utils/fileHandling.utils";

export function formatPeso(amount: number): string {
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
	}).format(amount);
}

export function formatDate(date: Date): string {
	return date.toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

const STATUS_META: Record<
	DisbursementStatus,
	{ label: string; dot: string; className: string }
> = {
	[DisbursementStatus.Initiated]: {
		label: "Initiated",
		dot: "bg-gray-400",
		className: "text-gray-600",
	},
	[DisbursementStatus.Sent]: {
		label: "Sent",
		dot: "bg-amber-500",
		className: "text-amber-700",
	},
	[DisbursementStatus.Received]: {
		label: "Received",
		dot: "bg-green-500",
		className: "text-green-700",
	},
};

export function DisbursementStatusBadge({
	status,
}: {
	status: DisbursementStatus;
}) {
	const meta = STATUS_META[status];
	return (
		<span
			className={`inline-flex items-center gap-1.5 text-xs ${meta.className}`}
		>
			<span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
			{meta.label}
		</span>
	);
}

const STEP_ORDER: DisbursementStatus[] = [
	DisbursementStatus.Initiated,
	DisbursementStatus.Sent,
	DisbursementStatus.Received,
];

const STEP_LABELS: Record<DisbursementStatus, string> = {
	[DisbursementStatus.Initiated]: "Created",
	[DisbursementStatus.Sent]: "Funds sent",
	[DisbursementStatus.Received]: "Received",
};

/**
 * Horizontal 3-step progress tracker. Pass `null` for the create stage (nothing
 * completed yet), otherwise the disbursement's current status.
 */
export function DisbursementSteps({
	current,
}: {
	current: DisbursementStatus | null;
}) {
	const currentIndex = current ? STEP_ORDER.indexOf(current) : -1;

	return (
		<div className="flex items-start rounded-xl border border-[#E0ECFF] bg-white px-3 py-4">
			{STEP_ORDER.map((status, i) => {
				const completed = i <= currentIndex;
				const active = i === currentIndex + 1;

				return (
					<div key={status} className="flex flex-1 flex-col items-center">
						<div className="flex w-full items-center">
							<span
								className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
									i === 0
										? "invisible"
										: i <= currentIndex
											? "bg-primary"
											: "bg-[#E0ECFF]"
								}`}
							/>
							<span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
								{active && (
									<span className="absolute h-9 w-9 animate-ping rounded-full bg-primary/20" />
								)}
								<span
									className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs transition-all duration-300 ${
										completed
											? "bg-primary text-white shadow-sm"
											: active
												? "border-2 border-primary bg-white text-primary"
												: "border border-[#E0ECFF] bg-white text-[#9CA3AF]"
									}`}
								>
									{completed ? <Check className="h-4 w-4" /> : i + 1}
								</span>
							</span>
							<span
								className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
									i === STEP_ORDER.length - 1
										? "invisible"
										: i + 1 <= currentIndex
											? "bg-primary"
											: "bg-[#E0ECFF]"
								}`}
							/>
						</div>
						<span
							className={`mt-2 text-center text-[11px] transition-colors ${
								completed || active ? "text-primary" : "text-[#9CA3AF]"
							}`}
						>
							{STEP_LABELS[status]}
						</span>
					</div>
				);
			})}
		</div>
	);
}

export function PaymentDetailsCard({
	method,
	accountName,
	accountNumber,
	title = "Send funds to",
}: {
	method: string;
	accountName: string;
	accountNumber: string;
	title?: string;
}) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(accountNumber);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// clipboard unavailable; ignore
		}
	}

	return (
		<div className="rounded-lg border border-[#E0ECFF] bg-[#F8FAFF] p-4">
			<p className="mb-3 text-[11px] uppercase tracking-wide text-[#9CA3AF]">
				{title}
			</p>
			<div className="space-y-2.5 text-sm">
				<div className="flex items-center justify-between gap-2">
					<span className="text-[#6B7280]">Channel</span>
					<span className="text-primary">{method}</span>
				</div>
				<div className="flex items-center justify-between gap-2">
					<span className="text-[#6B7280]">Account name</span>
					<span className="text-primary">{accountName}</span>
				</div>
				<div className="flex items-center justify-between gap-2">
					<span className="text-[#6B7280]">Account number</span>
					<button
						type="button"
						onClick={copy}
						title="Copy account number"
						className="group inline-flex cursor-pointer items-center gap-1.5 text-primary"
					>
						{accountNumber}
						{copied ? (
							<Check className="h-3.5 w-3.5 text-green-600" />
						) : (
							<Copy className="h-3.5 w-3.5 text-[#9CA3AF] transition-colors group-hover:text-primary" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

const BANNER_META = {
	neutral: { className: "text-[#6B7280]", icon: Info },
	waiting: { className: "text-amber-700", icon: Clock },
	success: { className: "text-green-700", icon: Check },
};

export function InfoBanner({
	variant,
	children,
}: {
	variant: "neutral" | "waiting" | "success";
	children: ReactNode;
}) {
	const meta = BANNER_META[variant];
	const Icon = meta.icon;
	return (
		<div className={`flex items-start gap-2 text-sm ${meta.className}`}>
			<Icon className="mt-0.5 h-4 w-4 shrink-0" />
			<span>{children}</span>
		</div>
	);
}

type ProofUploadFieldProps = {
	value: string | null;
	onChange: (url: string | null) => void;
	disabled?: boolean;
};

export function ProofUploadField({
	value,
	onChange,
	disabled,
}: ProofUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		setError(null);

		const validationError = validateFile(file);
		if (validationError) {
			setError(validationError);
			return;
		}

		const token = getCookie(ACCESS_TOKEN_KEY);
		if (!token) {
			setError("Access token not found.");
			return;
		}

		setUploading(true);
		try {
			const processed = await handleFileSelection(file, { compress: true });
			if (processed.error) {
				setError(processed.error);
				return;
			}

			setPreview(processed.preview);

			const uploadRes = await uploadFile(
				processed.file,
				token,
				"disbursement-files",
			);
			if (!uploadRes.data?.url) {
				setError(uploadRes.message || "Failed to upload proof.");
				return;
			}

			onChange(uploadRes.data.url);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to upload proof.");
		} finally {
			setUploading(false);
		}
	}

	const previewSrc = preview ?? value;

	return (
		<div className="space-y-2">
			{previewSrc ? (
				<div className="relative overflow-hidden rounded-lg border border-[#E0ECFF]">
					<img
						src={previewSrc}
						alt="Proof preview"
						className="max-h-44 w-full bg-[#F8FAFF] object-contain"
					/>
					<div className="flex items-center justify-between gap-2 border-t border-[#E0ECFF] bg-white px-3 py-2">
						<span className="inline-flex items-center gap-1.5 text-xs text-green-700">
							<Check className="h-3.5 w-3.5" />
							Proof attached
						</span>
						<button
							type="button"
							disabled={disabled || uploading}
							onClick={() => inputRef.current?.click()}
							className="cursor-pointer text-xs text-primary hover:underline disabled:opacity-60"
						>
							Replace
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					disabled={disabled || uploading}
					onClick={() => inputRef.current?.click()}
					className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#C7D5F5] bg-[#F8FAFF] px-4 py-6 text-center transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
				>
					{uploading ? (
						<Loader2 className="h-5 w-5 animate-spin text-primary" />
					) : (
						<FileUp className="h-5 w-5 text-[#9CA3AF]" />
					)}
					<span className="text-sm text-primary">
						{uploading ? "Uploading..." : "Upload proof image"}
					</span>
					<span className="text-[11px] text-[#9CA3AF]">
						PNG, JPG or PDF · up to 10MB
					</span>
				</button>
			)}
			<input
				ref={inputRef}
				type="file"
				accept="image/png,image/jpeg,image/jpg,application/pdf"
				className="hidden"
				onChange={handleSelect}
				disabled={disabled || uploading}
			/>
			{error && <p className="text-xs text-red-600">{error}</p>}
		</div>
	);
}

export function ProofImageLink({
	label,
	url,
}: {
	label: string;
	url: string | null;
}) {
	if (!url) {
		return null;
	}

	return (
		<div className="space-y-1.5">
			<p className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
				<ImageIcon className="h-3 w-3" />
				{label}
			</p>
			<a href={url} target="_blank" rel="noopener noreferrer" className="block">
				<img
					src={url}
					alt={label}
					className="h-36 w-full rounded-lg border border-[#E0ECFF] bg-[#F8FAFF] object-contain transition-opacity hover:opacity-90"
				/>
			</a>
		</div>
	);
}
