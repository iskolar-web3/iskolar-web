import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { useAuth } from "@/auth";
import { getPaymentMethodQuery } from "@/lib/student/api";
import { getMyApplicationsQuery } from "@/lib/scholarship/api";
import { ScholarshipApplicationStatus } from "@/lib/scholarship/status";
import type { Student } from "@/lib/student/model";

export function PaymentMethodBanner() {
	const { profile } = useAuth<Student>();

	const approvedAppsQuery = useQuery(
		getMyApplicationsQuery({ status: ScholarshipApplicationStatus.Approved }),
	);

	const hasApprovedApps =
		approvedAppsQuery.isSuccess &&
		(approvedAppsQuery.data ?? []).length > 0;

	const paymentMethodQuery = useQuery({
		...getPaymentMethodQuery(profile?.id ?? ""),
		enabled: !!profile?.id && hasApprovedApps,
	});

	const missingPaymentMethod =
		paymentMethodQuery.isSuccess && paymentMethodQuery.data === null;

	if (!hasApprovedApps || !missingPaymentMethod) {
		return null;
	}

	return (
		<div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
			<TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
			<p>
				You have an approved scholarship but haven't set up a payment method
				yet.{" "}
				<Link
					to="/profile/student/$studentId"
					params={{ studentId: profile?.id ?? "" }}
					className="font-semibold underline underline-offset-2 hover:text-amber-900"
				>
					Set it up now
				</Link>{" "}
				so your sponsor can send funds to you.
			</p>
		</div>
	);
}
