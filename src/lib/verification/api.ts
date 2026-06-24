import { queryOptions } from "@tanstack/react-query";
import { BACKEND_URL, type ApiResponse } from "../api";
import { verificationRecordSchema, type VerificationRecord } from "./model";

export async function startVerification(): Promise<{
	verificationUrl: string;
}> {
	const response = await fetch(`${BACKEND_URL}/verifications/me`, {
		method: "POST",
		credentials: "include",
	});

	const result: ApiResponse<{ verificationUrl: string }> =
		await response.json();
	if (!response.ok) {
		throw new Error(result.message || "Failed to start verification.");
	}

	return result.data;
}

export async function getVerificationStatus(): Promise<VerificationRecord | null> {
	const response = await fetch(`${BACKEND_URL}/verifications/me`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) return null;

	const result: ApiResponse<VerificationRecord> = await response.json();
	if (!result.data) return null;

	return verificationRecordSchema.parse(result.data);
}

export const getVerificationStatusQuery = queryOptions({
	queryKey: ["verification-status"],
	queryFn: () => getVerificationStatus(),
	staleTime: 30_000,
	enabled: true,
});
