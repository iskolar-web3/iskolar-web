import { z } from "zod";
import { enumDetailSchema } from "../api";

export enum NotificationType {
	ScholarshipCreated = "scholarship:created",
}

export const notificationSchema = z.object({
	notificationId: z.uuidv4(),
	createdAt: z.coerce.date(),
	metadata: z.any().nullable(),
	notificationType: enumDetailSchema(NotificationType),
});
export type Notification = z.infer<typeof notificationSchema>;
