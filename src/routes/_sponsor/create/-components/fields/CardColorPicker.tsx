import { Check } from "lucide-react";

export const CARD_COLORS = [
	{ value: "#3A52A6", label: "Blue" },
	{ value: "#1E3A8A", label: "Navy" },
	{ value: "#4F46E5", label: "Indigo" },
	{ value: "#7C3AED", label: "Violet" },
	{ value: "#BE185D", label: "Pink" },
	{ value: "#DC2626", label: "Red" },
	{ value: "#C2410C", label: "Orange" },
	{ value: "#D97706", label: "Amber" },
	{ value: "#059669", label: "Emerald" },
	{ value: "#166534", label: "Green" },
	{ value: "#0891B2", label: "Cyan" },
	{ value: "#0F766E", label: "Teal" },
	{ value: "#475569", label: "Slate" },
];

interface CardColorPickerProps {
	value: string;
	onChange: (color: string) => void;
	disabled?: boolean;
}

export default function CardColorPicker({
	value,
	onChange,
	disabled,
}: CardColorPickerProps) {
	return (
		<div>
			<label className="block text-xs text-[#6B7280] mb-2 ml-0.5">
				Card Color
			</label>
			<div className="flex flex-wrap gap-2">
				{CARD_COLORS.map((color) => (
					<button
						key={color.value}
						type="button"
						disabled={disabled}
						title={color.label}
						onClick={() => onChange(color.value)}
						className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3A52A6] disabled:cursor-not-allowed"
						style={{ backgroundColor: color.value }}
					>
						{value === color.value && (
							<Check size={14} className="text-white" strokeWidth={3} />
						)}
					</button>
				))}
			</div>
		</div>
	);
}
