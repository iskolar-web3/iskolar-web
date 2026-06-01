import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import { motion } from "framer-motion"
import { GraduationCapBg, GraduationCap3D } from "@/components/landing/graphics/GraduationCap"

// Flatten a logo to a silhouette, then tint it to the theme blue (#3a52a6).
// Best for line/text logos with transparent interiors.
const BLUE_TINT =
  "brightness(0) saturate(100%) invert(27%) sepia(46%) saturate(1066%) hue-rotate(196deg) brightness(91%) contrast(88%)"

// Grayscale duotone mapped onto blue. Keeps internal detail, so filled
// artwork (AWS badge, Tech Kubo illustration) stays legible instead of
// collapsing into a solid blob.
const BLUE_DUOTONE = "grayscale(1) sepia(1) hue-rotate(190deg) saturate(2.2) brightness(0.95)"

const partners = [
  { src: "/partnerships/byc-ventures.png", alt: "BYC Ventures", size: "h-11 sm:h-12", filter: BLUE_TINT },
  { src: "/partnerships/tutorials-dojo.png", alt: "Tutorials Dojo", size: "h-11 sm:h-12", filter: BLUE_TINT },
  { src: "/partnerships/cryptita-plays.png", alt: "Cryptita Plays", size: "h-18 sm:h-22", filter: BLUE_TINT },
  { src: "/partnerships/aws-learning-club-heron.png", alt: "AWS Learning Club - Heron", size: "h-17 sm:h-21", filter: BLUE_DUOTONE },
  { src: "/partnerships/tech-kubo.png", alt: "Tech Kubo", size: "h-20 sm:h-24", filter: BLUE_DUOTONE },
]

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-dvh px-6 flex items-center justify-center shrink-0 pt-24 pb-24 overflow-hidden support-[min-height:100dvh]:min-h-[100dvh]"
    >
      <div className="absolute inset-0 z-26 overflow-hidden pointer-events-none">
        {/* Graduation cap shape with animated gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-[8%] right-[2%] w-[80vw] max-w-[400px] aspect-4/3 md:w-[500px] md:h-[380px] lg:w-[550px] lg:h-[425px] opacity-20"
        >
          <GraduationCapBg />
        </motion.div>

        {/* 3D Graduation Cap */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotate: -5 }}
          animate={{ opacity: 0.1, y: 0, rotate: -5 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -bottom-[5%] md:-bottom-[20%] -left-[3%] w-[90vw] max-w-[500px] aspect-square md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px] opacity-100"
        >
          {/* Floating CSS Animation Container */}
          <div
            className="w-full h-full"
            style={{
              animation: 'float-soothing 8s ease-in-out infinite',
              transformOrigin: 'center center'
            }}
          >
            <GraduationCap3D />
          </div>
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

            <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-6">
              {partners.map((partner) => (
                <img
                  key={partner.src}
                  src={partner.src}
                  alt={partner.alt}
                  className={`${partner.size} w-auto object-contain`}
                  style={{ filter: partner.filter }}
                />
              ))}
            </div>
          </div>
        </MotionItem>
      </MotionContainer>
    </section>
  )
}
