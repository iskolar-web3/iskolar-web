import type { ReactNode } from "react";
import { MotionItem } from "@/components/landing/MotionContainer";

type SectionHeaderProps = {
	eyebrow: string;
	title: ReactNode;
	description?: ReactNode;
	align?: "center" | "left";
	className?: string;
	children?: ReactNode;
};

// Shared header for landing sections: eyebrow pill with the pulsing dot,
// display heading, optional lead. Render inside a MotionContainer.
export function SectionHeader({
	eyebrow,
	title,
	description,
	align = "center",
	className = "",
	children,
}: SectionHeaderProps) {
	const centered = align === "center";
	return (
		<MotionItem
			className={`${centered ? "text-center mx-auto" : ""} max-w-2xl ${className}`}
		>
			<span className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-card/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-secondary/70 backdrop-blur">
				<span
					className="h-1.5 w-1.5 rounded-full bg-secondary"
					style={{ animation: "soft-pulse 3s ease-in-out infinite" }}
				/>
				{eyebrow}
			</span>
			<h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl text-secondary leading-[1.1] tracking-tight text-balance">
				{title}
			</h2>
			{description && (
				<p
					className={`mt-4 text-base sm:text-lg text-secondary/65 leading-relaxed text-pretty ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}
				>
					{description}
				</p>
			)}
			{children}
		</MotionItem>
	);
}
