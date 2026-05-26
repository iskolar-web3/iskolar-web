import { enumDetailSchema } from "@/lib/api";
import { philippinePhoneSchema } from "@/utils/phoneSchema";
import z from "zod";

export enum UserRole {
	Student = "student",
	Sponsor = "sponsor",
	Admin = "admin",
}

export enum UserStatus {
	Active = "active",
	Inactive = "inactive",
	Suspended = "suspended",
}

export const userSchema = z.object({
	id: z.uuidv4(),
	lastLoginAt: z.coerce.date(),
	email: z.email(),
	avatarUrl: z.string().nullable(),
	role: enumDetailSchema(UserRole).nullable(),
	status: enumDetailSchema(UserStatus),
	isVerified: z.boolean().default(false),
});

export type User = z.output<typeof userSchema>;

export type AuthSession = {
	user: User;
	token: string;
};

export enum ContactType {
	Phone = "phone",
	// Insert other values
}

export const contactDetailSchema = z.object({
	id: z.uuidv4(),
	name: z.string().nonempty(),
	code: z.enum(ContactType),
	value: z.string().nonempty(),
});
export type ContactDetail = z.infer<typeof contactDetailSchema>;

export const createContactRequestSchema = z.object({
	value: philippinePhoneSchema,
	contactType: z.enum(ContactType),
});
