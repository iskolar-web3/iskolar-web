import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { UserListItem, PaginatedResponse } from "@/lib/admin/model";
import { format } from "date-fns";

interface UserTableProps {
	data: PaginatedResponse<UserListItem>;
	sortBy: string;
	sortOrder: "asc" | "desc";
	onSort: (column: string) => void;
	onPageChange: (page: number) => void;
}

function RoleBadge({ code, name }: { code: string | null; name: string | null }) {
	if (!code || !name) {
		return (
			<span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
				No role
			</span>
		);
	}

	const colors: Record<string, string> = {
		student: "bg-blue-50 text-blue-700",
		sponsor: "bg-purple-50 text-purple-700",
		admin: "bg-amber-50 text-amber-700",
	};

	return (
		<span
			className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[code] || "bg-gray-100 text-gray-600"}`}
		>
			{name}
		</span>
	);
}

function StatusBadge({ code, name }: { code: string; name: string }) {
	const colors: Record<string, string> = {
		active: "bg-green-50 text-green-700",
		inactive: "bg-gray-100 text-gray-600",
		suspended: "bg-red-50 text-red-700",
	};

	return (
		<span
			className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[code] || "bg-gray-100 text-gray-600"}`}
		>
			{name}
		</span>
	);
}

function SortIcon({
	column,
	sortBy,
	sortOrder,
}: { column: string; sortBy: string; sortOrder: string }) {
	if (column !== sortBy) {
		return (
			<ChevronUp className="w-3 h-3 text-[#D1D5DB]" />
		);
	}
	return sortOrder === "asc" ? (
		<ChevronUp className="w-3 h-3 text-[#3A52A6]" />
	) : (
		<ChevronDown className="w-3 h-3 text-[#3A52A6]" />
	);
}

export default function UserTable({
	data,
	sortBy,
	sortOrder,
	onSort,
	onPageChange,
}: UserTableProps) {
	const columns = [
		{ key: "email", label: "Email", sortable: true },
		{ key: "role", label: "Role", sortable: false },
		{ key: "status", label: "Status", sortable: false },
		{ key: "created_at", label: "Signup Date", sortable: true },
		{ key: "last_login_at", label: "Last Activity", sortable: true },
	];

	return (
		<div className="bg-white rounded-xl border border-[#E0ECFF] overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-[#E0ECFF]">
							{columns.map((col) => (
								<th
									key={col.key}
									className={`px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider ${
										col.sortable
											? "cursor-pointer select-none hover:text-primary"
											: ""
									}`}
									onClick={col.sortable ? () => onSort(col.key) : undefined}
								>
									<div className="flex items-center gap-1">
										{col.label}
										{col.sortable && (
											<SortIcon
												column={col.key}
												sortBy={sortBy}
												sortOrder={sortOrder}
											/>
										)}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F0F7FF]">
						{data.items.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-5 py-10 text-center text-sm text-[#9CA3AF]"
								>
									No users found
								</td>
							</tr>
						) : (
							data.items.map((user) => (
								<tr
									key={user.id}
									className="hover:bg-[#F0F7FF] transition-colors"
								>
									<td className="px-5 py-3.5 text-sm text-primary">
										{user.email}
									</td>
									<td className="px-5 py-3.5">
										<RoleBadge code={user.roleCode} name={user.roleName} />
									</td>
									<td className="px-5 py-3.5">
										<StatusBadge
											code={user.statusCode}
											name={user.statusName}
										/>
									</td>
									<td className="px-5 py-3.5 text-sm text-[#6B7280]">
										{format(new Date(user.createdAt), "MMM d, yyyy")}
									</td>
									<td className="px-5 py-3.5 text-sm text-[#6B7280]">
										{format(new Date(user.lastLoginAt), "MMM d, yyyy")}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{data.totalPages > 1 && (
				<div className="flex items-center justify-between px-5 py-3 border-t border-[#E0ECFF]">
					<p className="text-xs text-[#9CA3AF]">
						Showing {(data.page - 1) * data.limit + 1} to{" "}
						{Math.min(data.page * data.limit, data.total)} of {data.total} users
					</p>
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => onPageChange(data.page - 1)}
							disabled={data.page <= 1}
							className="p-1.5 rounded-md hover:bg-[#F0F7FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronLeft className="w-4 h-4 text-[#6B7280]" />
						</button>
						{Array.from({ length: data.totalPages }, (_, i) => i + 1)
							.filter(
								(p) =>
									p === 1 ||
									p === data.totalPages ||
									Math.abs(p - data.page) <= 1,
							)
							.map((p, idx, arr) => {
								const prev = arr[idx - 1];
								const showEllipsis = prev !== undefined && p - prev > 1;
								return (
									<span key={p} className="flex items-center">
										{showEllipsis && (
											<span className="px-1 text-xs text-[#9CA3AF]">...</span>
										)}
										<button
											type="button"
											onClick={() => onPageChange(p)}
											className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
												p === data.page
													? "bg-[#3A52A6] text-white"
													: "text-[#6B7280] hover:bg-[#F0F7FF]"
											}`}
										>
											{p}
										</button>
									</span>
								);
							})}
						<button
							type="button"
							onClick={() => onPageChange(data.page + 1)}
							disabled={data.page >= data.totalPages}
							className="p-1.5 rounded-md hover:bg-[#F0F7FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							<ChevronRight className="w-4 h-4 text-[#6B7280]" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
