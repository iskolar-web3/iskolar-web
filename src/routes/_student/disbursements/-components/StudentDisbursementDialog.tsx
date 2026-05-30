import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	getDisbursementQuery,
	getStudentDisbursementsQuery,
	markDisbursementReceived,
} from "@/lib/disbursement/api";
import {
	type Disbursement,
	DisbursementStatus,
} from "@/lib/disbursement/model";
import {
	DisbursementSteps,
	InfoBanner,
	PaymentDetailsCard,
	ProofImageLink,
	ProofUploadField,
	formatDate,
	formatPeso,
} from "@/components/disbursement/DisbursementShared";
import { toast } from "@/lib/toast";
import { uploadFile } from "@/lib/api";
import { getCookie } from "@/lib/cookie";
import { ACCESS_TOKEN_KEY } from "@/lib/user/auth";

type StudentDisbursementDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	disbursement: Disbursement | null;
};

export function StudentDisbursementDialog({
	open,
	onOpenChange,
	disbursement: initial,
}: StudentDisbursementDialogProps) {
	const queryClient = useQueryClient();
	const [proofFile, setProofFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [note, setNote] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const id = initial?.id ?? "";

	const detailQuery = useQuery({
		...getDisbursementQuery(id),
		enabled: open && !!id,
	});

	const disbursement = detailQuery.data ?? initial;

	const receiveMutation = useMutation({
		mutationFn: (vars: { proofUrl: string; note?: string }) =>
			markDisbursementReceived(id, vars),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getStudentDisbursementsQuery().queryKey,
			});
			if (id) {
				queryClient.invalidateQueries({
					queryKey: getDisbursementQuery(id).queryKey,
				});
			}
			toast.success(
				"Receipt confirmed",
				"Thanks for confirming you received the funds.",
			);
		},
	});

	function reset() {
		setProofFile(null);
		setUploading(false);
		setNote("");
		setFormError(null);
		receiveMutation.reset();
	}

	function handleOpenChange(next: boolean) {
		if (!next) {
			reset();
		}
		onOpenChange(next);
	}

	async function handleConfirm() {
		setFormError(null);
		if (!proofFile) {
			setFormError("Upload a proof image before confirming receipt.");
			return;
		}

		const token = getCookie(ACCESS_TOKEN_KEY);
		if (!token) {
			setFormError("Session expired. Please refresh.");
			return;
		}

		setUploading(true);
		try {
			const uploadRes = await uploadFile(
				proofFile,
				token,
				"disbursement-files",
			);
			if (!uploadRes.data?.url) {
				setFormError(uploadRes.message || "Failed to upload proof.");
				return;
			}
			receiveMutation.mutate({
				proofUrl: uploadRes.data.url,
				note: note.trim() || undefined,
			});
		} catch (err) {
			setFormError(
				err instanceof Error ? err.message : "Failed to upload proof.",
			);
		} finally {
			setUploading(false);
		}
	}

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
					<DialogHeader className="border-b border-[#E0ECFF] p-5">
						<DialogTitle className="font-normal">
							{disbursement?.scholarshipName ?? ""}
						</DialogTitle>
					</DialogHeader>

					{disbursement && (
						<div className="space-y-5 p-5">
							<DisbursementSteps current={disbursement.status} />

							<div className="space-y-4">
								<div className="flex items-baseline justify-between rounded-lg border border-[#E0ECFF] bg-white px-4 py-3">
									<span className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
										Amount
									</span>
									<span className="text-xl text-primary">
										{formatPeso(disbursement.amount)}
									</span>
								</div>

								<PaymentDetailsCard
									title="Paid to your account"
									method={disbursement.paymentMethod.method.name}
									accountName={disbursement.paymentMethod.accountName}
									accountNumber={disbursement.paymentMethod.accountNumber}
								/>

								{disbursement.status === DisbursementStatus.Initiated && (
									<InfoBanner variant="neutral">
										Your sponsor is preparing this disbursement. You'll be
										notified once the funds are sent.
									</InfoBanner>
								)}

								{disbursement.status === DisbursementStatus.Sent && (
									<div className="space-y-3">
										<ProofImageLink
											label="Sponsor's proof of transfer"
											url={disbursement.sponsorProofUrl}
										/>
										<div>
											<p className="text-sm text-primary">
												Confirm you received the funds
											</p>
											<p className="mt-0.5 text-xs text-[#6B7280]">
												Upload a screenshot showing the funds in your account,
												then confirm.
											</p>
										</div>
										<ProofUploadField
											value={null}
											onFileChange={setProofFile}
										/>
										<textarea
											value={note}
											onChange={(e) => setNote(e.target.value)}
											rows={2}
											placeholder="Note (optional)"
											className="w-full rounded-md border border-[#D3DCF6] px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#3A52A6]"
										/>
										{(formError || receiveMutation.isError) && (
											<p className="text-sm text-red-600">
												{formError ||
													(receiveMutation.error instanceof Error
														? receiveMutation.error.message
														: "Failed to confirm receipt.")}
											</p>
										)}
										<Button
											type="button"
											className="w-full cursor-pointer"
											disabled={
												!proofFile || uploading || receiveMutation.isPending
											}
											onClick={handleConfirm}
										>
											{uploading
												? "Uploading..."
												: receiveMutation.isPending
													? "Confirming..."
													: "Confirm Receipt"}
										</Button>
									</div>
								)}

								{disbursement.status === DisbursementStatus.Received && (
									<div className="space-y-3">
										<InfoBanner variant="success">
											Receipt confirmed
											{disbursement.receivedAt
												? ` on ${formatDate(disbursement.receivedAt)}`
												: ""}
											.
										</InfoBanner>
										<div className="grid gap-3 sm:grid-cols-2">
											<ProofImageLink
												label="Sponsor's proof of transfer"
												url={disbursement.sponsorProofUrl}
											/>
											<ProofImageLink
												label="Your proof of receipt"
												url={disbursement.studentProofUrl}
											/>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
