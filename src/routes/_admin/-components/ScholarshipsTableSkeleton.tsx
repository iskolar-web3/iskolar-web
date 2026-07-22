import { Skeleton } from "@/components/ui/skeleton";

const COLUMN_WIDTHS = ["w-24", "w-20", "w-14", "w-14", "w-16", "w-14", "w-16"];

/**
 * Skeleton for the scholarships table, mirroring the real table's 8
 * columns (Scholarship, Sponsor, Status, Type, Applications, Amount,
 * Deadline, chevron) and footer summary row.
 */
export default function ScholarshipsTableSkeleton() {
	return (
		<div className="overflow-hidden rounded-2xl border border-[#D8E6FF] bg-white shadow-[0_18px_45px_-32px_rgba(58,82,166,0.4)]">
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-[#E0ECFF] bg-[#F8FBFF]">
							{COLUMN_WIDTHS.map((w, i) => (
								<th key={i} className="px-5 py-3 text-left">
									<Skeleton className={`h-3 ${w} bg-muted-foreground`} />
								</th>
							))}
							<th className="px-4 py-3" aria-hidden="true" />
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F0F5FF]">
						{Array.from({ length: 6 }).map((_, i) => (
							<tr key={i}>
								<td className="px-5 py-3.5">
									<div className="flex items-center gap-3">
										<Skeleton className="h-9 w-9 shrink-0 rounded-lg bg-muted-foreground" />
										<div className="min-w-0 space-y-1.5">
											<Skeleton className="h-4 w-32 bg-muted-foreground" />
											<Skeleton className="h-3 w-24 bg-muted-foreground" />
										</div>
									</div>
								</td>
								<td className="px-5 py-3.5">
									<div className="space-y-1.5">
										<Skeleton className="h-4 w-24 bg-muted-foreground" />
										<Skeleton className="h-3 w-28 bg-muted-foreground" />
									</div>
								</td>
								<td className="px-5 py-3.5">
									<Skeleton className="h-5 w-16 rounded-full bg-muted-foreground" />
								</td>
								<td className="px-5 py-3.5">
									<Skeleton className="h-5 w-20 rounded-full bg-muted-foreground" />
								</td>
								<td className="px-5 py-3.5">
									<Skeleton className="h-4 w-10 bg-muted-foreground" />
								</td>
								<td className="px-5 py-3.5">
									<Skeleton className="h-4 w-16 bg-muted-foreground" />
								</td>
								<td className="px-5 py-3.5">
									<Skeleton className="h-4 w-20 bg-muted-foreground" />
								</td>
								<td className="px-4 py-3.5">
									<Skeleton className="h-4 w-4 rounded bg-muted-foreground" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="border-t border-[#E0ECFF] px-5 py-3">
				<Skeleton className="h-3 w-56 bg-muted-foreground" />
			</div>
		</div>
	);
}
