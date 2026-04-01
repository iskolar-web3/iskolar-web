import {
	ChevronUp,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Mail,
	Clock3,
	CalendarDays,
} from "lucide-react";
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
			<span className="inline-flex rounded-full border border-[#E5ECFA] bg-[#F7FAFF] px-2.5 py-1 text-xs text-[#7C879C]">
				No role
			</span>
		);
	}

	const colors: Record<string, string> = {
		student: "border-[#D8E6FF] bg-[#EFF5FF] text-[#3659A8]",
		sponsor: "border-[#DDE1FF] bg-[#F2F3FF] text-[#4D57B8]",
		admin: "border-[#DFE6F5] bg-[#F4F7FC] text-[#4A5B7C]",
	};

	return (
		<span
			className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${colors[code] || "border-[#E5ECFA] bg-[#F7FAFF] text-[#7C879C]"}`}
		>
			{name}
		</span>
	);
}

function StatusBadge({ code, name }: { code: string; name: string }) {
	const colors: Record<string, string> = {
		active: "border-[#CBEBDD] bg-[#F0FBF5] text-[#1F7A52]",
		inactive: "border-[#E0E8F5] bg-[#F5F8FC] text-[#637189]",
		suspended: "border-[#F2D3DA] bg-[#FFF4F6] text-[#B14866]",
	};

	return (
		<span
			className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${colors[code] || "border-[#E0E8F5] bg-[#F5F8FC] text-[#637189]"}`}
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
		<div className="overflow-hidden rounded-3xl border border-[#D8E6FF] bg-white shadow-[0_24px_55px_-38px_rgba(58,82,166,0.45)]">
			<div className="border-b border-[#E7F0FF] bg-[linear-gradient(180deg,#FCFDFF_0%,#F6FAFF_100%)] px-6 py-4">
				<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-base text-primary">Registered users</h2>
					</div>
					<p className="text-xs uppercase tracking-[0.18em] text-[#8CA2D6]">
						{data.total} total users
					</p>
				</div>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-[#E7F0FF] bg-[#FBFDFF]">
							{columns.map((col) => (
								<th
									key={col.key}
									className={`px-6 py-4 text-left text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6] ${
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
					<tbody className="divide-y divide-[#EEF4FF]">
						{data.items.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-6 py-14 text-center text-sm text-[#9CA3AF]"
								>
									No users found
								</td>
							</tr>
						) : (
							data.items.map((user) => (
								<tr
									key={user.id}
									className="transition-colors hover:bg-[#F7FAFF]"
								>
									<td className="px-6 py-4 text-sm text-primary">
										<div className="flex min-w-[240px] items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D9E7FF] bg-[#F3F8FF]">
												<Mail className="h-4 w-4 text-[#3A52A6]" />
											</div>
											<div className="min-w-0">
												<p className="truncate text-primary">
													{user.email}
												</p>
												<p className="text-xs text-[#8A94A8]">User account</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<RoleBadge code={user.roleCode} name={user.roleName} />
									</td>
									<td className="px-6 py-4">
										<StatusBadge
											code={user.statusCode}
											name={user.statusName}
										/>
									</td>
									<td className="px-6 py-4 text-sm text-[#6B7280]">
										<div className="flex items-center gap-2">
											<CalendarDays className="h-4 w-4 text-[#9CB0D9]" />
											<div>
												<p>{format(new Date(user.createdAt), "MMM d, yyyy")}</p>
												<p className="text-xs text-[#9AA5BA]">
													{format(new Date(user.createdAt), "p")}
												</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 text-sm text-[#6B7280]">
										<div className="flex items-center gap-2">
											<Clock3 className="h-4 w-4 text-[#9CB0D9]" />
											<div>
												<p>{format(new Date(user.lastLoginAt), "MMM d, yyyy")}</p>
												<p className="text-xs text-[#9AA5BA]">
													{format(new Date(user.lastLoginAt), "p")}
												</p>
											</div>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{data.totalPages > 1 && (
				<div className="flex flex-col gap-3 border-t border-[#E7F0FF] bg-[#FBFDFF] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-xs text-[#8A94A8]">
						Showing {(data.page - 1) * data.limit + 1} to{" "}
						{Math.min(data.page * data.limit, data.total)} of {data.total} users
					</p>
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => onPageChange(data.page - 1)}
							disabled={data.page <= 1}
							className="rounded-xl p-2 transition-colors hover:bg-[#EEF5FF] disabled:cursor-not-allowed disabled:opacity-40"
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
											className={`h-9 w-9 rounded-xl text-xs transition-colors ${
												p === data.page
													? "bg-[#3A52A6] text-white shadow-[0_14px_28px_-18px_rgba(58,82,166,0.8)]"
													: "text-[#6B7280] hover:bg-[#EEF5FF]"
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
							className="rounded-xl p-2 transition-colors hover:bg-[#EEF5FF] disabled:cursor-not-allowed disabled:opacity-40"
						>
							<ChevronRight className="w-4 h-4 text-[#6B7280]" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
