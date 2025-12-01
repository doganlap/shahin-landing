import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, Presentation, FlaskConical, ChevronLeft, ChevronRight } from 'lucide-react'

const FloatingActionButtons = ({ onLoginClick, onDemoClick, onPOCClick }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const actions = [
    {
      id: 'login',
      icon: LogIn,
      label: 'دخول المنصة',
      labelEn: 'Login',
      onClick: onLoginClick,
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'from-emerald-600 to-emerald-700'
    },
    {
      id: 'demo',
      icon: Presentation,
      label: 'عرض توضيحي',
      labelEn: 'Demo',
      onClick: onDemoClick,
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700'
    },
    {
      id: 'poc',
      icon: FlaskConical,
      label: 'إثبات المفهوم',
      labelEn: 'POC',
      onClick: onPOCClick,
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700'
    },
  ]

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40"
      style={{
        filter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.15))',
      }}
    >
      <div className="relative">
        {/* Glassmorphism Container */}
        <div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-2"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
          }}
        >
          <div className="flex flex-col gap-2">
            {/* Toggle Button */}
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 rounded-full bg-gradient-to-br from-brand-accent to-brand-gold text-white shadow-lg hover:shadow-xl transition-all"
              aria-label={isExpanded ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={isExpanded}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isExpanded ? (
                  <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                )}
              </motion.div>
            </motion.button>

            {/* Action Buttons */}
            <AnimatePresence>
              {isExpanded && actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ scale: 0, x: 50, opacity: 0 }}
                  animate={{ scale: 1, x: 0, opacity: 1 }}
                  exit={{ scale: 0, x: 50, opacity: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  className="relative group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.button
                    onClick={action.onClick}
                    className={`relative p-3 rounded-full bg-gradient-to-br ${action.gradient} hover:${action.hoverGradient} text-white shadow-lg hover:shadow-xl transition-all`}
                    aria-label={action.label}
                  >
                    <action.icon
                      className="w-5 h-5"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  </motion.button>

                  {/* Tooltip */}
                  <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl"
                      style={{
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                    >
                      <div className="font-arabic font-bold text-sm">{action.label}</div>
                      <div className="text-xs text-gray-300 mt-0.5">{action.labelEn}</div>
                    </motion.div>
                    {/* Arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-[-1px]">
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-gray-900 border-b-4 border-b-transparent"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pulse Effect when Collapsed */}
            {!isExpanded && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </div>
        </div>

        {/* Badge Counter (Optional) */}
        {!isExpanded && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
          >
            {actions.length}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default FloatingActionButtons
