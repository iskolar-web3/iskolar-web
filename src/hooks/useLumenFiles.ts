import { useState, useEffect, useCallback } from "react";
import { getLumenFile } from "@/lib/lumen/api";
import { getStoredCredentials, updateStoredCredential } from "@/lib/lumen/storage";
import type { StoredCredential } from "@/lib/lumen/model";

const POLL_MS = 15_000;
const MAX_POLLS = 5;

export function useLumenCredentials(userId: string | undefined) {
	const [credentials, setCredentials] = useState<StoredCredential[]>(
		() => (userId ? getStoredCredentials(userId) : []),
	);
	const [pollCounts, setPollCounts] = useState<Record<string, number>>({});

	useEffect(() => {
		if (userId) setCredentials(getStoredCredentials(userId));
		else setCredentials([]);
		setPollCounts({});
	}, [userId]);

	const refresh = useCallback(() => {
		if (userId) setCredentials(getStoredCredentials(userId));
	}, [userId]);

	// Poll pending files
	useEffect(() => {
		if (!userId) return;

		const pending = credentials.filter(
			(c) =>
				(c.lumenStatus === "pending" || c.lumenStatus === "uploading") &&
				(pollCounts[c.fetchKey] ?? 0) < MAX_POLLS,
		);
		if (pending.length === 0) return;

		const poll = async () => {
			for (const cred of pending) {
				const attempt = (pollCounts[cred.fetchKey] ?? 0) + 1;
				const result = await getLumenFile(cred.fetchKey);

				if (result?.File?.FileURL) {
					updateStoredCredential(userId, cred.fetchKey, {
						lumenStatus: "completed",
						fileUrl: result.File.FileURL,
					});
					setCredentials(getStoredCredentials(userId));
					return;
				}

				setPollCounts((p) => ({ ...p, [cred.fetchKey]: attempt }));
				if (attempt >= MAX_POLLS) {
					updateStoredCredential(userId, cred.fetchKey, { lumenStatus: "failed" });
					setCredentials(getStoredCredentials(userId));
				}
			}
		};

		const id = setInterval(poll, POLL_MS);
		return () => clearInterval(id);
	}, [userId, credentials, pollCounts]);

	return { credentials, refresh };
}
