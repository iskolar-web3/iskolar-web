import { queryOptions } from "@tanstack/react-query";
import { BACKEND_URL, safeResponseJson, type ApiResponse } from "../api";
import { getCookie } from "../cookie";
import { ACCESS_TOKEN_KEY } from "../user/auth";
import { notificationSchema, type Notification } from "./model";

async function getMyNotifications(): Promise<Notification[]> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	if (!token) {
		throw new Error("Access token not found.");
	}

	const url = new URL(`${BACKEND_URL}/notifications/me`);
	const response = await fetch(url.toString(), {
		method: "GET",
		headers: { Authorization: `Bearer ${token}` },
	});
	const result: ApiResponse<Notification[]> = await safeResponseJson(response);

	return notificationSchema.array().parse(result.data);
}

export const getMyNotificationsQuery = () =>
	queryOptions({
		queryKey: ["notifications", getCookie(ACCESS_TOKEN_KEY)],
		queryFn: () => getMyNotifications(),
	});
