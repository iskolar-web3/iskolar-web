import { Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	scholarshipTitle: string;
	onConfirm: () => void;
	loading: boolean;
}

export default function ConfirmationDialog({
	open,
	onOpenChange,
	scholarshipTitle,
	onConfirm,
	loading,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="font-normal">Create Scholarship</DialogTitle>
					<DialogDescription className="text-[#6B7280] font-normal">
						You're about to create{" "}
						<span className="text-primary">
							{scholarshipTitle || "this scholarship"}
						</span>
						. Are you sure you want to proceed?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex gap-2 sm:justify-end">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						disabled={loading}
						className="cursor-pointer px-4 py-2 rounded-lg border border-[#C4CBD5] text-primary text-sm hover:bg-[#F3F4F6] transition-colors"
					>
						Review
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={loading}
						className={`cursor-pointer px-4 py-2 rounded-lg bg-[#EFA508] text-tertiary text-sm hover:bg-[#D89407] transition-colors ${
							loading && "opacity-60 cursor-not-allowed"
						}`}
					>
						{loading ? (
							<span className="flex items-center justify-center">
								<Loader2 className="w-4 h-4 animate-spin" />
							</span>
						) : (
							"Create"
						)}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
