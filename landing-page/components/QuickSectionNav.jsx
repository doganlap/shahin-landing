import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useScrollSpy } from '../hooks/useScrollSpy'

const QuickSectionNav = () => {
  const sections = [
    'hero',
    'vision', 
    'features',
    'frameworks',
    'transformation',
    'platform-demo',
    'pricing',
    'contact'
  ]

  const activeSection = useScrollSpy(sections, 150)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const index = sections.indexOf(activeSection)
    if (index !== -1) {
      setCurrentIndex(index)
    }
    
    // Show after scrolling past hero
    setIsVisible(window.scrollY > 300)
    
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  const scrollToSection = (index) => {
    if (index >= 0 && index < sections.length) {
      const element = document.getElementById(sections[index])
      if (element) {
        const offset = 80
        const elementPosition = element.offsetTop - offset
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        })
      }
    }
  }

  const goToPreviousSection = () => {
    if (currentIndex > 0) {
      scrollToSection(currentIndex - 1)
    }
  }

  const goToNextSection = () => {
    if (currentIndex < sections.length - 1) {
      scrollToSection(currentIndex + 1)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40"
        >
          {/* Unified Slim Navigation Bar */}
          <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 px-2 py-4 flex flex-col items-center gap-1">
            {/* Up Button - Slim */}
            <motion.button
              onClick={goToPreviousSection}
              disabled={currentIndex === 0}
              whileHover={{ scale: currentIndex > 0 ? 1.15 : 1 }}
              whileTap={{ scale: currentIndex > 0 ? 0.9 : 1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentIndex === 0
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-br from-brand-primary to-brand-secondary hover:shadow-lg cursor-pointer'
              }`}
            >
              <ChevronUp 
                className={`w-5 h-5 ${currentIndex === 0 ? 'text-gray-400' : 'text-white'}`} 
                strokeWidth={2.5}
              />
            </motion.button>

            {/* Slim Divider */}
            <div className="w-6 h-px bg-gray-300 my-1" />

            {/* Section Dots - Slim Indicator */}
            <div className="flex flex-col gap-1.5 py-2">
              {sections.map((section, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToSection(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-gradient-to-br from-brand-accent to-brand-gold scale-150'
                      : idx < currentIndex
                        ? 'bg-brand-primary'
                        : 'bg-gray-300'
                  }`}
                  title={getSectionNameArabic(section)}
                />
              ))}
            </div>

            {/* Slim Counter */}
            <div className="text-[10px] font-bold text-brand-primary mt-1">
              {currentIndex + 1}/{sections.length}
            </div>

            {/* Slim Divider */}
            <div className="w-6 h-px bg-gray-300 my-1" />

            {/* Down Button - Slim */}
            <motion.button
              onClick={goToNextSection}
              disabled={currentIndex === sections.length - 1}
              whileHover={{ scale: currentIndex < sections.length - 1 ? 1.15 : 1 }}
              whileTap={{ scale: currentIndex < sections.length - 1 ? 0.9 : 1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentIndex === sections.length - 1
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-br from-brand-accent to-brand-gold hover:shadow-lg cursor-pointer'
              }`}
            >
              <ChevronDown 
                className={`w-5 h-5 ${currentIndex === sections.length - 1 ? 'text-gray-400' : 'text-white'}`} 
                strokeWidth={2.5}
              />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper function for Arabic section names
const getSectionNameArabic = (sectionId) => {
  const names = {
    'hero': 'الرئيسية',
    'vision': 'الرؤية',
    'features': 'الميزات',
    'frameworks': 'الأطر',
    'transformation': 'التحول',
    'platform-demo': 'العرض',
    'pricing': 'الأسعار',
    'contact': 'اتصال'
  }
  return names[sectionId] || sectionId
}

export default QuickSectionNav

