import z from "zod";
import { enumDetailSchema } from "../api";
import { PaymentMethod } from "../student/model";

export enum DisbursementStatus {
	Initiated = "initiated",
	Sent = "sent",
	Received = "received",
}

export const disbursementSchema = z.object({
	id: z.uuidv4(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	scholarshipApplicationId: z.uuidv4(),
	sponsorId: z.uuidv4(),
	studentId: z.uuidv4(),
	amount: z.coerce.number(),
	status: z.enum(DisbursementStatus),
	sponsorNote: z.string().nullable(),
	studentNote: z.string().nullable(),
	sponsorProofUrl: z.string().nullable(),
	studentProofUrl: z.string().nullable(),
	sentAt: z.coerce.date().nullable(),
	receivedAt: z.coerce.date().nullable(),
	scholarshipName: z.string(),
	studentFirstName: z.string(),
	studentLastName: z.string(),
	paymentMethod: z.object({
		method: enumDetailSchema(PaymentMethod),
		accountName: z.string(),
		accountNumber: z.string(),
	}),
});
export type Disbursement = z.output<typeof disbursementSchema>;

export const createDisbursementRequestSchema = z.object({
	scholarshipApplicationId: z.uuidv4(),
	amount: z.number().positive(),
	sponsorNote: z.string().optional(),
});
export type CreateDisbursementRequest = z.infer<
	typeof createDisbursementRequestSchema
>;

export const markSentRequestSchema = z.object({
	proofUrl: z.string().nonempty(),
	note: z.string().optional(),
});
export type MarkSentRequest = z.infer<typeof markSentRequestSchema>;

export const markReceivedRequestSchema = z.object({
	proofUrl: z.string().nonempty(),
	note: z.string().optional(),
});
export type MarkReceivedRequest = z.infer<typeof markReceivedRequestSchema>;
