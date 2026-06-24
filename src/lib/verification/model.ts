import z from "zod";

export enum VerificationStatus {
	Pending = "pending",
	Verified = "verified",
	Rejected = "rejected",
	Expired = "expired",
}

export const verificationRecordSchema = z.object({
	id: z.string(),
	userId: z.uuidv4(),
	diditSessionId: z.uuid(),
	diditSessionUrl: z.url(),
	status: z.enum(VerificationStatus),
	cooldownUntil: z.coerce.date().nullable(),
	remarks: z.array(z.string()).default([]),
});
export type VerificationRecord = z.infer<typeof verificationRecordSchema>;
