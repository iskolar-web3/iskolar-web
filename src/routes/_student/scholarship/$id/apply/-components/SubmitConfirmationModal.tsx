import { Loader2 } from "lucide-react";

interface SubmitConfirmationModalProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading: boolean;
}

export default function SubmitConfirmationModal({
	isOpen,
	onConfirm,
	onCancel,
	isLoading,
}: SubmitConfirmationModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div className="bg-[#F0F7FF] rounded-2xl p-5 max-w-md w-full">
				<h3 className="text-lg text-primary text-center mb-2">
					Submit Application?
				</h3>
				<p className="text-sm text-[#4B5563] text-center mb-6">
					Please review your information before submitting. Once submitted,
					you cannot modify your application.
				</p>

				<div className="flex gap-3">
					<button
						onClick={onCancel}
						className={`flex-1 py-2.5 text-sm cursor-pointer bg-[#CACDD2] text-[#4B5563] rounded-md hover:bg-[#B8BCC2] transition-colors ${
							isLoading && "opacity-60 cursor-not-allowed"
						}`}
					>
						Review
					</button>
					<button
						onClick={onConfirm}
						className={`flex-1 py-2.5 text-sm cursor-pointer bg-[#EFA508] text-tertiary rounded-md hover:bg-[#D89407] transition-colors ${
							isLoading && "opacity-60 cursor-not-allowed"
						}`}
					>
						{isLoading ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<span>Submit</span>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
