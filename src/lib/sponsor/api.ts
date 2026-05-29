import { type ApiResponse, BACKEND_URL, safeResponseJson } from "../api";
import { getCookie } from "../cookie";
import { ACCESS_TOKEN_KEY } from "../user/auth";
import {
	type AnySponsor,
	anySponsorSchema,
	type CreateGovernmentSponsorRequest,
	type CreateIndividualSponsorRequest,
	type CreateOrganizationSponsorRequest,
	type GovernmentSponsor,
	type IndividualSponsor,
	type OrganizationSponsor,
	SponsorType,
	type UpdateGovernmentSponsorRequest,
	type UpdateIndividualSponsorRequest,
	type UpdateOrganizationSponsorRequest,
} from "./model";

export async function createIndividualSponsor(
	value: CreateIndividualSponsorRequest,
): Promise<IndividualSponsor> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	const response = await fetch(`${BACKEND_URL}/sponsors/individuals`, {
		method: "POST",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});
	const result: ApiResponse<IndividualSponsor> =
		await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to create profile.");
	}
	return result.data;
}

export async function createOrganizationSponsor(
	value: CreateOrganizationSponsorRequest,
): Promise<OrganizationSponsor> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	const response = await fetch(`${BACKEND_URL}/sponsors/organizations`, {
		method: "POST",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});
	const result: ApiResponse<OrganizationSponsor> =
		await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to create profile.");
	}
	return result.data;
}

export async function createGovernmentSponsor(
	value: CreateGovernmentSponsorRequest,
): Promise<GovernmentSponsor> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	const response = await fetch(`${BACKEND_URL}/sponsors/governments`, {
		method: "POST",
		body: JSON.stringify(value),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});
	const result: ApiResponse<GovernmentSponsor> =
		await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to create profile.");
	}
	return result.data;
}

export async function getMySponsorProfile(
	token: string,
): Promise<AnySponsor | null> {
	const response = await fetch(`${BACKEND_URL}/sponsors/me`, {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
		credentials: "include",
	});
	if (!response.ok) {
		return null;
	}

	const result: ApiResponse<AnySponsor | null> =
		await safeResponseJson(response);
	return anySponsorSchema.parse(result.data);
}

export function getSponsorName(sponsor: AnySponsor): string {
	switch (sponsor.sponsorType.code) {
		case SponsorType.Individual: {
			const s = sponsor as IndividualSponsor;
			return `${s.firstName} ${s.lastName}`;
		}

		case SponsorType.Organization:
		case SponsorType.Government:
			return (sponsor as OrganizationSponsor | GovernmentSponsor).name;

		default:
			return "iSkolar";
	}
}

export async function updateIndividualSponsor(
	value: UpdateIndividualSponsorRequest,
): Promise<ApiResponse<IndividualSponsor>> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	const response = await fetch(
		`${BACKEND_URL}/sponsors/individuals/${value.id}`,
		{
			method: "PATCH",
			body: JSON.stringify(value),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		},
	);
	const result: ApiResponse<IndividualSponsor> =
		await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to update profile.");
	}

	return result;
}

export async function updateOrganizationSponsor(
	value: UpdateOrganizationSponsorRequest,
): Promise<ApiResponse<OrganizationSponsor>> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	const response = await fetch(
		`${BACKEND_URL}/sponsors/organizations/${value.id}`,
		{
			method: "PATCH",
			body: JSON.stringify(value),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		},
	);
	const result: ApiResponse<OrganizationSponsor> =
		await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to update profile.");
	}

	return result;
}

export async function updateGovernmentSponsor(
	value: UpdateGovernmentSponsorRequest,
): Promise<ApiResponse<GovernmentSponsor>> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	const response = await fetch(
		`${BACKEND_URL}/sponsors/governments/${value.id}`,
		{
			method: "PATCH",
			body: JSON.stringify(value),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		},
	);
	const result: ApiResponse<GovernmentSponsor> =
		await safeResponseJson(response);
	if (!response.ok) {
		throw new Error(result.message || "Failed to update profile.");
	}

	return result;
}
