import { useState } from "react"
import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import { ChevronDown } from "lucide-react"
import { CTA } from "./CTA"

const faqs = [
  {
    question: "What is iSkolar?",
    answer:
      "iSkolar is a centralized scholarship hub platform designed for upcoming and current university students and scholarship providers. It streamlines the entire scholarship process from discovery to disbursement, making education funding more accessible and transparent.",
  },
  {
    question: "Who can use the platform?",
    answer:
      "iSkolar is built for three main user groups: Students looking for scholarship opportunities, Sponsors (individuals, organizations, or government agencies) who want to create and manage scholarship programs, and Schools that need to monitor student scholarships and ensure compliance.",
  },
  {
    question: "Is it free for students?",
    answer:
      "Yes! iSkolar is completely free for students. You can browse scholarships, submit applications, and track your application status without any fees. Our goal is to make scholarship opportunities accessible to all deserving students.",
  },
  {
    question: "How do I apply for a scholarship?",
    answer:
      "Simply browse available scholarships, review the criteria and requirements, and tap “Apply Now.” You’ll fill out the application form and upload any required documents directly in the app.",
  },
  {
    question: "How are users and scholarships verified?",
    answer:
      "All scholarship programs undergo a verification process. Sponsors must complete identity verification before they can create scholarship programs. We also implement identity verification for students to ensure the authenticity of applications and prevent fraud.",
  },
  {
    question: "When will full features be available?",
    answer:
      "We are launching our pilot program in Q1 2026 with core features. Full platform capabilities including automation and transparent fund disbursements will be available in Q2 2026.",
  },
  {
    question: "How do I get started as a sponsor?",
    answer:
      "Sponsors can register on the platform by clicking 'Get Started' and selecting the Sponsor role option. You'll need to provide your organization/personal details, verify your identity, and then you can start creating scholarship programs.",
  },
  {
    question: "What role do schools play on iSkolar?",
    answer:
      "Schools can monitor student scholarships, receive tuition payments either in fiat or crypto, verify enrollment, and support transparency between students and sponsors.",
  },
]

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <MotionItem
      className="bg-card rounded-md border border-border px-6 overflow-hidden"
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
        onClick={onToggle}
        className="w-full text-left text-lg text-secondary py-5 flex items-center justify-between gap-4"
      >
        <span>{question}</span>
        <ChevronDown 
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
        style={{ overflow: 'hidden' }}
      >
        <p className="text-secondary/80 leading-relaxed">{answer}</p>
      </div>
    </MotionItem>
  )
}

const GMAIL_COMPOSE_URL = "https://mail.google.com/mail/u/0/#all?compose=new"
const CONTACT_EMAIL = "scholarpass23@gmail.com"

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
    <section id="faqs" className="py-20 lg:py-32">
      <MotionContainer className="max-w-3xl mx-auto relative z-26">
        {/* Section Header */}
        <MotionItem className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-secondary mt-4 text-balance">
            FAQ
          </h2>
        </MotionItem>

        {/* FAQ Accordion */}
        <MotionContainer 
            className="space-y-4 px-6"
            staggerDelay={0.1}
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </MotionContainer>

        {/* CTA */}
        <MotionItem className="mt-26 text-center relative z-26">
          <p className="text-secondary/80 mb-4">Still have questions?</p>
          <a
            href={GMAIL_COMPOSE_URL}
            onClick={handleEmailClick}
            className="inline-flex items-center text-secondary hover:underline mb-16"
          >
            {emailCopied ? "Email copied!" : `Contact us at ${CONTACT_EMAIL}`}
          </a>
        </MotionItem>
      </MotionContainer>

      {/* CTA */}
      <CTA/>
    </section>
  )
}