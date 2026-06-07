import { useRef } from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import {
  MotionContainer,
  MotionItem,
} from "@/components/landing/MotionContainer"
import { Rocket, Sparkles, Building, Globe } from "lucide-react"

const milestones = [
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

export function Roadmap() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 60%"],
  })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="roadmap" className="py-16 lg:py-24 px-4 sm:px-12 lg:px-26">
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
            className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 origin-top bg-gradient-to-b from-secondary via-secondary to-secondary/30 lg:-translate-x-1/2"
            aria-hidden
          />

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
                        transition: { delay: index * 0.2, duration: 0.6 }
                    }
                }}
              >
                <div
                  className={`lg:flex items-center gap-8 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 grid place-items-center w-10 h-10 bg-card border-2 border-secondary rounded-full z-10 shadow-[0_0_0_5px_rgba(58,82,166,0.08)]">
                    <milestone.icon className="w-5 h-5 text-secondary" strokeWidth={1.75} />
                    {milestone.status === "upcoming" && (
                      <span
                        aria-hidden
                        className="absolute inset-[-3px] rounded-full ring-2 ring-secondary/40"
                        style={{ animation: "soft-pulse 2s ease-in-out infinite" }}
                      />
                    )}
                  </div>

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