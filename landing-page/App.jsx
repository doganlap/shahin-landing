import React from 'react'
import Header from './components/Header'
import FloatingNav from './components/FloatingNav'
import QuickSectionNav from './components/QuickSectionNav'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Vision from './components/Vision'
import Interactive3DCards from './components/Interactive3DCards'
import AITeamShowcase from './components/AITeamShowcase'
import CompetitiveAdvantage from './components/CompetitiveAdvantage'
import TargetSectors from './components/TargetSectors'
import DashboardPreview from './components/DashboardPreview'
import TransformationStory from './components/TransformationStory'
import ParallaxSection from './components/ParallaxSection'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'

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
        <Interactive3DCards />
        <AITeamShowcase />
        <CompetitiveAdvantage />
        <TargetSectors />
        <DashboardPreview />
        <TransformationStory />
        <ParallaxSection />
        <Pricing />
        <FAQ />
      </main>
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="font-english text-sm text-gray-600 dark:text-gray-400">
              Powered by{' '}
              <a
                href="https://www.doganconsult.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-primary hover:text-brand-accent transition-colors underline"
              >
                DoganConsult
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

