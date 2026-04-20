import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useAuth } from "@/auth";
import { adminUsersQueryOptions, adminDashboardQueryOptions } from "@/lib/admin/queries";
import UserTable from "@/components/admin/UserTable";
import { LocalTimeClock } from "@/components/landing/LocalTimeClock";
import { Search, Users, ShieldCheck, GraduationCap, HeartHandshake } from "lucide-react";
import type { UserListQuery } from "@/lib/admin/model";

export const Route = createFileRoute("/_admin/users-management")({
	component: AdminUsers,
});

function AdminUsers() {
	const auth = useAuth();
	const token = auth.sessionToken;

	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [role, setRole] = useState<UserListQuery["role"]>(undefined);
	const [sortBy, setSortBy] = useState("created_at");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [page, setPage] = useState(1);

	const params: UserListQuery = {
		page,
		limit: 20,
		role,
		search: debouncedSearch || undefined,
		sortBy: sortBy as UserListQuery["sortBy"],
		sortOrder,
	};

	const { data, isLoading } = useQuery(adminUsersQueryOptions(token, params));
	const { data: metrics } = useQuery(adminDashboardQueryOptions(token));

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
	const handleSearchChange = (value: string) => {
		setSearch(value);
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}
		searchTimeoutRef.current = setTimeout(() => {
			setDebouncedSearch(value);
			setPage(1);
		}, 400);
	};

	const handleSort = (column: string) => {
		if (column === sortBy) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortOrder("desc");
		}
		setPage(1);
	};

	const handleRoleChange = (value: string) => {
		setRole(value === "all" ? undefined : (value as UserListQuery["role"]));
		setPage(1);
	};

	return (
		<div className="space-y-6">
			<div className="relative overflow-hidden rounded-3xl border border-[#D7E5FF] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF5FF_54%,#FFFFFF_100%)] px-6 py-6 shadow-[0_26px_60px_-36px_rgba(58,82,166,0.45)] sm:px-8 sm:py-7">
				<div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/60 blur-2xl" />
				<div className="absolute bottom-0 right-0 h-20 w-32 rounded-tl-[80px] bg-[#EAF2FF]" />
				<div className="relative flex flex-col gap-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<h1 className="text-3xl tracking-tight text-primary sm:text-[2.2rem]">
							User Management
						</h1>
						<LocalTimeClock compact />
					</div>

					<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
						<div className="rounded-xl border border-white/70 bg-white/92 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Visible users
									</p>
									<p className="mt-2 text-2xl text-primary">
										{data?.total ?? "--"}
									</p>
								</div>
								<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D9E7FF] bg-[#F3F8FF]">
									<Users className="h-4 w-4 text-[#3A52A6]" />
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/70 bg-white/92 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Students
									</p>
									<p className="mt-2 text-2xl text-primary">
										{metrics?.studentCount ?? "--"}
									</p>
								</div>
								<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D9E7FF] bg-[#F3F8FF]">
									<GraduationCap className="mt-1 h-4 w-4 text-[#4B63B4]" />
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/70 bg-white/92 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Sponsors
									</p>
									<p className="mt-2 text-2xl text-primary">
										{metrics?.sponsorCount ?? "--"}
									</p>
								</div>
								<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D9E7FF] bg-[#F3F8FF]">
									<HeartHandshake className="mt-1 h-4 w-4 text-[#5B67C2]" />
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/70 bg-white/92 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Admins
									</p>
									<p className="mt-2 text-2xl">
										{metrics?.adminCount ?? "--"}
									</p>
								</div>
								<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D9E7FF] bg-[#F3F8FF]">
									<ShieldCheck className="mt-1 h-4 w-4 text-[#5B67C2]" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-[#D8E6FF] bg-white/95 p-4 shadow-[0_18px_45px_-32px_rgba(58,82,166,0.4)]">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<h2 className="text-base text-primary">Filters</h2>
						<p className="text-sm text-[#6B7280]">
							Search the directory and narrow the role view.
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<div className="relative flex-1 sm:min-w-[260px]">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
							<input
								type="text"
								placeholder="Search by email..."
								value={search}
								onChange={(e) => handleSearchChange(e.target.value)}
								className="w-full rounded-lg border border-[#D3DCF6] bg-[#FBFDFF] py-2.5 pl-10 pr-4 text-sm text-primary placeholder-[#9CA3AF] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3A52A6]"
							/>
						</div>

						<select
							value={role || "all"}
							onChange={(e) => handleRoleChange(e.target.value)}
							className="w-full rounded-lg border border-[#D3DCF6] bg-[#FBFDFF] px-4 py-2.5 text-sm text-primary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3A52A6] sm:w-auto"
						>
							<option value="all">All Roles</option>
							<option value="student">Student</option>
							<option value="sponsor">Sponsor</option>
							<option value="admin">Admin</option>
						</select>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="h-96 animate-pulse rounded-4xl border border-[#E0ECFF] bg-white" />
			) : data ? (
				<UserTable
					data={data}
					sortBy={sortBy}
					sortOrder={sortOrder}
					onSort={handleSort}
					onPageChange={setPage}
				/>
			) : (
				<div className="rounded-4xl border border-[#E0ECFF] bg-white p-10 text-center text-sm text-[#9CA3AF]">
					Failed to load users
				</div>
			)}
		</div>
	);
}
