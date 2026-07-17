import z from "zod";
import { studentSchema } from "../student/model";

export const createTestimonialRequestSchema = z.object({
	studentId: z.uuidv4(),
	scholarshipId: z.uuidv4({ error: "Please select a scholarship" }),
	content: z
		.string()
		.min(1, "Testimonial is required")
		.max(2000, "Testimonial must be 2000 characters or less"),
	isSharedWithSponsor: z.boolean(),
});
export type CreateTestimonialRequest = z.infer<
	typeof createTestimonialRequestSchema
>;

export const updateTestimonialRequestSchema = z.object({
	id: z.uuidv4(),
	content: z
		.string()
		.min(1, "Testimonial is required")
		.max(2000, "Testimonial must be 2000 characters or less"),
	isSharedWithSponsor: z.boolean(),
});
export type UpdateTestimonialRequest = z.infer<
	typeof updateTestimonialRequestSchema
>;

export const testimonialSchema = z.object({
	id: z.uuidv4(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	content: z.string(),
	isSharedWithSponsor: z.boolean(),
	scholarship: z.object({
		id: z.uuidv4(),
		name: z.string(),
	}),
	student: studentSchema,
});
export type Testimonial = z.output<typeof testimonialSchema>;
