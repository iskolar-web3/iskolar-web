import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, HandCoins } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentDisbursementsQuery } from "@/lib/disbursement/api";
import { type Disbursement, DisbursementStatus } from "@/lib/disbursement/model";
import {
	DisbursementStatusBadge,
	formatPeso,
} from "@/components/disbursement/DisbursementShared";
import { StudentDisbursementDialog } from "./-components/StudentDisbursementDialog";

export const Route = createFileRoute("/_student/disbursements/")({
	component: DisbursementsPage,
});

function SummaryCard({
	disbursement,
	index,
	onView,
}: {
	disbursement: Disbursement;
	index: number;
	onView: () => void;
}) {
	const needsAction = disbursement.status === DisbursementStatus.Sent;

	return (
		<motion.button
			type="button"
			onClick={onView}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.04 }}
			className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#E0ECFF] bg-card p-4 text-left shadow-sm transition-colors hover:border-primary"
		>
			<div className="min-w-0">
				<p className="truncate text-[11px] uppercase tracking-wide text-[#9CA3AF]">
					{disbursement.scholarshipName}
				</p>
				<p className="mt-0.5 text-xl text-primary">
					{formatPeso(disbursement.amount)}
				</p>
				<div className="mt-2 flex items-center gap-2">
					<DisbursementStatusBadge status={disbursement.status} />
					{needsAction && (
						<span className="text-xs text-amber-600">Action needed</span>
					)}
				</div>
			</div>
			<span className="flex items-center gap-1 text-sm text-primary">
				View details
				<ChevronRight className="h-4 w-4" />
			</span>
		</motion.button>
	);
}

function DisbursementsPage() {
	const disbursementsQuery = useQuery(getStudentDisbursementsQuery());
	const disbursements = disbursementsQuery.data ?? [];
	const [active, setActive] = useState<Disbursement | null>(null);

	return (
		<div className="min-h-screen">
			<SEO title="My Funds" noindex={true} />

			<div className="mx-auto max-w-3xl space-y-5">
				<motion.div
					initial={{ opacity: 0, y: -16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<h1 className="text-2xl text-primary">My Funds</h1>
					<p className="mt-0.5 text-sm text-[#6B7280]">
						Track disbursements from your sponsors and confirm when you receive
						them.
					</p>
				</motion.div>

				<div className="space-y-3">
					{disbursementsQuery.isLoading ? (
						["skel-1", "skel-2", "skel-3"].map((key) => (
							<Skeleton key={key} className="h-24 w-full rounded-lg" />
						))
					) : disbursements.length === 0 ? (
						<div className="flex flex-col items-center justify-center pt-24 pb-16">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF]">
								<HandCoins className="h-8 w-8 text-primary" />
							</div>
							<p className="mt-4 text-base text-primary">No disbursements yet</p>
							<p className="mt-1 max-w-sm text-center text-sm text-[#9CA3AF]">
								When a sponsor disburses funds to you, they'll appear here.
							</p>
						</div>
					) : (
						disbursements.map((d, index) => (
							<SummaryCard
								key={d.id}
								disbursement={d}
								index={index}
								onView={() => setActive(d)}
							/>
						))
					)}
				</div>
			</div>

			<StudentDisbursementDialog
				open={!!active}
				onOpenChange={(next) => {
					if (!next) {
						setActive(null);
					}
				}}
				disbursement={active}
			/>
		</div>
	);
}
