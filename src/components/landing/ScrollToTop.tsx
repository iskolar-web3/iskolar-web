import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScrollToTop() {
	const [progress, setProgress] = useState(0);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const pct = docHeight > 0 ? scrollTop / docHeight : 0;
			setProgress(pct);
			setVisible(scrollTop > 200);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

	return (
		<button
			type="button"
			onClick={scrollToTop}
			aria-label="Scroll to top"
			className="fixed cursor-pointer bottom-11 md:bottom-5 right-6 md:right-5 z-50 transition-all duration-300"
			style={{
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? "auto" : "none",
				transform: visible ? "translateY(0)" : "translateY(16px)",
			}}
		>
			<div className="relative flex items-center justify-center w-14 h-14">
				{/* Background circle */}
				<div className="absolute inset-0 rounded-full bg-white shadow-lg" />

				{/* SVG progress ring */}
				<svg
					className="absolute inset-0 w-full h-full -rotate-90"
					viewBox="0 0 56 56"
				>
					{/* Track */}
					<circle
						cx="28"
						cy="28"
						r={RADIUS}
						fill="none"
						stroke="#e4e4e7"
						strokeWidth="3"
					/>
					{/* Progress */}
					<circle
						cx="28"
						cy="28"
						r={RADIUS}
						fill="none"
						stroke="#1e3a8a"
						strokeWidth="3"
						strokeLinecap="round"
						strokeDasharray={CIRCUMFERENCE}
						strokeDashoffset={strokeDashoffset}
						style={{ transition: "stroke-dashoffset 0.1s linear" }}
					/>
				</svg>

				{/* Arrow icon */}
				<ArrowUp className="relative z-10 w-5 h-5 text-[#1e3a8a]" />
			</div>
		</button>
	);
}
