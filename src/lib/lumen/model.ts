export interface LumenCreateParams {
	urlPath: string;
	name: string;
	description: string;
	ownerAddress: string;
	fileExtension: string;
	checksum: string;
	file: File;
}

export interface LumenCreateResponse {
	workflowId: string;
	sasUrl: string;
	fetchKey: string;
}

export interface LumenFileResponse {
	File: {
		Path: string;
		Name: string;
		Description: string;
		OwnerAddress: string;
		FileURL: string;
		Checksum: string;
		WorkflowID: string;
		OrganizationID: string;
		AdminID: string;
		id: string;
		Type: string;
		File: { OriginalFile: { URL: string }; Checksum: string };
		CreatedTS: number;
		_ts: number;
	};
}

export type LumenFileStatus = "uploading" | "pending" | "completed" | "failed";

export interface StoredCredential {
	fetchKey: string;
	workflowId: string;
	/** Auth user profile ID — used to key localStorage */
	userId: string;
	credentialType: string;
	name: string;
	institution: string;
	issuedDate?: string;
	extension: string;
	description: string;
	checksum: string;
	lumenStatus: LumenFileStatus;
	fileUrl?: string;
	uploadedAt: string;
}
