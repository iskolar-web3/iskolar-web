import type { StoredCredential } from "./model";

function key(userId: string): string {
	return `lumen_credentials_${userId}`;
}

export function getStoredCredentials(userId: string): StoredCredential[] {
	try {
		const raw = localStorage.getItem(key(userId));
		return raw ? (JSON.parse(raw) as StoredCredential[]) : [];
	} catch {
		return [];
	}
}

export function addStoredCredential(cred: StoredCredential): void {
	const existing = getStoredCredentials(cred.userId);
	const updated = [cred, ...existing.filter((c) => c.fetchKey !== cred.fetchKey)];
	localStorage.setItem(key(cred.userId), JSON.stringify(updated));
}

export function updateStoredCredential(
	userId: string,
	fetchKey: string,
	updates: Partial<StoredCredential>,
): void {
	const existing = getStoredCredentials(userId);
	const updated = existing.map((c) =>
		c.fetchKey === fetchKey ? { ...c, ...updates } : c,
	);
	localStorage.setItem(key(userId), JSON.stringify(updated));
}
