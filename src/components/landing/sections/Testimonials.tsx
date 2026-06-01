import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import {
  Atom,
  BookOpen,
  Compass,
  GraduationCap,
  Palette,
  PenTool,
  Quote,
  Sparkles,
} from "lucide-react"

// PLACEHOLDER CONTENT. Swap with real testimonials when available.
const testimonials = [
  {
    quote:
      "I found and applied to three scholarships in one afternoon. What used to mean printing forms and lining up now takes a few taps.",
    name: "Maria Santos",
    role: "BS Computer Science · Pilot scholar",
  },
  {
    quote:
      "Being able to track my application status without emailing anyone took so much stress off. I always knew exactly where I stood.",
    name: "Joshua Reyes",
    role: "Senior High School · Pilot scholar",
  },
  {
    quote:
      "Reviewing and selecting applicants is finally organized in one place, and the disbursement is transparent for everyone involved.",
    name: "BYC Ventures",
    role: "Scholarship sponsor",
  },
]

// Faint scattered education doodles in the background.
const doodles = [
  { icon: GraduationCap, className: "top-[6%] left-[3%] w-10 h-10 -rotate-12" },
  { icon: Atom, className: "top-[10%] right-[8%] w-12 h-12 rotate-6" },
  { icon: PenTool, className: "top-[2%] left-[28%] w-7 h-7 rotate-12" },
  { icon: Sparkles, className: "top-[24%] right-[3%] w-9 h-9" },
  { icon: BookOpen, className: "bottom-[10%] left-[6%] w-11 h-11 rotate-6" },
  { icon: Compass, className: "bottom-[6%] right-[10%] w-9 h-9 -rotate-12" },
  { icon: Palette, className: "top-[44%] left-[1%] w-8 h-8 rotate-3" },
  { icon: Sparkles, className: "bottom-[20%] right-[28%] w-6 h-6 -rotate-6" },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-20 lg:py-28 px-6 md:px-12">
      {/* Decorative doodles */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {doodles.map((doodle) => (
          <doodle.icon
            key={doodle.className}
            className={`absolute text-secondary/[0.06] ${doodle.className}`}
            strokeWidth={1.5}
          />
        ))}
      </div>

      <MotionContainer className="relative z-26 max-w-6xl mx-auto" viewportMargin="-50px">
        {/* Header */}
        <MotionItem className="text-center mb-14 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary text-balance">
            Real students, <span className="text-[#6073F2]">real funding</span>
          </h2>
          <p className="text-base sm:text-lg text-secondary/70 max-w-xl mx-auto mt-4 text-pretty">
            Early feedback from the students and sponsors using iSkolar.
          </p>
        </MotionItem>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <MotionItem
              key={item.name}
              className="flex flex-col h-full rounded-2xl bg-card border border-secondary/10 p-8 lg:p-9 shadow-[0_18px_45px_-30px_rgba(58,82,166,0.55)]"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.12, duration: 0.5 },
                },
              }}
            >
              <Quote className="w-10 h-10 text-secondary fill-secondary mb-5" strokeWidth={1} />

              <p className="text-secondary leading-relaxed grow">{item.quote}</p>

              <div className="border-t border-secondary/10 mt-7 pt-6">
                <p className="text-secondary font-bold leading-tight">{item.name}</p>
                <p className="text-sm text-secondary/55 mt-1">{item.role}</p>
              </div>
            </MotionItem>
          ))}
        </div>
      </MotionContainer>
    </section>
  )
}
