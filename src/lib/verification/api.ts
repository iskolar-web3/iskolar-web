import { BACKEND_URL, type ApiResponse } from "../api";
import {
	verificationRecordSchema,
	publicVerificationSchema,
	type VerificationRecord,
	type PublicVerification,
} from "./model";

export async function startVerification(): Promise<{ verificationUrl: string }> {
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

export async function getVerificationStatus(
	role: "students" | "sponsors",
): Promise<VerificationRecord | null> {
	const response = await fetch(`${BACKEND_URL}/${role}/me/verification`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) return null;

	const result: ApiResponse<VerificationRecord | null> =
		await response.json();
	if (!result.data) return null;

	return verificationRecordSchema.parse(result.data);
}

export async function getPublicVerificationStatus(
	userId: string,
): Promise<PublicVerification | null> {
	const response = await fetch(
		`${BACKEND_URL}/users/${userId}/verification`,
	);

	if (!response.ok) return null;

	const result: ApiResponse<PublicVerification | null> =
		await response.json();
	if (!result.data) return null;

	return publicVerificationSchema.parse(result.data);
}
