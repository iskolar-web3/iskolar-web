import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

// Blueprint grid behind the landing pages, like a sheet of graph paper. A slow
// ocean swell rolls through it and a soft light band drifts across; the cursor
// bends the grid like a magnifying lens and marks the nearest grid point; a
// click drops a water ripple that rolls outward through the grid. Strictly
// brand blue (#3a52a6) on the light background.

type Ripple = { x: number; y: number; t: number };

const BLUE = "58,82,166";
const GAP = 32;
const HALF = GAP / 2;
const MAJOR_EVERY = 4;
const LENS_R = 170;
const LENS_PUSH = 0.45;
const BAND_W = 140;
const BAND_MS = 14000;
const RIPPLE_MS = 2600;
const RIPPLE_R = 640;
const RIPPLE_AMP = 8;
const WAVELENGTH = 64;
// Half width of the wave packet riding the front.
const PACKET = 90;
const RING_GAP = 34;
const MAX_RIPPLES = 6;

// Ocean swell: a few long Gerstner waves crossing at different angles. Each
// point circles as a crest passes, so points bunch on crests and spread in
// troughs like a real sea surface. Angles in radians, lengths in px, periods in s.
const SWELLS = [
	{ angle: 0.35, length: 560, amp: 12, period: 12 },
	{ angle: -0.6, length: 360, amp: 7, period: 9 },
	{ angle: 1.25, length: 230, amp: 3.5, period: 7 },
].map(({ angle, length, amp, period }) => {
	const k = (Math.PI * 2) / length;
	return {
		dx: Math.cos(angle),
		dy: Math.sin(angle),
		kx: Math.cos(angle) * k,
		ky: Math.sin(angle) * k,
		amp,
		omega: (Math.PI * 2) / period,
	};
});
const SWELL_SUM = SWELLS.reduce((s, w) => s + w.amp, 0);
// How far points orbit sideways relative to the wave height.
const STEEPNESS = 0.9;
// Height shows as a small upward shift, like the sea seen at a slight angle.
const TILT = 0.5;
const SWELL_FADE_MS = 2000;

// Close to constant speed like real water, easing off a touch as it spreads.
const rippleFront = (p: number) => (1 - (1 - p) ** 1.5) * RIPPLE_R;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

// Few cores or little memory: render lighter from the start.
const isLowEnd = () => {
	if (typeof navigator === "undefined") return false;
	const nav = navigator as Navigator & { deviceMemory?: number };
	return (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4;
};

export default function AnimatedBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const reduce = useReducedMotion();

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		const lowEnd = isLowEnd();
		// Background motion never needs more than 60fps; weak devices get 30.
		let frameGap = lowEnd ? 1000 / 30 : 1000 / 60;
		// Smoothed draw cost in ms, used to drop to 30fps if frames run heavy.
		let cost = 0;

		let width = 0;
		let height = 0;
		// Grid origin, centred so the margins match on both sides.
		let originX = 0;
		let originY = 0;
		let cols = 0;
		let rows = 0;
		// Grid sampled at half steps, since major lines bend through midpoints.
		let halfCols = 0;
		let halfRows = 0;
		// Swell phase split as sin(a + b) = sin a cos b + cos a sin b, with a per
		// column and b per row, so each dot costs a few multiplies instead of
		// trig calls. Row terms never change; column terms carry the time.
		let colSin = new Float32Array(0);
		let colCos = new Float32Array(0);
		let rowSin = new Float32Array(0);
		let rowCos = new Float32Array(0);
		let swellAmt = 0;
		const start = performance.now();
		const ripples: Ripple[] = [];
		// Per frame ripple state, so displace() does no timing maths per dot.
		const waves: {
			x: number;
			y: number;
			front: number;
			amp: number;
			glow: number;
		}[] = [];
		const pointer = { x: 0, y: 0, active: false };
		// Lens and crosshair trail the pointer slightly so they glide.
		const lens = { x: 0, y: 0, amt: 0 };
		const cross = { x: 0, y: 0 };
		let lastPointerType = "mouse";
		let frame = 0;
		let last = performance.now();

		// Displaced position, highlight (0..1) and swell height (-1..1) of a grid
		// point, written into shared vars to avoid allocating per dot per frame.
		// ci and ri index the half step grid.
		let outX = 0;
		let outY = 0;
		let outInfl = 0;
		let outSwell = 0;
		const displace = (x: number, y: number, ci: number, ri: number) => {
			outX = x;
			outY = y;
			outInfl = 0;
			outSwell = 0;

			if (swellAmt > 0) {
				let sx = 0;
				let sy = 0;
				let h = 0;
				for (let w = 0; w < SWELLS.length; w++) {
					const sw = SWELLS[w];
					const sa = colSin[w * halfCols + ci];
					const ca = colCos[w * halfCols + ci];
					const sb = rowSin[w * halfRows + ri];
					const cb = rowCos[w * halfRows + ri];
					const orbit = STEEPNESS * sw.amp * (ca * cb - sa * sb);
					sx += sw.dx * orbit;
					sy += sw.dy * orbit;
					h += sw.amp * (sa * cb + ca * sb);
				}
				outX += sx * swellAmt;
				outY += (sy - h * TILT) * swellAmt;
				outSwell = (h / SWELL_SUM) * swellAmt;
			}

			// Ripples: a damped sine packet riding each expanding front pushes
			// points in and out along the radius, like the surface of water.
			for (const w of waves) {
				const ox = x - w.x;
				const oy = y - w.y;
				const dist = Math.hypot(ox, oy);
				const phase = dist - w.front;
				if (dist === 0 || phase > PACKET * 2 || phase < -PACKET * 2) continue;
				const env = Math.exp(-((phase / PACKET) ** 2));
				const wave = Math.sin((phase / WAVELENGTH) * Math.PI * 2);
				const push = w.amp * env * wave;
				outX += (ox / dist) * push;
				outY += (oy / dist) * push;
				outInfl = Math.max(outInfl, env * w.glow * (0.5 + 0.5 * wave));
			}

			if (lens.amt < 0.01) return;
			const ox = outX - lens.x;
			const oy = outY - lens.y;
			const dist = Math.hypot(ox, oy);
			if (dist >= LENS_R) return;
			const f = 1 - dist / LENS_R;
			const push = f * f * LENS_PUSH * lens.amt;
			outX += ox * push;
			outY += oy * push;
			outInfl = Math.max(outInfl, f * lens.amt);
		};

		const snap = (x: number, y: number) => ({
			x: originX + Math.round((x - originX) / GAP) * GAP,
			y: originY + Math.round((y - originY) / GAP) * GAP,
		});

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 1.5 : 2);
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			cols = Math.floor(width / GAP) + 2;
			rows = Math.floor(height / GAP) + 2;
			originX = (width - (cols - 1) * GAP) / 2;
			originY = (height - (rows - 1) * GAP) / 2;

			halfCols = (cols - 1) * 2 + 1;
			halfRows = (rows - 1) * 2 + 1;
			colSin = new Float32Array(SWELLS.length * halfCols);
			colCos = new Float32Array(SWELLS.length * halfCols);
			rowSin = new Float32Array(SWELLS.length * halfRows);
			rowCos = new Float32Array(SWELLS.length * halfRows);
			for (let w = 0; w < SWELLS.length; w++) {
				for (let i = 0; i < halfRows; i++) {
					const b = SWELLS[w].ky * (originY + i * HALF);
					rowSin[w * halfRows + i] = Math.sin(b);
					rowCos[w * halfRows + i] = Math.cos(b);
				}
			}

			if (reduce) draw(performance.now(), true);
		};

		const updateSwell = (now: number, still: boolean) => {
			// Ease the swell in so it starts calm instead of mid motion.
			swellAmt = still ? 0 : clamp01((now - start) / SWELL_FADE_MS);
			swellAmt = swellAmt * swellAmt * (3 - 2 * swellAmt);
			if (swellAmt === 0) return;
			const t = now / 1000;
			for (let w = 0; w < SWELLS.length; w++) {
				const sw = SWELLS[w];
				for (let i = 0; i < halfCols; i++) {
					const a = sw.kx * (originX + i * HALF) - sw.omega * t;
					colSin[w * halfCols + i] = Math.sin(a);
					colCos[w * halfCols + i] = Math.cos(a);
				}
			}
		};

		const drawMajorLines = () => {
			ctx.strokeStyle = `rgba(${BLUE},0.05)`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			// Sample at half steps so lines bend smoothly through the lens.
			for (let c = 0; c < cols; c += MAJOR_EVERY) {
				const x = originX + c * GAP;
				for (let i = 0; i < halfRows; i++) {
					displace(x, originY + i * HALF, c * 2, i);
					if (i === 0) ctx.moveTo(outX, outY);
					else ctx.lineTo(outX, outY);
				}
			}
			for (let r = 0; r < rows; r += MAJOR_EVERY) {
				const y = originY + r * GAP;
				for (let i = 0; i < halfCols; i++) {
					displace(originX + i * HALF, y, i, r * 2);
					if (i === 0) ctx.moveTo(outX, outY);
					else ctx.lineTo(outX, outY);
				}
			}
			ctx.stroke();
		};

		const drawDots = (now: number, still: boolean) => {
			// Batch dots by quantised alpha so the whole grid costs a few fills.
			const buckets = new Map<number, Path2D>();
			const span = width + height + BAND_W * 4;
			const bandPos = still
				? -Infinity
				: ((now % BAND_MS) / BAND_MS) * span - BAND_W * 2;

			for (let c = 0; c < cols; c++) {
				const x = originX + c * GAP;
				const majorCol = c % MAJOR_EVERY === 0;
				for (let r = 0; r < rows; r++) {
					const y = originY + r * GAP;
					const major = majorCol && r % MAJOR_EVERY === 0;
					const s = (x + y - bandPos) / BAND_W;
					const band = still ? 0 : Math.exp(-s * s);
					displace(x, y, c * 2, r * 2);
					// Crests catch the light, troughs sink back a little.
					const crest = outSwell > 0 ? outSwell : 0;
					const trough = outSwell < 0 ? -outSwell : 0;
					const alpha =
						(major ? 0.3 : 0.16) +
						band * 0.18 +
						crest * 0.3 -
						trough * 0.1 +
						outInfl * outInfl * 0.5;
					const radius =
						(major ? 1.4 : 1) * (1 + outInfl * 1.3) * (1 + crest * 0.5);
					const key = Math.round(Math.min(alpha, 0.85) * 50);
					let path = buckets.get(key);
					if (!path) {
						path = new Path2D();
						buckets.set(key, path);
					}
					path.moveTo(outX + radius, outY);
					path.arc(outX, outY, radius, 0, Math.PI * 2);
				}
			}
			for (const [key, path] of buckets) {
				ctx.fillStyle = `rgba(${BLUE},${key / 50})`;
				ctx.fill(path);
			}
		};

		const drawCrosshair = () => {
			if (lens.amt < 0.01) return;
			const a = lens.amt;
			ctx.strokeStyle = `rgba(${BLUE},${0.55 * a})`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(cross.x, cross.y, 4.5, 0, Math.PI * 2);
			for (const [dx, dy] of [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1],
			]) {
				ctx.moveTo(cross.x + dx * 8, cross.y + dy * 8);
				ctx.lineTo(cross.x + dx * 15, cross.y + dy * 15);
			}
			ctx.stroke();
		};

		const updateWaves = (now: number) => {
			waves.length = 0;
			for (let i = ripples.length - 1; i >= 0; i--) {
				// rAF timestamps can trail the pointer event time, so clamp at 0.
				const p = clamp01((now - ripples[i].t) / RIPPLE_MS);
				if (p >= 1) {
					ripples.splice(i, 1);
					continue;
				}
				const fade = (1 - p) ** 1.5;
				waves.push({
					x: ripples[i].x,
					y: ripples[i].y,
					front: rippleFront(p),
					amp: RIPPLE_AMP * fade,
					glow: 0.85 * fade,
				});
			}
		};

		const drawRipples = (now: number) => {
			for (const ripple of ripples) {
				const p = clamp01((now - ripple.t) / RIPPLE_MS);
				const front = rippleFront(p);
				const fade = (1 - p) ** 1.4;

				// A soft touch point that fades almost at once
				if (p < 0.18) {
					const a = 1 - p / 0.18;
					ctx.fillStyle = `rgba(${BLUE},${0.25 * a})`;
					ctx.beginPath();
					ctx.arc(ripple.x, ripple.y, 3 + p * 30, 0, Math.PI * 2);
					ctx.fill();
				}

				// Three thin trailing rings, each fainter than the one ahead
				for (let k = 0; k < 3; k++) {
					const r = front - k * RING_GAP;
					if (r <= 0) continue;
					ctx.strokeStyle = `rgba(${BLUE},${0.42 * fade * (1 - k * 0.3)})`;
					ctx.lineWidth = Math.max(0.5, 1.4 * (1 - p) - k * 0.25);
					ctx.beginPath();
					ctx.arc(ripple.x, ripple.y, r, 0, Math.PI * 2);
					ctx.stroke();
				}
			}
		};

		const draw = (now: number, still = false) => {
			ctx.clearRect(0, 0, width, height);
			updateSwell(now, still);
			updateWaves(now);
			drawMajorLines();
			drawDots(now, still);
			drawRipples(now);
			drawCrosshair();
		};

		const step = (now: number) => {
			frame = requestAnimationFrame(step);
			// Skip frames past the cap; the 4ms slack keeps 60Hz screens from
			// dropping frames that land a hair early.
			if (now - last < frameGap - 4) return;

			// Normalise to 60fps steps so motion stays even on any refresh rate.
			const dt = Math.min((now - last) / 16.67, 3);
			last = now;

			const target = pointer.active ? 1 : 0;
			if (pointer.active && lens.amt < 0.01) {
				// Appear under the cursor instead of sliding in from the last spot.
				lens.x = pointer.x;
				lens.y = pointer.y;
				const s = snap(pointer.x, pointer.y);
				cross.x = s.x;
				cross.y = s.y;
			}
			lens.amt += (target - lens.amt) * Math.min(1, 0.08 * dt);
			lens.x += (pointer.x - lens.x) * Math.min(1, 0.18 * dt);
			lens.y += (pointer.y - lens.y) * Math.min(1, 0.18 * dt);
			const s = snap(pointer.x, pointer.y);
			cross.x += (s.x - cross.x) * Math.min(1, 0.3 * dt);
			cross.y += (s.y - cross.y) * Math.min(1, 0.3 * dt);

			const t0 = performance.now();
			draw(now);
			cost += (performance.now() - t0 - cost) * 0.05;
			// Frames eating half the 60fps budget: halve the rate for good.
			if (cost > 8) frameGap = 1000 / 30;
		};

		const splash = (clientX: number, clientY: number) => {
			ripples.push({ x: clientX, y: clientY, t: performance.now() });
			while (ripples.length > MAX_RIPPLES) ripples.shift();
		};

		const onMove = (e: PointerEvent) => {
			if (e.pointerType === "touch") return;
			pointer.x = e.clientX;
			pointer.y = e.clientY;
			pointer.active = true;
		};
		const onOut = (e: PointerEvent) => {
			// relatedTarget is null once the pointer leaves the window.
			if (!e.relatedTarget) pointer.active = false;
		};
		const onDown = (e: PointerEvent) => {
			lastPointerType = e.pointerType;
			if (e.pointerType !== "touch") splash(e.clientX, e.clientY);
		};
		const onClick = (e: MouseEvent) => {
			// Taps splash on click, which never fires for a scroll gesture.
			// detail is 0 for keyboard-triggered clicks.
			if (lastPointerType === "touch" && e.detail > 0) {
				splash(e.clientX, e.clientY);
			}
		};
		const onVisibility = () => {
			cancelAnimationFrame(frame);
			if (!document.hidden && !reduce) {
				last = performance.now();
				frame = requestAnimationFrame(step);
			}
		};

		resize();
		window.addEventListener("resize", resize);

		if (reduce) {
			// Still grid, no motion or interaction.
			draw(performance.now(), true);
			return () => window.removeEventListener("resize", resize);
		}

		window.addEventListener("pointermove", onMove, { passive: true });
		window.addEventListener("pointerdown", onDown, { passive: true });
		window.addEventListener("click", onClick, { passive: true });
		document.addEventListener("pointerout", onOut);
		document.addEventListener("visibilitychange", onVisibility);
		frame = requestAnimationFrame(step);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerdown", onDown);
			window.removeEventListener("click", onClick);
			document.removeEventListener("pointerout", onOut);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [reduce]);

	return (
		<div
			aria-hidden
			className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
		>
			{/* Faint wash for depth under the grid */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(70vw 60vh at 20% 0%, rgba(58,82,166,0.08), transparent 60%)," +
						"radial-gradient(60vw 50vh at 100% 60%, rgba(58,82,166,0.06), transparent 60%)",
				}}
			/>
			<canvas ref={canvasRef} className="absolute inset-0" />
		</div>
	);
}
