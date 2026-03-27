import { motion } from "framer-motion"
import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"

const features = [
  {
    title: "Scholarship Creation",
    description: "Set up scholarships with eligibility rules that fit specific goals.",
    position: "left",
    order: 1,
    color: "#6073F2",
  },
  {
    title: "Browsing & Application",
    description: "Discover and apply to scholarships that match a chosen field.",
    position: "left",
    order: 2,
    color: "#6073F2",
  },
  {
    title: "NFT Credential",
    description: "Upload credentials on-chain to increase selection chances.",
    position: "left",
    order: 3,
    color: "#6073F2",
  },
  {
    title: "Application Tracking",
    description: "Track progress in real time, from application to fund disbursement.",
    position: "right",
    order: 4,
    color: "#6073F2",
  },
  {
    title: "Scholar Selection",
    description: "Evaluate and manage applications efficiently using built-in tools.",
    position: "right",
    order: 5,
    color: "#6073F2",
  },
  {
    title: "Fund Disbursement",
    description: "Track scholarships transparently, with crypto or fiat payouts.",
    position: "right",
    order: 6,
    color: "#6073F2",
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 lg:py-28 px-6 md:px-12 overflow-hidden">
      <div className="mx-auto max-w-7xl relative z-26">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-sm text-secondary uppercase tracking-wider">Core Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary mt-4 mb-6">
            Everything You Need, <span className="text-[#6073F2]">All in One Place</span>
          </h2>
          <p className="text-lg text-secondary/80 max-w-2xl mx-auto">
            Comprehensive tools for every step of the scholarship journey.
          </p>
        </motion.div>

        {/* Mobile: Simple Stack */}
        <MotionContainer 
          className="lg:hidden space-y-6"
          staggerDelay={0.15}
        >
          {features.map((feature, idx) => (
            <MotionItem
              key={feature.title}
              className="group relative overflow-hidden bg-background rounded-lg border border-[#6073F2]/20 p-6 transition-all duration-300 hover:shadow-sm"
            >
              <div className="relative">
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-2xl font-semibold text-secondary/60">
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl text-secondary pt-1">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-secondary/80 leading-relaxed pl-14">
                  {feature.description}
                </p>
              </div>
            </MotionItem>
          ))}
        </MotionContainer>

        {/* Desktop: Clean Orbital Layout */}
        <div className="hidden lg:block relative">
          <div className="relative mx-auto max-w-6xl">
            {/* Central Hub */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 10 }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Orbital Rings with Water Ripple Effect */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1025px] h-[1025px] rounded-full border border-[#6073F2]/12"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.0,
                  delay: 0.32,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[855px] h-[855px] rounded-full border border-[#6073F2]/18"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.0,
                  delay: 0.24,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[690px] h-[690px] rounded-full border border-[#6073F2]/21"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.0,
                  delay: 0.16,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-[#6073F2]/24"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.0,
                  delay: 0.08,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-[#6073F2]/28"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.0,
                  delay: 0,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              />

              {/* Center Logo */}
              <motion.div
                className="relative w-50 h-50 rounded-full border-2 border-[#6073F2]/32 shadow-2xl flex items-center justify-center backdrop-blur-sm overflow-hidden"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              >
                <img src="/logo.png" alt="iSkolar" className="w-40 h-40 object-contain" />
              </motion.div>
            </motion.div>

            {/* Feature Cards Container */}
            <MotionContainer
              className="relative z-27"
              style={{ minHeight: "925px" }}
              staggerDelay={0.15}
            >
              {/* Left Side Features */}
              <div className="absolute left-[25px] top-1/2 -translate-y-1/2 w-[350px] space-y-8">
                {features.filter(f => f.position === "left").map((feature) => (
                  <MotionItem
                    key={feature.title}
                    className="group relative bg-background rounded-tr-full rounded-bl-full border border-[#6073F2]/20 px-8 py-4 transition-all duration-300 hover:shadow-sm hover:-translate-x-1"
                  >
                    <div className="relative flex items-start gap-3">
                      <span className="shrink-0 font-semibold text-2xl text-secondary/60">
                        #{String(feature.order).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-[19px] text-secondary mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-secondary/80 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </MotionItem>
                ))}
              </div>

              {/* Right Side Features */}
              <div className="absolute right-[25px] top-1/2 -translate-y-1/2 w-[350px] space-y-8">
                {features.filter(f => f.position === "right").map((feature) => (
                  <MotionItem
                    key={feature.title}
                    className="group relative bg-background rounded-tl-full rounded-br-full border border-[#6073F2]/20 px-8 py-4 transition-all duration-300 hover:shadow-sm hover:translate-x-1"
                  >
                    <div className="relative flex items-start gap-3">
                      <div className="flex-1 text-right">
                        <h3 className="text-[19px] text-secondary mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-secondary/80 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-2xl text-secondary/60">
                        #{String(feature.order).padStart(2, "0")}
                      </span>
                    </div>
                  </MotionItem>
                ))}
              </div>
            </MotionContainer>
          </div>
        </div>
      </div>
    </section>
  )
}