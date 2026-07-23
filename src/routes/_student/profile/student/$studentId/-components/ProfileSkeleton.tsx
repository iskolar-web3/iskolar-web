import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { JSX } from "react";

const verificationEnabled =
	import.meta.env.VITE_ENABLE_IDENTITY_VERIFICATION === "true";
const credentialsEnabled =
	import.meta.env.VITE_ENABLE_LUMEN_CREDENTIALS === "true";

export default function ProfileSkeleton(): JSX.Element {
	return (
		<div className="min-h-screen">
			<div className="max-w-2xl mx-auto space-y-4">
				{/* Profile Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="bg-card rounded-lg shadow-sm border border-[#E0ECFF] overflow-hidden"
				>
					<div className="px-6 pb-6">
						<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mt-6">
							<div className="flex flex-col md:flex-row items-center md:items-start gap-6">
								<Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-full flex-shrink-0 bg-muted-foreground" />
								<div className="flex-1 text-center md:text-left mt-4 md:mt-6">
									<div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
										<Skeleton className="h-7 w-40 mx-auto md:mx-0 bg-muted-foreground" />
										<Skeleton className="h-6 w-24 rounded-md mx-auto md:mx-0 bg-muted-foreground" />
									</div>
									<div className="space-y-2 flex flex-col items-center md:items-start">
										<Skeleton className="h-4 w-48 bg-muted-foreground" />
										<Skeleton className="h-4 w-40 bg-muted-foreground" />
									</div>
								</div>
							</div>
							{verificationEnabled && (
								<div className="hidden md:block shrink-0 mt-6">
									<Skeleton className="h-7 w-28 rounded-md bg-muted-foreground" />
								</div>
							)}
						</div>
					</div>
				</motion.div>

				{/* Personal Information */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					className="bg-white rounded-lg shadow-sm border border-[#E0ECFF] p-6"
				>
					<div className="flex items-center justify-between mb-4">
						<Skeleton className="h-5 w-40 bg-muted-foreground" />
						<Skeleton className="h-8 w-8 rounded-sm bg-muted-foreground" />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
						{Array.from({ length: 8 }).map((_, index) => (
							<div key={`personal-field-${index}`}>
								<Skeleton className="h-3 w-20 mb-1.5 bg-muted-foreground" />
								<Skeleton className="h-10 w-full rounded-sm bg-muted-foreground" />
							</div>
						))}
					</div>
				</motion.div>

				{/* Credentials */}
				{credentialsEnabled && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.3 }}
						className="bg-white rounded-lg shadow-sm border border-[#E0ECFF] p-6"
					>
						<div className="flex items-center justify-between mb-6">
							<Skeleton className="h-5 w-28 bg-muted-foreground" />
							<Skeleton className="h-9 w-36 rounded-sm bg-muted-foreground" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-14 w-full rounded-lg bg-muted-foreground" />
							<Skeleton className="h-14 w-full rounded-lg bg-muted-foreground" />
						</div>
					</motion.div>
				)}

				{/* Payment Method */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.4 }}
					className="bg-white rounded-lg shadow-sm border border-[#E0ECFF] p-6"
				>
					<div className="flex items-center justify-between mb-4">
						<Skeleton className="h-5 w-36 bg-muted-foreground" />
						<Skeleton className="h-8 w-8 rounded-sm bg-muted-foreground" />
					</div>
					<div className="grid grid-cols-1 gap-4 md:gap-6">
						{Array.from({ length: 3 }).map((_, index) => (
							<div key={`payment-field-${index}`}>
								<Skeleton className="h-3 w-24 mb-1.5 bg-muted-foreground" />
								<Skeleton className="h-10 w-full rounded-sm bg-muted-foreground" />
							</div>
						))}
					</div>
				</motion.div>
			</div>
		</div>
	);
}
