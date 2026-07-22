import ScholarshipCardSkeleton from "./ScholarshipCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const FILTER_GROUPS = [
	{ label: "Sort By", ranged: false },
	{ label: "Scholarship Type", ranged: false },
	{ label: "Applications", ranged: true },
	{ label: "Amount per Scholar", ranged: true },
	{ label: "Slots", ranged: true },
];

export default function ScholarshipsSkeleton() {
	return (
		<div className="min-h-screen">
			{/* Mobile/Tablet header */}
			<div className="lg:hidden space-y-2">
				<div className="bg-card rounded-md text-center p-2 border border-[#D3DCF6] shadow-sm">
					<Skeleton className="h-5 w-36 mx-auto bg-muted-foreground" />
				</div>
				<div className="bg-white rounded-md p-2 shadow-sm">
					<Skeleton className="h-9 w-full rounded-md bg-muted-foreground" />
				</div>
			</div>

			<div className="space-y-4 mt-4 lg:mt-0">
				<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0">
					{/* Filters sidebar */}
					<div className="hidden lg:block">
						<div className="h-fit sticky top-4 pr-4">
							<div className="bg-card rounded-md border border-[#D3DCF6] shadow-[0_20px_40px_rgba(17,24,39,0.04)] p-6">
								<div className="flex items-center gap-2 mb-6">
									<Skeleton className="w-5 h-5 rounded bg-muted-foreground" />
									<Skeleton className="h-4 w-16 bg-muted-foreground" />
								</div>
								<div className="space-y-6">
									{FILTER_GROUPS.map((group) => (
										<div key={group.label}>
											<Skeleton className="h-3 w-28 mb-2 bg-muted-foreground" />
											{group.ranged ? (
												<div className="flex gap-2">
													<Skeleton className="h-9 w-full rounded-lg bg-muted-foreground" />
													<Skeleton className="h-9 w-full rounded-lg bg-muted-foreground" />
												</div>
											) : (
												<Skeleton className="h-9 w-full rounded-lg bg-muted-foreground" />
											)}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Card grid */}
					<div className="space-y-5">
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
							{Array.from({ length: 6 }).map((_, index) => (
								<ScholarshipCardSkeleton
									key={`skeleton-${index}`}
									index={index}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
