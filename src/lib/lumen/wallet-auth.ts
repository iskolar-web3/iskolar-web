import { type ApiResponse, BACKEND_URL } from "@/lib/api";
import type { AuthSession } from "@/lib/user/model";

export type LumenLoginSession = {
	sessionId: string;
	loginUrl: string;
	expiresAt: string;
};

export type LumenStatusData =
	| { status: "pending" }
	| { status: "expired" }
	| { status: "rejected" }
	| ({ status: "authenticated" } & AuthSession);

export async function initiateLumenLogin(): Promise<LumenLoginSession> {
	const res = await fetch(`${BACKEND_URL}/auth/lumen/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
	});
	const result: ApiResponse<LumenLoginSession> = await res.json();
	if (!res.ok) {
		throw new Error(result.message || "Failed to initiate Lumen login.");
	}
	return result.data;
}

export async function pollLumenStatus(
	sessionId: string,
): Promise<LumenStatusData> {
	const url = new URL(`${BACKEND_URL}/auth/lumen/status`);
	url.searchParams.set("sessionId", sessionId);

	const res = await fetch(url.toString(), { method: "GET" });
	const result: ApiResponse<LumenStatusData> = await res.json();

	// 410 Gone = expired, 401 = rejected — both carry a data.status field
	if (res.status === 410 || res.status === 401) {
		return (result.data as LumenStatusData) ?? { status: "rejected" };
	}

	if (!res.ok) {
		throw new Error(result.message || "Failed to poll login status.");
	}

	return result.data;
}
