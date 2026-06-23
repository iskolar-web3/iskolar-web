import { z } from "zod";
import { enumDetailSchema } from "../api";

export enum NotificationType {
	ScholarshipCreated = "scholarship:created",
	ScholarshipEndedSelected = "scholarship:ended:selected",
	ScholarshipEndedNotSelected = "scholarship:ended:not_selected",
	ApplicationShortlisted = "application:shortlisted",
	ApplicationApproved = "application:approved",
	ApplicationGranted = "application:granted",
	ApplicationReceived = "application:received",
}

export const notificationSchema = z.object({
	notificationId: z.uuidv4(),
	createdAt: z.coerce.date(),
	metadata: z.any().nullable(),
	notificationType: enumDetailSchema(NotificationType),
	isRead: z.boolean(),
});
export type Notification = z.infer<typeof notificationSchema>;
