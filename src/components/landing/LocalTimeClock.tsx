import { useEffect, useState } from "react";

function getLocalParts() {
	const now = new Date();
	const longName =
		new Intl.DateTimeFormat("en-US", { timeZoneName: "long" })
			.formatToParts(now)
			.find((p) => p.type === "timeZoneName")?.value ?? "Local Time";

	const date = now.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const hours = now.getHours();
	const minutes = now.getMinutes().toString().padStart(2, "0");
	const seconds = now.getSeconds().toString().padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	const h = (hours % 12 || 12).toString().padStart(2, "0");
	const time = `${h}:${minutes}:${seconds} ${ampm}`;

	return { longName, date, time };
}

interface LocalTimeClockProps {
	className?: string;
	compact?: boolean;
}

export function LocalTimeClock({
	className = "",
	compact = false,
}: LocalTimeClockProps) {
	const [parts, setParts] = useState(getLocalParts);

	useEffect(() => {
		const interval = setInterval(() => {
			setParts(getLocalParts());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	if (compact) {
		return (
			<div className={className}>
				<p className="text-sm text-[#6B7280]">
					{parts.date} | {parts.time}
				</p>
			</div>
		);
	}

	return (
		<div
			className={`fixed bottom-0 left-0 z-50 inline-flex items-center gap-2 rounded-xs border border-secondary/20 bg-background/80 px-4 py-2 text-xs text-secondary/80 shadow-lg backdrop-blur-sm ${className}`}
		>
			<span className="text-secondary whitespace-nowrap">{parts.longName}</span>
			<span className="text-secondary/40">|</span>
			<span className="whitespace-nowrap">
				{parts.date} | {parts.time}
			</span>
		</div>
	);
}
