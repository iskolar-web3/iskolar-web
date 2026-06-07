import { queryOptions } from "@tanstack/react-query";
import {
	getDashboardMetrics,
	getSignupTimeline,
	getStudentDistribution,
	getUsers,
	getAdminScholarships,
	getAdminScholarshipApplicants,
} from "./api";
import type { UserListQuery } from "./model";

export type TimeRange = "7d" | "30d" | "q1" | "q2" | "q3" | "q4" | "1y";

// PHT is UTC+8; shift the current instant so toISOString() yields the PHT date
const PHT_OFFSET_MS = 8 * 60 * 60 * 1000;
function phtNow(): Date {
	return new Date(Date.now() + PHT_OFFSET_MS);
}

export function getDateRange(range: TimeRange): { startDate: string; endDate: string } {
	const today = phtNow();
	const year = Number(today.toISOString().substring(0, 4));
	const fmt = (d: Date) => d.toISOString().split("T")[0];
	const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000);
	const tomorrow = new Date(today.getTime() + 86400000);

	switch (range) {
		case "7d":
			return { startDate: fmt(daysAgo(7)), endDate: fmt(tomorrow) };
		case "30d":
			return { startDate: fmt(daysAgo(30)), endDate: fmt(tomorrow) };
		case "q1":
			return { startDate: `${year}-01-01`, endDate: `${year}-04-01` };
		case "q2":
			return { startDate: `${year}-04-01`, endDate: `${year}-07-01` };
		case "q3":
			return { startDate: `${year}-07-01`, endDate: `${year}-10-01` };
		case "q4":
			return { startDate: `${year}-10-01`, endDate: `${year + 1}-01-01` };
		case "1y":
			return { startDate: fmt(daysAgo(365)), endDate: fmt(tomorrow) };
	}
}

export function adminDashboardQueryOptions() {
	return queryOptions({
		queryKey: ["admin", "dashboard"],
		queryFn: async () => {
			const res = await getDashboardMetrics();
			return res.data;
		},
		staleTime: 60 * 1000,
	});
}

export function adminSignupTimelineQueryOptions(range: TimeRange = "30d") {
	const { startDate, endDate } = getDateRange(range);
	return queryOptions({
		queryKey: ["admin", "signups", range],
		queryFn: async () => {
			const res = await getSignupTimeline(startDate, endDate);
			return res.data;
		},
		staleTime: 60 * 1000,
	});
}

export function adminStudentDistributionQueryOptions() {
	return queryOptions({
		queryKey: ["admin", "students", "distribution"],
		queryFn: async () => {
			const res = await getStudentDistribution();
			return res.data;
		},
		staleTime: 60 * 1000,
	});
}

export function adminUsersQueryOptions(
	params: UserListQuery,
) {
	return queryOptions({
		queryKey: ["admin", "users", params],
		queryFn: async () => {
			const res = await getUsers(params);
			return res.data;
		},
		staleTime: 60 * 1000,
	});
}

export function adminScholarshipsQueryOptions(
	params?: { search?: string },
) {
	return queryOptions({
		queryKey: ["admin", "scholarships", params],
		queryFn: () => getAdminScholarships(params),
		staleTime: 60 * 1000,
	});
}

export function adminScholarshipApplicantsQueryOptions(
	scholarshipId: string | null,
) {
	return queryOptions({
		queryKey: ["admin", "scholarships", scholarshipId, "applicants"],
		queryFn: () => getAdminScholarshipApplicants(scholarshipId!),
		enabled: !!scholarshipId,
		staleTime: 60 * 1000,
	});
}
