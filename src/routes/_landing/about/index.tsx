import { createFileRoute } from '@tanstack/react-router'
import { SEO } from "@/components/SEO"
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Navbar from "@/components/landing/Navbar"
import AnimatedBackground from "@/components/landing/AnimatedBackground"
import { Footer } from "@/components/landing/sections/Footer"
import { Partnerships } from "@/components/landing/about/Partnerships"
import CompanyOverviewSection from "@/components/landing/about/CompanyOverview"
import MissionVisionSection from "@/components/landing/about/MissionVision"
import TeamSection from "@/components/landing/about/Team"
import { useEffect } from 'react'

export const Route = createFileRoute('/_landing/about/')({
  component: About,
})

function About() {
  useSmoothScroll()

  useEffect(() => {
    // Handle hash scrolling on initial load
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [])

  return (
    <main className="relative min-h-screen bg-background text-secondary">
      <SEO
        title="About Us"
        description="Learn about iSkolar's mission, vision, and the team building the future of scholarship management."
        canonicalPath="/about"
      />
      <Navbar />
      <AnimatedBackground />
      
      <div className="pt-20">
        <CompanyOverviewSection />
        <MissionVisionSection />
        <TeamSection />
        <Partnerships />
      </div>

      <Footer />
    </main>
  )
}
