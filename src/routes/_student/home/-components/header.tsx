import type { JSX } from "react";
import { FilterType } from "../-model";
import { Link } from "@tanstack/react-router";

export function HomeHeader(): JSX.Element {
	const filters: { key: FilterType; label: string }[] = [
		{ key: FilterType.All, label: "All" },
		{ key: FilterType.Applied, label: "Applied" },
		{ key: FilterType.Past, label: "Past" },
		{ key: FilterType.Granted, label: "Granted" },
	];

	return (
		<header className="flex items-center justify-between gap-4">
			<div>
				<h1 className="text-2xl md:text-3xl text-primary">Applications</h1>
			</div>

			<div className="flex items-center gap-3 relative rounded-md bg-[#3A52A6] p-0.75 shadow-sm border border-[#4F63C4]">
				{filters.map((filter) => {
					return (
						<Link
							to="/home"
							search={{ status: filter.key }}
							key={filter.key}
							type="button"
							className="relative px-3 md:px-4 py-1.5 rounded-sm transition-all text-[#E5E7EB]/80 hover:text-tertiary text-xs md:text-sm"
							activeProps={{
								className: "bg-[#607EF2] text-tertiary shadow-md",
							}}
						>
							<span>{filter.label}</span>
						</Link>
					);
				})}
			</div>
		</header>
	);
}
