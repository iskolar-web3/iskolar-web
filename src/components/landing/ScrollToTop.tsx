import type Lenis from "lenis";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { setCornerWidgetVisible } from "@/hooks/useCornerWidgets";
import { onLenisChange } from "@/hooks/useSmoothScroll";

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScrollToTop() {
	const [progress, setProgress] = useState(0);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const update = (scroll: number, limit: number) => {
			setProgress(limit > 0 ? scroll / limit : 0);
			const isVisible = scroll > 200;
			setVisible(isVisible);
			// Publish so the global chat widget can move out of the way.
			setCornerWidgetVisible("scroll-to-top", isVisible);
		};

		// Lenis emits on every animation frame, so the ring tracks the smoothed
		// scroll position in real time rather than the native event's lag.
		const onLenisScroll = (lenis: Lenis) => update(lenis.scroll, lenis.limit);

		// Fallback for when smooth scroll isn't active (no Lenis instance).
		const onNativeScroll = () => {
			update(
				window.scrollY,
				document.documentElement.scrollHeight - window.innerHeight,
			);
		};

		let current: Lenis | null = null;
		const unsubscribe = onLenisChange((lenis) => {
			current?.off("scroll", onLenisScroll);
			current = lenis;
			if (lenis) {
				lenis.on("scroll", onLenisScroll);
				update(lenis.scroll, lenis.limit);
			} else {
				onNativeScroll();
			}
		});

		window.addEventListener("scroll", onNativeScroll, { passive: true });
		return () => {
			unsubscribe();
			current?.off("scroll", onLenisScroll);
			window.removeEventListener("scroll", onNativeScroll);
			// Reset when the arrow leaves the page (e.g. navigating away).
			setCornerWidgetVisible("scroll-to-top", false);
		};
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
			className="fixed cursor-pointer bottom-11 md:bottom-5 right-6 md:right-5 z-50 transition-all duration-300 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
			style={{
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? "auto" : "none",
				transform: visible ? "translateY(0)" : "translateY(16px)",
			}}
		>
			<div className="relative flex items-center justify-center w-14 h-14">
				{/* Background circle */}
				<div className="absolute inset-0 rounded-full bg-card shadow-lg shadow-secondary/15 ring-1 ring-secondary/10" />

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
						stroke="rgba(58,82,166,0.14)"
						strokeWidth="3"
					/>
					{/* Progress */}
					<circle
						cx="28"
						cy="28"
						r={RADIUS}
						fill="none"
						stroke="var(--secondary)"
						strokeWidth="3"
						strokeLinecap="round"
						strokeDasharray={CIRCUMFERENCE}
						strokeDashoffset={strokeDashoffset}
					/>
				</svg>

				{/* Arrow icon */}
				<ArrowUp className="relative z-10 w-5 h-5 text-secondary" />
			</div>
		</button>
	);
}
