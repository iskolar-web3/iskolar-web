import {
	ScholarshipEvent,
	type ScholarshipCreatedEvent,
} from "../scholarship/event";
import type { Notification } from "./model";

export function getNotificationMetadata(notif: Notification) {
	switch (notif.notificationType.code) {
		case ScholarshipEvent.Created:
			return notif.metadata as ScholarshipCreatedEvent;
		default:
			break;
	}
}

export function formatTimeAgo(date: string | Date | undefined): string {
	if (!date) return "";

	const now = new Date();
	const then = new Date(date);
	const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
	if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
	if (seconds < 2419200) return `${Math.floor(seconds / 604800)}w`;
	if (seconds < 29030400) return `${Math.floor(seconds / 2419200)}mo`;
	return `${Math.floor(seconds / 29030400)}y`;
}

export function getNotificationMessage(notif: Notification): string {
	switch (notif.notificationType.code) {
		case ScholarshipEvent.Created:
			return `New scholarship available`;
		default:
			break;
	}

	return "";
}
