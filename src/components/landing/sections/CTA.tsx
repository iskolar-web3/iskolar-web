import { motion, useReducedMotion } from "framer-motion"

export function CTA() {
  const reduce = useReducedMotion()
  return (
    <section id="get-started" className="px-4 pb-20 lg:pb-28">
      <motion.div
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 100, damping: 16 }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-secondary px-6 py-16 sm:px-12 lg:py-20 text-center"
      >
        {/* Faint ruled-paper texture on the blue card for the academic feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,white_31px,white_32px)]"
          aria-hidden
        />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] text-tertiary/70 mb-5">
            <span
              className="w-1.5 h-1.5 bg-tertiary rounded-full"
              style={{ animation: "soft-pulse 3s ease-in-out infinite" }}
            />
            Get started
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-tertiary leading-tight text-balance">
            Ready to start your scholarship journey?
          </h2>
          <p className="text-tertiary/80 text-lg mt-5 mb-9 max-w-2xl mx-auto text-pretty">
            Join students, sponsors, and schools preparing for the future of scholarship management.
          </p>
          <motion.a
            href="/login"
            whileHover={
              reduce
                ? undefined
                : { y: -3, transition: { type: "spring", stiffness: 260, damping: 22 } }
            }
            whileTap={reduce ? undefined : { y: -1 }}
            className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-tertiary text-secondary font-semibold shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)] hover:bg-tertiary/90 transition-colors will-change-transform"
          >
            Get early access
          </motion.a>
        </div>
      </motion.div>
    </section>
  )
}
