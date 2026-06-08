import { useEffect, useRef, useState } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion"
import {
  MotionContainer,
  MotionItem,
} from "@/components/landing/MotionContainer"
import { Rocket, Sparkles, Building, Globe, type LucideIcon } from "lucide-react"

interface Milestone {
  quarter: string
  title: string
  icon: LucideIcon
  description: string
  status: "upcoming" | "planned"
}

const milestones: Milestone[] = [
  {
    quarter: "Q1 2026",
    title: "Pilot Launch",
    icon: Rocket,
    description:
      "MVP release with core features including user registration, scholarship creation, discovery, application submission, scholar selection, and application tracking.",
    status: "upcoming",
  },
  {
    quarter: "Q2 2026",
    title: "AI & Blockchain Integration",
    icon: Sparkles,
    description:
      "Full platform launch with AI-powered scholarship processes, blockchain-based fund disbursements, identity verification systems, and integrated school features.",
    status: "planned",
  },
  {
    quarter: "Q3 2026",
    title: "Institutional Integrations",
    icon: Building,
    description:
      "Onboarding and partnerships with schools, organizations, and government institutions, offering dedicated dashboards and tools.",
    status: "planned",
  },
  {
    quarter: "Q4 2026",
    title: "Nationwide Rollout",
    icon: Globe,
    description:
      "Platform scaling to serve all regions of the Philippines with mobile app launch and expanded partnerships.",
    status: "planned",
  },
]

// Brand blue (#3a52a6 / --secondary) sparks, no new hues — just a lighter
// tint of the same blue for the bright spark cores.
const SPARK_BLUE = "rgba(58,82,166,0.85)"
const SPARK_CORE = "#6f86d6"

// Radial burst of sparks fired when the fill line reaches a circle.
const SPARKS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2
  const dist = i % 2 === 0 ? 30 : 22
  return {
    id: `spark-${i}`,
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    delay: i * 0.015,
  }
})

interface MilestoneNodeProps {
  milestone: Milestone
  scrollYProgress: MotionValue<number>
  timelineRef: React.RefObject<HTMLDivElement | null>
  reduce: boolean
}

// A single timeline circle that glows and sparkles blue the moment the
// scroll-driven fill line reaches its center.
function MilestoneNode({
  milestone,
  scrollYProgress,
  timelineRef,
  reduce,
}: MilestoneNodeProps) {
  const dotRef = useRef<HTMLDivElement>(null)
  const [lit, setLit] = useState(reduce)

  // The fill grows from the top of the timeline to `progress * height`. This
  // circle is "reached" once that leading edge passes its center. Comparing
  // live rects every frame keeps it exact regardless of layout or entrance.
  const reached = (progress: number) => {
    const timeline = timelineRef.current
    const dot = dotRef.current
    if (!timeline || !dot) return false
    const tlRect = timeline.getBoundingClientRect()
    const dotRect = dot.getBoundingClientRect()
    if (tlRect.height <= 0) return false
    const frontPx = progress * tlRect.height
    const dotCenterPx = dotRect.top - tlRect.top + dotRect.height / 2
    return frontPx + 6 >= dotCenterPx
  }

  // Evaluate once on mount so deep links (e.g. /#roadmap) start in the right
  // state instead of waiting for the first scroll event.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time mount sync
  useEffect(() => {
    setLit(reduce ? true : reached(scrollYProgress.get()))
  }, [reduce])

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduce) return
    setLit(reached(value))
  })

  const Icon = milestone.icon
  const burst = lit && !reduce

  return (
    <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 w-10 h-10 z-10">
      {/* One-shot radial glow flash behind the circle */}
      {burst && (
        <motion.span
          aria-hidden
          className="absolute -inset-3 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(58,82,166,0.5) 0%, rgba(58,82,166,0) 70%)",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.6, 1.6, 1.4] }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      )}

      {/* The circle itself: steady blue glow once lit, with a brief scale pop */}
      <motion.div
        ref={dotRef}
        className="relative grid place-items-center w-10 h-10 bg-card border-2 rounded-full overflow-visible"
        animate={{
          borderColor: lit ? "rgba(58,82,166,1)" : "rgba(58,82,166,0.85)",
          boxShadow: lit
            ? "0 0 0 5px rgba(58,82,166,0.16), 0 0 18px 4px rgba(58,82,166,0.55), 0 0 34px 10px rgba(58,82,166,0.26)"
            : "0 0 0 5px rgba(58,82,166,0.08)",
          scale: burst ? [1, 1.16, 1] : 1,
        }}
        transition={{
          scale: { duration: 0.55, ease: "easeOut" },
          boxShadow: { duration: 0.5, ease: "easeOut" },
          borderColor: { duration: 0.4 },
        }}
      >
        <Icon
          className={`w-5 h-5 transition-[color,filter] duration-500 ${lit ? "text-secondary" : "text-secondary/90"}`}
          style={
            lit && !reduce
              ? { filter: "drop-shadow(0 0 5px rgba(58,82,166,0.85))" }
              : undefined
          }
          strokeWidth={1.75}
        />

        {milestone.status === "upcoming" && (
          <span
            aria-hidden
            className="absolute inset-[-3px] rounded-full ring-2 ring-secondary/40"
            style={{ animation: "soft-pulse 2s ease-in-out infinite" }}
          />
        )}

        {/* One-shot expanding ring ripple */}
        {burst && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-secondary/60 pointer-events-none"
            initial={{ opacity: 0.7, scale: 0.7 }}
            animate={{ opacity: 0, scale: 2.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        )}

        {/* One-shot spark particles bursting outward */}
        {burst && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            {SPARKS.map((s) => (
              <motion.span
                key={s.id}
                aria-hidden
                className="col-start-1 row-start-1 h-1 w-1 rounded-full"
                style={{
                  backgroundColor: SPARK_CORE,
                  boxShadow: `0 0 6px 1px ${SPARK_BLUE}`,
                }}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{
                  x: [0, s.x],
                  y: [0, s.y],
                  opacity: [0, 1, 0],
                  scale: [0.4, 1, 0.2],
                }}
                transition={{ duration: 0.7, delay: s.delay, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export function Roadmap() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 60%"],
  })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  // Glowing node that rides the leading edge of the fill as it travels down.
  const tipTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const tipOpacity = useTransform(
    scrollYProgress,
    [0, 0.02, 0.98, 1],
    [0, 1, 1, 0],
  )

  return (
    <section id="roadmap" className="py-20 lg:py-28 px-4 sm:px-12 lg:px-26">
      <MotionContainer className="relative z-30">
        {/* Section Header */}
        <MotionItem className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <div
              className="w-1.5 h-1.5 bg-secondary rounded-full"
              style={{ animation: "soft-pulse 3s ease-in-out infinite" }}
            />
            <span className="text-xs uppercase tracking-[0.2em] text-secondary/55">
              Roadmap
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary leading-tight text-balance">
            Our journey to 2026
          </h2>
          <p className="text-lg text-secondary/80 max-w-2xl mx-auto text-pretty mt-6">
            Building iSkolar step by step, with quality and impact at every stage.
          </p>
        </MotionItem>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Faint full-height rail + scroll-driven brand fill */}
          <div
            className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-secondary/12 lg:-translate-x-1/2"
            aria-hidden
          />
          <motion.div
            style={{ scaleY: reduce ? 1 : lineScale }}
            className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 origin-top bg-linear-to-b from-secondary via-secondary to-secondary/30 lg:-translate-x-1/2 shadow-[0_0_10px_1px_rgba(58,82,166,0.45)]"
            aria-hidden
          />

          {/* Glowing tip that travels along the leading edge of the fill */}
          {!reduce && (
            <motion.span
              aria-hidden
              style={{
                top: tipTop,
                opacity: tipOpacity,
                backgroundColor: SPARK_CORE,
                boxShadow: `0 0 12px 3px ${SPARK_BLUE}`,
              }}
              className="absolute left-4 lg:left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-[5]"
            />
          )}

          {/* Milestone Items */}
          <div className="space-y-8 lg:space-y-10">
            {milestones.map((milestone, index) => (
              <MotionItem
                key={milestone.quarter}
                className="relative pl-12 lg:pl-0"
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.2, duration: 0.6 },
                  },
                }}
              >
                <div
                  className={`lg:flex items-center gap-8 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                >
                  {/* Timeline Dot */}
                  <MilestoneNode
                    milestone={milestone}
                    scrollYProgress={scrollYProgress}
                    timelineRef={timelineRef}
                    reduce={reduce}
                  />

                  {/* Content Card */}
                  <div className={`lg:w-[calc(50%-2rem)] ${index % 2 === 0 ? "lg:text-right lg:pr-8" : "lg:pl-8"}`}>
                    <div className="relative border-y border-secondary/15 py-6">
                      <div className={`flex flex-wrap items-center gap-2.5 mb-3 ${index % 2 === 0 ? "lg:justify-end" : ""}`}>
                        <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-secondary">
                          {milestone.quarter}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl text-secondary mb-2">{milestone.title}</h3>
                      <p className="text-sm text-secondary/80 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden lg:block lg:w-[calc(50%-2rem)]" />
                </div>
              </MotionItem>
            ))}
          </div>
        </div>
      </MotionContainer>
    </section>
  )
}
