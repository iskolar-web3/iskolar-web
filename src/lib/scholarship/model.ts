import z from "zod";
import { enumDetailSchema } from "../api";
import { anySponsorSchema, type AnySponsor } from "../sponsor/model";
import { validateFormField } from "./helper";
import { studentSchema } from "../student/model";
import { ScholarshipApplicationStatus } from "./status";

export enum ScholarshipType {
	NeedBased = "need-based",
	MeritBased = "merit-based",
	Combined = "combined",
}

export enum ScholarshipStatus {
	Draft = "draft",
	Active = "active",
	Inactive = "inactive",
	Closed = "closed",
	Suspended = "suspended",
	Archived = "archived",
}

export enum FormFieldType {
	ShortAnswer = "short_answer",
	Paragraph = "paragraph",
	MultipleChoice = "multiple_choice",
	Dropdown = "dropdown",
	Checkbox = "checkbox",
	Number = "number",
	Date = "date",
	Email = "email",
	Phone = "phone",
	File = "file",
}

const formFieldOptionSchema = z.object({
	id: z.uuidv4(),
	value: z.string().nonempty(),
	sortOrder: z.number().positive(),
});

const formFieldSchema = z.object({
	id: z.uuidv4(),
	label: z.string().nonempty(),
	isRequired: z.boolean(),
	sortOrder: z.number().positive(),
	fieldType: enumDetailSchema(FormFieldType),
	options: formFieldOptionSchema.array().default([]),
});
export type FormField = z.infer<typeof formFieldSchema>;

export const scholarshipSchema = <T extends z.ZodType>(sponsor: T) =>
	z.object({
		id: z.uuidv4(),
		createdAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
		name: z.string().nonempty(),
		description: z.string().nullable(),
		scholarshipType: enumDetailSchema(ScholarshipType),
		status: enumDetailSchema(ScholarshipStatus),
		totalAmount: z.coerce.number().positive().optional().nullable(),
		totalAmountMin: z.coerce.number().positive().optional().nullable(),
		totalAmountMax: z.coerce.number().positive().optional().nullable(),
		totalSlots: z.number().positive().optional().nullable(),
		applicationDeadline: z.coerce.date(),
		imageUrl: z.string().nullable(),
		cardColor: z.string().default("#3A52A6"),
		criterias: z.string().array().default([]),
		requirements: z.string().array().default([]),
		sponsor: sponsor,
		formFields: formFieldSchema.array().default([]),
		applicationCount: z.number().nonnegative().default(0),
	});

export type Scholarship<T extends AnySponsor = AnySponsor> = Omit<
	z.infer<ReturnType<typeof scholarshipSchema<z.ZodTypeAny>>>,
	"sponsor"
> & {
	sponsor: T;
};

export const createFormFieldOptionRequestSchema = z.object({
	value: z.string().nonempty(),
});
export type CreateFormFieldOptionRequest = z.infer<
	typeof createFormFieldOptionRequestSchema
>;

export const baseFormFieldSchema = z.object({
	label: z.string().nonempty(),
	isRequired: z.boolean(),
	fieldType: z.enum(FormFieldType),
	options: createFormFieldOptionRequestSchema.array().default([]),
});

export const createFormFieldRequestSchema = baseFormFieldSchema.refine((data) =>
	validateFormField(data.fieldType, data.options.length),
);
export type CreateFormFieldRequest = z.infer<
	typeof createFormFieldRequestSchema
>;

// Validation
export const createScholarshipRequestSchema = z.object({
	name: z
		.string()
		.min(2, "Title must be at least 2 characters")
		.max(100, "Title must be 100 characters or less"),
	description: z
		.string()
		.max(1000, "Description must be 1000 characters or less")
		.optional(),
	scholarshipType: z.enum(ScholarshipType, {
		error: "Please select a scholarship type",
	}),
	status: z.enum(ScholarshipStatus).default(ScholarshipStatus.Draft),
	totalAmount: z.coerce.number().positive().optional(),
	totalAmountMin: z.coerce.number().positive().optional(),
	totalAmountMax: z.coerce.number().positive().optional(),
	totalSlots: z.coerce.number().positive().optional(),
	applicationDeadline: z.date({ error: "Please set an application deadline" }),
	imageUrl: z.string().optional(),
	cardColor: z.string().optional().default("#3A52A6"),
	criterias: z.string().array().default([]),
	requirements: z.string().array().default([]),
	sponsorId: z.uuidv4(),
	formFields: createFormFieldRequestSchema.array().default([]),
});
/**
 * Scholarship form data type inferred from Zod schema
 */
export type ScholarshipFormData = z.infer<
	typeof createScholarshipRequestSchema
>;

const updateFormFieldOptionRequestSchema = createFormFieldOptionRequestSchema
	.extend({
		id: z.uuidv4(),
	})
	.partial();
export const updateFormFieldRequestSchema = baseFormFieldSchema
	.extend({
		options: updateFormFieldOptionRequestSchema.array(),
		id: z.uuidv4(),
	})
	.partial()
	.refine(
		(data) => {
			if (!data.fieldType || !data.options) return true;
			return validateFormField(data.fieldType, data.options.length);
		},
		{
			error:
				"Options are required for choice-based fields and must be empty for others",
			path: ["options"],
		},
	);

export const updateScholarshipRequestSchema = createScholarshipRequestSchema
	.omit({
		sponsorId: true,
	})
	.extend({
		formFields: updateFormFieldRequestSchema.array(),
	})
	.partial()
	.extend({
		id: z.uuidv4(),
	});

export type EditScholarshipFormData = z.infer<
	typeof updateScholarshipRequestSchema
>;

export const getScholarshipQueryParamSchema = z
	.object({
		sponsorId: z.uuidv4(),
		search: z.string(),
		notAppliedBy: z.uuidv4(),
		status: z.enum(ScholarshipStatus),
	})
	.partial();

export type GetScholarshipQueryParam = z.infer<
	typeof getScholarshipQueryParamSchema
>;

const formFieldAnswerSchema = z.object({
	formFieldId: z.uuidv4(),
	value: z.any(),
});

const baseApplicationSchema = z.object({
	id: z.uuidv4(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	status: enumDetailSchema(ScholarshipApplicationStatus),
	remarks: z.string().nullable(),
	formFieldAnswers: formFieldAnswerSchema.array(),
});

export const applicantSchema = baseApplicationSchema.extend({
	student: studentSchema,
});
export type Applicant = z.output<typeof applicantSchema>;

export const getApplicationsQueryParam = z
	.object({
		status: z.string(),
	})
	.partial();
export type GetApplicationsQueryParam = z.infer<
	typeof getApplicationsQueryParam
>;

export const applicationSchema = z.object({
	scholarship: scholarshipSchema(anySponsorSchema),
	application: baseApplicationSchema,
});
export type Application = z.output<typeof applicationSchema>;

const createFormFieldAnswerSchema = z.object({
	formFieldId: z.uuidv4(),
	value: z.any(),
});

export const createApplicationSchema = z.object({
	scholarshipId: z.uuidv4(),
	studentId: z.uuidv4(),
	formFieldAnswers: createFormFieldAnswerSchema.array(),
});
export type CreateApplicationRequest = z.infer<typeof createApplicationSchema>;

const selectedScholarSchema = z.object({
	applicationId: z.uuidv4(),
	status: z.enum(ScholarshipApplicationStatus),
	remarks: z.string().optional(),
});
export const selectScholarSchema = z.object({
	scholarshipId: z.uuidv4(),
	scholars: selectedScholarSchema.array(),
});
export type SelectScholarRequest = z.infer<typeof selectScholarSchema>;

export const applicationStatusSchema = z.object({
	id: z.uuidv4(),
	status: enumDetailSchema(ScholarshipApplicationStatus),
});
export type ApplicationStatus = z.output<typeof applicationStatusSchema>;

export type ScholarshipCreatedEvent = {
	id: string;
	createdAt: Date;
	name: string;
};
