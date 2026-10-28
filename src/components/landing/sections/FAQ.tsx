import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import { SectionHeader } from "@/components/landing/SectionHeader"
import { Plus } from "lucide-react"
import { type ProductStatus, products } from "@/components/landing/products"

// Availability answer follows product statuses, so it never drifts from the Journey chips.
function listNames(names: string[]) {
  if (names.length <= 1) return names.join("")
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

const namesWith = (status: ProductStatus) =>
  products.filter((p) => p.status === status).map((p) => p.name)

const availability = [
  namesWith("Live").length > 0 && `${listNames(namesWith("Live"))} ${namesWith("Live").length > 1 ? "are" : "is"} live now.`,
  namesWith("Pilot").length > 0 && `${listNames(namesWith("Pilot"))} ${namesWith("Pilot").length > 1 ? "are" : "is"} in pilot with partner schools.`,
  namesWith("Soon").length > 0 && `${listNames(namesWith("Soon"))} ${namesWith("Soon").length > 1 ? "are" : "is"} coming soon.`,
]
  .filter(Boolean)
  .join(" ")

const faqs = [
  {
    question: "What is iSkolar?",
    answer:
      "iSkolar is a SEC registered EdTech company in the Philippines. We build six connected products that support students from senior high to their first job: PathFinder, Review, iSkolar, Academy, Vocation, and Verity.",
  },
  {
    question: "Which product is right for me?",
    answer:
      "Choosing a college course? Start with PathFinder. Preparing for an entrance exam? Try Review. Need funding? Use iSkolar. Want to show your projects? Join Academy. Looking for an internship or a coach? Open Vocation. Need to share or check a diploma? Use Verity.",
  },
  {
    question: "Are the products free for students?",
    answer:
      "Core features are free for students. Students never pay to apply for scholarships or publish projects. Some products offer optional paid extras, like full review courses, coaching sessions, or premium course reports.",
  },
  {
    question: "Which products are available now?",
    answer: availability,
  },
  {
    question: "How do schools work with iSkolar?",
    answer:
      "Registrars use Verity to issue tamper proof transcripts and diplomas that anyone can verify. Scholarship offices use iSkolar to monitor funded students. Email us to set up a pilot for your school.",
  },
  {
    question: "How is student data protected?",
    answer:
      "Verity anchors only a SHA-256 fingerprint of each credential on the blockchain, never personal data, in line with the Data Privacy Act. The credential file itself stays under the school's control.",
  },
  {
    question: "How do I apply for a scholarship?",
    answer:
      "Create a free iSkolar account, browse available scholarships, review the requirements, and tap \"Apply Now.\" You fill out the form and upload any required documents directly in the app.",
  },
  {
    question: "How do I get started as a sponsor?",
    answer:
      "Click 'Get Started' and choose the Sponsor role. Provide your organization or personal details, verify your identity, and you can start creating scholarship programs.",
  },
]

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  const reduce = useReducedMotion()
  return (
    <MotionItem
      className="border-b border-secondary/10 last:border-b-0"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group w-full text-left text-base sm:text-lg font-medium text-secondary py-6 flex items-center justify-between gap-6"
      >
        <span>{question}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
            isOpen
              ? "border-secondary bg-secondary text-tertiary"
              : "border-secondary/20 text-secondary group-hover:border-secondary/40"
          }`}
        >
          <Plus
            className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${
              isOpen ? "rotate-45" : ""
            }`}
            strokeWidth={1.75}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-secondary/65 leading-relaxed pb-6 pr-14 text-pretty">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionItem>
  )
}

const GMAIL_COMPOSE_URL = "https://mail.google.com/mail/u/0/#all?compose=new"
const CONTACT_EMAIL = "hello@iskolar.io"

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [emailCopied, setEmailCopied] = useState(false)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigator.clipboard.writeText(CONTACT_EMAIL)
    setEmailCopied(true)
    setTimeout(() => {
      window.open(GMAIL_COMPOSE_URL, "_blank")
      setEmailCopied(false)
    }, 650)
  }

  return (
    <section id="faqs" className="px-4 sm:px-12 lg:px-26 py-24 lg:py-36">
      <MotionContainer className="relative z-30 mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        {/* Header and contact, pinned while the list scrolls on desktop */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeader
            align="left"
            eyebrow="Questions"
            title="Frequently asked questions"
          >
            <div className="mt-8">
              <p className="text-secondary/60 mb-2">Still have questions?</p>
              <a
                href={GMAIL_COMPOSE_URL}
                onClick={handleEmailClick}
                className="inline-flex items-center font-medium text-secondary underline decoration-secondary/30 underline-offset-4 transition-colors hover:decoration-secondary"
              >
                {emailCopied ? "Email copied!" : `Contact us at ${CONTACT_EMAIL}`}
              </a>
            </div>
          </SectionHeader>
        </div>

        {/* FAQ Accordion */}
        <MotionContainer
          className="rounded-3xl border border-secondary/10 bg-card/80 px-6 sm:px-8 backdrop-blur"
          staggerDelay={0.06}
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </MotionContainer>
      </MotionContainer>
    </section>
  )
}
