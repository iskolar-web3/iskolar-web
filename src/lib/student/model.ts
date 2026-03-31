import z from "zod";
import { enumDetailSchema } from "../api";
import { contactDetailSchema, createContactRequestSchema } from "../user/model";
import { schoolSchema } from "../school/model";

export enum Gender {
	Male = "male",
	Female = "female",
}

export enum EducationLevel {
	Secondary = "secondary_education",
	Tertiary = "tertiary_education",
}

export const studentSchema = z.object({
	id: z.uuidv4(),
	userId: z.uuidv4(),
	firstName: z.string(),
	middleName: z.string().nullable(),
	lastName: z.string(),
	birthDate: z.coerce.date(),
	gender: enumDetailSchema(Gender),
	school: schoolSchema.nullable(),
	educationLevel: z.enum(EducationLevel).nullable(),
	schoolName: z.string().nullable(),
	contact: contactDetailSchema,
	avatarUrl: z.string().nullable(),
	email: z.email(),
});
export type Student = z.output<typeof studentSchema>;

export const createStudentRequestSchema = z.object({
	userId: z.uuidv4(),
	firstName: z.string().min(1, "First name is required"),
	middleName: z.string().optional(),
	lastName: z.string().min(1, "Last name is required"),
	gender: z.enum(Gender, { message: "Please select a gender" }),
	birthDate: z.date().refine((date) => date <= new Date(), {
		message: "Date of birth cannot be in the future",
	}),
	contact: createContactRequestSchema,
	educationLevel: z.enum(EducationLevel, { message: "Please select an education level" }),
	schoolName: z.string().min(1, "School name is required"),
});

export const updateStudentRequestSchema = createStudentRequestSchema
	.extend({
		avatarUrl: z.string(),
	})
	.partial()
	.extend({
		id: z.uuidv4(),
	});
export type UpdateStudentRequest = z.infer<typeof updateStudentRequestSchema>;
