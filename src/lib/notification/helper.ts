import type { ScholarshipCreatedEvent } from "../scholarship/model";
import { NotificationType, type Notification } from "./model";

type ApplicationStatusChangedEvent = {
	scholarshipName: string;
};

export function getNotificationMetadata(notif: Notification) {
	switch (notif.notificationType.code) {
		case NotificationType.ScholarshipCreated:
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

export function getNotificationTitle(notif: Notification): string {
	switch (notif.notificationType.code) {
		case NotificationType.ScholarshipCreated:
			return "New scholarship available";
		case NotificationType.ScholarshipEndedSelected:
			return "You were selected!";
		case NotificationType.ScholarshipEndedNotSelected:
			return "Scholarship has ended";
		case NotificationType.ApplicationShortlisted:
			return "Application shortlisted";
		case NotificationType.ApplicationApproved:
			return "Application approved";
		case NotificationType.ApplicationGranted:
			return "Scholarship granted";
		case NotificationType.ApplicationReceived:
			return "New applicant";
		case NotificationType.VerificationApproved:
			return "Identity verified";
		case NotificationType.VerificationDeclined:
			return "Verification declined";
		default:
			return "Notification";
	}
}

export function getNotificationSubtitle(notif: Notification): string {
	switch (notif.notificationType.code) {
		case NotificationType.ScholarshipCreated: {
			const meta = notif.metadata as ScholarshipCreatedEvent | null;
			return meta?.name ?? "";
		}
		case NotificationType.ScholarshipEndedSelected:
		case NotificationType.ScholarshipEndedNotSelected:
		case NotificationType.ApplicationShortlisted:
		case NotificationType.ApplicationApproved:
		case NotificationType.ApplicationGranted:
		case NotificationType.ApplicationReceived: {
			const meta = notif.metadata as ApplicationStatusChangedEvent | null;
			return meta?.scholarshipName ?? "";
		}
		case NotificationType.VerificationApproved:
		case NotificationType.VerificationDeclined:
			return "";
		default:
			return "";
	}
}

export function getNotificationMessage(notif: Notification): string {
	switch (notif.notificationType.code) {
		case NotificationType.ScholarshipCreated:
			return "New scholarship available";
		case NotificationType.ScholarshipEndedSelected:
			return "You were selected!";
		case NotificationType.ScholarshipEndedNotSelected:
			return "Scholarship has ended";
		case NotificationType.ApplicationShortlisted:
			return "Your application has been shortlisted";
		case NotificationType.ApplicationApproved:
			return "Your application has been approved";
		case NotificationType.ApplicationGranted:
			return "Scholarship funds have been granted";
		case NotificationType.ApplicationReceived:
			return "A student has applied for your scholarship";
		case NotificationType.VerificationApproved:
			return "Your identity has been verified successfully";
		case NotificationType.VerificationDeclined:
			return "Your identity verification was not approved";
		default:
			return "";
	}
}
