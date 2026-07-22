import { Skeleton } from "@/components/ui/skeleton";
import ApplicationCardSkeleton from "./ApplicationCardSkeleton";
import type { JSX } from "react";

type Props = {
	index: number;
};

export function HomeSkeleton(props: Props): JSX.Element {
	return (
		<div className="flex gap-4 md:gap-6">
			{/* Desktop: Date/Time */}
			<div className="hidden md:flex gap-4">
				<div className="flex flex-col items-start w-30 shrink-0 pt-1">
					<div className="text-left space-y-1">
						<Skeleton className="h-4 w-30 bg-muted-foreground" />
						<Skeleton className="h-3 w-20 bg-muted-foreground" />
					</div>
				</div>

				{/* Timeline dot and line */}
				<div className="relative flex flex-col items-center pt-1">
					<div className="w-3 h-3 rounded-full mr-px bg-[#3A52A6] shadow-[0_0_0_4px_rgba(63,81,181,0.22)] z-10" />
					<div
						className={`w-px flex-1 border-l border-dashed border-[#3A52A6]/60 ${
							props.index === 3 ? "opacity-70" : ""
						}`}
					/>
				</div>
			</div>

			{/* Mobile/Tablet */}
			<div className="md:hidden relative flex flex-col items-center pt-1">
				<div className="w-3 h-3 rounded-full bg-[#3A52A6] shadow-[0_0_0_4px_rgba(63,81,181,0.22)] z-10" />
				<div
					className={`mt-1 w-px flex-1 border-l border-dashed border-[#3A52A6]/60 ${
						props.index === 3 ? "opacity-70" : ""
					}`}
				/>
			</div>

			{/* Card column */}
			<div className="flex-1 mb-3">
				{/* Mobile/Tablet: Date/Time */}
				<div className="md:hidden mb-2 text-left space-y-1">
					<Skeleton className="h-3 w-28 bg-muted-foreground" />
					<Skeleton className="h-[11px] w-16 bg-muted-foreground" />
				</div>

				<ApplicationCardSkeleton index={props.index} />
			</div>
		</div>
	);
}
