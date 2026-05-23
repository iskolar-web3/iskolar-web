import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	createDisbursement,
	getApplicationPaymentMethodQuery,
	getDisbursementQuery,
	getSponsorDisbursementsQuery,
	markDisbursementSent,
} from "@/lib/disbursement/api";
import { type Disbursement, DisbursementStatus } from "@/lib/disbursement/model";
import {
	DisbursementSteps,
	InfoBanner,
	PaymentDetailsCard,
	ProofImageLink,
	ProofUploadField,
	formatDate,
	formatPeso,
} from "@/components/disbursement/DisbursementShared";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

export type ScholarInfo = {
	applicationId: string;
	studentId: string;
	studentName: string;
	scholarshipName: string;
};

type DisbursementDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	scholar: ScholarInfo | null;
	existing?: Disbursement;
};

function AmountDisplay({ amount }: { amount: number }) {
	return (
		<div className="flex items-baseline justify-between rounded-lg border border-[#E0ECFF] bg-white px-4 py-3">
			<span className="text-[11px] uppercase tracking-wide text-[#9CA3AF]">
				Amount
			</span>
			<span className="text-xl text-primary">{formatPeso(amount)}</span>
		</div>
	);
}

export function DisbursementDialog({
	open,
	onOpenChange,
	scholar,
	existing,
}: DisbursementDialogProps) {
	const queryClient = useQueryClient();
	const { toast, showSuccess } = useToast();
	const amountId = useId();
	const noteId = useId();
	const [createdId, setCreatedId] = useState<string | null>(null);
	const [amount, setAmount] = useState("");
	const [sponsorNote, setSponsorNote] = useState("");
	const [proofUrl, setProofUrl] = useState<string | null>(null);
	const [sendNote, setSendNote] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const activeId = existing?.id ?? createdId;

	const paymentQuery = useQuery({
		...getApplicationPaymentMethodQuery(scholar?.applicationId ?? ""),
		enabled: open && !!scholar?.applicationId && !activeId,
	});

	const detailQuery = useQuery({
		...getDisbursementQuery(activeId ?? ""),
		enabled: open && !!activeId,
	});

	const disbursement = detailQuery.data ?? existing;

	const createMutation = useMutation({
		mutationFn: createDisbursement,
		onSuccess: (res) => {
			setCreatedId(res.data.id);
			queryClient.invalidateQueries({
				queryKey: getSponsorDisbursementsQuery().queryKey,
			});
		},
	});

	const sendMutation = useMutation({
		mutationFn: (vars: { id: string; proofUrl: string; note?: string }) =>
			markDisbursementSent(vars.id, {
				proofUrl: vars.proofUrl,
				note: vars.note,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getSponsorDisbursementsQuery().queryKey,
			});
			if (activeId) {
				queryClient.invalidateQueries({
					queryKey: getDisbursementQuery(activeId).queryKey,
				});
			}
			showSuccess(
				"Funds marked as sent",
				"The student has been notified to confirm receipt.",
			);
		},
	});

	function reset() {
		setCreatedId(null);
		setAmount("");
		setSponsorNote("");
		setProofUrl(null);
		setSendNote("");
		setFormError(null);
		createMutation.reset();
		sendMutation.reset();
	}

	function handleOpenChange(next: boolean) {
		if (!next) {
			reset();
		}
		onOpenChange(next);
	}

	function handleCreate() {
		setFormError(null);
		if (!scholar) {
			return;
		}

		const parsedAmount = Number(amount);
		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
			setFormError("Enter a valid amount greater than zero.");
			return;
		}

		createMutation.mutate({
			scholarshipApplicationId: scholar.applicationId,
			amount: parsedAmount,
			sponsorNote: sponsorNote.trim() || undefined,
		});
	}

	function handleSend() {
		setFormError(null);
		if (!activeId) {
			return;
		}
		if (!proofUrl) {
			setFormError("Upload a proof image before marking as sent.");
			return;
		}

		sendMutation.mutate({
			id: activeId,
			proofUrl,
			note: sendNote.trim() || undefined,
		});
	}

	return (
		<>
			{toast && <Toast {...toast} />}
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
					<DialogHeader className="border-b border-[#E0ECFF] p-5">
						<DialogTitle className="font-normal">
							{scholar?.scholarshipName ?? ""}
						</DialogTitle>
						<DialogDescription>
							{scholar?.studentName ?? ""}
						</DialogDescription>
					</DialogHeader>
	
					<div className="space-y-5 p-5">
						<DisbursementSteps current={disbursement?.status ?? null} />
	
						{!disbursement ? (
							<div className="space-y-4">
								{paymentQuery.isLoading ? (
									<p className="text-sm text-[#6B7280]">
										Loading payment details...
									</p>
								) : paymentQuery.data ? (
									<PaymentDetailsCard
										method={paymentQuery.data.method.name}
										accountName={paymentQuery.data.accountName}
										accountNumber={paymentQuery.data.accountNumber}
									/>
								) : (
									<InfoBanner variant="waiting">
										This student hasn't set up a payment method yet, so funds
										can't be disbursed.
									</InfoBanner>
								)}
	
								<div className="space-y-1.5">
									<label
										htmlFor={amountId}
										className="text-sm text-primary"
									>
										Amount
									</label>
									<div className="relative">
										<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">
											₱
										</span>
										<input
											id={amountId}
											type="number"
											min="0"
											step="0.01"
											value={amount}
											onChange={(e) => setAmount(e.target.value)}
											placeholder="0.00"
											className="w-full rounded-md border border-[#D3DCF6] py-2 pl-7 pr-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#3A52A6]"
										/>
									</div>
								</div>
	
								<div className="space-y-1.5">
									<label
										htmlFor={noteId}
										className="text-sm text-primary"
									>
										Reference note{" "}
										<span className="font-normal text-[#9CA3AF]">
											(optional)
										</span>
									</label>
									<textarea
										id={noteId}
										value={sponsorNote}
										onChange={(e) => setSponsorNote(e.target.value)}
										rows={2}
										placeholder="e.g. GCash reference number"
										className="w-full rounded-md border border-[#D3DCF6] px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#3A52A6]"
									/>
								</div>
	
								{(formError || createMutation.isError) && (
									<p className="text-sm text-red-600">
										{formError ||
											(createMutation.error instanceof Error
												? createMutation.error.message
												: "Failed to create disbursement.")}
									</p>
								)}
	
								<Button
									type="button"
									className="w-full cursor-pointer"
									disabled={!paymentQuery.data || createMutation.isPending}
									onClick={handleCreate}
								>
									{createMutation.isPending ? "Creating..." : "Create Disbursement"}
								</Button>
							</div>
						) : (
							<div className="space-y-4">
								<AmountDisplay amount={disbursement.amount} />
								<PaymentDetailsCard
									method={disbursement.paymentMethod.method.name}
									accountName={disbursement.paymentMethod.accountName}
									accountNumber={disbursement.paymentMethod.accountNumber}
								/>
	
								{disbursement.status === DisbursementStatus.Initiated && (
									<div className="space-y-3">
										<div>
											<p className="text-sm text-primary">
												Confirm you sent the funds
											</p>
											<p className="mt-0.5 text-xs text-[#6B7280]">
												Transfer the amount using the details above, then upload
												a screenshot as proof.
											</p>
										</div>
										<ProofUploadField value={proofUrl} onChange={setProofUrl} />
										<textarea
											value={sendNote}
											onChange={(e) => setSendNote(e.target.value)}
											rows={2}
											placeholder="Reference note (optional)"
											className="w-full rounded-md border border-[#D3DCF6] px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#3A52A6]"
										/>
										{(formError || sendMutation.isError) && (
											<p className="text-sm text-red-600">
												{formError ||
													(sendMutation.error instanceof Error
														? sendMutation.error.message
														: "Failed to update disbursement.")}
											</p>
										)}
										<Button
											type="button"
											className="w-full cursor-pointer"
											disabled={!proofUrl || sendMutation.isPending}
											onClick={handleSend}
										>
											{sendMutation.isPending ? "Saving..." : "Mark as Sent"}
										</Button>
									</div>
								)}
	
								{disbursement.status === DisbursementStatus.Sent && (
									<div className="space-y-3">
										<InfoBanner variant="waiting">
											Waiting for the student to confirm they received the funds.
										</InfoBanner>
										<ProofImageLink
											label="Your proof of transfer"
											url={disbursement.sponsorProofUrl}
										/>
									</div>
								)}
	
								{disbursement.status === DisbursementStatus.Received && (
									<div className="space-y-3">
										<InfoBanner variant="success">
											The student confirmed receipt
											{disbursement.receivedAt
												? ` on ${formatDate(disbursement.receivedAt)}`
												: ""}
											.
										</InfoBanner>
										<div className="grid gap-3 sm:grid-cols-2">
											<ProofImageLink
												label="Your proof of transfer"
												url={disbursement.sponsorProofUrl}
											/>
											<ProofImageLink
												label="Student's proof of receipt"
												url={disbursement.studentProofUrl}
											/>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
			</DialogContent>
		</Dialog>
		</>
	);
}
