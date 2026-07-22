import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicationCardSkeletonProps {
	index?: number;
}

export default function ApplicationCardSkeleton({
	index = 0,
}: ApplicationCardSkeletonProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
			className="overflow-hidden rounded-lg bg-white shadow-sm border border-[#E0ECFF]"
		>
			{/* Header */}
			<div className="flex">
				<div className="relative w-28 sm:w-32 min-h-28 sm:min-h-32 shrink-0 overflow-hidden">
					<Skeleton className="absolute inset-0 rounded-none bg-muted-foreground" />
				</div>

				<div className="flex-1 px-3 py-2">
					<div className="flex items-start justify-between gap-2">
						<div className="space-y-1 flex-1 min-w-0">
							<Skeleton className="h-5 w-3/4 bg-muted-foreground" />

							<div className="flex flex-wrap gap-1 mt-1 mb-3">
								<Skeleton className="h-4 w-20 rounded bg-muted-foreground" />
								<Skeleton className="h-4 w-16 rounded bg-muted-foreground" />
							</div>

							<div className="space-y-1.5">
								<div className="flex items-center gap-2">
									<Skeleton className="w-4 h-4 rounded-full bg-muted-foreground" />
									<Skeleton className="h-3 w-24 bg-muted-foreground" />
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
									<Skeleton className="h-3 w-28 bg-muted-foreground" />
								</div>
							</div>
						</div>

						<Skeleton className="w-5 h-5 rounded-full shrink-0 mt-1 bg-muted-foreground" />
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="p-4 space-y-2">
				<div className="grid grid-cols-2 gap-2">
					<div className="rounded-lg border border-border bg-[#F9FAFB] p-3">
						<div className="mb-1 flex items-center gap-1.5">
							<Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
							<Skeleton className="h-3 w-12 bg-muted-foreground" />
						</div>
						<Skeleton className="h-4 w-20 mb-1 bg-muted-foreground" />
						<Skeleton className="h-3 w-16 bg-muted-foreground" />
					</div>

					<div className="rounded-lg border border-border bg-[#F9FAFB] p-3">
						<div className="mb-1 flex items-center gap-1.5">
							<Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
							<Skeleton className="h-3 w-10 bg-muted-foreground" />
						</div>
						<Skeleton className="h-4 w-12 mb-1 bg-muted-foreground" />
						<Skeleton className="h-3 w-16 bg-muted-foreground" />
					</div>
				</div>

				<div className="flex gap-2">
					<Skeleton className="h-10 flex-1 rounded-lg bg-muted-foreground" />
					<Skeleton className="h-10 flex-1 rounded-lg bg-muted-foreground" />
				</div>
			</div>
		</motion.div>
	);
}
