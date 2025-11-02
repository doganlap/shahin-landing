import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Sparkles, Star, Shield, DollarSign, Mail, ArrowUp } from 'lucide-react'
import { useScrollSpy } from '../hooks/useScrollSpy'

const FloatingNav = () => {
  const sections = [
    { id: 'hero', icon: Home, label: 'الرئيسية', labelEn: 'Home' },
    { id: 'vision', icon: Sparkles, label: 'الرؤية', labelEn: 'Vision' },
    { id: 'features', icon: Star, label: 'الميزات', labelEn: 'Features' },
    { id: 'frameworks', icon: Shield, label: 'الأطر', labelEn: 'Frameworks' },
    { id: 'pricing', icon: DollarSign, label: 'الأسعار', labelEn: 'Pricing' },
    { id: 'contact', icon: Mail, label: 'اتصل', labelEn: 'Contact' },
  ]

  const activeSection = useScrollSpy(sections.map(s => s.id), 150)
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const smoothScrollTo = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Slim Floating Side Navigation */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:block"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 px-2 py-3">
          <div className="flex flex-col gap-1.5">
            {sections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <motion.button
                  key={section.id}
                  onClick={() => smoothScrollTo(section.id)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`relative group p-2.5 rounded-full transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-brand-accent to-brand-gold text-white shadow-lg' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title={section.label}
                  aria-label={`انتقل إلى ${section.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <section.icon className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                  
                  {/* Slim Tooltip - Only on Hover */}
                  <div className="absolute right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">
                      <div className="font-arabic font-semibold">{section.label}</div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Slim Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 left-6 w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-gold text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-110 transition-transform group"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingNav
