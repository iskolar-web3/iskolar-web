import type {
	LumenCreateParams,
	LumenCreateResponse,
	LumenFileResponse,
} from "./model";
import { BACKEND_URL, type ApiResponse, safeResponseJson } from "../api";

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
	// The server holds the Lumen credentials and prefixes the file name.
	const res = await fetch(`${BACKEND_URL}/lumen/files`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: params.name,
			description: params.description,
			fileExtension: params.fileExtension,
			checksum: params.checksum,
		}),
	});
	const result: ApiResponse<LumenCreateResponse> =
		await safeResponseJson(res);
	if (!res.ok) {
		throw new Error(`Lumen create failed (${res.status}): ${result.message}`);
	}

	const { workflowId, sasUrl, fetchKey } = result.data;
	if (!sasUrl || !workflowId) {
		throw new Error("Invalid Lumen response");
	}

	const upload = await fetch(sasUrl, {
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

	return { workflowId, sasUrl, fetchKey };
}

export async function getLumenFile(
	fetchKey: string,
): Promise<LumenFileResponse | null> {
	const res = await fetch(
		`${BACKEND_URL}/lumen/files?fetchKey=${encodeURIComponent(fetchKey)}`,
		{ credentials: "include" },
	);
	if (!res.ok) return null;
	try {
		const result: ApiResponse<LumenFileResponse> = await res.json();
		return result.data;
	} catch {
		return null;
	}
}
