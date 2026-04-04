import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	createLumenFile,
	computeFileChecksum,
	getLumenFile,
	LUMEN_OWNER_ADDRESS,
} from "@/lib/lumen/api";
import { addStoredCredential, updateStoredCredential } from "@/lib/lumen/storage";
import { formatFileSize } from "@/utils/fileHandling.utils";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import { logger } from "@/lib/logger";

interface LumenUploadModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	userId: string;
}

export default function LumenUploadModal({
	isOpen,
	onClose,
	onSuccess,
	userId,
}: LumenUploadModalProps) {
	const { toast, showError } = useToast();

	const [file, setFile] = useState<File | null>(null);
	const [credentialType, setCredentialType] = useState("");
	const [name, setName] = useState("");
	const [institution, setInstitution] = useState("");
	const [issuedDate, setIssuedDate] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [uploadSuccess, setUploadSuccess] = useState(false);

	const resetState = useCallback(() => {
		setFile(null);
		setCredentialType("");
		setName("");
		setInstitution("");
		setIssuedDate("");
		setIsUploading(false);
		setUploadSuccess(false);
	}, []);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const selected = e.target.files?.[0];
			e.target.value = "";
			if (!selected) return;
			if (selected.size > 10 * 1024 * 1024) {
				showError("File too large", "Maximum file size is 10 MB", 3000);
				return;
			}
			setFile(selected);
		},
		[showError],
	);

	const handleUpload = async () => {
		if (!credentialType) {
			showError("Required", "Please select a credential type", 3000);
			return;
		}
		if (!name.trim()) {
			showError("Required", "Please enter a credential name", 3000);
			return;
		}
		if (!institution.trim()) {
			showError("Required", "Please enter the issuing institution", 3000);
			return;
		}
		if (!file) {
			showError("Required", "Please select a file to upload", 3000);
			return;
		}

		setIsUploading(true);

		try {
			const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
			const checksum = await computeFileChecksum(file);
			const description = `${credentialType} credential issued by ${institution.trim()}`;

			// Use userId prefix to avoid file name collisions across users
			const lumenName = `${userId.slice(0, 8)}-${name.trim()}`;

			const { workflowId, fetchKey } = await createLumenFile({
				urlPath: "Credential",
				name: lumenName,
				description,
				ownerAddress: LUMEN_OWNER_ADDRESS,
				fileExtension: fileExt,
				checksum,
				file,
			});

			addStoredCredential({
				fetchKey,
				workflowId,
				userId,
				credentialType,
				name: name.trim(),
				institution: institution.trim(),
				issuedDate: issuedDate || undefined,
				extension: fileExt,
				description,
				checksum,
				lumenStatus: "pending",
				uploadedAt: new Date().toISOString(),
			});

			// Immediately confirm — file is usually available right after SAS upload
			const fetched = await getLumenFile(fetchKey);
			if (fetched?.File?.FileURL) {
				updateStoredCredential(userId, fetchKey, {
					lumenStatus: "completed",
					fileUrl: fetched.File.FileURL,
				});
			}

			setUploadSuccess(true);
			onSuccess?.();
			setTimeout(() => {
				resetState();
				onClose();
			}, 1200);
		} catch (err) {
			logger.error("Credential upload failed:", err);
			showError(
				"Upload Failed",
				err instanceof Error ? err.message : "Could not upload credential",
				4000,
			);
			setIsUploading(false);
		}
	};

	const handleClose = useCallback(() => {
		if (!isUploading) {
			resetState();
			onClose();
		}
	}, [isUploading, resetState, onClose]);

	const isValid = !!credentialType && !!name.trim() && !!institution.trim() && !!file;

	return (
		<>
			{toast && <Toast {...toast} />}

			<Dialog open={isOpen} onOpenChange={handleClose}>
				<DialogContent className="max-w-lg! p-0" showCloseButton={!isUploading}>
					<DialogHeader className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg text-gray-900">Add Credential</h2>
					</DialogHeader>

					<div className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
						{/* Type */}
						<div>
							<label className="block text-xs text-gray-500 mb-1.5">Type*</label>
							<Select
								value={credentialType}
								onValueChange={setCredentialType}
								disabled={isUploading}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Academic">Academic</SelectItem>
									<SelectItem value="Certification">Certification</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Name */}
						<div>
							<label className="block text-xs text-gray-500 mb-1.5">Credential Name*</label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g., Dean's List Award"
								disabled={isUploading}
							/>
						</div>

						{/* Institution */}
						<div>
							<label className="block text-xs text-gray-500 mb-1.5">
								Issuing Institution*
							</label>
							<Input
								value={institution}
								onChange={(e) => setInstitution(e.target.value)}
								placeholder="e.g., University of the Philippines"
								disabled={isUploading}
							/>
						</div>

						{/* Issued Date */}
						<div>
							<label className="block text-xs text-gray-500 mb-1.5">
								Issued Date
							</label>
							<Input
								type="month"
								value={issuedDate}
								onChange={(e) => setIssuedDate(e.target.value)}
								disabled={isUploading}
							/>
						</div>

						{/* File */}
						<div>
							<label className="block text-xs text-gray-500 mb-1.5">
								Upload Document*{" "}
								<span className="text-gray-400">(PNG, JPG, PDF — max 10 MB)</span>
							</label>
							{!file ? (
								<label className="block cursor-pointer">
									<div className="border-2 border-dashed border-gray-300 rounded-sm p-12 text-center hover:border-[#3B5AA8] transition-colors">
										<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
										<p className="text-sm text-gray-600">
											Click to upload or drag and drop
										</p>
										<p className="text-xs text-gray-400 mt-1">
											PNG, JPG, PDF up to 10MB
										</p>
									</div>
									<input
										type="file"
										accept="image/*,.pdf"
										onChange={handleFileChange}
										disabled={isUploading}
										className="hidden"
									/>
								</label>
							) : (
								<div className="border border-gray-200 rounded-sm p-3 flex items-center gap-3">
									<FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-sm text-gray-800 truncate">{file.name}</p>
										<p className="text-xs text-gray-500">
											{formatFileSize(file.size)}
										</p>
									</div>
									<button
										type="button"
										onClick={() => setFile(null)}
										disabled={isUploading}
										className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							)}
						</div>

						{/* Info */}
						<div className="bg-[#F9FAFB] border border-[#E0ECFF] rounded-sm p-3">
							<h3 className="text-sm text-primary mb-1">About Credentials</h3>
							<p className="text-xs text-gray-600 leading-relaxed">
								Your credential will be securely stored and registered on Lumen,
								ensuring it stays authentic and tamper-proof.
							</p>
						</div>
					</div>

					<DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
						<Button
							variant="outline"
							onClick={handleClose}
							disabled={isUploading}
							className="flex-1 cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							onClick={handleUpload}
							disabled={isUploading || !isValid}
							className="flex-1 bg-[#3B5AA8] hover:bg-[#2f4389] cursor-pointer disabled:bg-gray-300"
						>
							{isUploading ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Uploading…
								</>
							) : uploadSuccess ? (
								<>
									<CheckCircle className="w-4 h-4" />
									Saved!
								</>
							) : (
								"Save"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
