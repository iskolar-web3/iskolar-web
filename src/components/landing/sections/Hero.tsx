import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import { motion } from "framer-motion"
import { GraduationCapBg, GraduationCap3D } from "@/components/landing/graphics/GraduationCap"
import { useEffect, useState } from "react"

const TAGLINE = "Built For Students, Built By Students."

function TypewriterTagline() {
  const [displayed, setDisplayed] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentLength = displayed.length

    if (!isDeleting && currentLength === TAGLINE.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 2800)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && currentLength === 0) {
      const timeout = setTimeout(() => setIsDeleting(false), 600)
      return () => clearTimeout(timeout)
    }

    const timeout = setTimeout(
      () =>
        setDisplayed(
          isDeleting ? TAGLINE.slice(0, currentLength - 1) : TAGLINE.slice(0, currentLength + 1),
        ),
      isDeleting ? 28 : 55,
    )
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting])

  return (
    <span className="font-mono text-sm sm:text-base tracking-widest text-[#6073F2]/70 uppercase">
      {displayed}
      <span className="ml-0.5 inline-block w-0.5 h-4 bg-[#6073F2]/60 align-middle animate-pulse" />
    </span>
  )
}

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-dvh px-6 flex items-center justify-center shrink-0 pt-20 pb-16 overflow-hidden support-[min-height:100dvh]:min-h-[100dvh]"
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

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-secondary/5 via-transparent to-[#efa508]/5 z-0" />

      <MotionContainer
        className="relative z-10 max-w-5xl mx-auto text-center"
        staggerDelay={0.2}
      >
        <MotionItem>
          <div className="mb-6 h-6 flex items-center justify-center">
            <TypewriterTagline />
          </div>
        </MotionItem>

        <MotionItem>
          <strong className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-secondary leading-tight text-balance block">
            Discover, Apply, and Receive Scholarships
            <span className="text-[#6073F2] block mt-1">All in One Place</span>
          </strong>
        </MotionItem>

        <MotionItem>
          <p className="text-lg sm:text-xl text-secondary/80 max-w-2xl mx-auto mt-13 mb-10 text-pretty leading-relaxed">
            A centralized platform connecting students with scholarship providers — making education
            accessible and transparent.
          </p>
        </MotionItem>

        {/* Scroll indicator */}
        <MotionItem variants={{
           hidden: { opacity: 0, y: -20 },
           visible: { opacity: 1, y: 0, transition: { delay: 1, duration: 0.5 } }
        }}>
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-secondary/50 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-secondary rounded-full animate-pulse" />
            </div>
          </div>
        </MotionItem>
      </MotionContainer>
    </section>
  )
}