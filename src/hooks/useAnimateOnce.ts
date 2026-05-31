import { useMemo } from "react";

/** Keys whose entry animation has already played for this page's lifetime. */
const animatedKeys = new Set<string>();

/** Whether the entry animation has already played for the given key. */
export function hasAnimatedOnce(key: string): boolean {
	return animatedKeys.has(key);
}

/** Marks the given key's entry animation as played. */
export function markAnimatedOnce(key: string): void {
	animatedKeys.add(key);
}

/**
 * Ensures a component's entry ("animation-in") only plays once per key for the
 * lifetime of the page. The first mount for a key animates; later re-mounts
 * (filtering, refetching, navigating back) render in their final state without
 * replaying the animation.
 *
 * Gate every `initial` prop with `shouldAnimate ? {...} : false`, and call
 * `markAnimated` once the animation finishes (e.g. via framer-motion's
 * `onAnimationComplete`).
 *
 * For items rendered inside a `.map()` (where hooks can't be called per item),
 * use {@link hasAnimatedOnce}/{@link markAnimatedOnce} directly instead.
 *
 * @param key - Stable identifier for the animated item (e.g. a record id)
 */
export function useAnimateOnce(key: string): {
	shouldAnimate: boolean;
	markAnimated: () => void;
} {
	const shouldAnimate = useMemo(() => !hasAnimatedOnce(key), [key]);
	const markAnimated = () => markAnimatedOnce(key);
	return { shouldAnimate, markAnimated };
}
