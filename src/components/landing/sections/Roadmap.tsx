import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
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
  return (
    <section id="roadmap" className="py-16 lg:py-24 px-5">
      <MotionContainer className="max-w-5xl mx-auto relative z-26">
        {/* Section Header */}
        <MotionItem className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm text-secondary uppercase tracking-wider">Roadmap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary mt-4 mb-6 text-balance">
            Our Journey to <span className="text-secondary/55">2026</span>
          </h2>
          <p className="text-lg text-secondary/80 max-w-2xl mx-auto text-pretty">
            We're building iSkolar step by step, ensuring quality and impact at every milestone.
          </p>
        </MotionItem>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-secondary/50 via-secondary to-secondary/10  lg:-translate-x-1/2" />

          {/* Milestone Items */}
          <div className="space-y-8 lg:space-y-10">
            {milestones.map((milestone, index) => (
              <MotionItem
                key={milestone.quarter}
                className="relative pl-12 lg:pl-0"
                variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { 
                        opacity: 1, 
                        y: 0, 
                        transition: { delay: index * 0.2, duration: 0.7 } 
                    }
                }}
              >
                <div
                  className={`lg:flex items-center gap-8 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 w-8 h-8 bg-background border-4 border-secondary rounded-full flex items-center justify-center z-10">
                    <milestone.icon className="w-4 h-4 text-secondary" />
                  </div>

                  {/* Content Card */}
                  <div className={`lg:w-[calc(50%-2rem)] ${index % 2 === 0 ? "lg:text-right lg:pr-8" : "lg:pl-8"}`}>
                    <div className="bg-background rounded-lg px-6 py-4 border border-secondary/20 shadow-sm hover:shadow-sm transition-shadow">
                      <span className="inline-block text-secondary text-base font-semibold mb-3">
                        {milestone.quarter}
                      </span>
                      <h3 className="text-lg md:text-xl text-secondary mb-2">{milestone.title}</h3>
                      <p className="text-secondary/80 leading-relaxed">{milestone.description}</p>
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