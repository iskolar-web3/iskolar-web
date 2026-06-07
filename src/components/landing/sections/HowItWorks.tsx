import { motion, useReducedMotion } from "framer-motion"
import {
  Activity,
  Building2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  HandCoins,
  type LucideIcon,
  SquarePen,
  Wallet,
} from "lucide-react"
import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"

type Feature = {
  icon: LucideIcon
  title: string
  description: string
  position: "left" | "right"
}

// Left = the student journey, right = the sponsor journey (same content as the
// previous How it works section, laid out around the central hub).
const features: Feature[] = [
  {
    icon: Compass,
    title: "Discover & Apply",
    description: "Browse scholarships, then apply and submit documents digitally. No printing, no queues.",
    position: "left",
  },
  {
    icon: Activity,
    title: "Track",
    description: "Follow every application in real time and always know exactly where you stand.",
    position: "left",
  },
  {
    icon: Wallet,
    title: "Receive",
    description: "Receive your funds transparently once you are selected, all the way to disbursement.",
    position: "left",
  },
  {
    icon: SquarePen,
    title: "Create",
    description: "Set up scholarships with eligibility rules that match exactly what you are looking for.",
    position: "right",
  },
  {
    icon: ClipboardCheck,
    title: "Review",
    description: "Evaluate and shortlist applicants fairly, with everything you need in one workspace.",
    position: "right",
  },
  {
    icon: HandCoins,
    title: "Disburse",
    description: "Release funds transparently and follow every payout through to completion.",
    position: "right",
  },
]

const students = features.filter((f) => f.position === "left")
const sponsors = features.filter((f) => f.position === "right")

// Concentric orbital rings, faint to slightly stronger toward the center.
// Brand blue (#3a52a6) at low opacity, applied inline so Tailwind does not
// need to see runtime-built opacity classes.
const rings = [
  { size: 1025, color: "rgba(58,82,166,0.12)", delay: 0.32 },
  { size: 855, color: "rgba(58,82,166,0.18)", delay: 0.24 },
  { size: 690, color: "rgba(58,82,166,0.21)", delay: 0.16 },
  { size: 520, color: "rgba(58,82,166,0.24)", delay: 0.08 },
  { size: 350, color: "rgba(58,82,166,0.28)", delay: 0 },
]

function PersonaLabel({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-card px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-secondary shadow-sm">
      <Icon className="w-4 h-4" strokeWidth={1.75} />
      {label}
    </span>
  )
}

function FeatureCard({ feature, side }: { feature: Feature; side: "left" | "right" }) {
  const Icon = feature.icon
  const isLeft = side === "left"
  return (
    <MotionItem
      className={`group relative flex items-start gap-4 min-h-[150px] bg-card border border-secondary/20 px-8 py-6 transition-all duration-300 hover:shadow-sm ${
        isLeft
          ? "rounded-tr-full rounded-bl-full hover:-translate-x-1"
          : "flex-row-reverse rounded-tl-full rounded-br-full hover:translate-x-1"
      } motion-reduce:transition-none motion-reduce:hover:translate-x-0`}
    >
      <Icon
        className="shrink-0 w-8 h-8 text-secondary/70 transition-colors duration-300 group-hover:text-secondary"
        strokeWidth={1.5}
      />
      <div className={`flex-1 ${isLeft ? "" : "text-right"}`}>
        <h3 className="text-[19px] text-secondary mb-1">{feature.title}</h3>
        <p className="text-sm text-secondary/80 leading-relaxed">{feature.description}</p>
      </div>
    </MotionItem>
  )
}

export function HowItWorks() {
  const reduce = useReducedMotion()
  const popIn = reduce ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }

  return (
    <section
      id="how-it-works"
      className="relative py-16 lg:py-28 px-4 sm:px-12 overflow-hidden"
    >
      <div className="relative z-30">
        {/* Section Header */}
        <MotionContainer className="text-center mb-16 lg:mb-24" viewportMargin="-50px">
          <MotionItem>
            <div className="inline-flex items-center gap-2 mb-3">
              <div
                className="w-1.5 h-1.5 bg-secondary rounded-full"
                style={{ animation: "soft-pulse 3s ease-in-out infinite" }}
              />
              <span className="text-sm text-secondary/80 uppercase tracking-wider">
                How it works
              </span>
            </div>
          </MotionItem>
          <MotionItem>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary leading-[1.15] tracking-tight mt-2 mb-5 text-balance">
              From scattered listings to scholarships that reach you
            </h2>
          </MotionItem>
          <MotionItem>
            <p className="text-base sm:text-lg text-secondary/75 max-w-2xl mx-auto text-pretty leading-relaxed">
              One clear path for students and sponsors, from discovery to disbursement.
            </p>
          </MotionItem>
        </MotionContainer>

        {/* Mobile: grouped, numbered-free stacks */}
        <div className="lg:hidden space-y-12">
          {[
            { label: "For students", icon: GraduationCap, items: students },
            { label: "For sponsors", icon: Building2, items: sponsors },
          ].map((persona) => (
            <MotionContainer key={persona.label} className="space-y-5" staggerDelay={0.12}>
              <MotionItem>
                <PersonaLabel icon={persona.icon} label={persona.label} />
              </MotionItem>
              {persona.items.map((feature) => {
                const Icon = feature.icon
                const isLeft = feature.position === "left"
                return (
                  <MotionItem
                    key={feature.title}
                    className={`group relative flex items-start gap-4 bg-card border border-secondary/20 p-6 transition-all duration-300 hover:shadow-sm ${
                      isLeft
                        ? "rounded-tr-3xl rounded-bl-3xl"
                        : "flex-row-reverse rounded-tl-3xl rounded-br-3xl"
                    }`}
                  >
                    <Icon
                      className="shrink-0 w-8 h-8 text-secondary/70 transition-colors duration-300 group-hover:text-secondary"
                      strokeWidth={1.5}
                    />
                    <div className={`flex-1 ${isLeft ? "" : "text-right"}`}>
                      <h3 className="text-lg text-secondary mb-1">{feature.title}</h3>
                      <p className="text-sm text-secondary/80 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </MotionItem>
                )
              })}
            </MotionContainer>
          ))}
        </div>

        {/* Desktop: orbital layout */}
        <div className="hidden lg:block relative">
          <div className="relative mx-auto max-w-6xl">
            {/* Central hub */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 10 }}
              initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Soft glow for depth */}
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-secondary/[0.06] blur-3xl"
              />

              {/* Orbital rings */}
              {rings.map((ring) => (
                <motion.div
                  key={ring.size}
                  aria-hidden
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ width: ring.size, height: ring.size, borderColor: ring.color }}
                  initial={popIn}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.0, delay: ring.delay, ease: [0.34, 1.56, 0.64, 1] }}
                />
              ))}

              {/* Center logo */}
              <motion.div
                className="relative w-50 h-50 rounded-full border-2 border-secondary/30 bg-card shadow-2xl flex items-center justify-center overflow-hidden"
                initial={popIn}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <img src="/logo.png" alt="iSkolar" className="w-40 h-40 object-contain" />
              </motion.div>
            </motion.div>

            {/* Feature cards */}
            <MotionContainer
              className="relative z-20"
              style={{ minHeight: "925px" }}
              staggerDelay={0.12}
            >
              {/* Left = students */}
              <div className="absolute left-[25px] top-1/2 -translate-y-1/2 w-[360px]">
                <MotionItem className="mb-6">
                  <PersonaLabel icon={GraduationCap} label="For students" />
                </MotionItem>
                <div className="space-y-6">
                  {students.map((feature) => (
                    <FeatureCard key={feature.title} feature={feature} side="left" />
                  ))}
                </div>
              </div>

              {/* Right = sponsors */}
              <div className="absolute right-[25px] top-1/2 -translate-y-1/2 w-[360px]">
                <MotionItem className="mb-6 flex justify-end">
                  <PersonaLabel icon={Building2} label="For sponsors" />
                </MotionItem>
                <div className="space-y-6">
                  {sponsors.map((feature) => (
                    <FeatureCard key={feature.title} feature={feature} side="right" />
                  ))}
                </div>
              </div>
            </MotionContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
