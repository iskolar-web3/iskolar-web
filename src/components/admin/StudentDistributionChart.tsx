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
	Legend,
	ResponsiveContainer,
} from "recharts";
import type { StudentDistribution } from "@/lib/admin/model";

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
			{/* School Distribution Pie Chart */}
			<div className="relative overflow-hidden rounded-4xl border border-[#D8E6FF] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(58,82,166,0.55)]">
				<div className="absolute -right-16 top-0 h-36 w-36 rounded-full bg-[#EEF4FF]" />
				<div className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-[80px] bg-[#F7FAFF]" />
				<div className="relative mb-4 flex flex-col gap-1">
					<p className="text-[11px] uppercase tracking-[0.24em] text-[#8CA2D6]">
						Student breakdown
					</p>
					<h3 className="text-lg text-primary">Students by School</h3>
					<p className="text-sm text-[#6B7280]">
						Distribution of registered students across schools.
					</p>
				</div>
				<div className="relative rounded-[28px] border border-[#E8F0FF] bg-[linear-gradient(180deg,#FCFDFF_0%,#F6FAFF_100%)] p-4">
					{schoolData.length === 0 ? (
						<p className="py-10 text-center text-sm text-[#9CA3AF]">
							No school data available
						</p>
					) : (
						<ResponsiveContainer width="100%" height={280}>
							<PieChart>
								<Pie
									data={schoolData}
									cx="50%"
									cy="45%"
									innerRadius={55}
									outerRadius={95}
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
								<Tooltip
									contentStyle={{
										borderRadius: "16px",
										border: "1px solid #E0ECFF",
										backgroundColor: "#FFFFFF",
										fontSize: "13px",
										boxShadow: "0 12px 30px -18px rgba(58,82,166,0.45)",
									}}
									formatter={(value) => {
										const count = value as number;
										return [`${count} student${count !== 1 ? "s" : ""}`, "Count"];
									}}
								/>
								<Legend
									iconType="circle"
									iconSize={8}
									wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
									formatter={(value) => (
										<span style={{ color: "#6B7280" }}>{value}</span>
									)}
								/>
							</PieChart>
						</ResponsiveContainer>
					)}
				</div>
				<div className="relative mt-3 flex justify-end">
					<div className="rounded-2xl border border-[#E0ECFF] bg-[#F8FBFF] px-4 py-2">
						<p className="text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
							Total students
						</p>
						<p className="mt-0.5 text-xl text-primary">{totalStudents}</p>
					</div>
				</div>
			</div>

			{/* Education Level Comparison */}
			<div className="relative overflow-hidden rounded-4xl border border-[#D8E6FF] bg-white p-6 shadow-[0_22px_55px_-34px_rgba(58,82,166,0.55)]">
				<div className="absolute -right-16 top-0 h-36 w-36 rounded-full bg-[#EEF4FF]" />
				<div className="absolute bottom-0 left-0 h-24 w-24 rounded-tr-[80px] bg-[#F7FAFF]" />
				<div className="relative mb-4 flex flex-col gap-1">
					<p className="text-[11px] uppercase tracking-[0.24em] text-[#8CA2D6]">
						Student breakdown
					</p>
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
								<Tooltip
									contentStyle={{
										borderRadius: "16px",
										border: "1px solid #E0ECFF",
										backgroundColor: "#FFFFFF",
										fontSize: "13px",
										boxShadow: "0 12px 30px -18px rgba(58,82,166,0.45)",
									}}
									formatter={(value) => {
										const count = value as number;
										return [`${count} student${count !== 1 ? "s" : ""}`, "Count"];
									}}
								/>
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
