import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion"
import type { ReactNode } from "react"

interface MotionContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  staggerDelay?: number
  delayChildren?: number
  className?: string
  viewportMargin?: string
}

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { staggerDelay: number; delayChildren: number } = { staggerDelay: 0.1, delayChildren: 0 }) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delayChildren,
    },
  }),
}

const defaultItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      duration: 0.5,
    },
  },
}

// Shared academic motion vocabulary so every section draws/lifts identically.
// A rule or underline that paints in from the left as it enters the viewport.
export const drawLineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

// Vertical counterpart for connectors that grow top to bottom.
export const drawLineVariantsY: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

// The single hover-lift spec for every card on a white surface.
// Restrained on purpose: a faint lift, no scaling or shadow swell.
export const cardHoverLift = {
  whileHover: {
    y: -3,
    transition: { type: "spring", stiffness: 300, damping: 26 },
  },
  whileTap: { y: -1 },
} as const

export function MotionContainer({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  className,
  viewportMargin = "-100px",
  variants = defaultContainerVariants,
  ...props
}: MotionContainerProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      custom={{ staggerDelay, delayChildren }}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface MotionItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  className?: string
}

export function MotionItem({
  children,
  className,
  variants = defaultItemVariants,
  ...props
}: MotionItemProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      variants={variants}
      initial={reduce ? "visible" : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
