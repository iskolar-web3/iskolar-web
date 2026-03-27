import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import { motion } from "framer-motion"

const problems = [
  {
    number: "01",
    title: "Fragmented Opportunities",
    description: "Scholarship info is scattered across platforms, making it hard to discover all options.",
  },
  {
    number: "02",
    title: "Manual Processes",
    description: "Paper-based applications waste time for students and coordinators alike.",
  },
  {
    number: "03",
    title: "Lack of Transparency",
    description: "No visibility into application status or disbursement details.",
  },
  {
    number: "04",
    title: "Limited Accessibility",
    description: "Students in remote areas face barriers accessing scholarship information.",
  },
]

export function Problem() {
  return (
    <section id="problem" className="py-16 lg:py-28 px-6 md:px-26 relative z-26">
      <MotionContainer className="max-w-8xl mx-auto">
        {/* Section Header */}
        <MotionItem className="relative z-26 text-center mb-30">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm text-secondary uppercase tracking-wider">
              The Challenge
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary mt-4 mb-6 text-balance">
            Why Scholarships Remain <span className="text-[#6073F2]">Out of Reach</span>
          </h2>
          <p className="text-lg text-secondary/80 max-w-2xl mx-auto text-pretty">
            Many deserving students miss out on scholarships due to systemic challenges.
          </p>
        </MotionItem>

        {/* Problem Items - Horizontal Layout */}
        <div className="space-y-8 lg:space-y-16">
          {problems.map((problem) => (
            <MotionContainer
              key={problem.number}
              className="grid grid-cols-1 md:grid-cols-7 gap-6 md:gap-8 items-start group"
              viewportMargin="-50px"
              staggerDelay={0.15}
            >
              {/* Column 1: Problem Number */}
              <MotionItem className="flex items-center justify-center md:justify-start group/number">
                <span className="text-3xl md:text-4xl font-semibold text-secondary/80 group-hover:text-secondary transition-opacity duration-400">
                  #{problem.number}
                </span>
              </MotionItem>

              {/* Column 2: Images */}
               <MotionItem className="flex items-center col-span-2 justify-center md:justify-start group/image">
                <div className="relative w-46 h-30 md:w-74 md:h-48 flex items-center p-1 border-2 border-secondary justify-center overflow-hidden rounded-lg">
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-linear-to-br from-secondary/20 to-secondary/10 group-hover:from-secondary/30 group-hover/image:from-secondary/30 rounded-lg group-hover:to-secondary/15 group-hover/image:to-secondary/15 transition-all duration-400" />
                    {/* Image */}
                    <motion.img
                      src={`/landing/problem-${problem.number}.png`}
                      alt={problem.title}
                      className="w-full h-full object-cover rounded-md relative z-10 opacity-80 group-hover/image:opacity-100 transition-opacity duration-400"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                </div>
              </MotionItem>

              {/* Column 3: Title */}
              <MotionItem className="flex items-center col-span-2 justify-center md:justify-start group/title">
                <h3 className="text-xl md:text-2xl text-secondary/80 mb-2 group-hover:text-secondary group-hover/title:text-secondary transition-colors duration-400">
                  {problem.title}
                </h3>
              </MotionItem>

              {/* Column 4: Description */}
              <MotionItem className="flex items-center text-center md:text-start col-span-2 justify-center md:justify-start group/description">
                <p className="text-base text-secondary/80 leading-relaxed group-hover:text-secondary group-hover/description:text-secondary transition-opacity duration-400">
                  {problem.description}
                </p>
              </MotionItem>
            </MotionContainer>
          ))}
        </div>
      </MotionContainer>
    </section>
  )
}