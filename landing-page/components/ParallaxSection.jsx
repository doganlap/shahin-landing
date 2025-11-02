import React from 'react'
import { motion } from 'framer-motion'

const ParallaxSection = () => {
  return (
    <section id="parallax" className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-brand-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-primary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-6">
              منصة واحدة. حل شامل. نتائج استثنائية.
            </h2>
            <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
              One Platform. One Complete Solution. Exceptional Results.
            </h3>
            <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
              شاهين ليست مجرد أداة - إنها شريك في نجاحك. نحن نؤمن بأن الحوكمة الفعالة 
              يجب أن تكون بسيطة، ذكية، وفي متناول الجميع.
            </p>
            <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-4">
              Shahin isn't just a tool - we're your partner in success. We believe effective 
              governance should be simple, smart, and accessible to everyone.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all hover:border-brand-accent/50">
              <div className="text-5xl mb-4">🚀</div>
              <h4 className="font-arabic font-bold text-xl text-gray-900 mb-2">سرعة فائقة</h4>
              <p className="font-english text-sm text-gray-600 mb-4">Lightning Fast</p>
              <p className="font-arabic text-sm text-gray-700">ابدأ في دقائق وسرع من عملياتك فوراً</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all hover:border-brand-accent/50">
              <div className="text-5xl mb-4">🧠</div>
              <h4 className="font-arabic font-bold text-xl text-gray-900 mb-2">ذكاء متقدم</h4>
              <p className="font-english text-sm text-gray-600 mb-4">Advanced Intelligence</p>
              <p className="font-arabic text-sm text-gray-700">ذكاء اصطناعي يوجهك في كل خطوة</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all hover:border-brand-accent/50">
              <div className="text-5xl mb-4">🌟</div>
              <h4 className="font-arabic font-bold text-xl text-gray-900 mb-2">تميز مستمر</h4>
              <p className="font-english text-sm text-gray-600 mb-4">Continuous Excellence</p>
              <p className="font-arabic text-sm text-gray-700">تحديثات مستمرة لخدمتك بشكل أفضل</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ParallaxSection
