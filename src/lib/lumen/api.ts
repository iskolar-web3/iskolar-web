import type {
	LumenCreateParams,
	LumenCreateResponse,
	LumenFileResponse,
} from "./model";

const LUMEN_BASE_URL = "https://lumen-api-mgmt-test.azure-api.net";
const API_KEY = import.meta.env.VITE_TEST_LUMEN_API_KEY ?? "";
const API_SECRET = import.meta.env.VITE_TEST_LUMEN_API_SECRET ?? "";

/** Organization wallet registered with the Lumen API key */
export const LUMEN_OWNER_ADDRESS =
	"0xcB9C6A13B31C9d28f65f32a7eDFc0E2d87010515";

const MIME_TYPES: Record<string, string> = {
	pdf: "application/pdf",
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	gif: "image/gif",
	webp: "image/webp",
};

function getMimeType(ext: string): string {
	return MIME_TYPES[ext.toLowerCase()] ?? "application/octet-stream";
}

function authHeaders(): Record<string, string> {
	return {
		"lumen-api-key": API_KEY,
		"lumen-api-secret": API_SECRET,
	};
}

export async function computeFileChecksum(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hash = await crypto.subtle.digest("SHA-256", buffer);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 32);
}

export async function createLumenFile(
	params: LumenCreateParams,
): Promise<LumenCreateResponse> {
	const urlPath = encodeURIComponent(params.urlPath.replace(/\s+/g, "-"));

	const res = await fetch(
		`${LUMEN_BASE_URL}/file/file/create/${urlPath}`,
		{
			method: "POST",
			headers: {
				...authHeaders(),
				"Content-Type": "application/json",
				"Cache-Control": "no-cache",
			},
			body: JSON.stringify({
				Path: "/",
				Name: params.name,
				Description: params.description,
				OwnerAddress: params.ownerAddress,
				FileExtension: params.fileExtension,
				Checksum: params.checksum,
			}),
		},
	);

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Lumen create failed (${res.status}): ${text}`);
	}

	const { SASURL, WorkflowID } = (await res.json()) as {
		SASURL: string;
		WorkflowID: string;
	};

	if (!SASURL || !WorkflowID) {
		throw new Error("Invalid Lumen response");
	}

	const upload = await fetch(SASURL, {
		method: "PUT",
		headers: {
			"x-ms-blob-type": "BlockBlob",
			"Content-Type": getMimeType(params.fileExtension),
		},
		body: params.file,
	});

	if (!upload.ok) {
		throw new Error(`Blob upload failed (${upload.status})`);
	}

	return {
		workflowId: WorkflowID,
		sasUrl: SASURL,
		fetchKey: `${params.name}.${params.fileExtension}`,
	};
}

/** GET /file/file/{Name}.{Extension} */
export async function getLumenFile(
	fetchKey: string,
): Promise<LumenFileResponse | null> {
	const res = await fetch(
		`${LUMEN_BASE_URL}/file/file/${encodeURIComponent(fetchKey)}`,
		{ headers: authHeaders() },
	);
	if (!res.ok) return null;
	try {
		return (await res.json()) as LumenFileResponse;
	} catch {
		return null;
	}
}
