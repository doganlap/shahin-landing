import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'ما هي شاهين للحوكمة؟',
      questionEn: 'What is Shahin GRC?',
      answer: 'شاهين للحوكمة هي منصة شاملة لإدارة الحوكمة والمخاطر والامتثال مصممة خصيصاً للمنظمات السعودية والعربية. نقدم حلولاً مبتكرة مدعومة بالذكاء الاصطناعي لتبسيط عمليات الامتثال وتحسين الكفاءة.',
      answerEn: 'Shahin GRC is a comprehensive platform for Governance, Risk, and Compliance management specifically designed for Saudi and Arabic organizations. We provide AI-powered innovative solutions to simplify compliance processes and improve efficiency.'
    },
    {
      question: 'كيف يمكنني البدء مع شاهين؟',
      questionEn: 'How can I get started with Shahin?',
      answer: 'يمكنك البدء بطلب عرض توضيحي مجاني أو إثبات المفهوم (POC). سيتصل بك فريقنا خلال 24 ساعة لتحديد موعد العرض. يمكنك أيضاً التسجيل للحصول على حساب تجريبي مجاني لمدة 14 يوماً.',
      answerEn: 'You can start by requesting a free demo or proof of concept (POC). Our team will contact you within 24 hours to schedule the presentation. You can also sign up for a 14-day free trial account.'
    },
    {
      question: 'ما الأطر التنظيمية التي تدعمها شاهين؟',
      questionEn: 'What regulatory frameworks does Shahin support?',
      answer: 'تدعم شاهين أكثر من 117 إطار تنظيمي، بما في ذلك جميع الأطر السعودية الرئيسية (NCA، SAMA، CMA، PDPL، NCA ECC، وغيرها) بالإضافة إلى المعايير الدولية (ISO 27001، NIST، PCI DSS، GDPR، وغيرها).',
      answerEn: 'Shahin supports over 117 regulatory frameworks, including all major Saudi frameworks (NCA, SAMA, CMA, PDPL, NCA ECC, and more) as well as international standards (ISO 27001, NIST, PCI DSS, GDPR, and more).'
    },
    {
      question: 'هل يمكن تخصيص النظام وفقاً لاحتياجاتنا؟',
      questionEn: 'Can the system be customized to our needs?',
      answer: 'نعم، شاهين قابلة للتخصيص بالكامل. يمكنك تخصيص الضوابط والتقارير والواجهات وفقاً لمتطلباتك الخاصة. نحن نقدم أيضاً خدمات استشارية لمساعدتك في تحديد التخصيصات المثلى لمؤسستك.',
      answerEn: 'Yes, Shahin is fully customizable. You can customize controls, reports, and interfaces according to your specific requirements. We also provide consulting services to help you identify the optimal customizations for your organization.'
    },
    {
      question: 'ما مستوى الدعم المتاح؟',
      questionEn: 'What level of support is available?',
      answer: 'نوفر دعم عملاء على مدار الساعة طوال أيام الأسبوع باللغتين العربية والإنجليزية. بالإضافة إلى التدريب الشامل، وثائق شاملة، وأدوات التعلم عبر الإنترنت. جميع الخطط تتضمن دعم أساسي مجاني.',
      answerEn: 'We provide 24/7 customer support in both Arabic and English. In addition to comprehensive training, detailed documentation, and online learning tools. All plans include free basic support.'
    },
    {
      question: 'كيف يتم ضمان أمان البيانات؟',
      questionEn: 'How is data security guaranteed?',
      answer: 'نستخدم أعلى معايير الأمان في الصناعة. بياناتك مشفرة في حالة الراحة والمتجهة، ونحن معتمدون بـ ISO 27001. يمكنك أيضاً اختيار التخزين المحلي إذا كانت مؤسستك تتطلب ذلك. نحن ملتزمون بشدة بالحفاظ على خصوصية وأمان بياناتك.',
      answerEn: 'We use the highest security standards in the industry. Your data is encrypted at rest and in transit, and we are ISO 27001 certified. You can also choose local storage if your organization requires it. We are strongly committed to maintaining your data privacy and security.'
    },
    {
      question: 'ما هي تكلفة الاشتراك؟',
      questionEn: 'What is the subscription cost?',
      answer: 'نحن نقدم خطط مرنة تناسب مختلف احتياجات وأحجام المؤسسات. تبدأ الأسعار من 999 ريال شهرياً للمؤسسات الصغيرة. نحن نقدم أيضاً خصومات للكروت السنوية والعقود متعددة السنوات. اتصل بنا للحصول على عرض أسعار مخصص لمؤسستك.',
      answerEn: 'We offer flexible plans that suit different needs and organization sizes. Prices start from 999 SAR per month for small organizations. We also offer discounts for annual subscriptions and multi-year contracts. Contact us for a customized quote for your organization.'
    },
    {
      question: 'هل تدعم العديد من المواقع أو الشركات المتعددة؟',
      questionEn: 'Do you support multiple sites or multi-company?',
      answer: 'نعم، شاهين يدعم إدارة متعددة المستويات للشركات التابعة والمواقع. يمكنك إدارة جميع عمليات الامتثال من لوحة تحكم موحدة مع صلاحيات وسيطرة محلية محددة.',
      answerEn: 'Yes, Shahin supports multi-level management for subsidiaries and sites. You can manage all compliance operations from a unified dashboard with specific local permissions and controls.'
    },
    {
      question: 'ما مقدار الوقت الذي أحتاجه لتنفيذ شاهين؟',
      questionEn: 'How much time do I need to implement Shahin?',
      answer: 'يمكنك البدء في غضون 24-48 ساعة. عملية التنفيذ الكامل تستغرق عادة ما بين أسبوعين و 4 أسابيع حسب حجم مؤسستك وتعقيدها. فريقنا يدعمك في كل خطوة على الطريق.',
      answerEn: 'You can get started within 24-48 hours. Full implementation typically takes between 2-4 weeks depending on your organization size and complexity. Our team supports you every step of the way.'
    },
    {
      question: 'هل يمكنني استيراد البيانات من أنظمة أخرى؟',
      questionEn: 'Can I import data from other systems?',
      answer: 'نعم، ندعم استيراد البيانات من مجموعة واسعة من الأنظمة عبر واجهات برمجة التطبيقات والاستيراد اليدوي. فريقنا يمكنه مساعدتك في ترحيل بياناتك بأمان وكفاءة.',
      answerEn: 'Yes, we support data import from a wide range of systems via APIs and manual import. Our team can help you migrate your data safely and efficiently.'
    }
  ]

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>الأسئلة الشائعة</span>
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            الأسئلة الشائعة
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Frequently Asked Questions
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            إجابات على الأسئلة الأكثر شيوعاً حول شاهين للحوكمة
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            Answers to the most common questions about Shahin GRC
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-right hover:bg-gray-50 transition-colors group"
                aria-label={faq.question}
                aria-expanded={openIndex === index}
              >
                <ChevronDown 
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <div className="flex-1 mr-4 text-right">
                  <div className="font-arabic font-bold text-lg text-gray-900 mb-1 group-hover:text-brand-primary transition-colors">
                    {faq.question}
                  </div>
                  <div className="font-english text-sm text-gray-600">
                    {faq.questionEn}
                  </div>
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
                      <p className="font-arabic text-gray-700 leading-relaxed mb-3">
                        {faq.answer}
                      </p>
                      <p className="font-english text-sm text-gray-600 leading-relaxed">
                        {faq.answerEn}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Additional Help CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="font-arabic text-xl text-gray-900 mb-4">
            لم تجد إجابة لسؤالك؟
          </p>
          <p className="font-english text-lg text-gray-600 mb-8">
            Didn't find an answer to your question?
          </p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-12 py-4 rounded-xl font-arabic font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            اتصل بنا
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
