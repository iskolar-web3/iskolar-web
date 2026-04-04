import { useEffect } from "react";
import {
	FileText,
	Clock,
	CheckCircle2,
	XCircle,
	Loader2,
} from "lucide-react";
import { useLumenCredentials } from "@/hooks/useLumenFiles";
import type { StoredCredential, LumenFileStatus } from "@/lib/lumen/model";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LumenFileStatus }) {
	switch (status) {
		case "completed":
			return (
				<span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
					<CheckCircle2 className="w-3 h-3" />
					Registered
				</span>
			);
		case "failed":
			return (
				<span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
					<XCircle className="w-3 h-3" />
					Failed
				</span>
			);
		case "uploading":
			return (
				<span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
					<Loader2 className="w-3 h-3 animate-spin" />
					Uploading
				</span>
			);
		default:
			return (
				<span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
					<Clock className="w-3 h-3" />
					Processing
				</span>
			);
	}
}

// ─── Credential Card ─────────────────────────────────────────────────────────

function CredentialCard({ credential }: { credential: StoredCredential }) {
	const displayUrl = credential.fileUrl ?? null;
	const isPdf = credential.extension === "pdf";

	return (
		<div className="border border-gray-150 rounded-sm p-2 hover:border-secondary/50 transition-colors">
			<div className="flex gap-4">
				{/* Thumbnail */}
				<div className="flex-shrink-0 w-34" style={{ aspectRatio: "297/210" }}>
					{displayUrl && !isPdf ? (
						<img
							src={displayUrl}
							alt={credential.name}
							className="w-full h-full object-cover bg-gray-50 rounded"
						/>
					) : (
						<div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
							<FileText className="w-8 h-8 text-gray-400" />
						</div>
					)}
				</div>

				{/* Details */}
				<div className="flex-1 min-w-0 flex flex-col">
					<h3 className="text-[15px] text-primary truncate">{credential.name}</h3>

					<p className="text-[13px] text-primary/75">{credential.institution}</p>

					{credential.issuedDate && (
						<p className="text-xs text-primary/55">{credential.issuedDate}</p>
					)}

					<div className="mt-auto pt-1.5 flex items-center gap-2 flex-wrap">
						<StatusBadge status={credential.lumenStatus} />

						<span className="text-[10px] text-gray-400">
							{credential.credentialType}
						</span>

						{displayUrl && (
							<a
								href={displayUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-[10px] text-blue-500 hover:underline ml-auto"
							>
								View
							</a>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface LumenFilesListProps {
	userId: string;
	/** Increment to force a re-read from localStorage after a new upload */
	refreshKey?: number;
}

export default function LumenFilesList({ userId, refreshKey }: LumenFilesListProps) {
	const { credentials, refresh } = useLumenCredentials(userId);

	useEffect(() => {
		refresh();
	}, [refreshKey, refresh]);

	const pendingCount = credentials.filter(
		(c) => c.lumenStatus === "pending" || c.lumenStatus === "uploading",
	).length;

	return (
		<div>
			{pendingCount > 0 && (
				<div className="flex items-center gap-1 mb-3 text-[11px] text-yellow-600">
					<Loader2 className="w-3 h-3 animate-spin" />
					{pendingCount} credential{pendingCount > 1 ? "s" : ""} processing…
				</div>
			)}

			{credentials.length === 0 ? (
				<div className="text-center py-8 text-gray-400">
					<FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
					<p className="text-sm">No credentials uploaded yet</p>
					<p className="text-xs mt-1">
						Click "Add Credential" to get started
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{credentials.map((cred) => (
						<CredentialCard key={cred.fetchKey} credential={cred} />
					))}
				</div>
			)}
		</div>
	);
}
