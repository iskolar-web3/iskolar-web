import type {
	KeyboardEvent as ReactKeyboardEvent,
	PointerEvent as ReactPointerEvent,
} from "react";
import { useEffect, useRef, useState } from "react";

// Size of the chat panel, which is pinned to the bottom-right corner. The visitor
// resizes it by dragging its top edge, left edge, or top-left corner (mouse,
// touch, and pen all use pointer events), with the arrow keys on the grab bar,
// or with the expand button. The chosen size is remembered in this browser.

export interface PanelSize {
	width: number;
	height: number;
}

export type ResizeEdge = "top" | "left" | "corner";

export const DEFAULT_PANEL_SIZE: PanelSize = { width: 416, height: 640 };
const MIN_PANEL_SIZE: PanelSize = { width: 300, height: 380 };
// Wider than this reads like a page, not a chat.
const MAX_PANEL_WIDTH = 720;
// The panel sits 20px from the right and 24px from the bottom (right-5,
// bottom-6); keep at least 12px of page visible on the opposite sides.
const RIGHT_OFFSET = 20;
const BOTTOM_OFFSET = 24;
const FAR_GAP = 12;
const KEY_STEP = 32;
const STORAGE_KEY = "iskolar-chat-size";

function viewportMax(): PanelSize {
	if (typeof window === "undefined") return DEFAULT_PANEL_SIZE;
	return {
		width: Math.min(
			MAX_PANEL_WIDTH,
			window.innerWidth - RIGHT_OFFSET - FAR_GAP,
		),
		height: window.innerHeight - BOTTOM_OFFSET - FAR_GAP,
	};
}

// Fit a size inside the minimum and the current viewport. On very small screens
// the viewport wins over the minimum so the panel never spills off screen.
function clampSize(size: PanelSize, max: PanelSize): PanelSize {
	return {
		width: Math.min(Math.max(size.width, MIN_PANEL_SIZE.width), max.width),
		height: Math.min(Math.max(size.height, MIN_PANEL_SIZE.height), max.height),
	};
}

function loadSize(): PanelSize {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_PANEL_SIZE;
		const parsed = JSON.parse(raw) as Partial<PanelSize>;
		if (
			typeof parsed.width === "number" &&
			typeof parsed.height === "number" &&
			Number.isFinite(parsed.width) &&
			Number.isFinite(parsed.height)
		) {
			return { width: parsed.width, height: parsed.height };
		}
	} catch {
		// Storage blocked or corrupt: fall back to the default size.
	}
	return DEFAULT_PANEL_SIZE;
}

function saveSize(size: PanelSize): void {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
	} catch {
		// Storage blocked: the size just won't be remembered.
	}
}

export function useChatPanelSize() {
	const [preferred, setPreferred] = useState<PanelSize>(loadSize);
	const [max, setMax] = useState<PanelSize>(viewportMax);
	const [resizing, setResizing] = useState(false);
	const drag = useRef<{
		edge: ResizeEdge;
		pointerId: number;
		startX: number;
		startY: number;
		start: PanelSize;
	} | null>(null);
	// Latest size during a drag, saved once when the drag ends.
	const dragged = useRef<PanelSize | null>(null);

	// Track the viewport so the panel shrinks with the window (or a rotated
	// phone) instead of overflowing it.
	useEffect(() => {
		function onResize(): void {
			setMax(viewportMax());
		}
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	const size = clampSize(preferred, max);
	const isMaximized = size.width >= max.width && size.height >= max.height;

	function commit(next: PanelSize): void {
		const clamped = clampSize(next, viewportMax());
		setPreferred(clamped);
		saveSize(clamped);
	}

	function startResize(edge: ResizeEdge) {
		return (e: ReactPointerEvent<HTMLElement>): void => {
			if (e.button !== 0) return;
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			drag.current = {
				edge,
				pointerId: e.pointerId,
				startX: e.clientX,
				startY: e.clientY,
				// Start from the size on screen, not the stored preference, so the
				// panel never jumps when the drag begins.
				start: size,
			};
			setResizing(true);
		};
	}

	function onResizeMove(e: ReactPointerEvent<HTMLElement>): void {
		const current = drag.current;
		if (!current || current.pointerId !== e.pointerId) return;
		// Anchored bottom-right: dragging left or up grows the panel.
		const dx = current.startX - e.clientX;
		const dy = current.startY - e.clientY;
		const next = clampSize(
			{
				width:
					current.edge === "top"
						? current.start.width
						: current.start.width + dx,
				height:
					current.edge === "left"
						? current.start.height
						: current.start.height + dy,
			},
			viewportMax(),
		);
		dragged.current = next;
		setPreferred(next);
	}

	function endResize(e: ReactPointerEvent<HTMLElement>): void {
		const current = drag.current;
		if (!current || current.pointerId !== e.pointerId) return;
		drag.current = null;
		setResizing(false);
		if (dragged.current) saveSize(dragged.current);
		dragged.current = null;
	}

	// Arrow keys on the grab bar: up/left grow, down/right shrink.
	function onResizeKey(e: ReactKeyboardEvent<HTMLElement>): void {
		const delta: Record<string, [number, number]> = {
			ArrowUp: [0, KEY_STEP],
			ArrowDown: [0, -KEY_STEP],
			ArrowLeft: [KEY_STEP, 0],
			ArrowRight: [-KEY_STEP, 0],
		};
		const step = delta[e.key];
		if (!step) return;
		e.preventDefault();
		commit({ width: size.width + step[0], height: size.height + step[1] });
	}

	// Expand to the largest size the screen allows, or restore. On phones the
	// default already fills the screen, so restoring drops to a shorter panel.
	function toggleMaximize(): void {
		const vmax = viewportMax();
		if (!isMaximized) {
			commit(vmax);
			return;
		}
		const fallback = clampSize(DEFAULT_PANEL_SIZE, vmax);
		const defaultFills =
			fallback.width >= vmax.width && fallback.height >= vmax.height;
		commit(
			defaultFills
				? { width: vmax.width, height: Math.round(vmax.height * 0.7) }
				: DEFAULT_PANEL_SIZE,
		);
	}

	// Handlers to spread on every resize hit area.
	const resizeHandlers = (edge: ResizeEdge) => ({
		onPointerDown: startResize(edge),
		onPointerMove: onResizeMove,
		onPointerUp: endResize,
		onPointerCancel: endResize,
	});

	return {
		size,
		isMaximized,
		resizing,
		resizeHandlers,
		onResizeKey,
		toggleMaximize,
	};
}
