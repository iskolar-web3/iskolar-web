import { MotionContainer } from "@/components/landing/MotionContainer"
import { Target, Globe, Eye } from "lucide-react"

export default function MissionVisionSection() {
  return (
    <section id="mission-vision" className="py-36 text-secondary w-full overflow-hidden">
      <MotionContainer>
        <div className="px-4 sm:px-12 lg:px-26 max-w-7xl mx-auto relative z-26">
          <h2 className="text-4xl md:text-5xl mb-12 text-center text-secondary">
            Mission & Vision
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-background backdrop-blur-sm border border-secondary/10 rounded-2xl p-8 shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <Eye className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="text-2xl mb-4 text-secondary">Our Vision</h3>
              <p className="text-lg text-secondary/80 leading-relaxed">
                A future where every student can pursue their dream education, supported by transparent funding, future-proof opportunities, and a community that invests in the next generation's success.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-background backdrop-blur-sm border border-secondary/10 rounded-2xl p-8 shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <Target className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="text-2xl mb-4 text-secondary">Our Mission</h3>
              <p className="text-lg text-secondary/80 leading-relaxed">
                To make education accessible, fair, and transparent for all by creating a trusted system that connects learners, sponsors, and institutions, ensuring that every individual, regardless of stage or circumstance, receives the opportunity they rightfully deserve to learn, grow, and shape their future.
              </p>
            </div>
          </div>

          {/* SDG Alignment */}
          <div className="mt-12 bg-background backdrop-blur-sm border border-secondary/10 rounded-2xl p-8 shadow-md">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <Globe className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="text-2xl mb-4 text-secondary">Contributing to UN Sustainable Development Goals</h3>
              <p className="text-secondary/80 max-w-3xl">
                iSkolar contributes directly to multiple SDGs, especially:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background/30 rounded-xl p-6 border border-secondary/5">
                <h4 className="text-xl mb-3 text-secondary">SDG 4 – Quality Education</h4>
                <p className="text-secondary/80">
                  Central goal: expanding access to scholarships and digitalizing access to education funding
                </p>
              </div>
              
              <div className="bg-background/30 rounded-xl p-6 border border-secondary/5">
                <h4 className="text-xl mb-3 text-secondary ">SDG 10 – Reduced Inequalities</h4>
                <p className="text-secondary/80">
                  Enables fair access to scholarships regardless of background or location
                </p>
              </div>
              
              <div className="bg-background/30 rounded-xl p-6 border border-secondary/5">
                <h4 className="text-xl mb-3 text-secondary ">SDG 9 – Innovation & Infrastructure</h4>
                <p className="text-secondary/80">
                  Provides a digital ecosystem for scholarship management and application
                </p>
              </div>
              
              <div className="bg-background/30 rounded-xl p-6 border border-secondary/5">
                <h4 className="text-xl mb-3 text-secondary ">SDG 17 – Partnerships for the Goals</h4>
                <p className="text-secondary/80">
                  Collaborates with schools, government, NGOs, and corporate sponsors
                </p>
              </div>
            </div>
          </div>

        </div>
      </MotionContainer>
    </section>
  )
}