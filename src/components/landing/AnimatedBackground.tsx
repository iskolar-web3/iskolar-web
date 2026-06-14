import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"

type IconType = 
  | "graduationCap" | "book" | "certificate" | "pencil" 
  | "lightbulb" | "star" | "trophy" | "atom" 
  | "globe" | "calculator" | "ruler" | "scroll" | "palette"

interface FloatingIcon {
  id: number
  size: number
  x: number
  y: number
  delay: number
  duration: number
  opacity: number
  type: IconType
  rotation: number
  color: string
}

const iconTypes: IconType[] = [
  "graduationCap", "book", "certificate", "pencil", 
  "lightbulb", "star", "trophy", "atom", 
  "globe", "calculator", "ruler", "scroll", "palette"
]

// Brand-only palette: theme blue (#3a52a6) and its lighter tints, plus a sky
// accent. Keeps the floating motif strictly on the blue + white identity.
const colors = [
  '#3a52a6', // Theme blue (--secondary)
  '#5b73c4', // Blue 400
  '#8ea3e0', // Blue 300
  '#60a5fa', // Sky
]

function GraduationCap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
    </svg>
  )
}

function Book({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
    </svg>
  )
}

function Certificate({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h8v5l3-3 3 3v-5h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4zm0 2h16v10h-6v1.88l-1-1-1 1V15H4V5zm2 2v2h12V7H6zm0 4v2h8v-2H6z" />
    </svg>
  )
}

function Pencil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  )
}

function Lightbulb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" />
    </svg>
  )
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  )
}

function Atom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function Globe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function Calculator({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
      <path d="M7 7h10v2H7zm0 4h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"/>
    </svg>
  )
}

function Ruler({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M2 6h20v4h-2V8h-2v2h-2V8h-2v2h-2V8H8v2H6V8H4v2H2V6zm20 8H2v4h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2h2v-4z"/>
    </svg>
  )
}

function Scroll({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-1c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM5 5h4.18C9.07 5.38 9 5.83 9 6.29V19H5V5zm14 14h-4V6.29c0-.46-.07-.91-.18-1.29H19v14z"/>
    </svg>
  )
}

function Palette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  )
}

function IconRenderer({ type, className }: { type: IconType; className?: string }) {
  switch (type) {
    case "graduationCap": return <GraduationCap className={className} />
    case "book": return <Book className={className} />
    case "certificate": return <Certificate className={className} />
    case "pencil": return <Pencil className={className} />
    case "lightbulb": return <Lightbulb className={className} />
    case "star": return <Star className={className} />
    case "trophy": return <Trophy className={className} />
    case "atom": return <Atom className={className} />
    case "globe": return <Globe className={className} />
    case "calculator": return <Calculator className={className} />
    case "ruler": return <Ruler className={className} />
    case "scroll": return <Scroll className={className} />
    case "palette": return <Palette className={className} />
    default: return <GraduationCap className={className} />
  }
}

export default function AnimatedBackground() {
  const [icons, setIcons] = useState<FloatingIcon[]>([])
  const reduce = useReducedMotion()

  useEffect(() => {
    // Skip the floating motif entirely for reduced-motion users.
    if (reduce) {
      setIcons([])
      return
    }
    // Increased count for better coverage
    const generatedIcons: FloatingIcon[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.random() * 40 + 20,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 20,
      duration: Math.random() * 20 + 20,
      opacity: Math.random() * 0.15 + 0.05,
      type: iconTypes[Math.floor(Math.random() * iconTypes.length)],
      rotation: Math.random() * 360, // Full rotation start
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setIcons(generatedIcons)
  }, [reduce])

  return (
    <>
      {/* Ambient mesh: soft blue glows over the white base for depth, plus a
          faint grid that echoes the HowItWorks section. Sits behind content. */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(60vw 50vh at 18% 0%, rgba(58,82,166,0.12), transparent 60%)," +
            "radial-gradient(55vw 45vh at 100% 20%, rgba(96,165,250,0.10), transparent 55%)," +
            "radial-gradient(70vw 55vh at 50% 108%, rgba(58,82,166,0.08), transparent 60%)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(58,82,166,0.04) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(58,82,166,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 100% 80% at 50% 40%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 80% at 50% 40%, black, transparent 80%)",
        }}
      />
      <style>{`
        @keyframes float-complex {
          0% {
            transform: translate(0, 0) rotate(var(--rotation));
          }
          25% {
            transform: translate(10px, -15px) rotate(calc(var(--rotation) + 5deg));
          }
          50% {
            transform: translate(0, -25px) rotate(calc(var(--rotation) + 10deg));
          }
          75% {
            transform: translate(-10px, -15px) rotate(calc(var(--rotation) + 5deg));
          }
          100% {
            transform: translate(0, 0) rotate(var(--rotation));
          }
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 25 }}>
        {icons.map((icon) => (
          <div
            key={icon.id}
            className="absolute"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              width: icon.size,
              height: icon.size,
              opacity: icon.opacity,
              color: icon.color,
              animation: `float-complex ${icon.duration}s ease-in-out infinite`,
              animationDelay: `-${icon.delay}s`, 
              // @ts-ignore
              '--rotation': `${icon.rotation}deg`,
            }}
          >
            <IconRenderer type={icon.type} className="w-full h-full" />
          </div>
        ))}
      </div>
    </>
  )
}
