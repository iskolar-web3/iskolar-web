import { queryOptions } from "@tanstack/react-query";
import {
	getDashboardMetrics,
	getSignupTimeline,
	getStudentDistribution,
	getUsers,
} from "./api";
import type { UserListQuery } from "./model";

export function adminDashboardQueryOptions(token: string) {
	return queryOptions({
		queryKey: ["admin", "dashboard"],
		queryFn: async () => {
			const res = await getDashboardMetrics(token);
			return res.data;
		},
		staleTime: 60 * 1000,
	});
}

export function adminSignupTimelineQueryOptions(token: string, days = 30) {
	return queryOptions({
		queryKey: ["admin", "signups", days],
		queryFn: async () => {
			const res = await getSignupTimeline(token, days);
			return res.data;
		},
		staleTime: 60 * 1000,
	});
}

export function adminStudentDistributionQueryOptions(token: string) {
	return queryOptions({
		queryKey: ["admin", "students", "distribution"],
		queryFn: async () => {
			const res = await getStudentDistribution(token);
			return res.data;
		},
		staleTime: 60 * 1000,
	});
}

export function adminUsersQueryOptions(
	token: string,
	params: UserListQuery,
) {
	return queryOptions({
		queryKey: ["admin", "users", params],
		queryFn: async () => {
			const res = await getUsers(token, params);
			return res.data;
		},
		staleTime: 60 * 1000,
	});
}
