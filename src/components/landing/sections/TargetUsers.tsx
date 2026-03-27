import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
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
    color: "bg-secondary",
    description:
      "Discover scholarships, apply with ease, and track your applications in real-time.",
    subTypes: [
      { icon: BookOpen, label: "Pre-College" },    
      { icon: UserRound, label: "Undergraduates" }, 
    ],
  },
  {
    icon: Building2,
    title: "Sponsors",
    subtitle: "Scholarship Providers",
    color: "bg-secondary",
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
    color: "bg-secondary",
    description:
      "Monitor scholarships, ensure compliance, and support transparency.",
    subTypes: [
      { icon: Landmark, label: "Public" },
      { icon: Building2, label: "Private" },
    ],
  },
]

export function TargetUsers() {
  return (
    <section
      id="about"
      className="py-20 lg:py-32 px-6 md:px-16 relative overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0" />

      <MotionContainer className="relative z-26 max-w-6xl mx-auto">
        {/* Section Header */}
        <MotionItem className="text-center mb-22">
          <div className="inline-flex items-center gap-2 px-4 py-1.5">
            <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm text-secondary uppercase tracking-wider">
              Who it's for
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight text-secondary mt-5 mb-3 text-balance">
            Built for the scholarship ecosystem
          </h2>
          <p className="text-sm sm:text-base text-secondary/70 max-w-xl mx-auto text-pretty">
            Three perspectives, one streamlined experience.
          </p>
        </MotionItem>

        {/* User Type Cards */}
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
          {userTypes.map((user, index) => (
            <MotionItem
              key={user.title}
              className="group relative h-full px-8"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.15, duration: 0.5 },
                },
              }}
            >
              <div className="relative h-full flex flex-col rounded-3xl bg-background overflow-hidden">
                {/* Icon */}
                <div className="relative flex justify-center pt-8 pb-5">
                  <div className="text-secondary">
                    <user.icon className="w-21 h-21" />
                  </div>
                </div>

                {/* Title and Subtitle */}
                <div className="relative text-center pb-6">
                  <h3 className="text-2xl sm:text-[2rem] text-secondary">
                    {user.title}
                  </h3>
                  <p className="text-[13px] uppercase tracking-[0.15em] text-secondary/60 mt-1">
                    {user.subtitle}
                  </p>
                </div>

                {/* Description */}
                <div className="relative pb-4 grow">
                  <p className="md:text-base text-secondary/80 leading-relaxed">
                    {user.description}
                  </p>
                </div>

                {user.subTypes && (
                  <div className="relative pt-2 pb-5 flex flex-wrap gap-2">
                    {user.subTypes.map((subType) => (
                      <div
                        key={subType.label}
                        className="flex items-center gap-1 text-secondary/80 text-[13px] tracking-tight"
                      >
                        <subType.icon className="w-4 h-4 text-secondary/75" />
                        <span>{subType.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Animated underline accent */}
                <div className="absolute inset-x-6 bottom-0 h-px bg-linear-to-r from-transparent via-blue-500/60 to-transparent scale-x-0 origin-center group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </MotionItem>
          ))}
        </div>
      </MotionContainer>
    </section>
  )
}