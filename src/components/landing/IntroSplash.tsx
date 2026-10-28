import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { onLenisChange } from "@/hooks/useSmoothScroll";

const SEEN_KEY = "iskolar-intro-seen";
const HOLD_MS = 1500;

function hasSeenIntro() {
	try {
		return sessionStorage.getItem(SEEN_KEY) === "1";
	} catch {
		return false;
	}
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function markIntroSeen() {
	try {
		sessionStorage.setItem(SEEN_KEY, "1");
	} catch {
		// Storage blocked (private mode, previews). The intro just shows again.
	}
}

/**
 * Logo only intro shown the first time the site opens in a browser session.
 * Skipped entirely for reduced motion. Calls `onDone` once the page is ready
 * to reveal, so the hero can start its entrance right as the splash lifts.
 */
export function IntroSplash({ onDone }: { onDone: () => void }) {
	// Read synchronously so the splash never flashes for users who skip it.
	const [visible, setVisible] = useState(
		() => !prefersReducedMotion() && !hasSeenIntro(),
	);

	useEffect(() => {
		if (!visible) {
			onDone();
			return;
		}
		markIntroSeen();
		document.documentElement.style.overflow = "hidden";
		let lenis: { stop: () => void; start: () => void } | null = null;
		const unsubscribe = onLenisChange((instance) => {
			lenis = instance;
			instance?.stop();
		});
		const timer = setTimeout(() => setVisible(false), HOLD_MS);
		return () => {
			clearTimeout(timer);
			unsubscribe();
			lenis?.start();
			document.documentElement.style.overflow = "";
		};
	}, [visible, onDone]);

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					key="intro"
					className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-background"
					exit={{ opacity: 0 }}
					transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
				>
					<motion.img
						src="/logo.png"
						alt="iSkolar"
						className="h-24 w-24 sm:h-28 sm:w-28 object-contain"
						initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
						animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
						exit={{ opacity: 0, scale: 1.06 }}
						transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
					/>
					{/* Slim rounded track; a soft gradient fill eases across,
					    then the whole bar fades with the splash */}
					<motion.div
						aria-hidden
						className="relative h-[3px] w-24 overflow-hidden rounded-full bg-secondary/10"
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						transition={{
							duration: 0.5,
							delay: 0.15,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						<motion.span
							className="absolute inset-0 rounded-full bg-linear-to-r from-secondary/50 to-secondary"
							// Clip instead of scale so the rounded head keeps its shape.
							initial={{ clipPath: "inset(0 100% 0 0 round 999px)" }}
							animate={{ clipPath: "inset(0 0% 0 0 round 999px)" }}
							transition={{
								duration: (HOLD_MS - 250) / 1000,
								delay: 0.2,
								ease: [0.45, 0, 0.15, 1],
							}}
						/>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
