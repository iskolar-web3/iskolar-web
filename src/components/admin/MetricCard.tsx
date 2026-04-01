import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon: LucideIcon;
	className?: string;
	iconClassName?: string;
}

export default function MetricCard({
	title,
	value,
	description,
	icon: Icon,
	className = "",
	iconClassName = "",
}: MetricCardProps) {
	return (
		<div
			className={`group relative overflow-hidden rounded-[28px] border border-[#E0ECFF] bg-white/95 p-5 shadow-[0_18px_45px_-28px_rgba(58,82,166,0.55)] transition-transform duration-300 hover:-translate-y-1 ${className}`}
		>
			<div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#BFD7FF] to-transparent" />
			<div className="flex items-start justify-between gap-4 mb-4">
				<div>
					<p className="text-sm text-[#6B7280]">{title}</p>
				</div>
				<div
					className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9E7FF] bg-[#F0F7FF] shadow-inner shadow-white ${iconClassName}`}
				>
					<Icon className="w-4.5 h-4.5 text-[#3A52A6]" />
				</div>
			</div>
			<p className="text-3xl font-semibold tracking-tight text-primary">{value}</p>
			{description && (
				<p className="mt-2 max-w-[24ch] text-xs leading-5 text-[#8A94A8]">
					{description}
				</p>
			)}
		</div>
	);
}
