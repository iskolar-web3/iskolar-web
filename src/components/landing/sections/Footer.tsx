import { useState } from "react"
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react"

const quickLinks = [
  { name: "Home", href: "/#home" },
  { name: "How it works", href: "/#how-it-works" },
  { name: "Roadmap", href: "/#roadmap" },
  { name: "FAQs", href: "/#faqs" },
  { name: "Company Overview", href: "/about/#company-overview" },
  { name: "Mission & Vision", href: "/about/#mission-vision" },
  { name: "Our Team", href: "/about/#team" },
  { name: "Partnerships", href: "/about/#partnerships" },
]

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms-conditions" },
]

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/profile.php?id=61575967087555" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/107364901" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/iskolar_web3?igsh=NDNvZmkwNmxwbDl2" },
]

const GMAIL_COMPOSE_URL = "https://mail.google.com/mail/u/0/#all?compose=new"
const CONTACT_EMAIL = "hello@iskolar.io"

export function Footer() {
  const [emailCopied, setEmailCopied] = useState(false)

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
    <footer className="bg-background text-tertiary">
      {/* Ruled hairline at top */}
      <div className="h-px w-full bg-secondary/15" />

      {/* Main Footer */}
      <div className="pt-30 pb-16 px-4 sm:px-12 lg:px-26">
        <div className="relative z-26">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              {/* Logo */}
              <a href="/">
                <div className="w-25 h-10 md:w-34 md:h-14 flex items-center mb-2 justify-center">
                  <img
                    src={"/logo2.png"}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </a>
              <p className="text-secondary/80 text-sm leading-relaxed mb-6">
                Empowering students with accessible, transparent, and efficient scholarship opportunities.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-secondary/90 transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-secondary text-base tracking-wide mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-secondary/80 hover:text-secondary text-sm inline-block transition-all duration-200 hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-secondary text-base tracking-wide mb-4">Legal</h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-secondary/80 hover:text-secondary text-sm inline-block transition-all duration-200 hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-secondary text-base tracking-wide mb-4">Contact Us</h4>
              <a
                href={GMAIL_COMPOSE_URL}
                onClick={handleEmailClick}
                className="flex items-center gap-2 text-secondary/80 hover:text-secondary transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                {emailCopied ? "Copied!" : CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-secondary text-sm">&copy; {new Date().getFullYear()} iSkolar. All rights reserved.</p>
            <div className="text-end">
              <p className="text-secondary text-sm">Built For Students, Built By Students.</p>
              {/* <p className="text-secondary text-sm">Powered by Lumen.</p> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}