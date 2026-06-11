import { queryOptions } from "@tanstack/react-query";
import { type ApiResponse, BACKEND_URL, safeResponseJson } from "../api";
import {
	type PersistedRankingResult,
	persistedRankingResultSchema,
} from "./model";

async function getLatestRankingResults(
	scholarshipId: string,
): Promise<PersistedRankingResult[]> {
	const url = new URL(`${BACKEND_URL}/ranking/${scholarshipId}/latest`);

	const response = await fetch(url.toString(), {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<PersistedRankingResult[]> =
		await safeResponseJson(response);

	return persistedRankingResultSchema.array().default([]).parse(result.data);
}

export const getLatestRankingResultsQuery = (scholarshipId: string) =>
	queryOptions({
		queryKey: ["ranking", "latest", scholarshipId],
		queryFn: () => getLatestRankingResults(scholarshipId),
	});
