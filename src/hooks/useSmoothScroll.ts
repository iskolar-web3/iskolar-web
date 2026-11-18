import Lenis from "lenis";
import { useEffect } from "react";
import { isLowEndDevice, prefersReducedMotion } from "@/lib/device";

type LenisOptions = ConstructorParameters<typeof Lenis>[0];

const defaultOptions: LenisOptions = {
	duration: 1.2,
	easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
	orientation: "vertical",
	gestureOrientation: "vertical",
	smoothWheel: true,
};

let activeLenis: Lenis | null = null;
const lenisListeners = new Set<(lenis: Lenis | null) => void>();

function setActiveLenis(lenis: Lenis | null) {
	activeLenis = lenis;
	for (const listener of lenisListeners) listener(lenis);
}

/**
 * Subscribe to the active Lenis instance. Fires immediately with the current
 * instance (which may be null before the smooth-scroll effect mounts) and again
 * whenever it is created or destroyed. Returns an unsubscribe function.
 */
export function onLenisChange(listener: (lenis: Lenis | null) => void) {
	lenisListeners.add(listener);
	listener(activeLenis);
	return () => {
		lenisListeners.delete(listener);
	};
}

export function useSmoothScroll(options?: LenisOptions) {
	useEffect(() => {
		// Smooth wheel scrolling runs on the main thread. Low-end devices and
		// reduced-motion visitors keep native scrolling, which the compositor
		// handles; every Lenis consumer already falls back to native scroll.
		if (isLowEndDevice() || prefersReducedMotion()) return;

		const lenis = new Lenis({ ...defaultOptions, ...options });
		setActiveLenis(lenis);

		let frame = 0;
		function raf(time: number) {
			lenis.raf(time);
			frame = requestAnimationFrame(raf);
		}

		frame = requestAnimationFrame(raf);

		return () => {
			// Stop the loop too; otherwise it keeps calling a destroyed instance
			// and every visit to a landing page adds another loop.
			cancelAnimationFrame(frame);
			lenis.destroy();
			setActiveLenis(null);
		};
	}, [options]);
}
