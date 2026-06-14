import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

const ROTATING_LABELS = [
  "Get Started",
  "Be a scholar",
  "Be a sponsor",
  "Find Scholarships",
  "Create Programs",
]

export function CTA() {
  const reduce = useReducedMotion()
  const [labelIndex, setLabelIndex] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => {
      setLabelIndex((i) => (i + 1) % ROTATING_LABELS.length)
    }, 3000)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <section id="get-started" className="pb-20 lg:pb-28">
      <motion.div
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 100, damping: 16 }}
        className="relative z-30 overflow-hidden bg-secondary px-4 py-16 sm:px-12 lg:px-26 lg:py-20 text-center"
      >
        {/* Faint ruled-paper texture on the blue card for the academic feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,white_31px,white_32px)]"
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
          <p className="text-tertiary/80 text-lg mt-5 mb-9 max-w-3xl mx-auto text-pretty">
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
            <span className="grid justify-items-center">
              {/* Invisible sizers reserve the widest label's width so the button never resizes */}
              {ROTATING_LABELS.map((label) => (
                <span
                  key={label}
                  aria-hidden
                  className="col-start-1 row-start-1 invisible whitespace-nowrap"
                >
                  {label}
                </span>
              ))}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={labelIndex}
                  initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="col-start-1 row-start-1 whitespace-nowrap"
                >
                  {ROTATING_LABELS[labelIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  )
}
