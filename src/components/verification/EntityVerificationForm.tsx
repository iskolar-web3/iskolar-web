import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startVerification } from "@/lib/verification/api";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function EntityVerificationForm({
	open,
	onOpenChange,
}: Props) {
	const [registrationNumber, setRegistrationNumber] = useState("");
	const [repName, setRepName] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		if (!registrationNumber.trim() || !repName.trim()) {
			setError("Both fields are required.");
			return;
		}

		setSubmitting(true);
		try {
			const result = await startVerification("sponsors", {
				registrationNumber: registrationNumber.trim(),
				repName: repName.trim(),
			});
			window.location.href = result.verificationUrl;
		} catch (err: any) {
			setError(err.message || "Failed to start verification.");
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Entity Verification</DialogTitle>
					<DialogDescription>
						Provide your organization details before proceeding to identity
						verification.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="registrationNumber"
							className="text-sm font-medium"
						>
							Legal Registration Number
						</label>
						<Input
							id="registrationNumber"
							value={registrationNumber}
							onChange={(e) => setRegistrationNumber(e.target.value)}
							placeholder="e.g. SEC-2024-001234"
							disabled={submitting}
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="repName" className="text-sm font-medium">
							Authorized Representative Full Name
						</label>
						<Input
							id="repName"
							value={repName}
							onChange={(e) => setRepName(e.target.value)}
							placeholder="Full legal name"
							disabled={submitting}
						/>
					</div>
					{error && <p className="text-sm text-red-600">{error}</p>}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={submitting}
							className="bg-[#3B5AA8] hover:bg-[#2f4389] text-white"
						>
							{submitting ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Processing...
								</>
							) : (
								"Continue to Verification"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
