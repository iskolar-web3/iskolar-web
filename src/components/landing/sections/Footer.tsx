import { useState } from "react"
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react"
import { products } from "@/components/landing/products"

const homeLinks = [
  { name: "Home", href: "/#home" },
  { name: "Products", href: "/#products" },
  { name: "Ecosystem", href: "/#ecosystem" },
  { name: "In the News", href: "/#in-the-news" },
  { name: "FAQs", href: "/#faqs" },
]

const productLinks = products.map((p) => ({ name: p.name, href: `/#${p.id}` }))

const aboutLinks = [
  { name: "Company Overview", href: "/about#company-overview" },
  { name: "Mission & Vision", href: "/about#mission-vision" },
  { name: "Partnerships", href: "/about#partnerships" },
  { name: "Our Team", href: "/about#team" },
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
    <footer className="relative overflow-hidden text-tertiary">
      <div className="pt-24 pb-10 px-4 sm:px-12 lg:px-26">
        <div className="relative z-26 border-t border-secondary/10 pt-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(5,1fr)] gap-10 lg:gap-12">
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
              <p className="text-secondary/80 text-sm leading-relaxed mb-6 max-w-xs">
                Tools for every step of a Filipino student's journey, from choosing a course to proving a diploma.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-secondary/20 text-secondary flex items-center justify-center hover:bg-secondary hover:text-tertiary hover:border-secondary transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-4 h-4" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </div>

            {/* Home */}
            <div>
              <h4 className="text-secondary/50 text-[11px] font-medium uppercase tracking-[0.18em] mb-4">Home</h4>
              <ul className="space-y-3">
                {homeLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-secondary/75 hover:text-secondary text-sm inline-block transition-all duration-200 hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-secondary/50 text-[11px] font-medium uppercase tracking-[0.18em] mb-4">Products</h4>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-secondary/75 hover:text-secondary text-sm inline-block transition-all duration-200 hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-secondary/50 text-[11px] font-medium uppercase tracking-[0.18em] mb-4">About</h4>
              <ul className="space-y-3">
                {aboutLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-secondary/75 hover:text-secondary text-sm inline-block transition-all duration-200 hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-secondary/50 text-[11px] font-medium uppercase tracking-[0.18em] mb-4">Legal</h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-secondary/75 hover:text-secondary text-sm inline-block transition-all duration-200 hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:hover:translate-x-0">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-secondary/50 text-[11px] font-medium uppercase tracking-[0.18em] mb-4">Contact Us</h4>
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

          <div className="mt-16 pt-8 border-t border-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-secondary/60 text-sm">&copy; {new Date().getFullYear()} iSkolar. All rights reserved.</p>
            <div className="text-end">
              <p className="text-secondary/60 text-sm">Built For Students, Built By Students.</p>
              {/* <p className="text-secondary text-sm">Powered by Lumen.</p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the page edge */}
      <p
        aria-hidden
        className="pointer-events-none select-none text-center text-[26vw] leading-[0.75] tracking-tight text-secondary/[0.05] -mb-[4vw]"
      >
        iSkolar
      </p>
    </footer>
  )
}