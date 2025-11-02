import React from 'react'
import Header from './components/Header'
import FloatingNav from './components/FloatingNav'
import QuickSectionNav from './components/QuickSectionNav'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Vision from './components/Vision'
import KeyFeatures from './components/KeyFeatures'
import Interactive3DCards from './components/Interactive3DCards'
import AITeamShowcase from './components/AITeamShowcase'
import UnifiedValueSection from './components/UnifiedValueSection'
import CompetitiveAdvantage from './components/CompetitiveAdvantage'
import TargetSectors from './components/TargetSectors'
import DashboardPreview from './components/DashboardPreview'
import TransformationStory from './components/TransformationStory'
import ParallaxSection from './components/ParallaxSection'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300" dir="rtl">
      <Header />
      <FloatingNav />
      <QuickSectionNav />
      <main>
        <Hero />
        <TrustBar />
        <Vision />
        <KeyFeatures />
        <Interactive3DCards />
        <AITeamShowcase />
        <UnifiedValueSection />
        <CompetitiveAdvantage />
        <TargetSectors />
        <DashboardPreview />
        <TransformationStory />
        <ParallaxSection />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}

export default App

