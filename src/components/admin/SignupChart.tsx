import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import type { SignupTimelineEntry } from "@/lib/admin/model";
import type { TimeRange } from "@/lib/admin/queries";
import { format } from "date-fns";

interface SignupChartProps {
	data: SignupTimelineEntry[];
	timeRange: TimeRange;
	onTimeRangeChange: (range: TimeRange) => void;
}

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
	{ value: "7d", label: "7 days" },
	{ value: "30d", label: "30 days" },
	{ value: "q1", label: "Q1" },
	{ value: "q2", label: "Q2" },
	{ value: "q3", label: "Q3" },
	{ value: "q4", label: "Q4" },
	{ value: "1y", label: "1 year" },
];

function getRangeTitle(range: TimeRange): string {
	const year = new Date().getFullYear();
	switch (range) {
		case "7d": return "Signups in the last 7 days";
		case "30d": return "Signups in the last 30 days";
		case "q1": return `Signups in Q1 ${year}`;
		case "q2": return `Signups in Q2 ${year}`;
		case "q3": return `Signups in Q3 ${year}`;
		case "q4": return `Signups in Q4 ${year}`;
		case "1y": return "Signups in the last year";
	}
}

function getXAxisInterval(range: TimeRange): number {
	switch (range) {
		case "7d": return 0;
		case "30d": return 4;
		case "q1":
		case "q2":
		case "q3":
		case "q4": return 13;
		case "1y": return 29;
	}
}

export default function SignupChart({ data, timeRange, onTimeRangeChange }: SignupChartProps) {
	const formatted = data.map((entry) => ({
		...entry,
		label: format(new Date(entry.date), "MMM d"),
	}));
	const total = data.reduce((sum, entry) => sum + entry.count, 0);
	const peak = data.reduce<SignupTimelineEntry | null>(
		(currentPeak, entry) =>
			!currentPeak || entry.count > currentPeak.count ? entry : currentPeak,
		null,
	);

	return (
		<div className="relative overflow-hidden rounded-4xl border border-[#D8E6FF] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(58,82,166,0.55)]">
			<div className="absolute -right-16 top-0 h-36 w-36 rounded-full bg-[#EEF4FF]" />
			<div className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-[80px] bg-[#F7FAFF]" />
			<div className="relative mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="text-[11px] uppercase tracking-[0.24em] text-[#8CA2D6]">
						Growth pulse
					</p>
					<h3 className="mt-2 text-lg text-primary">
						{getRangeTitle(timeRange)}
					</h3>
					<p className="mt-1 text-sm text-[#6B7280]">
						A rolling view of how quickly new users are discovering iSkolar.
					</p>
				</div>
				<select
					value={timeRange}
					onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
					className="self-start rounded-xl border border-[#E0ECFF] bg-[#F8FBFF] px-3 py-1.5 text-xs font-medium text-[#6B7280] outline-none focus:border-primary/40 focus:text-primary lg:self-auto"
				>
					{RANGE_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>
			<div className="relative mb-6 flex gap-3">
				<div className="rounded-2xl border border-[#E0ECFF] bg-[#F8FBFF] px-4 py-3">
					<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
						Total
					</p>
					<p className="mt-1 text-xl text-primary">{total}</p>
				</div>
				<div className="rounded-2xl border border-[#E0ECFF] bg-[#F8FBFF] px-4 py-3">
					<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
						Peak day
					</p>
					<p className="mt-1 text-xl text-primary">
						{peak ? peak.count : 0}
					</p>
					{peak ? (
						<p className="text-xs text-[#8A94A8]">
							{format(new Date(peak.date), "MMM d")}
						</p>
					) : null}
				</div>
			</div>
			{data.length === 0 ? (
				<p className="relative py-10 text-center text-sm text-[#9CA3AF]">
					No signup data available
				</p>
			) : (
				<div className="relative rounded-[28px] border border-[#E8F0FF] bg-[linear-gradient(180deg,#FCFDFF_0%,#F6FAFF_100%)] p-4">
					<ResponsiveContainer width="100%" height={280}>
					<AreaChart data={formatted}>
						<defs>
							<linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#3A52A6" stopOpacity={0.22} />
								<stop offset="95%" stopColor="#3A52A6" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="#E3EEFF" vertical={false} />
						<XAxis
							dataKey="label"
							tick={{ fontSize: 12, fill: "#9CA3AF" }}
							axisLine={false}
							tickLine={false}
							interval={getXAxisInterval(timeRange)}
						/>
						<YAxis
							allowDecimals={false}
							tick={{ fontSize: 12, fill: "#9CA3AF" }}
							axisLine={false}
							tickLine={false}
						/>
						<Tooltip
							contentStyle={{
								borderRadius: "16px",
								border: "1px solid #E0ECFF",
								backgroundColor: "#FFFFFF",
								fontSize: "13px",
								boxShadow: "0 12px 30px -18px rgba(58,82,166,0.45)",
							}}
						/>
						<Area
							type="monotone"
							dataKey="count"
							stroke="#3A52A6"
							strokeWidth={2.5}
							fill="url(#signupGradient)"
							name="Signups"
						/>
					</AreaChart>
					</ResponsiveContainer>
				</div>
			)}
		</div>
	);
}
