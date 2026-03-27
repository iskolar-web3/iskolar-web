import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import { motion } from "framer-motion"
import { Layers, Zap, Eye, Globe } from "lucide-react"

const solutions = [
  {
    icon: Layers,
    title: "One Unified Platform",
    description: "Discover, apply, and manage all scholarships in one place.",
    gradient: "from-amber-500 to-[#6073F2]"
  },
  {
    icon: Zap,
    title: "Streamlined Applications",
    description: "Apply and submit digitally — no paperwork.",
    gradient: "from-orange-400 to-[#6073F2]"
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Track application status and scholarships disbursement in real-time. No more \"ghost students\".",
    gradient: "from-yellow-400 to-[#6073F2]"
  },
  {
    icon: Globe,
    title: "Accessible Anywhere",
    description: "Access opportunities from any device, anywhere.",
    gradient: "from-amber-500 to-[#6073F2]"
  },
]

export function Solution() {
  return (
    <section id="solution" className="relative overflow-hidden py-18 lg:py-28 px-6 md:px-26 bg-secondary">
      {/* Decorative grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,165,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,165,8,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <MotionContainer
        className="relative z-26"
        viewportMargin="-50px"
      >
        {/* Section Header */}
        <MotionItem className="text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2">
            <div className="w-2 h-2 bg-[#efa508] rounded-full animate-pulse" />
            <span className="text-sm text-tertiary uppercase tracking-wider">The Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-tertiary mt-4 mb-6 text-balance">
            Introducing <span className="text-[#efa508] relative inline-block">
              iSkolar
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#efa508] to-transparent" />
            </span>
          </h2>
          <p className="text-lg text-tertiary/80 max-w-3xl mx-auto text-pretty leading-relaxed">
            A digital ecosystem transforming how scholarships are discovered, applied for, and managed.
          </p>
        </MotionItem>

        {/* Zigzag Solution Cards */}
        <div className="space-y-12 lg:space-y-20">
          {solutions.map((solution, index) => {
            const isEven = index % 2 === 0
            return (
              <MotionContainer
                key={solution.title}
                viewportMargin="-50px"
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}
              >
                {/* Icon Side */}
                <MotionItem 
                  className="shrink-0 relative group will-change-transform"
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { 
                      opacity: 1, 
                      scale: 1,
                      transition: { type: "spring", stiffness: 260, damping: 20 } 
                    }
                  }}
                  whileHover={{ scale: 1.05, rotate: 3 }}
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${solution.gradient} opacity-20 blur-xl md:blur-2xl group-hover:opacity-30 transition-opacity duration-500 rounded-full scale-150`} />
                  <div className={`relative w-32 h-32 lg:w-43 lg:h-43 rounded-3xl bg-linear-to-br ${solution.gradient} p-1 shadow-2xl transform transition-all duration-500`}>
                    <div className="w-full h-full bg-secondary/95 backdrop-blur-none lg:backdrop-blur-sm rounded-3xl flex items-center justify-center">
                      <solution.icon className="w-14 h-14 lg:w-16 lg:h-16 text-white drop-shadow-lg" strokeWidth={1.5} />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <motion.div 
                    className={`hidden md:block absolute -top-4 -right-4 w-8 h-8 rounded-full bg-linear-to-br ${solution.gradient} opacity-60`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className={`hidden md:block absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-linear-to-br ${solution.gradient} opacity-40`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />
                </MotionItem>

                {/* Content Side */}
                <MotionItem 
                  className={`flex-1 text-center ${isEven ? "lg:text-left" : "lg:text-right"}`}
                  variants={{
                    hidden: { opacity: 0, x: isEven ? 50 : -50 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { duration: 0.5, ease: "easeOut" }
                    }
                  }}
                >
                  <div className="inline-block mb-4">
                    <span className="text-7xl lg:text-8xl font-bold text-[#efa508]/20 absolute -translate-y-8 lg:-translate-y-12 -z-10">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-4xl text-tertiary mb-4 relative inline-block">
                    {solution.title}
                  </h3>
                  
                  {/* Description */}
                  <div className={`flex mt-4 md:mt-8 ${isEven ? "justify-center lg:justify-start" : "justify-center lg:justify-end"}`}>
                    <p className="text-tertiary/80 text-sm lg:text-lg leading-relaxed max-w-xl">
                    {solution.description}
                  </p>
                  </div>
                </MotionItem>
              </MotionContainer>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <MotionItem className="text-center mt-34">
          <div className="inline-flex items-center gap-3 text-tertiary/65 text-base">
            <div className="h-px w-14 bg-linear-to-r from-transparent to-tertiary/20" />
            <span>Scholarships that find you, so you don’t have to.</span>
            <div className="h-px w-14 bg-linear-to-l from-transparent to-tertiary/20" />
          </div>
        </MotionItem>
      </MotionContainer>
    </section>
  )
}