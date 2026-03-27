import { MotionContainer } from "@/components/landing/MotionContainer"

export default function CompanyOverviewSection() {
  return (
    <section id="company-overview" className="py-36 text-secondary w-full overflow-hidden">
      <MotionContainer>
        <div className="px-4 sm:px-12 lg:px-26 max-w-5xl mx-auto relative z-26">
          <h2 className="text-4xl md:text-5xl mb-12 text-center text-secondary">
            Company Overview
          </h2>
          
          <div className="bg-background backdrop-blur-sm border border-secondary/10 rounded-2xl px-8 py-8 md:px-12 shadow-md">
            <div className="w-full flex items-center justify-center mb-2">
              <img src="/logo.png" alt="" className="w-38 h-38 object-cover" />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none text-secondary/80">
              <p className="text-lg leading-relaxed mb-12">
                iSkolar is a scholarship hub platform that connects students directly with scholarship providers, digitalizing and automating scholarship processes while making fund disbursements fully transparent.
              </p>
              
              <h3 className="text-2xl mb-4 text-secondary">Who We Are</h3>
              <p className="mb-6 text-secondary/80">
                We are a team of dreamers, builders, and students who have firsthand experience with the challenges of funding education. Guided by this understanding, we built a platform that brings students together with scholarship providers, institutions, and organizations committed to supporting the next generation of leaders.
              </p>

              <h3 className="text-2xl mb-4 text-secondary">What We Do</h3>
              <p className="text-secondary/80">
                Our ecosystem provides a seamless interface for students to find scholarships that match their field of study, while giving sponsors an efficient management system and track the impact of their contributions.
              </p>
            </div>
          </div>
        </div>
      </MotionContainer>
    </section>
  )
}