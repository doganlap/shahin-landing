import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Heart, Landmark, Code, Zap, GraduationCap, ShoppingCart, Factory } from 'lucide-react'

const TargetSectors = () => {
  const sectors = [
    { 
      icon: Building2, 
      name: 'Financial Services', 
      ar: 'الخدمات المالية', 
      color: 'from-blue-500 to-blue-700',
      bgColor: '#3B82F6',
      frameworks: ['SAMA', 'CMA', 'NCA ECC', 'PDPL'],
      controls: 846,
      description: 'البنوك، التأمين، الاستثمار',
      badge: 'قطاع حيوي'
    },
    { 
      icon: Heart, 
      name: 'Healthcare', 
      ar: 'الرعاية الصحية', 
      color: 'from-red-500 to-red-700',
      bgColor: '#EF4444',
      frameworks: ['MOH', 'SFDA', 'CBAHI', 'PDPL'],
      controls: 678,
      description: 'المستشفيات، العيادات، المختبرات',
      badge: 'قطاع حساس'
    },
    { 
      icon: Landmark, 
      name: 'Government', 
      ar: 'القطاع الحكومي', 
      color: 'from-purple-500 to-purple-700',
      bgColor: '#8B5CF6',
      frameworks: ['NCA ECC', 'SDAIA', 'NDMO', 'Yesser'],
      controls: 924,
      description: 'الوزارات، الهيئات، البلديات',
      badge: 'أولوية عليا'
    },
    { 
      icon: Code, 
      name: 'Technology', 
      ar: 'التكنولوجيا', 
      color: 'from-green-500 to-green-700',
      bgColor: '#10B981',
      frameworks: ['NCA CCC', 'CST', 'ISO 27001', 'PDPL'],
      controls: 734,
      description: 'تقنية المعلومات، السحابة، البرمجيات',
      badge: 'نمو سريع'
    },
    { 
      icon: Zap, 
      name: 'Energy', 
      ar: 'الطاقة والمرافق', 
      color: 'from-amber-500 to-amber-700',
      bgColor: '#F59E0B',
      frameworks: ['NCA OTCC', 'ECRA', 'ISO 27001'],
      controls: 562,
      description: 'الكهرباء، النفط، الطاقة المتجددة',
      badge: 'بنية تحتية'
    },
    { 
      icon: Factory, 
      name: 'Manufacturing', 
      ar: 'التصنيع والإنتاج', 
      color: 'from-gray-500 to-gray-700',
      bgColor: '#6B7280',
      frameworks: ['ISO 9001', 'SASO', 'NCA ECC'],
      controls: 445,
      description: 'المصانع، الإنتاج، التوريد',
      badge: 'صناعي'
    },
    { 
      icon: ShoppingCart, 
      name: 'E-Commerce', 
      ar: 'التجارة الإلكترونية', 
      color: 'from-emerald-500 to-emerald-700',
      bgColor: '#10B981',
      frameworks: ['MOCI', 'PDPL', 'NCA ECC', 'PCI DSS'],
      controls: 512,
      description: 'التجزئة، التوصيل، المدفوعات',
      badge: 'رقمي'
    },
    { 
      icon: GraduationCap, 
      name: 'Education', 
      ar: 'التعليم والتدريب', 
      color: 'from-violet-500 to-violet-700',
      bgColor: '#8B5CF6',
      frameworks: ['MOE', 'ETEC', 'PDPL', 'NCAAA'],
      controls: 398,
      description: 'الجامعات، المدارس، التدريب',
      badge: 'معرفي'
    },
  ]

  return (
    <section id="target-sectors" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            تغطية شاملة لجميع القطاعات
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-5xl text-gray-900 mb-4">
            من نخدم - جميع القطاعات السعودية
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Who We Serve - All Saudi Sectors
          </h3>
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-primary mb-1">40+</div>
              <div className="font-arabic text-sm text-gray-700 font-bold">جهة سعودية</div>
              <div className="font-english text-xs text-gray-500">Saudi Regulators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-1">15</div>
              <div className="font-arabic text-sm text-gray-700 font-bold">معيار دولي</div>
              <div className="font-english text-xs text-gray-500">International Standards</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-1">45+</div>
              <div className="font-arabic text-sm text-gray-700 font-bold">جهة إقليمية</div>
              <div className="font-english text-xs text-gray-500">Regional Regulators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-1">3,200+</div>
              <div className="font-arabic text-sm text-gray-700 font-bold">إجمالي الضوابط</div>
              <div className="font-english text-xs text-gray-500">Total Controls</div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sectors.map((sector, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-gray-400 transition-all shadow-lg hover:shadow-2xl cursor-pointer relative overflow-hidden"
            >
              {/* Sector Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-brand-accent to-brand-gold text-white text-xs font-bold rounded-full">
                  {sector.badge}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${sector.color} flex items-center justify-center mb-4 shadow-lg mt-8`}>
                <sector.icon className="w-8 h-8 text-white" strokeWidth={2} />
              </div>

              {/* Title */}
              <h4 className="font-arabic font-bold text-xl text-gray-900 mb-1">
                {sector.ar}
              </h4>
              <h5 className="font-english font-medium text-sm text-gray-500 mb-3">
                {sector.name}
              </h5>

              {/* Description */}
              <p className="font-arabic text-sm text-gray-600 mb-4 leading-relaxed">
                {sector.description}
              </p>

              {/* Controls Count */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="font-arabic text-xs text-gray-600">عدد الضوابط:</span>
                  <span className="font-bold text-2xl" style={{ color: sector.bgColor }}>
                    {sector.controls.toLocaleString()}
                  </span>
                </div>
                <div className="font-english text-xs text-gray-400 mt-1">
                  Pre-loaded Controls
                </div>
              </div>

              {/* Frameworks */}
              <div className="space-y-2">
                <div className="font-arabic text-xs text-gray-700 font-semibold mb-2">
                  الأطر التنظيمية:
                </div>
                <div className="flex flex-wrap gap-1">
                  {sector.frameworks.map((fw, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-english font-medium text-gray-700"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comprehensive Coverage Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-5xl mx-auto"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Saudi Regulators */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-blue-600 mb-3">40+</div>
              <h4 className="font-arabic font-bold text-lg text-gray-900 mb-2">
                جهة سعودية
              </h4>
              <p className="font-arabic text-sm text-gray-700 leading-relaxed mb-2">
                تغطية كاملة لجميع الجهات التنظيمية في المملكة
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs font-arabic text-gray-700 font-semibold">NCA، SAMA، CMA، CITC</div>
                <div className="text-xs font-arabic text-gray-600">MOH، SDAIA، ECRA، SFDA</div>
                <div className="text-xs font-arabic text-gray-600">MOCI، GAZT، MOE، CBAHI</div>
                <div className="text-xs font-arabic text-gray-600">+30 جهة أخرى</div>
              </div>
            </div>

            {/* International Standards */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-purple-600 mb-3">15</div>
              <h4 className="font-arabic font-bold text-lg text-gray-900 mb-2">
                معيار دولي
              </h4>
              <p className="font-arabic text-sm text-gray-700 leading-relaxed mb-2">
                المعايير العالمية المعترف بها دولياً
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs font-english text-gray-700 font-semibold">ISO, NIST, PCI-DSS</div>
                <div className="text-xs font-english text-gray-600">GDPR, SOC 2, COBIT</div>
                <div className="text-xs font-english text-gray-600">HIPAA, CIS, CSA, AICPA</div>
              </div>
            </div>

            {/* Regional Regulators */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-amber-600 mb-3">45+</div>
              <h4 className="font-arabic font-bold text-lg text-gray-900 mb-2">
                جهة إقليمية
              </h4>
              <p className="font-arabic text-sm text-gray-700 leading-relaxed mb-2">
                منظمون من الولايات المتحدة، أوروبا، آسيا، الخليج
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs font-english text-gray-600">USA (20), EU (15), UK (10)</div>
                <div className="text-xs font-arabic text-gray-600">الإمارات، قطر، الكويت، البحرين</div>
                <div className="text-xs font-english text-gray-600">Australia, Singapore, Japan</div>
              </div>
            </div>

            {/* Total Controls */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-emerald-600 mb-3">3,200+</div>
              <h4 className="font-arabic font-bold text-lg text-gray-900 mb-2">
                ضابط جاهز
              </h4>
              <p className="font-arabic text-sm text-gray-700 leading-relaxed mb-2">
                1,070 سعودي + 2,130 دولي
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs font-arabic text-gray-700 font-semibold">117 إطار تنظيمي</div>
                <div className="text-xs font-arabic text-gray-600">50 سعودي + 67 دولي</div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="mt-6 bg-white border-2 border-brand-accent/30 rounded-2xl p-8">
            <h4 className="font-arabic font-bold text-2xl text-center text-gray-900 mb-6">
              التوزيع التفصيلي للتغطية
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-arabic font-bold text-lg text-brand-primary mb-3">الضوابط</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-arabic">
                    <span className="text-gray-600">ضوابط سعودية محلية:</span>
                    <span className="font-bold text-brand-accent">1,070</span>
                  </div>
                  <div className="flex justify-between font-arabic">
                    <span className="text-gray-600">ضوابط دولية وإقليمية:</span>
                    <span className="font-bold text-purple-600">2,130</span>
                  </div>
                  <div className="flex justify-between font-arabic border-t-2 border-gray-200 pt-2">
                    <span className="font-bold text-gray-900">المجموع:</span>
                    <span className="font-bold text-emerald-600 text-lg">3,200+</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-arabic font-bold text-lg text-brand-primary mb-3">الجهات التنظيمية</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-arabic">
                    <span className="text-gray-600">جهات سعودية:</span>
                    <span className="font-bold text-blue-600">40+</span>
                  </div>
                  <div className="flex justify-between font-arabic">
                    <span className="text-gray-600">معايير دولية:</span>
                    <span className="font-bold text-purple-600">15</span>
                  </div>
                  <div className="flex justify-between font-arabic">
                    <span className="text-gray-600">جهات إقليمية:</span>
                    <span className="font-bold text-amber-600">45+</span>
                  </div>
                  <div className="flex justify-between font-arabic border-t-2 border-gray-200 pt-2">
                    <span className="font-bold text-gray-900">المجموع:</span>
                    <span className="font-bold text-brand-accent text-lg">100+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TargetSectors

