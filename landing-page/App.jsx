import React from 'react'
import Header from './components/Header'
import FloatingNav from './components/FloatingNav'
import QuickSectionNav from './components/QuickSectionNav'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Vision from './components/Vision'
import AdvancedStats from './components/AdvancedStats'
import ProblemSolution from './components/ProblemSolution'
import KeyFeatures from './components/KeyFeatures'
import Interactive3DCards from './components/Interactive3DCards'
import AITeamShowcase from './components/AITeamShowcase'
import UnifiedValueSection from './components/UnifiedValueSection'
import SaudiFrameworks from './components/SaudiFrameworks'
import CompetitiveAdvantage from './components/CompetitiveAdvantage'
import TargetSectors from './components/TargetSectors'
import PlatformDemo from './components/PlatformDemo'
import DashboardPreview from './components/DashboardPreview'
import TransformationStory from './components/TransformationStory'
import Testimonials from './components/Testimonials'
import ParallaxSection from './components/ParallaxSection'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      <FloatingNav />
      <QuickSectionNav />
      <main>
        <Hero />
        <TrustBar />
        <Vision />
        <AdvancedStats />
        <ProblemSolution />
        <KeyFeatures />
        <Interactive3DCards />
        <AITeamShowcase />
        <UnifiedValueSection />
        <SaudiFrameworks />
        <CompetitiveAdvantage />
        <TargetSectors />
        <DashboardPreview />
        <TransformationStory />
        <PlatformDemo />
        <Testimonials />
        <ParallaxSection />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App

