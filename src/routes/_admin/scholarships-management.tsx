import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useAuth } from "@/auth";
import { adminScholarshipsQueryOptions } from "@/lib/admin/queries";
import { LocalTimeClock } from "@/components/landing/LocalTimeClock";
import { Search, GraduationCap, BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import { ScholarshipStatus, ScholarshipType, type Scholarship } from "@/lib/scholarship/model";
import { getSponsorName } from "@/lib/sponsor/api";
import AdminScholarshipDetailDrawer from "./-components/AdminScholarshipDetailDrawer";

export const Route = createFileRoute("/_admin/scholarships-management")({
	component: AdminScholarships,
});

const STATUS_STYLES: Record<string, string> = {
	[ScholarshipStatus.Active]: "bg-emerald-50 text-emerald-700 border border-emerald-200",
	[ScholarshipStatus.Draft]: "bg-gray-100 text-gray-600 border border-gray-200",
	[ScholarshipStatus.Inactive]: "bg-yellow-50 text-yellow-700 border border-yellow-200",
	[ScholarshipStatus.Closed]: "bg-red-50 text-red-600 border border-red-200",
	[ScholarshipStatus.Suspended]: "bg-orange-50 text-orange-700 border border-orange-200",
	[ScholarshipStatus.Archived]: "bg-slate-100 text-slate-500 border border-slate-200",
};

const TYPE_STYLES: Record<string, string> = {
	[ScholarshipType.MeritBased]: "bg-blue-50 text-blue-700 border border-blue-200",
	[ScholarshipType.NeedBased]: "bg-violet-50 text-violet-700 border border-violet-200",
	[ScholarshipType.Combined]: "bg-indigo-50 text-indigo-700 border border-indigo-200",
};

function formatDeadline(date: Date) {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatAmount(s: Scholarship) {
	if (s.totalAmount) return `₱${s.totalAmount.toLocaleString()}`;
	if (s.totalAmountMin && s.totalAmountMax)
		return `₱${s.totalAmountMin.toLocaleString()}–₱${s.totalAmountMax.toLocaleString()}`;
	return "—";
}

function AdminScholarships() {
	const auth = useAuth();
	const token = auth.sessionToken;

	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

	const { data, isLoading } = useQuery(
		adminScholarshipsQueryOptions(token, {
			search: debouncedSearch || undefined,
		}),
	);

	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
	const handleSearchChange = (value: string) => {
		setSearch(value);
		if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
		searchTimeoutRef.current = setTimeout(() => {
			setDebouncedSearch(value);
		}, 400);
	};

	const filtered =
		data?.filter(
			(s) => statusFilter === "all" || s.status.code === statusFilter,
		) ?? [];

	const activeCount =
		data?.filter((s) => s.status.code === ScholarshipStatus.Active).length ?? 0;
	const draftCount =
		data?.filter((s) => s.status.code === ScholarshipStatus.Draft).length ?? 0;

	return (
		<div className="space-y-6">
			{/* Header panel */}
			<div className="relative overflow-hidden rounded-3xl border border-[#D7E5FF] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF5FF_54%,#FFFFFF_100%)] px-6 py-6 shadow-[0_26px_60px_-36px_rgba(58,82,166,0.45)] sm:px-8 sm:py-7">
				<div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/60 blur-2xl" />
				<div className="absolute bottom-0 right-0 h-20 w-32 rounded-tl-[80px] bg-[#EAF2FF]" />
				<div className="relative flex flex-col gap-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<h1 className="text-3xl tracking-tight text-primary sm:text-[2.2rem]">
							Scholarships
						</h1>
						<LocalTimeClock compact />
					</div>

					<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
						<div className="rounded-xl border border-white/70 bg-white/92 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Total
									</p>
									<p className="mt-2 text-2xl text-primary">
										{data?.length ?? "--"}
									</p>
								</div>
								<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D9E7FF] bg-[#F3F8FF]">
									<BookOpen className="h-4 w-4 text-[#3A52A6]" />
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/70 bg-white/92 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Active
									</p>
									<p className="mt-2 text-2xl text-primary">{activeCount}</p>
								</div>
								<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D9E7FF] bg-[#F3F8FF]">
									<CheckCircle2 className="h-4 w-4 text-emerald-600" />
								</div>
							</div>
						</div>
						<div className="rounded-xl border border-white/70 bg-white/92 p-4 shadow-[0_16px_35px_-28px_rgba(58,82,166,0.7)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Drafts
									</p>
									<p className="mt-2 text-2xl text-primary">{draftCount}</p>
								</div>
								<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#D9E7FF] bg-[#F3F8FF]">
									<GraduationCap className="h-4 w-4 text-[#4B63B4]" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="rounded-2xl border border-[#D8E6FF] bg-white/95 p-4 shadow-[0_18px_45px_-32px_rgba(58,82,166,0.4)]">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<h2 className="text-base text-primary">Filters</h2>
						<p className="text-sm text-[#6B7280]">Search and narrow by status.</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<div className="relative flex-1 sm:min-w-[260px]">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
							<input
								type="text"
								placeholder="Search by name..."
								value={search}
								onChange={(e) => handleSearchChange(e.target.value)}
								className="w-full rounded-lg border border-[#D3DCF6] bg-[#FBFDFF] py-2.5 pl-10 pr-4 text-sm text-primary placeholder-[#9CA3AF] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3A52A6]"
							/>
						</div>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full rounded-lg border border-[#D3DCF6] bg-[#FBFDFF] px-4 py-2.5 text-sm text-primary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3A52A6] sm:w-auto"
						>
							<option value="all">All Statuses</option>
							<option value={ScholarshipStatus.Active}>Active</option>
							<option value={ScholarshipStatus.Draft}>Draft</option>
							<option value={ScholarshipStatus.Inactive}>Inactive</option>
							<option value={ScholarshipStatus.Closed}>Closed</option>
							<option value={ScholarshipStatus.Suspended}>Suspended</option>
							<option value={ScholarshipStatus.Archived}>Archived</option>
						</select>
					</div>
				</div>
			</div>

			{/* Table */}
			{isLoading ? (
				<div className="h-96 animate-pulse rounded-4xl border border-[#E0ECFF] bg-white" />
			) : filtered.length === 0 ? (
				<div className="rounded-4xl border border-[#E0ECFF] bg-white p-10 text-center text-sm text-[#9CA3AF]">
					No scholarships found.
				</div>
			) : (
				<div className="overflow-hidden rounded-2xl border border-[#D8E6FF] bg-white shadow-[0_18px_45px_-32px_rgba(58,82,166,0.4)]">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[#E0ECFF] bg-[#F8FBFF]">
									<th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Scholarship
									</th>
									<th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Sponsor
									</th>
									<th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Status
									</th>
									<th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Type
									</th>
									<th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Applications
									</th>
									<th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Amount
									</th>
									<th className="px-5 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
										Deadline
									</th>
									<th className="px-5 py-3 text-[11px] text-[#8CA2D6]" aria-hidden="true" />
								</tr>
							</thead>
							<tbody className="divide-y divide-[#F0F5FF]">
								{filtered.map((s) => (
									<tr
										key={s.id}
										onClick={() => setSelectedScholarship(s)}
										className="cursor-pointer transition-colors hover:bg-[#EEF5FF] group"
									>
										<td className="px-5 py-3.5">
											<div className="flex items-center gap-3">
												{s.imageUrl ? (
													<img
														src={s.imageUrl}
														alt={s.name}
														className="h-9 w-9 shrink-0 rounded-lg object-cover"
													/>
												) : (
													<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3FF]">
														<GraduationCap className="h-4 w-4 text-[#3A52A6]" />
													</div>
												)}
												<div className="min-w-0">
													<p className="max-w-[200px] truncate font-medium text-primary">
														{s.name}
													</p>
													{s.description && (
														<p className="max-w-[200px] truncate text-xs text-[#9CA3AF]">
															{s.description}
														</p>
													)}
												</div>
											</div>
										</td>
										<td className="px-5 py-3.5">
											<p className="max-w-40 truncate text-primary">
												{getSponsorName(s.sponsor)}
											</p>
											<p className="max-w-40 truncate text-xs text-[#9CA3AF]">
												{s.sponsor.email}
											</p>
										</td>
										<td className="px-5 py-3.5">
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[s.status.code] ?? "bg-gray-100 text-gray-600"}`}
											>
												{s.status.name}
											</span>
										</td>
										<td className="px-5 py-3.5">
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TYPE_STYLES[s.scholarshipType.code] ?? "bg-gray-100 text-gray-600"}`}
											>
												{s.scholarshipType.name}
											</span>
										</td>
										<td className="px-5 py-3.5 text-primary">
											{s.applicationCount}
											{s.totalSlots != null ? (
												<span className="text-[#9CA3AF]">/{s.totalSlots}</span>
											) : (
												<span className="text-[#3A52A6]">/∞</span>
											)}
										</td>
										<td className="px-5 py-3.5 text-primary">{formatAmount(s)}</td>
										<td className="px-5 py-3.5 text-primary">
											{formatDeadline(s.applicationDeadline)}
										</td>
										<td className="px-4 py-3.5">
											<ChevronRight
												size={15}
												className="text-[#C8D9F5] transition-colors group-hover:text-[#3A52A6]"
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="border-t border-[#E0ECFF] px-5 py-3 text-xs text-[#9CA3AF]">
						Showing {filtered.length} of {data?.length ?? 0} scholarships · Click a row to view full details
					</div>
				</div>
			)}

			{/* Detail Drawer */}
			{selectedScholarship && (
				<AdminScholarshipDetailDrawer
					scholarship={selectedScholarship}
					token={token}
					onClose={() => setSelectedScholarship(null)}
				/>
			)}
		</div>
	);
}
