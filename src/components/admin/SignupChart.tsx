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
import { format } from "date-fns";

interface SignupChartProps {
	data: SignupTimelineEntry[];
}

export default function SignupChart({ data }: SignupChartProps) {
	const formatted = data.map((entry) => ({
		...entry,
		label: format(new Date(entry.date), "MMM d"),
	}));

	return (
		<div className="bg-white rounded-xl border border-[#E0ECFF] p-5">
			<h3 className="text-sm font-medium text-primary mb-4">
				Signups (Last 30 Days)
			</h3>
			{data.length === 0 ? (
				<p className="text-sm text-[#9CA3AF] text-center py-10">
					No signup data available
				</p>
			) : (
				<ResponsiveContainer width="100%" height={280}>
					<AreaChart data={formatted}>
						<defs>
							<linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#3A52A6" stopOpacity={0.15} />
								<stop offset="95%" stopColor="#3A52A6" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="#E0ECFF" />
						<XAxis
							dataKey="label"
							tick={{ fontSize: 12, fill: "#9CA3AF" }}
							axisLine={{ stroke: "#E0ECFF" }}
							tickLine={false}
						/>
						<YAxis
							allowDecimals={false}
							tick={{ fontSize: 12, fill: "#9CA3AF" }}
							axisLine={{ stroke: "#E0ECFF" }}
							tickLine={false}
						/>
						<Tooltip
							contentStyle={{
								borderRadius: "8px",
								border: "1px solid #E0ECFF",
								fontSize: "13px",
							}}
						/>
						<Area
							type="monotone"
							dataKey="count"
							stroke="#3A52A6"
							strokeWidth={2}
							fill="url(#signupGradient)"
							name="Signups"
						/>
					</AreaChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}
