import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { BACKEND_URL, safeResponseJson, type ApiResponse } from "../api";
import { notificationSchema, type Notification } from "./model";

async function getMyNotifications(): Promise<Notification[]> {
	const url = new URL(`${BACKEND_URL}/notifications/me`);
	const response = await fetch(url.toString(), {
		method: "GET",
		credentials: "include",
	});
	const result: ApiResponse<Notification[]> = await safeResponseJson(response);

	return notificationSchema.array().parse(result.data);
}

export const getMyNotificationsQuery = () =>
	queryOptions({
		queryKey: ["notifications"],
		queryFn: () => getMyNotifications(),
	});

async function markMyNotificationsAsRead(): Promise<void> {
	const url = new URL(`${BACKEND_URL}/notifications/me/read`);
	const response = await fetch(url.toString(), {
		method: "POST",
		credentials: "include",
	});
	await safeResponseJson(response);
}

export const markMyNotificationsAsReadMutation = () =>
	mutationOptions({
		mutationFn: markMyNotificationsAsRead,
	});
