import { z } from "zod";
import { enumDetailSchema } from "../api";
import { ScholarshipEvent } from "../scholarship/event";

export const notificationSchema = z.object({
	notificationId: z.uuidv4(),
	createdAt: z.coerce.date(),
	metadata: z.any().nullable(),
	// TODO: Create a separate enum for notification type
	notificationType: enumDetailSchema(ScholarshipEvent),
});
export type Notification = z.infer<typeof notificationSchema>;
