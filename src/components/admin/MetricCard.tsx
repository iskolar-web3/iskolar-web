import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon: LucideIcon;
}

export default function MetricCard({
	title,
	value,
	description,
	icon: Icon,
}: MetricCardProps) {
	return (
		<div className="bg-white rounded-xl border border-[#E0ECFF] p-5">
			<div className="flex items-center justify-between mb-3">
				<p className="text-sm text-[#6B7280]">{title}</p>
				<div className="w-9 h-9 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
					<Icon className="w-4.5 h-4.5 text-[#3A52A6]" />
				</div>
			</div>
			<p className="text-2xl font-semibold text-primary">{value}</p>
			{description && (
				<p className="text-xs text-[#9CA3AF] mt-1">{description}</p>
			)}
		</div>
	);
}
