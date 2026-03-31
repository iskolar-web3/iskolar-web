import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useAuth } from "@/auth";
import { adminUsersQueryOptions } from "@/lib/admin/queries";
import UserTable from "@/components/admin/UserTable";
import { Search } from "lucide-react";
import type { UserListQuery } from "@/lib/admin/model";

export const Route = createFileRoute("/_admin/users")({
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
		<div>
			<div className="mb-6">
				<h1 className="text-xl text-primary">User Management</h1>
				<p className="text-sm text-[#6B7280] mt-1">
					View and filter registered users
				</p>
			</div>

			<div className="flex flex-col sm:flex-row gap-3 mb-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
					<input
						type="text"
						placeholder="Search by email..."
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#D3DCF6] text-sm text-primary placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent bg-white"
					/>
				</div>

				<select
					value={role || "all"}
					onChange={(e) => handleRoleChange(e.target.value)}
					className="px-3 py-2 rounded-lg border border-[#D3DCF6] text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
				>
					<option value="all">All Roles</option>
					<option value="student">Student</option>
					<option value="sponsor">Sponsor</option>
					<option value="admin">Admin</option>
				</select>
			</div>

			{isLoading ? (
				<div className="bg-white rounded-xl border border-[#E0ECFF] p-5 h-96 animate-pulse" />
			) : data ? (
				<UserTable
					data={data}
					sortBy={sortBy}
					sortOrder={sortOrder}
					onSort={handleSort}
					onPageChange={setPage}
				/>
			) : (
				<div className="bg-white rounded-xl border border-[#E0ECFF] p-10 text-center text-sm text-[#9CA3AF]">
					Failed to load users
				</div>
			)}
		</div>
	);
}
