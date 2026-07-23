import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface ScholarshipCardSkeletonProps {
	index?: number;
}

export default function ScholarshipCardSkeleton({
	index = 0,
}: ScholarshipCardSkeletonProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.4,
				delay: index * 0.05,
				ease: [0.25, 0.1, 0.25, 1],
			}}
			className="bg-white rounded-md border border-[#D3DCF6] relative shadow-sm overflow-hidden"
		>
			{/* Kebab (three-dots) menu */}
			<Skeleton className="w-7 h-7 rounded-full absolute top-2 right-2 z-10 bg-muted-foreground" />

			{/* Header */}
			<div className="flex">
				<div className="w-32 h-32 shrink-0 overflow-hidden">
					<Skeleton className="w-full h-full rounded-none bg-muted-foreground" />
				</div>

				<div className="flex-1 px-4 py-2 pr-9">
					<Skeleton className="h-5 w-3/4 mb-2 bg-muted-foreground" />

					<div className="flex flex-wrap gap-2 mb-3">
						<Skeleton className="h-5 w-20 bg-muted-foreground rounded" />
						<Skeleton className="h-5 w-16 bg-muted-foreground rounded" />
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center gap-2">
							<Skeleton className="w-4 h-4 rounded-full bg-muted-foreground" />
							<Skeleton className="h-3 w-24 bg-muted-foreground" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
							<Skeleton className="h-3 w-32 bg-muted-foreground" />
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-4">
				<div className="grid grid-cols-3 gap-3 mb-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={`stat-${i}`}
							className="bg-[#F9FAFB] border border-border rounded-lg p-3"
						>
							<div className="flex items-center gap-1.5 mb-1">
								<Skeleton className="w-4 h-4 rounded bg-muted-foreground" />
								<Skeleton className="h-3 w-12 bg-muted-foreground" />
							</div>
							<Skeleton className="h-5 w-14 mb-1 bg-muted-foreground" />
							<Skeleton className="h-3 w-16 bg-muted-foreground" />
						</div>
					))}
				</div>

				{/* Action Buttons */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
					<Skeleton className="h-9 w-full rounded-md bg-muted-foreground" />
					<Skeleton className="h-9 w-full rounded-md bg-muted-foreground" />
					<Skeleton className="h-9 w-full rounded-md bg-muted-foreground" />
				</div>
			</div>
		</motion.div>
	);
}
