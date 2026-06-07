import { BACKEND_URL, safeResponseJson, type ApiResponse } from "@/lib/api";
import { applicantSchema, scholarshipSchema } from "@/lib/scholarship/model";
import { anySponsorSchema } from "@/lib/sponsor/model";
import type { Applicant, Scholarship } from "@/lib/scholarship/model";
import type {
	DashboardMetrics,
	PaginatedResponse,
	SignupTimelineEntry,
	StudentDistribution,
	UserListItem,
	UserListQuery,
} from "./model";

export async function getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
	const response = await fetch(`${BACKEND_URL}/admin/dashboard`, {
		method: "GET",
		credentials: "include",
	});
	return safeResponseJson(response);
}

export async function getSignupTimeline(
	startDate: string,
	endDate: string,
): Promise<ApiResponse<SignupTimelineEntry[]>> {
	const response = await fetch(
		`${BACKEND_URL}/admin/dashboard/signups?startDate=${startDate}&endDate=${endDate}`,
		{
			method: "GET",
			credentials: "include",
		},
	);
	return safeResponseJson(response);
}

export async function getStudentDistribution(): Promise<ApiResponse<StudentDistribution>> {
	const response = await fetch(`${BACKEND_URL}/admin/dashboard/students`, {
		method: "GET",
		credentials: "include",
	});
	return safeResponseJson(response);
}

export async function getAdminScholarships(
	params?: { search?: string },
): Promise<Scholarship[]> {
	const url = new URL(`${BACKEND_URL}/admin/scholarships`);
	if (params?.search) url.searchParams.set("search", params.search);

	const response = await fetch(url.toString(), {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<Scholarship[]> = await safeResponseJson(response);
	return scholarshipSchema(anySponsorSchema).array().default([]).parse(result.data);
}

export async function getAdminScholarshipApplicants(
	scholarshipId: string,
): Promise<Applicant[]> {
	const response = await fetch(
		`${BACKEND_URL}/scholarships/${scholarshipId}/applications`,
		{
			method: "GET",
			credentials: "include",
		},
	);
	const result: ApiResponse<Applicant[]> = await safeResponseJson(response);
	return applicantSchema.array().default([]).parse(result.data ?? []);
}

export async function getUsers(
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
			credentials: "include",
		},
	);
	return safeResponseJson(response);
}
