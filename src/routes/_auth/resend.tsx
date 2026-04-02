import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { BACKEND_URL, type ApiResponse } from "@/lib/api";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

// NOTE: This is a temporary page to test resending email verification link.
// Delete this after proper implementation

export const Route = createFileRoute("/_auth/resend")({
	component: RouteComponent,
});

const resendRequestSchema = z.object({
	email: z.email(),
});
type ResendRequest = z.infer<typeof resendRequestSchema>;

async function resendVerification(value: ResendRequest): Promise<void> {
	const response = await fetch(`${BACKEND_URL}/verify/resend`, {
		method: "POST",
		body: JSON.stringify(value),
		headers: { "Content-Type": "application/json" },
	});
	const result: ApiResponse = await response.json();
	if (!response.ok) {
		throw new Error(result.message || "Failed to resend verification link.");
	}
}

function RouteComponent() {
	const { toast, showSuccess, showError } = useToast();

	const form = useForm<ResendRequest>({
		resolver: zodResolver(resendRequestSchema),
		mode: "onBlur",
		defaultValues: {
			email: "",
		},
	});

	const mutation = useMutation({
		mutationFn: resendVerification,
		onSuccess: async () => {
			showSuccess(`Success`, "Resent verification link.", 1250);
		},
		onError: (err) => {
			showError("Error", err.message);
			console.error(err);
		},
	});

	const onSubmit = async (value: ResendRequest) => {
		mutation.mutate(value);
	};

	return (
		<div>
			{toast && <Toast {...toast} />}

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 sm:space-y-3"
			>
				<div>
					<label
						htmlFor="email"
						className="block text-xs sm:text-[11px] xl:text-sm text-primary mb-1.5"
					>
						Email
					</label>
					<input
						id="email"
						type="email"
						placeholder="Enter Email"
						{...form.register("email")}
						disabled={mutation.isPending}
						className={`w-full px-4 py-3 sm:px-3 sm:py-2.5 xl:py-3 rounded-lg text-xs sm:text-[11px] xl:text-sm focus:outline-none focus:ring-1 transition-all bg-transparent border text-primary placeholder:text-[#C4CBD5] ${
							form.formState.errors.email
								? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]"
								: "border-[#C4CBD5] focus:border-[#3A52A6] focus:ring-[#3A52A6]"
						}`}
					/>
					{form.formState.errors.email && (
						<p className="mt-1 text-[10px] sm:text-[9px] xl:text-xs text-[#EF4444]">
							{form.formState.errors.email.message}
						</p>
					)}
				</div>

				<Button type="submit">Resend verification link</Button>
			</form>
		</div>
	);
}
