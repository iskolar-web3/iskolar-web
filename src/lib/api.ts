import z from "zod";
import type { EnumLike } from "zod/v3";
import { UserRole, type User } from "./user/model";

export type ApiResponse<T = any> = T extends undefined
	? { message: string }
	: { message: string; data: T };

type FileDataResponse = {
	url: string;
};

export const BACKEND_URL =
	import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function safeResponseJson<T>(response: Response): Promise<T> {
	const text = await response.text();
	try {
		return JSON.parse(text) as T;
	} catch {
		throw new Error(text || `HTTP ${response.status}`);
	}
}

export function enumDetailSchema<T extends EnumLike>(code: T) {
	return z.object({
		id: z.number().positive(),
		name: z.string().nonempty(),
		code: z.enum(code),
	});
}

export async function uploadFile(
	file: File,
	type:
		| "profile-images"
		| "scholarship-images"
		| "application-files"
		| "disbursement-files" = "profile-images",
): Promise<ApiResponse<FileDataResponse>> {
	const formData = new FormData();
	formData.append("file", file);

	const response = await fetch(`${BACKEND_URL}/upload?type=${type}`, {
		method: "POST",
		body: formData,
		credentials: "include",
	});

	const result: ApiResponse<FileDataResponse> = await safeResponseJson(response);
	return result;
}

export function getDefaultPathOfRole(user: User): string {
	switch (user.role?.code) {
		case UserRole.Student:
			return "/home";
		case UserRole.Sponsor:
			return "/scholarships";
		case UserRole.Admin:
			return "/dashboard";
		default:
			return "/role-selection";
	}
}
