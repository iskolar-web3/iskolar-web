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
	{ value: "#1C1917", label: "Charcoal" },
	{ value: "#FFFFFF", label: "White" },
];

export function isLightColor(hex: string): boolean {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const toLinear = (c: number) =>
		c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	const L =
		0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
	return L > 0.179;
}

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
				{CARD_COLORS.map((color) => {
					const isLight = isLightColor(color.value);
					return (
						<button
							key={color.value}
							type="button"
							disabled={disabled}
							title={color.label}
							onClick={() => onChange(color.value)}
							className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3A52A6] disabled:cursor-not-allowed"
							style={{
								backgroundColor: color.value,
								boxShadow: isLight ? "inset 0 0 0 1.5px #D1D5DB" : undefined,
							}}
						>
							{value === color.value && (
								<Check
									size={14}
									strokeWidth={3}
									style={{ color: isLight ? "#374151" : "white" }}
								/>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
