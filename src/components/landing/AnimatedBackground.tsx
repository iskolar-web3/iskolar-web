import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

// Blueprint grid behind the landing pages, like a sheet of graph paper. A soft
// light band drifts across it; the cursor bends the grid like a magnifying lens
// and marks the nearest grid point; a click draws a compass construction, and a
// second quick click elsewhere joins the two points with a measured ruler line.
// Strictly brand blue (#3a52a6) on the light background.

type Construction =
	| {
			kind: "circle";
			x: number;
			y: number;
			units: number;
			angle: number;
			t: number;
	  }
	| {
			kind: "ruler";
			ax: number;
			ay: number;
			bx: number;
			by: number;
			t: number;
	  };

const BLUE = "58,82,166";
const GAP = 32;
const MAJOR_EVERY = 4;
const LENS_R = 170;
const LENS_PUSH = 0.45;
const BAND_W = 140;
const BAND_MS = 14000;
const CONSTRUCT_MS = 2600;
const RULER_WINDOW_MS = 1200;
const MAX_CONSTRUCTIONS = 8;
const FONT = '11px "Bree Serif", serif';

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export default function AnimatedBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const reduce = useReducedMotion();

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		let width = 0;
		let height = 0;
		// Grid origin, centred so the margins match on both sides.
		let originX = 0;
		let originY = 0;
		let cols = 0;
		let rows = 0;
		const constructions: Construction[] = [];
		const pointer = { x: 0, y: 0, active: false };
		// Lens and crosshair trail the pointer slightly so they glide.
		const lens = { x: 0, y: 0, amt: 0 };
		const cross = { x: 0, y: 0 };
		let lastClick: { x: number; y: number; t: number } | null = null;
		let lastPointerType = "mouse";
		let frame = 0;
		let last = performance.now();

		// Displaced position and lens influence (0..1) of a grid point, written
		// into shared vars to avoid allocating per dot per frame.
		let outX = 0;
		let outY = 0;
		let outInfl = 0;
		const displace = (x: number, y: number) => {
			outX = x;
			outY = y;
			outInfl = 0;
			if (lens.amt < 0.01) return;
			const ox = x - lens.x;
			const oy = y - lens.y;
			const dist = Math.hypot(ox, oy);
			if (dist >= LENS_R) return;
			const f = 1 - dist / LENS_R;
			const push = f * f * LENS_PUSH * lens.amt;
			outX = x + ox * push;
			outY = y + oy * push;
			outInfl = f * lens.amt;
		};

		const snap = (x: number, y: number) => ({
			x: originX + Math.round((x - originX) / GAP) * GAP,
			y: originY + Math.round((y - originY) / GAP) * GAP,
		});

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
			if (reduce) draw(performance.now(), true);
		};

		const drawMajorLines = () => {
			ctx.strokeStyle = `rgba(${BLUE},0.05)`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			// Sample at half steps so lines bend smoothly through the lens.
			const step = GAP / 2;
			for (let c = 0; c < cols; c += MAJOR_EVERY) {
				const x = originX + c * GAP;
				for (
					let y = originY, i = 0;
					y <= originY + (rows - 1) * GAP;
					y += step, i++
				) {
					displace(x, y);
					if (i === 0) ctx.moveTo(outX, outY);
					else ctx.lineTo(outX, outY);
				}
			}
			for (let r = 0; r < rows; r += MAJOR_EVERY) {
				const y = originY + r * GAP;
				for (
					let x = originX, i = 0;
					x <= originX + (cols - 1) * GAP;
					x += step, i++
				) {
					displace(x, y);
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
					displace(x, y);
					const alpha =
						(major ? 0.3 : 0.16) + band * 0.18 + outInfl * outInfl * 0.5;
					const radius = (major ? 1.4 : 1) * (1 + outInfl * 1.3);
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

		const drawConstruction = (item: Construction, now: number) => {
			// rAF timestamps can trail the pointer event time, so clamp at 0.
			const p = clamp01((now - item.t) / CONSTRUCT_MS);
			const fade = p < 0.7 ? 1 : 1 - easeOut((p - 0.7) / 0.3);
			ctx.lineWidth = 1.25;
			ctx.font = FONT;

			if (item.kind === "circle") {
				const radius = item.units * GAP;
				const arm = easeOut(clamp01(p / 0.12));
				const sweep = easeOut(clamp01((p - 0.12) / 0.43));
				const end = item.angle + sweep * Math.PI * 2;
				const armX = item.x + Math.cos(end) * radius * arm;
				const armY = item.y + Math.sin(end) * radius * arm;

				// Compass arm, dashed like a construction line
				ctx.strokeStyle = `rgba(${BLUE},${0.35 * fade})`;
				ctx.setLineDash([4, 4]);
				ctx.beginPath();
				ctx.moveTo(item.x, item.y);
				ctx.lineTo(armX, armY);
				ctx.stroke();
				ctx.setLineDash([]);

				// The arc drawing itself
				if (sweep > 0) {
					ctx.strokeStyle = `rgba(${BLUE},${0.45 * fade})`;
					ctx.beginPath();
					ctx.arc(item.x, item.y, radius, item.angle, end);
					ctx.stroke();
				}

				// Pivot and pencil point
				ctx.fillStyle = `rgba(${BLUE},${0.6 * fade})`;
				ctx.beginPath();
				ctx.arc(item.x, item.y, 2.5, 0, Math.PI * 2);
				ctx.moveTo(armX + 2, armY);
				ctx.arc(armX, armY, 2, 0, Math.PI * 2);
				ctx.fill();

				const labelAlpha = clamp01((p - 0.08) / 0.1) * fade;
				if (labelAlpha > 0) {
					const lx = item.x + Math.cos(end) * radius * 0.5;
					const ly = item.y + Math.sin(end) * radius * 0.5;
					// Nudge the label off the arm so the dashes don't cross it.
					const nx = -Math.sin(end) * 12;
					const ny = Math.cos(end) * 12;
					ctx.fillStyle = `rgba(${BLUE},${0.55 * labelAlpha})`;
					ctx.fillText(`r = ${item.units}`, lx + nx - 12, ly + ny + 4);
				}
				return;
			}

			const grow = easeOut(clamp01(p / 0.2));
			const dx = item.bx - item.ax;
			const dy = item.by - item.ay;
			const length = Math.hypot(dx, dy);
			const ux = dx / length;
			const uy = dy / length;
			const ex = item.ax + dx * grow;
			const ey = item.ay + dy * grow;

			ctx.strokeStyle = `rgba(${BLUE},${0.45 * fade})`;
			ctx.beginPath();
			ctx.moveTo(item.ax, item.ay);
			ctx.lineTo(ex, ey);
			// Ruler ticks every grid unit along the drawn part
			for (let d = 0; d <= length * grow; d += GAP) {
				const tx = item.ax + ux * d;
				const ty = item.ay + uy * d;
				ctx.moveTo(tx - uy * 4, ty + ux * 4);
				ctx.lineTo(tx + uy * 4, ty - ux * 4);
			}
			ctx.stroke();

			const labelAlpha = clamp01((p - 0.18) / 0.1) * fade;
			if (labelAlpha > 0) {
				const units = (length / GAP).toFixed(1).replace(/\.0$/, "");
				ctx.fillStyle = `rgba(${BLUE},${0.55 * labelAlpha})`;
				ctx.fillText(
					`d = ${units}`,
					item.ax + dx / 2 - uy * 14 - 14,
					item.ay + dy / 2 + ux * 14 + 4,
				);
			}
		};

		const draw = (now: number, still = false) => {
			ctx.clearRect(0, 0, width, height);
			drawMajorLines();
			drawDots(now, still);
			drawCrosshair();
			for (let i = constructions.length - 1; i >= 0; i--) {
				if (now - constructions[i].t >= CONSTRUCT_MS)
					constructions.splice(i, 1);
			}
			for (const item of constructions) drawConstruction(item, now);
		};

		const step = (now: number) => {
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

			draw(now);
			frame = requestAnimationFrame(step);
		};

		const construct = (clientX: number, clientY: number) => {
			const now = performance.now();
			const point = snap(clientX, clientY);
			constructions.push({
				kind: "circle",
				x: point.x,
				y: point.y,
				units: 2 + Math.floor(Math.random() * 3),
				angle: Math.random() * Math.PI * 2,
				t: now,
			});
			if (
				lastClick &&
				now - lastClick.t < RULER_WINDOW_MS &&
				(lastClick.x !== point.x || lastClick.y !== point.y)
			) {
				constructions.push({
					kind: "ruler",
					ax: lastClick.x,
					ay: lastClick.y,
					bx: point.x,
					by: point.y,
					t: now,
				});
				lastClick = null;
			} else {
				lastClick = { ...point, t: now };
			}
			while (constructions.length > MAX_CONSTRUCTIONS) constructions.shift();
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
			if (e.pointerType !== "touch") construct(e.clientX, e.clientY);
		};
		const onClick = (e: MouseEvent) => {
			// Taps draw on click, which never fires for a scroll gesture.
			// detail is 0 for keyboard-triggered clicks.
			if (lastPointerType === "touch" && e.detail > 0) {
				construct(e.clientX, e.clientY);
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
