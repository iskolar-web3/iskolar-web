import { Skeleton } from "@/components/ui/skeleton";

export default function EditScholarshipSkeleton() {
	return (
		<div className="min-h-screen">
			<div className="max-w-160 mx-auto">
				<div className="space-y-4">
					{/* Status Skeleton */}
					<Skeleton className="w-full h-12 rounded-lg bg-muted" />

					{/* Type and Purpose Skeleton */}
					<div className="grid grid-cols-2 gap-4">
						<Skeleton className="w-full h-12 rounded-lg bg-muted" />
						<Skeleton className="w-full h-12 rounded-lg bg-muted" />
					</div>

					{/* Image and Form Skeleton */}
					<div className="bg-[#F8F9FC] rounded-xl p-4 shadow-sm">
						<div className="flex flex-col md:flex-row gap-4">
							{/* Image Skeleton */}
							<div className="md:w-[218px]">
								<Skeleton className="w-full aspect-square rounded-lg bg-muted-foreground" />
							</div>

							{/* Form Fields Skeleton */}
							<div className="md:flex-1 space-y-4">
								{/* Title Skeleton */}
								<Skeleton className="h-8 w-full bg-muted-foreground" />

								{/* Description Button Skeleton */}
								<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />

								{/* Amount and Slot Skeleton */}
								<div className="grid grid-cols-2 gap-4">
									<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />
									<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />
								</div>

								{/* Deadline Skeleton */}
								<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />
							</div>
						</div>
					</div>

					{/* Criteria Input Skeleton */}
					<div className="flex gap-2">
						<Skeleton className="flex-1 h-12 rounded-lg bg-muted-foreground" />
						<Skeleton className="w-11 h-11 rounded-lg bg-muted-foreground" />
					</div>
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-8 w-24 rounded-md bg-muted-foreground" />
						<Skeleton className="h-8 w-32 rounded-md bg-muted-foreground" />
						<Skeleton className="h-8 w-28 rounded-md bg-muted-foreground" />
					</div>

					{/* Documents Input Skeleton */}
					<div className="flex gap-2">
						<Skeleton className="flex-1 h-12 rounded-lg bg-muted-foreground" />
						<Skeleton className="w-11 h-11 rounded-lg bg-muted-foreground" />
					</div>
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-8 w-28 rounded-md bg-muted-foreground" />
						<Skeleton className="h-8 w-32 rounded-md bg-muted-foreground" />
					</div>

					{/* Form Fields Skeleton */}
					<div>
						<Skeleton className="h-4 w-32 mb-2 bg-muted-foreground" />
						<Skeleton className="h-3 w-64 mb-3 bg-muted-foreground" />
						<div className="space-y-2">
							<Skeleton className="w-full h-16 rounded-lg bg-muted-foreground" />
							<Skeleton className="w-full h-16 rounded-lg bg-muted-foreground" />
						</div>
						<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground mt-3" />
					</div>

					{/* Save Button Skeleton */}
					<Skeleton className="w-full h-12 rounded-lg bg-muted-foreground" />
				</div>
			</div>
		</div>
	);
}
