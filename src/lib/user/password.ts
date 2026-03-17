import { BACKEND_URL, type ApiResponse } from "@/lib/api";

// ─── Request / Response Shapes ────────────────────────────────────────────────
// These interfaces define the contract between the frontend and backend.
// The backend team should implement endpoints that match these exactly.

/** POST /forgot-password — request body */
export interface ForgotPasswordRequest {
	email: string;
}

/**
 * POST /forgot-password — response body
 *
 * Backend should:
 * 1. Check if the email exists in the database.
 * 2. Generate a cryptographically secure, single-use token (e.g. 32 bytes hex).
 * 3. Store the hashed token with an expiry (15 minutes recommended).
 * 4. Send a reset email containing: {APP_URL}/reset-password?token=<raw-token>
 *
 * NOTE: Always return 200 regardless of whether the email exists (prevents
 * user-enumeration attacks). The `message` in `ApiResponse` can be generic.
 */
export interface ForgotPasswordResponse {
	message: string;
}

/** GET /reset-password/validate?token=<token> — response body */
export interface ValidateResetTokenResponse {
	/**
	 * `true` if the token exists, has not expired, and has not been used.
	 * `false` (or non-200) if invalid / expired / already used.
	 */
	valid: boolean;
	/** Optionally return the masked email associated with the token for display purposes. */
	maskedEmail?: string;
}

/** POST /reset-password — request body */
export interface ResetPasswordRequest {
	token: string;
	newPassword: string;
}

/**
 * POST /reset-password — response body
 *
 * Backend should:
 * 1. Validate token (exists, not expired, not used).
 * 2. Hash the new password (bcrypt / argon2).
 * 3. Update the user's password in the database.
 * 4. Mark the token as used / delete it to prevent replay.
 * 5. Optionally invalidate all existing sessions for that user.
 */
export interface ResetPasswordResponse {
	message: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * Sends a password reset email.
 *
 * @endpoint POST /forgot-password
 */
export async function requestPasswordReset(
	email: string,
): Promise<ForgotPasswordResponse> {
	const response = await fetch(`${BACKEND_URL}/forgot-password`, {
		method: "POST",
		body: JSON.stringify({ email } satisfies ForgotPasswordRequest),
		headers: { "Content-Type": "application/json" },
	});
	const result: ApiResponse<ForgotPasswordResponse> = await response.json();
	if (!response.ok) {
		throw new Error(result.message || "Failed to send password reset email");
	}
	return result.data;
}

/**
 * Validates a password reset token before showing the reset form.
 *
 * @endpoint GET /reset-password/validate?token=<token>
 */
export async function validateResetToken(
	token: string,
): Promise<ValidateResetTokenResponse> {
	const response = await fetch(
		`${BACKEND_URL}/reset-password/validate?token=${encodeURIComponent(token)}`,
		{ method: "GET" },
	);
	const result: ApiResponse<ValidateResetTokenResponse> = await response.json();
	if (!response.ok) {
		throw new Error(result.message || "Invalid or expired reset link");
	}
	return result.data;
}

/**
 * Submits a new password using a valid reset token.
 *
 * @endpoint POST /reset-password
 */
export async function resetPassword(
	token: string,
	newPassword: string,
): Promise<ResetPasswordResponse> {
	const response = await fetch(`${BACKEND_URL}/reset-password`, {
		method: "POST",
		body: JSON.stringify({
			token,
			newPassword,
		} satisfies ResetPasswordRequest),
		headers: { "Content-Type": "application/json" },
	});
	const result: ApiResponse<ResetPasswordResponse> = await response.json();
	if (!response.ok) {
		throw new Error(result.message || "Failed to reset password");
	}
	return result.data;
}
