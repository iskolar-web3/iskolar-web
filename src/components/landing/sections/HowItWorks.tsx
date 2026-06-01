import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import {
  Building2,
  ClipboardCheck,
  Compass,
  FileCheck,
  GraduationCap,
  HandCoins,
  SquarePen,
  Wallet,
} from "lucide-react"

const tracks = [
  {
    audience: "For students",
    icon: GraduationCap,
    steps: [
      {
        icon: Compass,
        title: "Discover",
        description: "Browse every opportunity in one place and filter down to the scholarships that fit you.",
      },
      {
        icon: FileCheck,
        title: "Apply",
        description: "Submit applications and documents digitally. No printing, no queues, no forms lost in transit.",
      },
      {
        icon: Wallet,
        title: "Receive",
        description: "Follow your status in real time and receive funds transparently, all the way to disbursement.",
      },
    ],
  },
  {
    audience: "For sponsors",
    icon: Building2,
    steps: [
      {
        icon: SquarePen,
        title: "Create",
        description: "Set up scholarships with eligibility rules that match exactly what you are looking for.",
      },
      {
        icon: ClipboardCheck,
        title: "Review",
        description: "Evaluate and shortlist applicants fairly, with everything you need in one workspace.",
      },
      {
        icon: HandCoins,
        title: "Disburse",
        description: "Release funds transparently and follow every payout through to completion.",
      },
    ],
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
            One clear path for students and sponsors, from discovery to disbursement.
          </p>
        </MotionItem>

        {/* Persona tracks */}
        <div className="space-y-16 lg:space-y-20">
          {tracks.map((track) => (
            <div key={track.audience}>
              {/* Track label */}
              <MotionItem className="flex items-center gap-3 mb-10">
                <track.icon className="w-6 h-6 text-tertiary" strokeWidth={1.75} />
                <h3 className="text-lg sm:text-xl text-tertiary tracking-tight">{track.audience}</h3>
                <div className="h-px flex-1 bg-tertiary/15" />
              </MotionItem>

              {/* Steps */}
              <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
                {/* Connecting line on desktop */}
                <div className="hidden md:block absolute top-5 left-[16%] right-[16%] h-px bg-tertiary/20" />

                {track.steps.map((step, index) => (
                  <MotionItem
                    key={step.title}
                    className="relative flex flex-col items-center text-center"
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.12, duration: 0.5 },
                      },
                    }}
                  >
                    <div className="relative z-10 flex items-center justify-center bg-secondary px-4">
                      <step.icon className="w-10 h-10 text-tertiary" strokeWidth={1.5} />
                      <span className="absolute -top-2 -right-1 text-xs font-semibold text-tertiary/50">
                        0{index + 1}
                      </span>
                    </div>
                    <h4 className="text-lg lg:text-xl text-tertiary mt-5 mb-2">{step.title}</h4>
                    <p className="text-sm lg:text-base text-tertiary/75 leading-relaxed max-w-xs">
                      {step.description}
                    </p>
                  </MotionItem>
                ))}
              </div>
            </div>
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
