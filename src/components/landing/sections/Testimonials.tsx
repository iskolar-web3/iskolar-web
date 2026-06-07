import { useRef } from "react"
import { MotionContainer, MotionItem, cardHoverLift } from "@/components/landing/MotionContainer"
import { useReducedMotion } from "framer-motion"
import {
  Atom,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
    initials: "MS",
  },
  {
    quote:
      "Being able to track my application status without emailing anyone took so much stress off. I always knew exactly where I stood.",
    name: "Joshua Reyes",
    role: "Senior High School · Pilot scholar",
    initials: "JR",
  },
  {
    quote:
      "The whole process felt clear from start to finish. I always knew what to submit next and when.",
    name: "Andrea Cruz",
    role: "BS Nursing · Pilot scholar",
    initials: "AC",
  },
  {
    quote:
      "I uploaded my documents once and reused them across applications. It saved me so much time.",
    name: "Mark Villanueva",
    role: "BS Civil Engineering · Pilot scholar",
    initials: "MV",
  },
  {
    quote:
      "Getting an update the moment my status changed kept me motivated through the whole application.",
    name: "Patricia Gomez",
    role: "BS Accountancy · Pilot scholar",
    initials: "PG",
  },
  {
    quote:
      "As a first time applicant, the guided steps made it easy. I never felt lost along the way.",
    name: "Daniel Lim",
    role: "Grade 12 STEM · Pilot scholar",
    initials: "DL",
  },
  {
    quote:
      "Funds arrived transparently and on time. I could follow every step of the disbursement myself.",
    name: "Sofia Ramos",
    role: "BS Information Technology · Pilot scholar",
    initials: "SR",
  },
  {
    quote:
      "Finding scholarships that actually fit my course used to take days. Here it took minutes.",
    name: "Carlo Mendoza",
    role: "BS Education · Pilot scholar",
    initials: "CM",
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
  const reduce = useReducedMotion()
  const lift = reduce ? {} : cardHoverLift
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollByCards = (dir: number) => {
    scrollerRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" })
  }

  return (
    <section id="testimonials" className="relative overflow-hidden py-20 lg:py-28">
      {/* Decorative doodles */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {doodles.map((doodle) => (
          <doodle.icon
            key={doodle.className}
            className={`absolute text-secondary/[0.07] ${doodle.className}`}
            strokeWidth={1.5}
          />
        ))}
      </div>

      <MotionContainer
        className="relative z-30 mx-auto max-w-6xl px-6 md:px-12"
        viewportMargin="-50px"
      >
        {/* Header */}
        <MotionItem className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div
              className="w-1.5 h-1.5 bg-secondary rounded-full"
              style={{ animation: "soft-pulse 3s ease-in-out infinite" }}
            />
            <span className="text-xs uppercase tracking-[0.2em] text-secondary/55">
              Voices
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary text-balance">
            Real students, real funding
          </h2>
          <p className="text-base sm:text-lg text-secondary/70 max-w-xl mx-auto mt-4 text-pretty">
            Early feedback from the students using iSkolar.
          </p>
        </MotionItem>
      </MotionContainer>

      {/* Horizontal scroll carousel */}
      <div className="relative z-30 mx-auto max-w-6xl">
        {/* Edge fades to hint there is more to scroll */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent" />

        {/* Desktop arrow controls */}
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          aria-label="Previous testimonials"
          className="hidden md:grid place-items-center absolute left-2 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-card border border-secondary/20 text-secondary shadow-md transition-colors hover:bg-secondary hover:text-tertiary"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          aria-label="Next testimonials"
          className="hidden md:grid place-items-center absolute right-2 top-1/2 -translate-y-1/2 z-30 size-10 rounded-full bg-card border border-secondary/20 text-secondary shadow-md transition-colors hover:bg-secondary hover:text-tertiary"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory px-6 md:px-12 pt-2 pb-6"
        >
          {testimonials.map((item) => (
            <MotionItem
              key={item.name}
              {...lift}
              className="ruled-paper group relative flex flex-col shrink-0 w-[290px] sm:w-[340px] snap-start overflow-hidden rounded-2xl bg-card border border-secondary/15 p-7 lg:p-8 shadow-[0_18px_45px_-30px_rgba(58,82,166,0.55)] will-change-transform"
              initial={reduce ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <Quote className="w-9 h-9 text-secondary fill-secondary mb-4" strokeWidth={1} />

              <p className="text-[15px] text-secondary leading-relaxed grow">{item.quote}</p>

              <div className="border-t border-secondary/10 mt-6 pt-5">
                <p className="text-secondary leading-tight truncate">{item.name}</p>
              </div>
            </MotionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
