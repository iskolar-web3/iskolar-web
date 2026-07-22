import { Skeleton } from "@/components/ui/skeleton";

export default function EditScholarshipSkeleton() {
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			{/* Go Back + Live Preview Toggle Skeleton */}
			<div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<Skeleton className="h-4 w-40 bg-muted-foreground" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-4 rounded bg-muted-foreground" />
					<Skeleton className="h-4 w-28 bg-muted-foreground" />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6">
				<div className="space-y-4 w-full lg:max-w-2xl lg:mx-auto">
					{/* Card Color Skeleton */}
					<div className="bg-[#F8F9FC] rounded-xl p-3 shadow-sm">
						<Skeleton className="h-3 w-20 mb-2 bg-muted-foreground" />
						<div className="flex flex-wrap gap-2">
							{Array.from({ length: 14 }).map((_, i) => (
								<Skeleton
									key={i}
									className="w-7 h-7 rounded-full bg-muted-foreground"
								/>
							))}
						</div>
					</div>

					{/* Close Scholarship Button Skeleton */}
					<Skeleton className="w-full h-12 rounded-lg bg-muted" />

					{/* End Scholarship Button Skeleton */}
					<Skeleton className="w-full h-12 rounded-lg bg-muted" />

					{/* Image, Title, Description Skeleton */}
					<div className="bg-[#F8F9FC] rounded-xl p-3 shadow-sm">
						<div className="flex flex-col md:flex-row gap-4 items-stretch">
							{/* Image Skeleton */}
							<div className="md:w-[218px] shrink-0">
								<Skeleton className="w-full h-full min-h-[218px] rounded-lg bg-muted-foreground" />
							</div>

							{/* Title + Description Skeleton */}
							<div className="flex-1 flex flex-col justify-between min-h-[218px] space-y-4">
								<div>
									<Skeleton className="h-3 w-10 mb-1 bg-muted-foreground" />
									<Skeleton className="h-8 w-full bg-muted-foreground" />
								</div>
								<div className="flex-1">
									<Skeleton className="h-3 w-20 mb-1 bg-muted-foreground" />
									<Skeleton className="w-full h-[140px] rounded-lg bg-muted-foreground" />
								</div>
							</div>
						</div>
					</div>

					{/* Amount and Slots/Deadline Skeleton */}
					<div className="bg-[#F8F9FC] rounded-xl p-3 shadow-sm space-y-4">
						{/* Amount */}
						<div>
							<div className="flex items-center justify-between mb-1.5">
								<Skeleton className="h-3 w-32 bg-muted-foreground" />
								<div className="flex h-7 rounded-sm overflow-hidden border border-border">
									<Skeleton className="h-full w-12 rounded-none bg-muted-foreground" />
									<Skeleton className="h-full w-12 rounded-none bg-muted-foreground" />
									<Skeleton className="h-full w-12 rounded-none bg-muted-foreground" />
								</div>
							</div>
							<Skeleton className="w-full h-11 rounded-lg bg-muted-foreground" />
						</div>

						{/* Number of Slots */}
						<div>
							<div className="flex items-center justify-between mb-1.5">
								<Skeleton className="h-3 w-28 bg-muted-foreground" />
								<Skeleton className="h-3 w-16 bg-muted-foreground" />
							</div>
							<Skeleton className="w-full h-11 rounded-lg bg-muted-foreground" />
						</div>

						{/* Application Deadline */}
						<div>
							<Skeleton className="h-3 w-32 mb-1.5 bg-muted-foreground" />
							<Skeleton className="w-full h-11 rounded-lg bg-muted-foreground" />
						</div>
					</div>

					{/* Eligibility Criteria Skeleton */}
					<div>
						<Skeleton className="h-3 w-28 mb-1.5 bg-muted-foreground" />
						<Skeleton className="w-full h-11 rounded-lg bg-muted-foreground" />
						<div className="flex flex-wrap gap-2 mt-3">
							<Skeleton className="h-8 w-24 rounded-md bg-muted-foreground" />
							<Skeleton className="h-8 w-32 rounded-md bg-muted-foreground" />
							<Skeleton className="h-8 w-28 rounded-md bg-muted-foreground" />
						</div>
					</div>

					{/* Required Documents Skeleton */}
					<div>
						<Skeleton className="h-3 w-32 mb-1.5 bg-muted-foreground" />
						<Skeleton className="w-full h-11 rounded-lg bg-muted-foreground" />
						<div className="flex flex-wrap gap-2 mt-3">
							<Skeleton className="h-8 w-28 rounded-md bg-muted-foreground" />
							<Skeleton className="h-8 w-32 rounded-md bg-muted-foreground" />
						</div>
					</div>

					{/* Application Form Skeleton */}
					<div>
						<Skeleton className="h-4 w-32 mb-2 bg-muted-foreground" />
						<Skeleton className="h-3 w-64 mb-3 bg-muted-foreground" />
						<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />
					</div>

					{/* Save Button Skeleton */}
					<Skeleton className="w-full h-12 rounded-lg bg-muted" />
				</div>
			</div>
		</div>
	);
}
