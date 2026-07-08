import { queryOptions } from "@tanstack/react-query";
import { type ApiResponse, BACKEND_URL, safeResponseJson } from "../api";
import {
	type CreateTestimonialRequest,
	type Testimonial,
	testimonialSchema,
	type UpdateTestimonialRequest,
} from "./model";

async function getMyTestimonials(): Promise<Testimonial[]> {
	const response = await fetch(`${BACKEND_URL}/testimonials/me`, {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<Testimonial[]> = await safeResponseJson(response);

	return testimonialSchema.array().default([]).parse(result.data);
}

export const getMyTestimonialsQuery = () =>
	queryOptions({
		queryKey: ["testimonials", "me"],
		queryFn: getMyTestimonials,
	});

async function getSponsorTestimonials(
	scholarshipId?: string,
): Promise<Testimonial[]> {
	const url = new URL(`${BACKEND_URL}/testimonials`);
	if (scholarshipId) {
		url.searchParams.append("scholarshipId", scholarshipId);
	}

	const response = await fetch(url.toString(), {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<Testimonial[]> = await safeResponseJson(response);

	return testimonialSchema.array().default([]).parse(result.data);
}

export const getSponsorTestimonialsQuery = (scholarshipId?: string) =>
	queryOptions({
		queryKey: ["testimonials", "sponsor", scholarshipId ?? "all"],
		queryFn: () => getSponsorTestimonials(scholarshipId),
	});

export async function createTestimonial(
	data: CreateTestimonialRequest,
): Promise<ApiResponse<Testimonial>> {
	const response = await fetch(`${BACKEND_URL}/testimonials`, {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	const result: ApiResponse<Testimonial> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to submit testimonial.");
	}

	return result;
}

export async function updateTestimonial(
	data: UpdateTestimonialRequest,
): Promise<ApiResponse<Testimonial>> {
	const response = await fetch(`${BACKEND_URL}/testimonials/${data.id}`, {
		method: "PATCH",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	const result: ApiResponse<Testimonial> = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to update testimonial.");
	}

	return result;
}

export async function withdrawTestimonial(id: string): Promise<ApiResponse> {
	const response = await fetch(`${BACKEND_URL}/testimonials/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	const result: ApiResponse = await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to withdraw testimonial.");
	}

	return result;
}
