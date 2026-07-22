import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS = [
	{ width: "w-16", sortable: true },
	{ width: "w-12", sortable: false },
	{ width: "w-14", sortable: false },
	{ width: "w-24", sortable: true },
	{ width: "w-24", sortable: true },
];

/**
 * Skeleton for the users table, mirroring UserTable: title bar, the 5
 * sortable/non-sortable columns (Email, Role, Status, Signup Date, Last
 * Activity), and the pagination footer.
 */
export default function UsersTableSkeleton() {
	return (
		<div className="overflow-hidden rounded-3xl border border-[#D8E6FF] bg-white shadow-[0_24px_55px_-38px_rgba(58,82,166,0.45)]">
			<div className="border-b border-[#E7F0FF] bg-[linear-gradient(180deg,#FCFDFF_0%,#F6FAFF_100%)] px-6 py-4">
				<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
					<Skeleton className="h-5 w-36 bg-muted-foreground" />
					<Skeleton className="h-3 w-24 bg-muted-foreground" />
				</div>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-[#E7F0FF] bg-[#FBFDFF]">
							{COLUMNS.map((col, i) => (
								<th key={i} className="px-6 py-4 text-left">
									<div className="flex items-center gap-1">
										<Skeleton
											className={`h-3 ${col.width} bg-muted-foreground`}
										/>
										{col.sortable && (
											<Skeleton className="h-3 w-3 bg-muted-foreground" />
										)}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-[#EEF4FF]">
						{Array.from({ length: 8 }).map((_, i) => (
							<tr key={i}>
								<td className="px-6 py-4">
									<div className="flex items-center gap-3">
										<Skeleton className="h-10 w-10 shrink-0 rounded-2xl bg-muted-foreground" />
										<div className="min-w-0 space-y-1.5">
											<Skeleton className="h-4 w-36 bg-muted-foreground" />
											<Skeleton className="h-3 w-20 bg-muted-foreground" />
										</div>
									</div>
								</td>
								<td className="px-6 py-4">
									<Skeleton className="h-5 w-16 rounded-full bg-muted-foreground" />
								</td>
								<td className="px-6 py-4">
									<Skeleton className="h-5 w-16 rounded-full bg-muted-foreground" />
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-4 bg-muted-foreground" />
										<div className="space-y-1">
											<Skeleton className="h-3 w-20 bg-muted-foreground" />
											<Skeleton className="h-3 w-12 bg-muted-foreground" />
										</div>
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-4 bg-muted-foreground" />
										<div className="space-y-1">
											<Skeleton className="h-3 w-20 bg-muted-foreground" />
											<Skeleton className="h-3 w-12 bg-muted-foreground" />
										</div>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex flex-col gap-3 border-t border-[#E7F0FF] bg-[#FBFDFF] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-3 w-48 bg-muted-foreground" />
				<div className="flex items-center gap-1">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-9 w-9 rounded-xl bg-muted-foreground"
						/>
					))}
				</div>
			</div>
		</div>
	);
}
