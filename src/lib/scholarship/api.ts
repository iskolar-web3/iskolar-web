import { queryOptions } from "@tanstack/react-query";
import { BACKEND_URL, safeResponseJson, type ApiResponse } from "../api";
import { anySponsorSchema } from "../sponsor/model";
import {
	applicantSchema,
	applicationSchema,
	applicationStatusSchema,
	scholarshipSchema,
	type Applicant,
	type Application,
	type ApplicationStatus,
	type CreateApplicationRequest,
	type EditScholarshipFormData,
	type GetApplicationsQueryParam,
	type GetScholarshipQueryParam,
	type Scholarship,
	type SelectScholarRequest,
} from "./model";
import { getCookie } from "../cookie";
import { ACCESS_TOKEN_KEY } from "../user/auth";

async function getMyScholarships(
	token: string,
	params?: GetScholarshipQueryParam,
): Promise<Scholarship[]> {
	const url = new URL(`${BACKEND_URL}/scholarships`);
	if (params?.sponsorId) {
		url.searchParams.append("sponsorId", params.sponsorId);
	}
	if (params?.search) {
		url.searchParams.append("search", params.search);
	}
	if (params?.notAppliedBy) {
		url.searchParams.append("notAppliedBy", params.notAppliedBy);
	}

	const response = await fetch(url.toString(), {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	const result: ApiResponse<Scholarship[]> = await safeResponseJson(response);

	return scholarshipSchema(anySponsorSchema)
		.array()
		.default([])
		.parse(result.data);
}

export const getMyScholarshipsQuery = (
	token: string,
	params?: GetScholarshipQueryParam,
) =>
	queryOptions({
		queryKey: ["scholarships", params],
		queryFn: () => getMyScholarships(token, params),
	});

async function getScholarshipById(id: string): Promise<Scholarship> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	if (!token) {
		throw new Error("Access token not found.");
	}

	const url = new URL(`${BACKEND_URL}/scholarships/${id}`);

	const response = await fetch(url.toString(), {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	const result: ApiResponse<Scholarship> = await safeResponseJson(response);

	console.log(result.data);

	return scholarshipSchema(anySponsorSchema).parse(result.data);
}

export const getScholarshipByIdQuery = (id: string) =>
	queryOptions({
		queryKey: ["scholarships", id],
		queryFn: () => getScholarshipById(id),
	});

export async function updateScholarship(
	data: EditScholarshipFormData,
): Promise<ApiResponse<Scholarship>> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	if (!token) {
		throw new Error("Access token not found.");
	}

	const url = new URL(`${BACKEND_URL}/scholarships/${data.id}`);
	const response = await fetch(url.toString(), {
		method: "PATCH",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		credentials: "include",
	});
	const result: ApiResponse<Scholarship> = await safeResponseJson(response);

	scholarshipSchema(anySponsorSchema).parse(result.data);

	return result;
}

async function getApplicants(id: string): Promise<Applicant[]> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	if (!token) {
		throw new Error("Access token not found.");
	}
	const url = new URL(`${BACKEND_URL}/scholarships/${id}/applications`);

	const response = await fetch(url.toString(), {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	const result: ApiResponse<Applicant[]> = await safeResponseJson(response);

	return applicantSchema.array().parse(result.data);
}

export const getApplicantsQuery = (id: string) =>
	queryOptions({
		queryKey: ["scholarships", "applicants", id],
		queryFn: () => getApplicants(id),
	});

async function getMyApplications(
	param: GetApplicationsQueryParam,
): Promise<Application[]> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	if (!token) {
		throw new Error("Access token not found.");
	}
	const url = new URL(`${BACKEND_URL}/scholarships/applications`);
	if (param.studentId) {
		url.searchParams.append("studentId", param.studentId);
	}

	if (param.status) {
		url.searchParams.append("status", param.status);
	}

	const response = await fetch(url.toString(), {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	const result: ApiResponse<Application[]> = await safeResponseJson(response);

	return applicationSchema.array().parse(result.data);
}

export const getMyApplicationsQuery = (param: GetApplicationsQueryParam) =>
	queryOptions({
		queryKey: ["scholarships", "applications", param],
		queryFn: () => getMyApplications(param),
	});

export async function createApplication(
	data: CreateApplicationRequest,
): Promise<ApiResponse> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	if (!token) {
		throw new Error("Access token not found.");
	}
	const url = new URL(
		`${BACKEND_URL}/scholarships/${data.scholarshipId}/applications`,
	);

	const response = await fetch(url.toString(), {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		credentials: "include",
	});
	const result: ApiResponse = await safeResponseJson(response);

	return result;
}

export async function updateApplication(
	data: SelectScholarRequest,
): Promise<ApiResponse> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	if (!token) {
		throw new Error("Access token not found.");
	}
	const url = new URL(
		`${BACKEND_URL}/scholarships/${data.scholarshipId}/applications`,
	);

	const response = await fetch(url.toString(), {
		method: "PATCH",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		credentials: "include",
	});
	const result: ApiResponse = await safeResponseJson(response);

	if (!response.ok) {
		throw new Error(result.message);
	}

	return result;
}

export async function deleteScholarship(id: string): Promise<ApiResponse> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	if (!token) {
		throw new Error("Access token not found.");
	}

	const url = new URL(`${BACKEND_URL}/scholarships/${id}`);

	const response = await fetch(url.toString(), {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		credentials: "include",
	});
	const result: ApiResponse = await safeResponseJson(response);

	if (!response.ok) {
		throw new Error(result.message);
	}

	return result;
}

export async function getMyApplicationStatus(
	scholarshipId: string,
): Promise<ApplicationStatus | null> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	if (!token) {
		throw new Error("Access token not found.");
	}
	const url = new URL(
		`${BACKEND_URL}/students/me/scholarships/${scholarshipId}`,
	);

	const response = await fetch(url.toString(), {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	const result: ApiResponse<ApplicationStatus> = await safeResponseJson(response);

	return applicationStatusSchema.nullable().parse(result.data);
}
