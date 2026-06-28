import { MotionContainer } from "@/components/landing/MotionContainer"

export default function CompanyOverviewSection() {
  return (
    <section id="company-overview" className="py-36 text-secondary w-full overflow-hidden">
      <MotionContainer>
        <div className="px-4 sm:px-12 lg:px-26 relative z-26">
          <h2 className="text-4xl md:text-5xl mb-12 text-center text-secondary">
            Company Overview
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Column 1: logo + description */}
            <div className="bg-background backdrop-blur-sm border border-secondary/10 rounded-2xl p-8 shadow-md flex flex-col items-center justify-center text-center">
              <div className="w-full flex items-center justify-center mb-6">
                <img src="/logo.png" alt="" className="w-38 h-38 object-cover" />
              </div>
              <p className="text-lg leading-relaxed text-secondary/80">
                iSkolar is an edtech company that builds technology platforms and tools for the education sector, digitalizing and automating manual processes while bringing transparency and accountability to how educational programs are managed.
              </p>
            </div>

            {/* Column 2: two rows — Who We Are / What We Do */}
            <div className="grid gap-8 md:grid-rows-2">
              <div className="bg-background backdrop-blur-sm border border-secondary/10 rounded-2xl p-8 shadow-md">
                <h3 className="text-2xl mb-4 text-secondary">Who We Are</h3>
                <p className="text-secondary/80 leading-relaxed">
                  We are a team of dreamers, builders, and students who have firsthand experience with the challenges of funding education. Guided by this understanding, we built a platform that brings students together with scholarship providers, institutions, and organizations committed to supporting the next generation of leaders.
                </p>
              </div>

              <div className="bg-background backdrop-blur-sm border border-secondary/10 rounded-2xl p-8 shadow-md">
                <h3 className="text-2xl mb-4 text-secondary">What We Do</h3>
                <p className="text-secondary/80 leading-relaxed">
                  Our ecosystem provides students with a seamless interface to discover opportunities matched to their goals, while giving institutions efficient management systems and the tools to improve their operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MotionContainer>
    </section>
  )
}
