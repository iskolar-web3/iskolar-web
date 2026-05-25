export type ScholarshipCreatedEvent = {
	id: string;
	createdAt: Date;
	name: string;
};

export enum ScholarshipEvent {
	Created = "scholarship:created",
}
