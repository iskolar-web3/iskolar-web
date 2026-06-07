import { queryOptions } from "@tanstack/react-query";
import { type ApiResponse, BACKEND_URL, safeResponseJson } from "../api";
import { getCookie } from "../cookie";
import {
	type PaymentMethodDetail,
	paymentMethodSchema,
} from "../student/model";
import { ACCESS_TOKEN_KEY } from "../user/auth";
import {
	type CreateDisbursementRequest,
	type Disbursement,
	disbursementSchema,
	type MarkReceivedRequest,
	type MarkSentRequest,
} from "./model";

export async function createDisbursement(
	value: CreateDisbursementRequest,
): Promise<ApiResponse<Disbursement>> {
	const response = await fetch(`${BACKEND_URL}/disbursements`, {
		method: "POST",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	const result: ApiResponse<Disbursement> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to create disbursement.");
	}

	return result;
}

export async function markDisbursementSent(
	id: string,
	value: MarkSentRequest,
): Promise<ApiResponse<Disbursement>> {
	const response = await fetch(`${BACKEND_URL}/disbursements/${id}/send`, {
		method: "PATCH",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	const result: ApiResponse<Disbursement> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to update disbursement.");
	}

	return result;
}

export async function markDisbursementReceived(
	id: string,
	value: MarkReceivedRequest,
): Promise<ApiResponse<Disbursement>> {
	const response = await fetch(`${BACKEND_URL}/disbursements/${id}/receive`, {
		method: "PATCH",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	const result: ApiResponse<Disbursement> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to update disbursement.");
	}

	return result;
}

async function getDisbursement(id: string): Promise<Disbursement> {
	const response = await fetch(`${BACKEND_URL}/disbursements/${id}`, {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<Disbursement> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to fetch disbursement.");
	}

	return disbursementSchema.parse(result.data);
}

async function listSponsorDisbursements(): Promise<Disbursement[]> {
	const response = await fetch(`${BACKEND_URL}/disbursements/sponsor/me`, {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<Disbursement[]> = await safeResponseJson(response);

	return disbursementSchema.array().default([]).parse(result.data);
}

async function listStudentDisbursements(): Promise<Disbursement[]> {
	const response = await fetch(`${BACKEND_URL}/disbursements/student/me`, {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<Disbursement[]> = await safeResponseJson(response);

	return disbursementSchema.array().default([]).parse(result.data);
}

async function getApplicationPaymentMethod(
	applicationId: string,
): Promise<PaymentMethodDetail | null> {
	const response = await fetch(
		`${BACKEND_URL}/disbursements/applications/${applicationId}/payment-method`,
		{
			method: "GET",
			credentials: "include",
		},
	);
	const result: ApiResponse<PaymentMethodDetail | null> =
		await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to fetch payment method.");
	}

	return paymentMethodSchema.nullable().parse(result.data ?? null);
}

export const getApplicationPaymentMethodQuery = (applicationId: string) =>
	queryOptions({
		queryKey: ["disbursements", "payment-method", applicationId],
		queryFn: () => getApplicationPaymentMethod(applicationId),
	});

export const getDisbursementQuery = (id: string) =>
	queryOptions({
		queryKey: ["disbursements", id],
		queryFn: () => getDisbursement(id),
		refetchInterval: 5000,
	});

export const getSponsorDisbursementsQuery = () =>
	queryOptions({
		queryKey: ["disbursements", "sponsor", "me"],
		queryFn: listSponsorDisbursements,
		refetchInterval: 10000,
	});

export const getStudentDisbursementsQuery = (enabled = true) =>
	queryOptions({
		queryKey: ["disbursements", "student", "me"],
		queryFn: listStudentDisbursements,
		refetchInterval: 10000,
		enabled,
	});
