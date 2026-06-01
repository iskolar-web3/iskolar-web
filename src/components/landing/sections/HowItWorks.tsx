import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import { Compass, FileCheck, Wallet } from "lucide-react"

const steps = [
  {
    icon: Compass,
    title: "Discover",
    description:
      "Browse every opportunity in one place and filter down to the scholarships that actually fit you.",
  },
  {
    icon: FileCheck,
    title: "Apply",
    description:
      "Submit applications and documents digitally. No printing, no queues, no forms lost in transit.",
  },
  {
    icon: Wallet,
    title: "Receive",
    description:
      "Follow your status in real time and receive funds transparently, all the way to disbursement.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-secondary py-20 lg:py-28 px-6 md:px-16"
    >
      {/* Faint grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(240,247,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(240,247,255,0.04)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <MotionContainer className="relative z-26 max-w-5xl mx-auto" viewportMargin="-50px">
        {/* Header */}
        <MotionItem className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse" />
            <span className="text-sm text-tertiary/80 uppercase tracking-wider">How it works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-tertiary mt-2 mb-5 text-balance">
            From scattered listings to scholarships that reach you
          </h2>
          <p className="text-base sm:text-lg text-tertiary/75 max-w-2xl mx-auto text-pretty leading-relaxed">
            Opportunities are spread thin, applications get stuck on paper, and students rarely
            know where they stand. iSkolar closes that gap in three steps.
          </p>
        </MotionItem>

        {/* Steps */}
        <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-9 left-[16%] right-[16%] h-px bg-tertiary/20" />

          {steps.map((step, index) => (
            <MotionItem
              key={step.title}
              className="relative flex flex-col items-center text-center"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.15, duration: 0.5 },
                },
              }}
            >
              <div className="relative z-10 flex items-center justify-center w-18 h-18 rounded-2xl bg-tertiary text-secondary shadow-lg">
                <step.icon className="w-8 h-8" strokeWidth={1.75} />
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-tertiary text-sm font-semibold ring-2 ring-tertiary/30">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl lg:text-2xl text-tertiary mt-6 mb-2">{step.title}</h3>
              <p className="text-sm lg:text-base text-tertiary/75 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </MotionItem>
          ))}
        </div>

        {/* Closing line */}
        <MotionItem className="text-center mt-16 lg:mt-20">
          <div className="inline-flex items-center gap-3 text-tertiary/65 text-base">
            <div className="h-px w-12 bg-tertiary/20" />
            <span>Scholarships that find you, so you don&apos;t have to.</span>
            <div className="h-px w-12 bg-tertiary/20" />
          </div>
        </MotionItem>
      </MotionContainer>
    </section>
  )
}
