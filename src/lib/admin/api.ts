import { BACKEND_URL, safeResponseJson, type ApiResponse } from "@/lib/api";
import { scholarshipSchema } from "@/lib/scholarship/model";
import { anySponsorSchema } from "@/lib/sponsor/model";
import type { Scholarship } from "@/lib/scholarship/model";
import type {
	DashboardMetrics,
	PaginatedResponse,
	SignupTimelineEntry,
	StudentDistribution,
	UserListItem,
	UserListQuery,
} from "./model";

export async function getDashboardMetrics(
	token: string,
): Promise<ApiResponse<DashboardMetrics>> {
	const response = await fetch(`${BACKEND_URL}/admin/dashboard`, {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	return safeResponseJson(response);
}

export async function getSignupTimeline(
	token: string,
	days = 30,
): Promise<ApiResponse<SignupTimelineEntry[]>> {
	const response = await fetch(
		`${BACKEND_URL}/admin/dashboard/signups?days=${days}`,
		{
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
			credentials: "include",
		},
	);
	return safeResponseJson(response);
}

export async function getStudentDistribution(
	token: string,
): Promise<ApiResponse<StudentDistribution>> {
	const response = await fetch(`${BACKEND_URL}/admin/dashboard/students`, {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	return safeResponseJson(response);
}

export async function getAdminScholarships(
	token: string,
	params?: { search?: string },
): Promise<Scholarship[]> {
	const url = new URL(`${BACKEND_URL}/admin/scholarships`);
	if (params?.search) url.searchParams.set("search", params.search);

	const response = await fetch(url.toString(), {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	const result: ApiResponse<Scholarship[]> = await safeResponseJson(response);
	return scholarshipSchema(anySponsorSchema).array().default([]).parse(result.data);
}

export async function getUsers(
	token: string,
	params: UserListQuery,
): Promise<ApiResponse<PaginatedResponse<UserListItem>>> {
	const searchParams = new URLSearchParams();

	if (params.page) searchParams.set("page", String(params.page));
	if (params.limit) searchParams.set("limit", String(params.limit));
	if (params.role) searchParams.set("role", params.role);
	if (params.search) searchParams.set("search", params.search);
	if (params.sortBy) searchParams.set("sortBy", params.sortBy);
	if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

	const response = await fetch(
		`${BACKEND_URL}/admin/users?${searchParams.toString()}`,
		{
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
			credentials: "include",
		},
	);
	return safeResponseJson(response);
}
