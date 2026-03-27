import { MotionContainer, MotionItem } from "@/components/landing/MotionContainer"
import { Linkedin } from "lucide-react"

const Card = ({ image, name, role, university, link }: { image: string; name: string; role: string; university: string; link: string; }) => (
  <div className={`
    relative bg-background backdrop-blur-sm border border-secondary/10 shadow-lg rounded-xl
    flex flex-col items-center text-center p-6
    w-full min-w-60 max-w-[280px]
    transition-transform hover:-translate-y-1 duration-300 group
  `}>
    <img
      src={image}
      alt=""
      className="w-28 h-28 rounded-full mb-4 overflow-hidden object-cover border-2 border-secondary/20 group-hover:border-secondary/50 transition-colors"
    />
    <h3 className="text-xl font-bold text-secondary mb-1">{name}</h3>
    <p className="text-sm text-secondary/85 mb-1">{role}</p>
    <p className="text-[12.5px] text-secondary/60 italic mb-4 flex items-center gap-1">
      {university}
    </p>
    <a href={link} target="_blank" className="p-2 text-secondary/80 hover:text-secondary rounded-full transition-all">
      <Linkedin className="w-5 h-5" />
    </a>
  </div>
)

export default function TeamSection() {
  return (
    <section id="team" className="py-36 pb-24 text-secondary w-full overflow-hidden">
      <MotionContainer>
        <div className="px-4 sm:px-12 lg:px-26 max-w-8xl mx-auto relative z-26">
          <h2 className="text-4xl md:text-5xl mb-4 text-center text-secondary">
            Meet Our Team
          </h2>
          <p className="text-center text-secondary/80 mb-16 max-w-2xl mx-auto text-lg">
            The dreamers, builders, and students behind iSkolar.
          </p>
          
          <div className="flex flex-col items-center gap-16">
            {/* Founders */}
            <div className="w-full">
              <h3 className="text-3xl text-center text-secondary mb-7">Founders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-5xl mx-auto justify-items-center">
                <MotionItem>
                  <Card image="/team/CEO.jpg" name="Justin Luzano" role="CEO" university="University of Makati" link="https://www.linkedin.com/in/justinluzano23/" />
                </MotionItem>

                <MotionItem>
                  <Card image="/team/CTO.jpg" name="Louigie Caminoy" role="CTO" university="University of Makati" link="https://www.linkedin.com/in/louie1221" />
                </MotionItem>

                <MotionItem>
                  <Card image="/team/COO.jpg" name="Adam Ruadilla" role="COO" university="Taguig City University" link="https://www.linkedin.com/in/kyle-adam-r-35946332a/" />
                </MotionItem>

                <MotionItem>
                  <Card image="/team/CFO.jpg" name="Jeselle Francisco" role="CFO" university="University of Makati" link="https://www.linkedin.com/in/maria-jeselle-francisco-736491369/" />
                </MotionItem>
              </div>
            </div>

            {/* Team Members */}
            <div className="flex flex-col items-center gap-20">
              <div className="w-full">
                <h3 className="text-3xl text-center text-secondary mb-7">Core Team</h3>
                <div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl mx-auto">
                  <MotionItem>
                    <Card image="/team/Research-Lead.jpg" name="Cristian Obida" role="Research Lead" university="Asia Pacific College" link="https://www.linkedin.com/in/cristian-r-obida-96a36b28a/" />
                  </MotionItem>

                  <MotionItem>
                    <Card image="/team/Tech-Lead.jpg" name="Giordan Nuez" role="Tech Lead" university="University of Makati" link="https://www.linkedin.com/in/giordan-nuez-b8924838b/" />
                  </MotionItem>

                  <MotionItem>
                    <Card image="/team/Community-Manager.jpg" name="Juliet Tariman" role="Community Manager" university="PUP Sta. Mesa" link="https://www.linkedin.com/in/juliet-daphne-e-tariman-2022b1236/" />
                  </MotionItem>

                  <MotionItem>
                    <Card image="/team/Cybersecurity-Lead.jpg" name="Emmanuel Mutas" role="Cybersecurity Lead" university="PUP Sta. Mesa" link="https://www.linkedin.com/in/manel04/" />
                  </MotionItem>

                  <MotionItem>
                    <Card image="/team/Design-Lead.jpg" name="Arah Mejidana" role="Design Lead" university="Taguig City University" link="https://www.linkedin.com/in/arah-mejidana-a12945398/" />
                  </MotionItem>

                  <MotionItem>
                    <Card image="/team/AI-Lead.jpg" name="John Richie Campo" role="AI Lead" university="University of Makati" link="https://www.linkedin.com/in/john-richie-campo/" />
                  </MotionItem>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionContainer>
    </section>
  )
}