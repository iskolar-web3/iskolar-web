import { useSyncExternalStore } from "react";

// Tiny shared store tracking which fixed bottom-right widgets are currently on
// screen (the landing scroll-to-top arrow, the feedback pill, ...). Each source
// registers under a key, and the corner counts as "occupied" while any key is
// active. The globally-mounted chat launcher subscribes so it can lift above
// these widgets instead of overlapping them.

const active = new Set<string>();
const listeners = new Set<() => void>();

/** Publish whether a given bottom-right widget is currently visible. */
export function setCornerWidgetVisible(key: string, visible: boolean): void {
	if (active.has(key) === visible) return;
	if (visible) active.add(key);
	else active.delete(key);
	for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function getSnapshot(): boolean {
	return active.size > 0;
}

/** Reactively read whether any bottom-right corner widget is currently visible. */
export function useCornerWidgetVisible(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
