import { BACKEND_URL, type ApiResponse } from "../api";
import type { AuthSession } from "./model";

export const ACCESS_TOKEN_KEY = "auth_token";

export async function validateSession(): Promise<ApiResponse<AuthSession | null>> {
	const response = await fetch(`${BACKEND_URL}/sessions`, {
		method: "GET",
		credentials: "include",
	});
	if (!response.ok) {
		return { message: "Unauthorized", data: null };
	}
	const result: ApiResponse<AuthSession> = await response.json();
	return result;
}

export async function validateVerificationToken(
	token: string,
): Promise<ApiResponse> {
	const url = new URL(`${BACKEND_URL}/verify`);
	url.searchParams.append("token", token);

	const response = await fetch(url.toString(), { method: "GET" });
	const result: ApiResponse = await response.json();
	if (!response.ok) {
		throw new Error(result.message || "Invalid or expired verification link");
	}

	return result;
}

export async function resendVerificationEmail(email: string): Promise<void> {
	const response = await fetch(`${BACKEND_URL}/verify/resend`, {
		method: "POST",
		body: JSON.stringify({ email }),
		headers: { "Content-Type": "application/json" },
	});
	const result: ApiResponse = await response.json();
	if (!response.ok) {
		throw new Error(result.message || "Failed to resend verification link.");
	}
}
