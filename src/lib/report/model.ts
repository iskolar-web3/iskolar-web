import z from "zod";
import { studentSchema } from "@/lib/student/model";

export enum ReportStatus {
	Pending = "pending",
	Approved = "approved",
	Rejected = "rejected",
}

export const createReportRequestSchema = z
	.object({
		scholarshipId: z.uuidv4({ error: "Please select a scholarship" }),
		title: z
			.string()
			.min(1, "Title is required")
			.max(200, "Title must be 200 characters or less"),
		description: z
			.string()
			.min(1, "Description is required")
			.max(5000, "Description must be 5000 characters or less"),
		reportingPeriodStart: z.coerce.date({ error: "Start date is required" }),
		reportingPeriodEnd: z.coerce.date().optional(),
		attachmentUrls: z.string().url().array().default([]),
	})
	.refine(
		(data) =>
			!data.reportingPeriodEnd ||
			data.reportingPeriodEnd >= data.reportingPeriodStart,
		{
			message: "End date must not be before the start date.",
			path: ["reportingPeriodEnd"],
		},
	);
export type CreateReportRequest = z.infer<typeof createReportRequestSchema>;

export const updateReportRequestSchema = z.object({
	id: z.uuidv4(),
	reportingPeriodEnd: z.coerce.date({ error: "End date is required" }),
});
export type UpdateReportRequest = z.infer<typeof updateReportRequestSchema>;

const reportAttachmentSchema = z.object({
	id: z.uuidv4(),
	url: z.string(),
});

const reportScholarshipSchema = z.object({
	id: z.uuidv4(),
	name: z.string(),
	sponsorId: z.uuidv4(),
});

export const reportSchema = z.object({
	id: z.uuidv4(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	scholarshipApplicationId: z.uuidv4(),
	title: z.string(),
	description: z.string(),
	startedAt: z.coerce.date(),
	endedAt: z.coerce.date().nullable(),
	status: z.enum(ReportStatus),
	remarks: z.string().nullable(),
	reviewedBy: z.uuidv4().nullable(),
	reviewedAt: z.coerce.date().nullable(),
	scholarship: reportScholarshipSchema,
	student: studentSchema,
	attachments: reportAttachmentSchema.array(),
});
export type Report = z.output<typeof reportSchema>;

export const getReportsQueryParamSchema = z
	.object({
		scholarshipId: z.uuidv4(),
		studentId: z.uuidv4(),
		status: z.enum(ReportStatus),
	})
	.partial();
export type GetReportsQueryParam = z.infer<typeof getReportsQueryParamSchema>;
