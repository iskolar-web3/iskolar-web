import { motion, useReducedMotion } from "framer-motion"
import {
  MotionContainer,
  MotionItem,
  cardHoverLift,
} from "@/components/landing/MotionContainer"
import {
  GraduationCap,
  Building2,
  School,
  Landmark,
  BookOpen,
  UserRound,
  Heart,
} from "lucide-react"

const userTypes = [
  {
    icon: GraduationCap,
    title: "Students",
    subtitle: "Aspiring Scholars",
    description:
      "Discover scholarships, apply with ease, and track your applications in real time.",
    subTypes: [
      { icon: BookOpen, label: "Pre-College" },    
      { icon: UserRound, label: "Undergraduates" }, 
    ],
  },
  {
    icon: Building2,
    title: "Sponsors",
    subtitle: "Scholarship Providers",
    description: "Create scholarships, evaluate applicants, and track disbursements transparently.",
    subTypes: [
      { icon: Heart, label: "Individuals" },
      { icon: Building2, label: "Organizations" },
      { icon: Landmark, label: "Governments" },
    ],
  },
  {
    icon: School,
    title: "Schools",
    subtitle: "Educational Institutions",
    description:
      "Monitor scholarships, ensure compliance, and support transparency.",
    subTypes: [
      { icon: Landmark, label: "Public" },
      { icon: Building2, label: "Private" },
    ],
  },
]

export function TargetUsers() {
  const reduce = useReducedMotion()
  const lift = reduce ? {} : cardHoverLift

  return (
    <section
      id="about"
      className="py-20 lg:py-28 px-4 sm:px-12 lg:px-26 relative overflow-hidden"
    >
      <MotionContainer className="relative z-30">
        {/* Section Header */}
        <MotionItem className="flex flex-col items-center text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <div
              className="w-1.5 h-1.5 bg-secondary rounded-full"
              style={{ animation: "soft-pulse 3s ease-in-out infinite" }}
            />
            <span className="text-xs uppercase tracking-[0.2em] text-secondary/55">
              Who it's for
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight text-secondary text-balance">
            Built for the scholarship ecosystem
          </h2>
          <p className="mt-5 text-sm sm:text-base text-secondary/70 max-w-xl mx-auto text-pretty">
            Three perspectives, one streamlined experience.
          </p>
        </MotionItem>

        {/* User Type Cards */}
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
          {userTypes.map((user, index) => (
            <MotionItem
              key={user.title}
              className="group relative h-full"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.15, duration: 0.5 },
                },
              }}
            >
              <motion.div
                {...lift}
                className="ruled-paper relative h-full flex flex-col rounded-3xl border border-border bg-card px-8 pt-8 pb-7 overflow-hidden will-change-transform"
              >
                {/* Icon */}
                <div className="relative flex justify-center pb-5">
                  <user.icon className="size-16 text-secondary" strokeWidth={1.5} />
                </div>

                {/* Title and Subtitle */}
                <div className="relative text-center pb-5">
                  <h3 className="text-2xl sm:text-[1.75rem] text-secondary leading-snug">
                    {user.title}
                  </h3>
                  <p className="mt-1.5 text-[12px] uppercase tracking-[0.18em] text-secondary/55">
                    {user.subtitle}
                  </p>
                </div>

                {/* Description */}
                <div className="relative grow pb-5">
                  <p className="text-sm md:text-base text-secondary/80 leading-relaxed">
                    {user.description}
                  </p>
                </div>

                {user.subTypes && (
                  <div className="relative flex flex-wrap gap-2 pt-1">
                    {user.subTypes.map((subType) => (
                      <span
                        key={subType.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-secondary/15 bg-secondary/[0.06] px-3 py-1 text-[12px] tracking-tight text-secondary/85 transition-colors duration-300 hover:bg-secondary/[0.12]"
                      >
                        <subType.icon className="size-3.5 text-secondary/70" />
                        {subType.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Highlighter draw-in accent (left to right on hover) */}
                <span className="pointer-events-none absolute inset-x-8 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-secondary/45 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
              </motion.div>
            </MotionItem>
          ))}
        </div>
      </MotionContainer>
    </section>
  )
}