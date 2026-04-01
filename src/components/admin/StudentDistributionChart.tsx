import {
	BarChart,
	Bar,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	PieChart,
	Pie,
	ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { StudentDistribution } from "@/lib/admin/model";

function SchoolTooltip({ active, payload }: TooltipContentProps) {
	if (!active || !payload?.length) return null;
	const item = payload[0];
	const count = Number(item.value ?? 0);
	return (
		<div className="rounded-2xl border border-[#E0ECFF] bg-white px-4 py-3 shadow-[0_12px_30px_-18px_rgba(58,82,166,0.45)]">
			<p className="text-sm font-medium text-primary">{item.name}</p>
			<p className="mt-0.5 text-sm text-[#6B7280]">
				{count} student{count !== 1 ? "s" : ""}
			</p>
		</div>
	);
}

function EduTooltip({ active, payload }: TooltipContentProps) {
	if (!active || !payload?.length) return null;
	const item = payload[0];
	const count = Number(item.value ?? 0);
	const name = (item.payload as { name: string }).name;
	return (
		<div className="rounded-2xl border border-[#E0ECFF] bg-white px-4 py-3 shadow-[0_12px_30px_-18px_rgba(58,82,166,0.45)]">
			<p className="text-sm font-medium text-primary">{name}</p>
			<p className="mt-0.5 text-sm text-[#6B7280]">
				{count} student{count !== 1 ? "s" : ""}
			</p>
		</div>
	);
}

const PIE_COLORS = [
	"#3A52A6",
	"#5472D3",
	"#7B93E8",
	"#A8BBFF",
	"#4ECDC4",
	"#45B7D1",
	"#96CEB4",
	"#FFB347",
	"#DDA0DD",
	"#F87171",
];

const EDU_COLORS = ["#3A52A6", "#7B93E8"];

interface StudentDistributionChartProps {
	data: StudentDistribution;
}

export default function StudentDistributionChart({
	data,
}: StudentDistributionChartProps) {
	const schoolData = data.schools.map((s) => ({
		name: s.schoolName,
		value: s.count,
	}));
	const eduData = data.educationLevels.map((e) => ({
		name: e.educationLevel,
		value: e.count,
	}));
	const totalStudents = schoolData.reduce((sum, s) => sum + s.value, 0);

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			{/* School Distribution */}
			<div className="relative overflow-hidden rounded-4xl border border-[#D8E6FF] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(58,82,166,0.55)]">
				<div className="absolute -right-16 top-0 h-36 w-36 rounded-full bg-[#EEF4FF]" />
				<div className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-[80px] bg-[#F7FAFF]" />

				<div className="relative mb-4 flex items-start justify-between gap-4">
					<div className="flex flex-col gap-1">
						<h3 className="text-lg text-primary">Students by School</h3>
						<p className="text-sm text-[#6B7280]">
							Distribution of registered students across schools.
						</p>
					</div>
					<div className="shrink-0 rounded-2xl border border-[#E0ECFF] bg-[#F8FBFF] px-3 py-2 text-right">
						<p className="text-[10px] uppercase tracking-[0.18em] text-[#8CA2D6]">
							Total
						</p>
						<p className="text-lg text-primary">{totalStudents}</p>
					</div>
				</div>

				{schoolData.length === 0 ? (
					<p className="py-10 text-center text-sm text-[#9CA3AF]">
						No school data available
					</p>
				) : (
					<div className="relative flex flex-col gap-4">
						{/* Donut chart */}
						<div className="rounded-[28px] border border-[#E8F0FF] bg-[linear-gradient(180deg,#FCFDFF_0%,#F6FAFF_100%)] p-4">
							<ResponsiveContainer width="100%" height={200}>
								<PieChart>
									<Pie
										data={schoolData}
										cx="50%"
										cy="50%"
										innerRadius={50}
										outerRadius={85}
										paddingAngle={2}
										dataKey="value"
									>
										{schoolData.map((_, i) => (
											<Cell
												key={i}
												fill={PIE_COLORS[i % PIE_COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip content={SchoolTooltip} />
								</PieChart>
							</ResponsiveContainer>
						</div>

						{/* Scrollable school legend */}
						<div className="max-h-52 overflow-y-auto rounded-[20px] border border-[#E8F0FF] bg-[#FAFCFF]">
							{schoolData.map((school, i) => {
								const pct =
									totalStudents > 0
										? Math.round((school.value / totalStudents) * 100)
										: 0;
								return (
									<div
										key={school.name}
										className="flex items-center gap-3 border-b border-[#EEF5FF] px-4 py-2.5 last:border-b-0"
									>
										<span
											className="h-2.5 w-2.5 shrink-0 rounded-full"
											style={{
												backgroundColor:
													PIE_COLORS[i % PIE_COLORS.length],
											}}
										/>
										<span
											className="min-w-0 flex-1 truncate text-sm text-[#374151]"
											title={school.name}
										>
											{school.name}
										</span>
										<div className="flex shrink-0 items-center gap-2">
											<div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E8F0FF]">
												<div
													className="h-full rounded-full"
													style={{
														width: `${pct}%`,
														backgroundColor:
															PIE_COLORS[i % PIE_COLORS.length],
													}}
												/>
											</div>
											<span className="w-6 text-right text-xs text-[#8CA2D6]">
												{pct}%
											</span>
											<span className="w-4 text-right text-sm font-medium text-primary">
												{school.value}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{/* Education Level Comparison */}
			<div className="relative overflow-hidden rounded-4xl border border-[#D8E6FF] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(58,82,166,0.55)]">
				<div className="absolute -right-16 top-0 h-36 w-36 rounded-full bg-[#EEF4FF]" />
				<div className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-[80px] bg-[#F7FAFF]" />
				<div className="relative mb-4 flex flex-col gap-1">
					<h3 className="text-lg text-primary">Education Levels</h3>
					<p className="text-sm text-[#6B7280]">
						Comparison of students by their education level.
					</p>
				</div>
				<div className="relative rounded-[28px] border border-[#E8F0FF] bg-[linear-gradient(180deg,#FCFDFF_0%,#F6FAFF_100%)] p-4">
					{eduData.length === 0 ? (
						<p className="py-10 text-center text-sm text-[#9CA3AF]">
							No education level data available
						</p>
					) : (
						<ResponsiveContainer width="100%" height={200}>
							<BarChart
								data={eduData}
								layout="vertical"
								margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#E3EEFF"
									horizontal={false}
								/>
								<XAxis
									type="number"
									tick={{ fontSize: 12, fill: "#9CA3AF" }}
									axisLine={false}
									tickLine={false}
									allowDecimals={false}
								/>
								<YAxis
									type="category"
									dataKey="name"
									tick={{ fontSize: 12, fill: "#6B7280" }}
									axisLine={false}
									tickLine={false}
									width={140}
								/>
								<Tooltip content={EduTooltip} />
								<Bar dataKey="value" radius={4} name="Students">
									{eduData.map((_, i) => (
										<Cell
											key={i}
											fill={EDU_COLORS[i % EDU_COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					)}
				</div>
				<div className="relative mt-3 grid grid-cols-2 gap-2">
					{eduData.map((item, i) => (
						<div
							key={item.name}
							className="rounded-2xl border border-[#E0ECFF] bg-[#F8FBFF] px-4 py-3"
						>
							<div className="mb-1 flex items-center gap-2">
								<span
									className="h-2.5 w-2.5 shrink-0 rounded-full"
									style={{ backgroundColor: EDU_COLORS[i % EDU_COLORS.length] }}
								/>
								<p className="truncate text-[11px] uppercase tracking-[0.14em] text-[#8CA2D6]">
									{item.name}
								</p>
							</div>
							<p className="text-xl text-primary">{item.value}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
