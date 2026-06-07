import { queryOptions } from "@tanstack/react-query";
import { type ApiResponse, BACKEND_URL, safeResponseJson } from "../api";
import {
	type CreateStudentRequest,
	type PaymentMethodDetail,
	paymentMethodSchema,
	type Student,
	studentSchema,
	type UpdateStudentRequest,
	type UpsertPaymentMethodRequest,
} from "./model";

export async function createStudent(
	value: CreateStudentRequest,
): Promise<Student> {
	const response = await fetch(`${BACKEND_URL}/students`, {
		method: "POST",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	const result: ApiResponse<Student> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to create profile.");
	}
	return result.data;
}

export async function getMyStudentProfile(): Promise<Student | null> {
	const response = await fetch(`${BACKEND_URL}/students/me`, {
		method: "GET",
		credentials: "include",
	});
	if (!response.ok) {
		return null;
	}

	const result: ApiResponse<Student | null> = await safeResponseJson(response);
	if (!result.data) {
		return null;
	}

	return studentSchema.parse(result.data);
}

export async function updateStudent(
	value: UpdateStudentRequest,
): Promise<ApiResponse<Student>> {
	const response = await fetch(`${BACKEND_URL}/students/me`, {
		method: "PATCH",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	const result: ApiResponse<Student> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to create profile.");
	}

	return result;
}

export async function upsertPaymentMethod(
	value: UpsertPaymentMethodRequest,
): Promise<ApiResponse<PaymentMethodDetail>> {
	const response = await fetch(`${BACKEND_URL}/students/me/payment`, {
		method: "PUT",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	const result: ApiResponse<PaymentMethodDetail> =
		await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message);
	}

	return result;
}

async function getPaymentMethod(
	studentId: string,
): Promise<PaymentMethodDetail | null> {
	const url = new URL(`${BACKEND_URL}/students/${studentId}/payment`);

	const response = await fetch(url.toString(), {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<PaymentMethodDetail | null> =
		await safeResponseJson(response);

	return paymentMethodSchema.nullable().parse(result.data);
}

export const getPaymentMethodQuery = (studentId: string) =>
	queryOptions({
		queryKey: ["students", "payment", studentId],
		queryFn: () => getPaymentMethod(studentId),
	});
