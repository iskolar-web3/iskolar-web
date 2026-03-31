import { useState } from "react"
import { Facebook, Linkedin, Mail } from "lucide-react"

const quickLinks = [
  { name: "Home", href: "/#home" },
  { name: "Features", href: "/#features" },
  { name: "Roadmap", href: "/#roadmap" },
  { name: "FAQs", href: "/#faqs" },
  { name: "Company Overview", href: "/about/#company-overview" },
  { name: "Mission & Vision", href: "/about/#mission-vision" },
  { name: "Our Team", href: "/about/#team" },
  { name: "Partnerships", href: "/about/#partnerships" },
]

const legalLinks = [
  { name: "", href: "/" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms-conditions" },
]

const socialLinks = [
  { 
    name: "Discord", 
    icon: ({ size = 18 }: { size?: number }) => (
			<svg
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
			</svg>
		), 
    href: "https://discord.gg/Jw8xDA8Hnx" 
  },
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/profile.php?id=61575967087555" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/107364901" },
]

const GMAIL_COMPOSE_URL = "https://mail.google.com/mail/u/0/#all?compose=new"
const CONTACT_EMAIL = "scholarpass23@gmail.com"

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
      {/* Horizontal line at top */}
      <div className="border-t border-secondary/20"></div>

      {/* Main Footer */}
      <div className="pt-30 pb-16 px-6 md:px-26">
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
              <h4 className="text-lg mb-4 text-secondary">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-secondary/80 hover:text-secondary transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-secondary text-lg mb-4">Legal</h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-secondary/80 hover:text-secondary transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-secondary text-lg mb-4">Contact Us</h4>
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