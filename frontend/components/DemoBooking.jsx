import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, Mail, Phone, Building2, MessageSquare, CheckCircle, X } from 'lucide-react'

const DemoBooking = ({ isOpen, onClose, type = 'demo' }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    companySize: '',
    sector: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    requestType: type // 'demo' or 'poc'
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const companySizes = [
    { value: 'small', label: 'Small (1-50)', labelAr: 'صغير (1-50)' },
    { value: 'medium', label: 'Medium (51-250)', labelAr: 'متوسط (51-250)' },
    { value: 'large', label: 'Large (251-1000)', labelAr: 'كبير (251-1000)' },
    { value: 'enterprise', label: 'Enterprise (1000+)', labelAr: 'مؤسسي (1000+)' }
  ]

  const sectors = [
    { value: 'financial', label: 'Financial Services', labelAr: 'الخدمات المالية' },
    { value: 'healthcare', label: 'Healthcare', labelAr: 'الرعاية الصحية' },
    { value: 'government', label: 'Government', labelAr: 'حكومي' },
    { value: 'technology', label: 'Technology', labelAr: 'تكنولوجيا' },
    { value: 'energy', label: 'Energy', labelAr: 'طاقة' },
    { value: 'manufacturing', label: 'Manufacturing', labelAr: 'تصنيع' },
    { value: 'other', label: 'Other', labelAr: 'أخرى' }
  ]

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Import booking service
      const { submitBooking, calculateLeadScore } = await import('../services/bookingService')
      
      // Calculate lead score
      const leadScore = calculateLeadScore(formData)
      
      // Submit to Azure
      const result = await submitBooking({
        ...formData,
        leadScore: leadScore
      })
      
      console.log('Booking submitted successfully:', result)
      
      setIsSubmitted(true)
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
        setStep(1)
        setFormData({
          name: '', email: '', phone: '', company: '', companySize: '',
          sector: '', preferredDate: '', preferredTime: '', message: '', requestType: type
        })
      }, 3000)
      
    } catch (error) {
      console.error('Booking submission error:', error)
      alert('There was an error submitting your booking. Please try again or contact us directly.')
    }
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const isStepValid = () => {
    if (step === 1) {
      return formData.name && formData.email && formData.phone
    }
    if (step === 2) {
      return formData.company && formData.companySize && formData.sector
    }
    if (step === 3) {
      return formData.preferredDate && formData.preferredTime
    }
    return true
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-8">
                <h2 className="font-english font-bold text-3xl mb-2">
                  {type === 'demo' ? 'Request Demo' : 'Request POC'}
                </h2>
                <p className="font-arabic text-lg opacity-90">
                  {type === 'demo' ? 'احجز عرض توضيحي' : 'اطلب إثبات المفهوم'}
                </p>
                
                {/* Progress Steps */}
                <div className="flex items-center gap-4 mt-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        s <= step ? 'bg-brand-accent text-white' : 'bg-white/20 text-white/60'
                      }`}>
                        {s}
                      </div>
                      {s < 3 && (
                        <div className={`flex-1 h-1 mx-2 ${
                          s < step ? 'bg-brand-accent' : 'bg-white/20'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="font-english font-semibold text-xl text-gray-900 mb-4">
                        Personal Information
                      </h3>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-english">Full Name</span>
                          <span className="font-arabic text-gray-500">الاسم الكامل</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4" />
                          <span className="font-english">Email Address</span>
                          <span className="font-arabic text-gray-500">البريد الإلكتروني</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                          placeholder="john@company.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4" />
                          <span className="font-english">Phone Number</span>
                          <span className="font-arabic text-gray-500">رقم الهاتف</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                          placeholder="+966 XX XXX XXXX"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="font-english font-semibold text-xl text-gray-900 mb-4">
                        Company Details
                      </h3>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Building2 className="w-4 h-4" />
                          <span className="font-english">Company Name</span>
                          <span className="font-arabic text-gray-500">اسم الشركة</span>
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleChange('company', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                          placeholder="Company Inc."
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          <span className="font-english">Company Size</span>
                          <span className="font-arabic text-gray-500 mr-2">حجم الشركة</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {companySizes.map((size) => (
                            <button
                              key={size.value}
                              type="button"
                              onClick={() => handleChange('companySize', size.value)}
                              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                formData.companySize === size.value
                                  ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                  : 'border-gray-300 hover:border-brand-primary/50'
                              }`}
                            >
                              <div className="font-english text-sm font-medium">{size.label}</div>
                              <div className="font-arabic text-xs text-gray-500">{size.labelAr}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          <span className="font-english">Industry Sector</span>
                          <span className="font-arabic text-gray-500 mr-2">القطاع</span>
                        </label>
                        <select
                          value={formData.sector}
                          onChange={(e) => handleChange('sector', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                          required
                        >
                          <option value="">Select Sector</option>
                          {sectors.map((sector) => (
                            <option key={sector.value} value={sector.value}>
                              {sector.label} - {sector.labelAr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="font-english font-semibold text-xl text-gray-900 mb-4">
                        Schedule {type === 'demo' ? 'Demo' : 'POC Discussion'}
                      </h3>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-english">Preferred Date</span>
                          <span className="font-arabic text-gray-500">التاريخ المفضل</span>
                        </label>
                        <input
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => handleChange('preferredDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-english">Preferred Time</span>
                          <span className="font-arabic text-gray-500">الوقت المفضل</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleChange('preferredTime', time)}
                              className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                                formData.preferredTime === time
                                  ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-semibold'
                                  : 'border-gray-300 hover:border-brand-primary/50'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-english">Additional Notes (Optional)</span>
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none resize-none"
                          placeholder="Any specific requirements or questions..."
                        ></textarea>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                      Previous
                    </button>
                  )}
                  
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                        isStepValid()
                          ? 'bg-brand-primary text-white hover:bg-brand-secondary'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                        isStepValid()
                          ? 'bg-gradient-to-r from-brand-accent to-brand-gold text-white hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {type === 'demo' ? 'Book Demo' : 'Request POC'}
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="font-english font-bold text-2xl text-gray-900 mb-2">
                Request Submitted Successfully!
              </h3>
              <p className="font-arabic text-lg text-gray-600 mb-4">
                تم إرسال الطلب بنجاح
              </p>
              <p className="font-english text-gray-600">
                Our team will contact you within 24 hours to confirm your {type === 'demo' ? 'demo' : 'POC'} session.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DemoBooking

