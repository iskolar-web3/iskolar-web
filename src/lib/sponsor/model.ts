import z from "zod";
import { enumDetailSchema } from "../api";
import { contactDetailSchema, createContactRequestSchema } from "../user/model";

export enum SponsorType {
	Individual = "individual",
	Organization = "organization",
	Government = "government",
}

export enum EmploymentType {
	Employed = "employed",
	SelfEmployed = "self_employed",
	Freelancer = "freelancer",
	OFW = "ofw",
}

export const individualSponsorSchema = z.object({
	id: z.uuidv4(),
	userId: z.uuidv4(),
	email: z.email(),
	firstName: z.string().nonempty(),
	middleName: z.string().nullable(),
	lastName: z.string().nonempty(),
	employmentType: enumDetailSchema(EmploymentType),
	birthDate: z.coerce.date(),
	contact: contactDetailSchema,
	sponsorType: enumDetailSchema(SponsorType),
	avatarUrl: z.string().nullable(),
});
export type IndividualSponsor = z.output<typeof individualSponsorSchema>;

export const createIndividualSponsorRequestSchema = z.object({
	userId: z.uuidv4(),
	firstName: z.string().nonempty({ error: "First name is required." }),
	middleName: z.string().optional(),
	lastName: z.string().nonempty({ error: "Last name is required." }),
	sponsorType: z.enum(SponsorType),
	employmentType: z.enum(EmploymentType, {
		error: "Employment type is required.",
	}),
	birthDate: z.date({ error: "Birth date is required." }),
	contact: createContactRequestSchema,
});
export type CreateIndividualSponsorRequest = z.infer<
	typeof createIndividualSponsorRequestSchema
>;

export const updateIndividualSponsorRequestSchema =
	createIndividualSponsorRequestSchema
		.extend({
			avatarUrl: z.string(),
		})
		.partial()
		.extend({
			id: z.uuidv4(),
		});
export type UpdateIndividualSponsorRequest = z.infer<
	typeof updateIndividualSponsorRequestSchema
>;

export enum OrganizationType {
	PrivateCompany = "private_company",
	NonGovernmentalOrganization = "non_governmental_organization",
	EducationalInstitution = "educational_institution",
}
export const organizationSponsorSchema = z.object({
	id: z.uuidv4(),
	userId: z.string(),
	email: z.email(),
	name: z.string().nonempty(),
	organizationType: enumDetailSchema(OrganizationType),
	contact: contactDetailSchema,
	sponsorType: enumDetailSchema(SponsorType),
	avatarUrl: z.string().nullable(),
});
export type OrganizationSponsor = z.output<typeof organizationSponsorSchema>;

export const createOrganizationSponsorRequestSchema = z.object({
	userId: z.uuidv4(),
	sponsorType: z.enum(SponsorType),
	name: z.string().nonempty(),
	organizationType: z.enum(OrganizationType),
	contact: createContactRequestSchema,
});
export type CreateOrganizationSponsorRequest = z.infer<
	typeof createOrganizationSponsorRequestSchema
>;

export const updateOrganizationSponsorRequestSchema =
	createOrganizationSponsorRequestSchema
		.extend({
			avatarUrl: z.string(),
		})
		.partial()
		.extend({
			id: z.uuidv4(),
		});
export type UpdateOrganizationSponsorRequest = z.infer<
	typeof updateOrganizationSponsorRequestSchema
>;

export enum AgencyType {
	NationalGovernmentAgency = "national_government_agency",
	LocalGovernmentUnit = "local_government_unit",
	GovernmentOwnedAndControlledCorporation = "government_owned_and_controlled_corporation",
}
export const governmentSponsorSchema = z.object({
	id: z.uuidv4(),
	userId: z.uuidv4(),
	email: z.email(),
	name: z.string().nonempty(),
	agencyType: enumDetailSchema(AgencyType),
	contact: contactDetailSchema,
	sponsorType: enumDetailSchema(SponsorType),
	avatarUrl: z.string().nullable(),
});
export type GovernmentSponsor = z.output<typeof governmentSponsorSchema>;

export const createGovernmentSponsorRequestSchema = z.object({
	userId: z.uuidv4(),
	sponsorType: z.enum(SponsorType),
	name: z.string().nonempty(),
	agencyType: z.enum(AgencyType),
	contact: createContactRequestSchema,
});
export type CreateGovernmentSponsorRequest = z.infer<
	typeof createGovernmentSponsorRequestSchema
>;

export const updateGovernmentSponsorRequestSchema =
	createGovernmentSponsorRequestSchema
		.extend({
			avatarUrl: z.string(),
		})
		.partial()
		.extend({
			id: z.uuidv4(),
		});
export type UpdateGovernmentSponsorRequest = z.infer<
	typeof updateGovernmentSponsorRequestSchema
>;

export const anySponsorSchema = z.union([
	individualSponsorSchema,
	organizationSponsorSchema,
	governmentSponsorSchema,
]);
export type AnySponsor = z.infer<typeof anySponsorSchema>;
