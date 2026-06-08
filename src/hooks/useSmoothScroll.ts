import { useEffect } from "react";
import Lenis from "lenis";

type LenisOptions = ConstructorParameters<typeof Lenis>[0];

const defaultOptions: LenisOptions = {
	duration: 1.2,
	easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
		const lenis = new Lenis({ ...defaultOptions, ...options });
		setActiveLenis(lenis);

		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		return () => {
			lenis.destroy();
			setActiveLenis(null);
		};
	}, [options]);
}
