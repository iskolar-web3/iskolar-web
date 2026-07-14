import { queryOptions } from "@tanstack/react-query";
import { type ApiResponse, BACKEND_URL, safeResponseJson } from "@/lib/api";
import type {
	CreateReportRequest,
	GetReportsQueryParam,
	Report,
	UpdateReportRequest,
} from "./model";
import { reportSchema } from "./model";

async function getMyReports(): Promise<Report[]> {
	const response = await fetch(`${BACKEND_URL}/reports/me`, {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<Report[]> = await safeResponseJson(response);
	return reportSchema.array().default([]).parse(result.data);
}

export const getMyReportsQuery = () =>
	queryOptions({
		queryKey: ["reports", "me"],
		queryFn: getMyReports,
	});

export async function createReport(
	data: CreateReportRequest,
): Promise<ApiResponse<Report>> {
	const response = await fetch(`${BACKEND_URL}/reports`, {
		method: "POST",
		body: JSON.stringify(data),
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	const result: ApiResponse<Report> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to submit report.");
	}
	return result;
}

async function getReports(param: GetReportsQueryParam): Promise<Report[]> {
	const url = new URL(`${BACKEND_URL}/reports`);
	if (param.scholarshipId)
		url.searchParams.append("scholarshipId", param.scholarshipId);
	if (param.studentId) url.searchParams.append("studentId", param.studentId);
	if (param.status) url.searchParams.append("status", param.status);

	const response = await fetch(url.toString(), {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<Report[]> = await safeResponseJson(response);
	return reportSchema.array().default([]).parse(result.data);
}

export const getReportsQuery = (param: GetReportsQueryParam) =>
	queryOptions({
		queryKey: ["reports", param],
		queryFn: () => getReports(param),
	});

export async function markReportReviewed(
	id: string,
): Promise<ApiResponse<Report>> {
	const response = await fetch(`${BACKEND_URL}/reports/${id}/review`, {
		method: "PATCH",
		credentials: "include",
	});
	const result: ApiResponse<Report> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to review report.");
	}
	return result;
}

export async function updateReport(
	data: UpdateReportRequest,
): Promise<ApiResponse<Report>> {
	const response = await fetch(`${BACKEND_URL}/reports/${data.id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});
	const result: ApiResponse<Report> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to update report.");
	}
	return result;
}
