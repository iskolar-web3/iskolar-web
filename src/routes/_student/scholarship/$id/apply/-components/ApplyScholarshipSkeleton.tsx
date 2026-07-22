import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page skeleton for the scholarship apply route.
 *
 * Wired in as this route's `pendingComponent`: the page reads scholarship
 * data via `useSuspenseQuery` and a blocking `loader`, so there is no local
 * isLoading branch to slot a skeleton into — the router swaps this in for
 * the whole routed component while the loader/suspense is pending.
 */
export default function ApplyScholarshipSkeleton() {
	return (
		<div className="min-h-screen bg-[#F8F9FC]">
			<div className="max-w-160 mx-auto space-y-4">
				{/* Back Button */}
				<div className="flex items-center gap-1 py-2">
					<Skeleton className="h-4 w-4 rounded bg-muted-foreground" />
					<Skeleton className="h-4 w-10 bg-muted-foreground" />
				</div>

				{/* Scholarship Details */}
				<div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-[#E0ECFF]">
					<Skeleton className="h-7 w-3/4 mb-3 bg-muted-foreground" />
					<div className="flex items-center gap-2 mb-2">
						<Skeleton className="w-4 h-4 rounded-full bg-muted-foreground" />
						<Skeleton className="h-4 w-36 bg-muted-foreground" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
						<Skeleton className="h-4 w-28 bg-muted-foreground" />
					</div>
				</div>

				{/* Application Form */}
				<div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-[#E0ECFF]">
					<Skeleton className="h-5 w-36 mb-1 bg-muted-foreground" />
					<Skeleton className="h-4 w-64 mb-6 md:mb-8 bg-muted-foreground" />

					<div className="space-y-5">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24 bg-muted-foreground" />
							<Skeleton className="h-11 w-full rounded-lg bg-muted-foreground" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-40 bg-muted-foreground" />
							<Skeleton className="h-11 w-full rounded-lg bg-muted-foreground" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-32 bg-muted-foreground" />
							<div className="border-2 border-dashed border-border rounded-lg py-3 flex items-center justify-center">
								<Skeleton className="h-4 w-24 bg-muted-foreground" />
							</div>
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<Skeleton className="h-12 w-full rounded-md bg-muted-foreground" />
			</div>
		</div>
	);
}
