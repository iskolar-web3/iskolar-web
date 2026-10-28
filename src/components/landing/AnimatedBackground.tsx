import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

// Interactive particle field behind the landing pages. Dots drift slowly and
// link to close neighbours; the cursor gently pushes them aside and draws
// threads to the nearest ones, and a click sends out a soft ripple.
// Strictly brand blue (#3a52a6) on the light background.

type Particle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	/** Resting drift velocity the particle eases back to after a push. */
	dx: number;
	dy: number;
	r: number;
	a: number;
};

type Ripple = { x: number; y: number; t: number };

const BLUE = "58,82,166";
const LINK_DIST = 120;
const HOVER_RADIUS = 160;
const RIPPLE_RADIUS = 240;
const RIPPLE_MS = 900;

function createParticles(width: number, height: number): Particle[] {
	const count = Math.round(
		Math.min(130, Math.max(36, (width * height) / 13000)),
	);
	return Array.from({ length: count }, () => {
		const angle = Math.random() * Math.PI * 2;
		const speed = 0.08 + Math.random() * 0.17;
		const dx = Math.cos(angle) * speed;
		const dy = Math.sin(angle) * speed;
		return {
			x: Math.random() * width,
			y: Math.random() * height,
			vx: dx,
			vy: dy,
			dx,
			dy,
			r: 1 + Math.random() * 1.6,
			a: 0.25 + Math.random() * 0.45,
		};
	});
}

export default function AnimatedBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const reduce = useReducedMotion();

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		let width = 0;
		let height = 0;
		let particles: Particle[] = [];
		const ripples: Ripple[] = [];
		const pointer = { x: 0, y: 0, active: false };
		let frame = 0;
		let last = performance.now();

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const prevWidth = width;
			const prevHeight = height;
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			if (particles.length === 0) {
				particles = createParticles(width, height);
			} else {
				// Keep the same field on resize (mobile URL bar, rotation) so dots never jump.
				for (const p of particles) {
					p.x *= width / prevWidth;
					p.y *= height / prevHeight;
				}
			}
			if (reduce) draw(performance.now());
		};

		const draw = (now: number) => {
			ctx.clearRect(0, 0, width, height);

			// Links between neighbours
			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				for (let j = i + 1; j < particles.length; j++) {
					const q = particles[j];
					const dist = Math.hypot(p.x - q.x, p.y - q.y);
					if (dist < LINK_DIST) {
						ctx.strokeStyle = `rgba(${BLUE},${(1 - dist / LINK_DIST) * 0.16})`;
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(p.x, p.y);
						ctx.lineTo(q.x, q.y);
						ctx.stroke();
					}
				}
			}

			// Threads from the cursor to nearby particles, over a soft glow
			if (pointer.active) {
				const glow = ctx.createRadialGradient(
					pointer.x,
					pointer.y,
					0,
					pointer.x,
					pointer.y,
					HOVER_RADIUS,
				);
				glow.addColorStop(0, `rgba(${BLUE},0.08)`);
				glow.addColorStop(1, `rgba(${BLUE},0)`);
				ctx.fillStyle = glow;
				ctx.beginPath();
				ctx.arc(pointer.x, pointer.y, HOVER_RADIUS, 0, Math.PI * 2);
				ctx.fill();

				for (const p of particles) {
					const dist = Math.hypot(p.x - pointer.x, p.y - pointer.y);
					if (dist < HOVER_RADIUS * 1.3) {
						ctx.strokeStyle = `rgba(${BLUE},${(1 - dist / (HOVER_RADIUS * 1.3)) * 0.5})`;
						ctx.beginPath();
						ctx.moveTo(pointer.x, pointer.y);
						ctx.lineTo(p.x, p.y);
						ctx.stroke();
					}
				}
			}

			// Dots
			for (const p of particles) {
				ctx.fillStyle = `rgba(${BLUE},${p.a})`;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
				ctx.fill();
			}

			// Click ripples: an expanding ring that fades out
			for (let i = ripples.length - 1; i >= 0; i--) {
				const ripple = ripples[i];
				// rAF timestamps can trail the pointer event time, so clamp at 0.
				const t = Math.max(0, (now - ripple.t) / RIPPLE_MS);
				if (t >= 1) {
					ripples.splice(i, 1);
					continue;
				}
				const eased = 1 - (1 - t) ** 3;
				ctx.strokeStyle = `rgba(${BLUE},${(1 - t) * 0.35})`;
				ctx.lineWidth = 1.25;
				ctx.beginPath();
				ctx.arc(ripple.x, ripple.y, eased * RIPPLE_RADIUS, 0, Math.PI * 2);
				ctx.stroke();
			}
		};

		const step = (now: number) => {
			// Normalise to 60fps steps so motion stays even on any refresh rate.
			const dt = Math.min((now - last) / 16.67, 3);
			last = now;

			for (const p of particles) {
				if (pointer.active) {
					const ox = p.x - pointer.x;
					const oy = p.y - pointer.y;
					const dist = Math.hypot(ox, oy);
					if (dist > 0 && dist < HOVER_RADIUS) {
						const force = (1 - dist / HOVER_RADIUS) * 0.06;
						p.vx += (ox / dist) * force * dt;
						p.vy += (oy / dist) * force * dt;
					}
				}

				// Ease back toward the resting drift for a smooth settle.
				p.vx += (p.dx - p.vx) * 0.025 * dt;
				p.vy += (p.dy - p.vy) * 0.025 * dt;
				p.x += p.vx * dt;
				p.y += p.vy * dt;

				// Wrap around the edges
				if (p.x < -10) p.x = width + 10;
				else if (p.x > width + 10) p.x = -10;
				if (p.y < -10) p.y = height + 10;
				else if (p.y > height + 10) p.y = -10;
			}

			draw(now);
			frame = requestAnimationFrame(step);
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
			ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
			for (const p of particles) {
				const ox = p.x - e.clientX;
				const oy = p.y - e.clientY;
				const dist = Math.hypot(ox, oy);
				if (dist > 0 && dist < RIPPLE_RADIUS) {
					const impulse = (1 - dist / RIPPLE_RADIUS) * 4;
					p.vx += (ox / dist) * impulse;
					p.vy += (oy / dist) * impulse;
				}
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
			// Still field, no motion or interaction.
			draw(performance.now());
			return () => window.removeEventListener("resize", resize);
		}

		window.addEventListener("pointermove", onMove, { passive: true });
		window.addEventListener("pointerdown", onDown, { passive: true });
		document.addEventListener("pointerout", onOut);
		document.addEventListener("visibilitychange", onVisibility);
		frame = requestAnimationFrame(step);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerdown", onDown);
			document.removeEventListener("pointerout", onOut);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [reduce]);

	return (
		<div
			aria-hidden
			className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
		>
			{/* Faint wash for depth under the particles */}
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
