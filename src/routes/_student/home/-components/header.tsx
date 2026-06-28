import type { JSX } from "react";
import { FilterType } from "../-model";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

export function HomeHeader(): JSX.Element {
	const filters: { key: FilterType; label: string }[] = [
		{ key: FilterType.All, label: "All" },
		{ key: FilterType.Applied, label: "Applied" },
		{ key: FilterType.Past, label: "Past" },
		{ key: FilterType.Granted, label: "Granted" },
	];

	const search = useSearch({ from: "/_student/home/" });
	const navigate = useNavigate({ from: "/home/" });
	const activeLabel = filters.find((f) => f.key === search.status)?.label ?? "All";

	return (
		<header className="flex items-center justify-between gap-4">
			<div>
				<h1 className="text-2xl md:text-3xl text-primary">Applications</h1>
			</div>

			{/* Mobile: dropdown */}
			<div className="relative md:hidden">
				<select
					value={search.status}
					onChange={(e) =>
						navigate({ search: { status: e.target.value as FilterType } })
					}
					className="appearance-none cursor-pointer rounded-md bg-[#3A52A6] border border-[#4F63C4] text-tertiary text-sm pl-3 pr-8 py-1.5 shadow-sm focus:outline-none"
				>
					{filters.map((filter) => (
						<option key={filter.key} value={filter.key} className="bg-[#3A52A6]">
							{filter.label}
						</option>
					))}
				</select>
				<ChevronDown
					size={14}
					className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-tertiary"
				/>
				<span className="sr-only">Filter: {activeLabel}</span>
			</div>

			{/* Desktop: tabs */}
			<div className="hidden md:flex items-center gap-3 relative rounded-md bg-[#3A52A6] p-0.75 shadow-sm border border-[#4F63C4]">
				{filters.map((filter) => (
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
				))}
			</div>
		</header>
	);
}
