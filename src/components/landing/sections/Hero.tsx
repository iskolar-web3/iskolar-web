import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import { GraduationCapBg, GraduationCap3D } from "@/components/landing/graphics/GraduationCap"
import { BLUE_DUOTONE, BLUE_TINT } from "@/components/landing/partners"

const partnerRow = [
  { src: "/partnerships/byc-ventures.png", alt: "BYC Ventures", size: "h-11 sm:h-12", filter: BLUE_TINT },
  { src: "/partnerships/qbo-innovation.png", alt: "QBO Innovation", size: "h-13 sm:h-15", filter: BLUE_DUOTONE },
  { src: "/partnerships/tutorials-dojo.png", alt: "Tutorials Dojo", size: "h-11 sm:h-12", filter: BLUE_TINT },
  { src: "/partnerships/jia-whitecloak.png", alt: "Jia Talent Vault", size: "h-8 sm:h-9", filter: BLUE_TINT },
]

const communityRow = [
  { src: "/partnerships/cryptita-plays.png", alt: "Cryptita Plays", size: "h-18 sm:h-22", filter: BLUE_TINT },
  { src: "/partnerships/aws-learning-club-heron.png", alt: "AWS Learning Club - Heron", size: "h-17 sm:h-21", filter: BLUE_DUOTONE },
  { src: "/partnerships/tech-kubo.png", alt: "Tech Kubo", size: "h-20 sm:h-24", filter: BLUE_DUOTONE },
]

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  // Background graphics drift up slightly slower than the foreground for depth.
  const capYRaw = useTransform(scrollYProgress, [0, 1], [0, -40])
  const bgCapYRaw = useTransform(scrollYProgress, [0, 1], [0, -20])
  const capY = reduce ? 0 : capYRaw
  const bgCapY = reduce ? 0 : bgCapYRaw

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-dvh px-4 sm:px-12 lg:px-26 flex items-center justify-center shrink-0 pt-24 pb-24 overflow-hidden support-[min-height:100dvh]:min-h-[100dvh]"
    >
      <div className="absolute inset-0 z-26 overflow-hidden pointer-events-none">
        {/* Graduation cap shape with animated gradient */}
        <motion.div
          style={{ y: bgCapY }}
          initial={reduce ? { opacity: 0.2, scale: 1 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-[8%] right-[2%] w-[80vw] max-w-[400px] aspect-4/3 md:w-[500px] md:h-[380px] lg:w-[550px] lg:h-[425px] opacity-20"
        >
          <GraduationCapBg reduced={!!reduce} />
        </motion.div>

        {/* 3D Graduation Cap */}
        <motion.div
          initial={reduce ? { opacity: 0.1, y: 0, rotate: -5 } : { opacity: 0, y: 50, rotate: -5 }}
          animate={{ opacity: 0.1, y: 0, rotate: -5 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -bottom-[5%] md:-bottom-[20%] -left-[3%] w-[90vw] max-w-[500px] aspect-square md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px] opacity-100"
        >
          {/* Scroll parallax layer, kept separate from the entrance y and the float */}
          <motion.div style={{ y: capY }} className="w-full h-full">
            {/* Floating CSS Animation Container */}
            <div
              className="w-full h-full"
              style={{
                animation: reduce
                  ? "none"
                  : "float-soothing 8s ease-in-out infinite",
                transformOrigin: "center center",
              }}
            >
              <GraduationCap3D reduced={!!reduce} />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Soft blue wash */}
      <div className="absolute inset-0 bg-linear-to-b from-secondary/5 via-transparent to-secondary/5 z-0" />

      <MotionContainer
        className="relative z-10 max-w-5xl mx-auto text-center"
        staggerDelay={0.18}
      >
        <MotionItem>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-secondary leading-tight text-balance block">
            Everything You Need to Manage Scholarships
            <span className="text-secondary/55 block mt-1">All in One Place</span>
          </h1>
        </MotionItem>

        <MotionItem>
          <p className="text-lg sm:text-xl text-secondary/80 max-w-2xl mx-auto mt-10 text-pretty leading-relaxed">
            Connecting students and scholarship providers, making scholarships accessible, efficient, and transparent.
          </p>
        </MotionItem>

        {/* Partnerships trust strip */}
        <MotionItem
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.6 } },
          }}
        >
          <div className="mt-10 sm:mt-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-10 bg-secondary/20" />
              <span className="text-xs uppercase tracking-[0.2em] text-secondary/50">
                Trusted by
              </span>
              <div className="h-px w-10 bg-secondary/20" />
            </div>

            {[partnerRow, communityRow].map((row, rowIndex) => (
              <motion.div
                key={rowIndex}
                className="grid grid-cols-3 place-items-center gap-x-6 gap-y-8 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-x-9 lg:gap-y-6 mb-8 last:mb-0"
                initial={reduce ? "visible" : "hidden"}
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                  },
                }}
              >
                {row.map((partner) => (
                  <motion.img
                    key={partner.src}
                    src={partner.src}
                    alt={partner.alt}
                    className={`${partner.size} w-auto object-contain will-change-transform`}
                    style={{ filter: partner.filter }}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                      },
                    }}
                    whileHover={
                      reduce
                        ? undefined
                        : {
                            y: -3,
                            scale: 1.04,
                            transition: {
                              type: "spring",
                              stiffness: 260,
                              damping: 22,
                            },
                          }
                    }
                  />
                ))}
              </motion.div>
            ))}
          </div>
        </MotionItem>
      </MotionContainer>
    </section>
  )
}
