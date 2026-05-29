import { useSyncExternalStore } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastState {
	id: string;
	type: ToastType;
	title: string;
	message: string;
	visible: boolean;
}

type Listener = () => void;

let _state: ToastState | null = null;
let _dismissTimer: ReturnType<typeof setTimeout> | null = null;
let _cleanupTimer: ReturnType<typeof setTimeout> | null = null;
const _listeners = new Set<Listener>();

function _notify() {
	_listeners.forEach((fn) => fn());
}

function _subscribe(fn: Listener): () => void {
	_listeners.add(fn);
	return () => _listeners.delete(fn);
}

function _getSnapshot(): ToastState | null {
	return _state;
}

function _show(
	type: ToastType,
	title: string,
	message: string,
	duration?: number,
): void {
	const ms = duration ?? (type === "error" ? 3000 : 2500);
	if (_dismissTimer) clearTimeout(_dismissTimer);
	if (_cleanupTimer) clearTimeout(_cleanupTimer);

	const id = `toast-${Date.now()}-${Math.random()}`;
	_state = { id, type, title, message, visible: true };

	_notify();

	_dismissTimer = setTimeout(() => {
		if (_state?.id === id) {
			_state = { ..._state, visible: false };
			_notify();
		}
		_cleanupTimer = setTimeout(() => {
			if (_state?.id === id) {
				_state = null;
				_notify();
			}
		}, 400);
	}, ms);
}

export const toast = {
	success: (title: string, message: string, duration?: number) =>
		_show("success", title, message, duration),
	error: (title: string, message: string, duration?: number) =>
		_show("error", title, message, duration),
	info: (title: string, message: string, duration?: number) =>
		_show("info", title, message, duration),
	warning: (title: string, message: string, duration?: number) =>
		_show("warning", title, message, duration),
};

export function useToastStore(): ToastState | null {
	return useSyncExternalStore(_subscribe, _getSnapshot, _getSnapshot);
}
