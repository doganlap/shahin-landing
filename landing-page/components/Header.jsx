import React, { useState } from 'react'
import { Shield, Sparkles, LogIn, Bot } from 'lucide-react'
import DemoBooking from './DemoBooking'
import UnifiedLogo from './UnifiedLogo'
import { useScrollSpy, useScrollProgress, useHeaderVisibility } from '../hooks/useScrollSpy'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [bookingType, setBookingType] = useState('demo')

  // Advanced navigation hooks
  const sections = ['hero', 'vision', 'features', 'frameworks', 'transformation', 'platform-demo', 'pricing', 'contact']
  const activeSection = useScrollSpy(sections, 150)
  const scrollProgress = useScrollProgress()
  const isHeaderVisible = useHeaderVisibility()

  const smoothScrollTo = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
      setIsMenuOpen(false)
    }
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800 backdrop-blur-xl border-b border-blue-700/50 transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-brand-accent via-purple-600 to-brand-gold transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <nav className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Unified Logo - Symmetrical & Centered */}
          <UnifiedLogo size="medium" variant="horizontal" />

          {/* Advanced Desktop Navigation with Active States */}
          <div className="hidden lg:flex items-center gap-6">
            <button 
              onClick={() => smoothScrollTo('vision')}
              className={`flex items-center gap-2 font-arabic font-bold transition-all ${
                activeSection === 'vision' 
                  ? 'text-yellow-300 scale-110' 
                  : 'text-white/90 hover:text-yellow-300'
              }`}
              aria-label="انتقل إلى الرؤية"
              aria-current={activeSection === 'vision' ? 'page' : undefined}
            >
              <Sparkles className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              <span>الرؤية</span>
              {activeSection === 'vision' && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-gold rounded-full" aria-hidden="true" />
              )}
            </button>
            <button 
              onClick={() => smoothScrollTo('features')}
              className={`relative font-arabic font-medium transition-all ${
                activeSection === 'features' 
                  ? 'text-yellow-300 font-bold scale-110' 
                  : 'text-white/90 hover:text-yellow-300'
              }`}
              aria-label="انتقل إلى الميزات"
              aria-current={activeSection === 'features' ? 'page' : undefined}
            >
              الميزات
              {activeSection === 'features' && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-primary rounded-full" aria-hidden="true" />
              )}
            </button>
            <button 
              onClick={() => smoothScrollTo('frameworks')}
              className={`relative font-arabic font-medium transition-all ${
                activeSection === 'frameworks' 
                  ? 'text-yellow-300 font-bold scale-110' 
                  : 'text-white/90 hover:text-yellow-300'
              }`}
              aria-label="انتقل إلى الأطر"
              aria-current={activeSection === 'frameworks' ? 'page' : undefined}
            >
              الأطر
              {activeSection === 'frameworks' && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-primary rounded-full" aria-hidden="true" />
              )}
            </button>
            <button 
              onClick={() => smoothScrollTo('contact')}
              className={`relative font-arabic font-medium transition-all ${
                activeSection === 'contact' 
                  ? 'text-yellow-300 font-bold scale-110' 
                  : 'text-white/90 hover:text-yellow-300'
              }`}
              aria-label="انتقل إلى اتصل بنا"
              aria-current={activeSection === 'contact' ? 'page' : undefined}
            >
              اتصل بنا
              {activeSection === 'contact' && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-primary rounded-full" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="القائمة"
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Arabic Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-white/98 backdrop-blur-xl" role="menu">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => smoothScrollTo('vision')}
                className={`flex items-center gap-2 font-arabic font-bold text-right ${
                  activeSection === 'vision' ? 'text-brand-gold' : 'text-brand-accent hover:text-brand-gold'
                }`}
                aria-label="انتقل إلى الرؤية"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                <span>الرؤية</span>
                {activeSection === 'vision' && <span className="mr-auto text-xs">●</span>}
              </button>
              <button 
                onClick={() => smoothScrollTo('features')}
                className={`font-arabic font-medium text-sm text-right ${
                  activeSection === 'features' ? 'text-brand-primary font-bold' : 'text-gray-600 hover:text-brand-primary'
                }`}
                aria-label="انتقل إلى الميزات"
              >
                الميزات {activeSection === 'features' && <span className="mr-2 text-xs">●</span>}
              </button>
              <button 
                onClick={() => smoothScrollTo('frameworks')}
                className={`font-arabic font-medium text-sm text-right ${
                  activeSection === 'frameworks' ? 'text-brand-primary font-bold' : 'text-gray-600 hover:text-brand-primary'
                }`}
                aria-label="انتقل إلى الأطر"
              >
                الأطر {activeSection === 'frameworks' && <span className="mr-2 text-xs">●</span>}
              </button>
              <button 
                onClick={() => smoothScrollTo('pricing')}
                className={`font-arabic font-medium text-sm text-right ${
                  activeSection === 'pricing' ? 'text-brand-primary font-bold' : 'text-gray-600 hover:text-brand-primary'
                }`}
                aria-label="انتقل إلى الأسعار"
              >
                الأسعار {activeSection === 'pricing' && <span className="mr-2 text-xs">●</span>}
              </button>
              <button 
                onClick={() => smoothScrollTo('contact')}
                className={`font-arabic font-medium text-sm text-right ${
                  activeSection === 'contact' ? 'text-brand-primary font-bold' : 'text-gray-600 hover:text-brand-primary'
                }`}
                aria-label="انتقل إلى اتصل بنا"
              >
                اتصل بنا {activeSection === 'contact' && <span className="mr-2 text-xs">●</span>}
              </button>
              <button 
                onClick={() => {
                  setBookingType('demo')
                  setIsDemoOpen(true)
                }}
                className="bg-brand-primary text-white px-6 py-2.5 rounded-lg font-arabic font-semibold w-full hover:bg-brand-secondary transition-colors"
                aria-label="احجز عرض توضيحي"
              >
                احجز عرض توضيحي
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Demo Booking Modal */}
      <DemoBooking 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)}
        type={bookingType}
      />
    </header>
  )
}

export default Header
