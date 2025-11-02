const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Mock AI responses in Arabic
const generateAIResponse = (context) => {
  const responses = {
    general: [
      'مرحباً بك في شاهين للحوكمة! كيف يمكنني مساعدتك اليوم؟',
      'أنا هنا لمساعدتك في إدارة المخاطر والامتثال. ما الذي تحتاج إليه؟',
      'يسعدني أن أساعدك في حلول الذكاء الاصطناعي للحوكمة.',
    ],
    analysis: [
      'بناءً على التحليل، يمكنني أن أساعدك في تقييم المخاطر وتحسين الامتثال.',
      'تم تحليل البيانات بنجاح. النتائج تشير إلى فرص تحسين في عمليات الحوكمة.',
    ],
    pricing: [
      'نقدم باقات مرنة تبدأ من 500 ريال شهرياً للشركات الصغيرة وحتى الحلول المؤسسية.',
      'يمكنك الحصول على تجربة مجانية لمدة 30 يوماً لتقييم منصتنا.',
    ],
    compliance: [
      'نساعدك في الامتثال لمعايير الحوكمة السعودية ومتطلبات هيئة السوق المالية.',
      'منصتنا تدعم جميع الأطر التنظيمية المحلية والدولية.',
    ]
  };

  const getRandomResponse = (category) => {
    const categoryResponses = responses[category] || responses.general;
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  if (context.message) {
    const message = context.message.toLowerCase();
    if (message.includes('سعر') || message.includes('تكلفة') || message.includes('باقة')) {
      return getRandomResponse('pricing');
    } else if (message.includes('امتثال') || message.includes('قانون') || message.includes('نظام')) {
      return getRandomResponse('compliance');
    } else if (message.includes('تحليل') || message.includes('تقرير') || message.includes('بيانات')) {
      return getRandomResponse('analysis');
    }
  }

  return getRandomResponse('general');
};

// API Routes

// Health check
app.get('/api/ai/health', (req, res) => {
  res.json({ 
    status: 'active', 
    service: 'Shahin GRC AI Assistant',
    version: '1.0.0',
    capabilities: ['chat', 'image_analysis', 'document_analysis', 'voice_processing']
  });
});

// Initialize AI system
app.get('/api/ai/initialize', (req, res) => {
  res.json({ 
    status: 'initialized',
    agent: 'ARIA',
    language: 'ar-SA',
    features: {
      chat: true,
      voice_recognition: true,
      text_to_speech: true,
      image_analysis: true,
      document_processing: true
    }
  });
});

// Chat endpoint
app.post('/api/ai/chat', (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Simulate processing delay
    setTimeout(() => {
      const response = generateAIResponse({ message, ...context });
      
      res.json({
        type: 'text',
        message: response,
        context: {
          agent: 'ARIA',
          timestamp: new Date().toISOString(),
          mode: context?.mode || 'chat'
        }
      });
    }, 500 + Math.random() * 1500); // Random delay between 500-2000ms
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Image analysis endpoint
app.post('/api/ai/analyze-image', (req, res) => {
  try {
    const { image, context } = req.body;
    
    // Simulate image analysis
    setTimeout(() => {
      const analysisResults = [
        'تمكنت من تحليل الصورة بنجاح. يمكنني رؤية مستند أو نموذج يحتوي على معلومات مهمة.',
        'الصورة تحتوي على نص عربي وإنجليزي. يمكنني مساعدتك في فهم المحتوى وتحليله.',
        'تم اكتشاف جداول وبيانات في الصورة. يمكنني مساعدتك في تنظيم هذه المعلومات.',
        'الصورة تظهر مخططات أو رسوم بيانية. يمكنني تحليل الاتجاهات والأنماط.',
        'تحتوي الصورة على معلومات مالية أو تقارير. يمكنني مساعدتك في تقييم المخاطر.'
      ];
      
      const analysis = analysisResults[Math.floor(Math.random() * analysisResults.length)];
      
      res.json({
        analysis: analysis,
        confidence: 0.85 + Math.random() * 0.14, // Random confidence between 85-99%
        detected_elements: ['text', 'tables', 'numbers', 'logos'],
        language_detected: ['ar', 'en']
      });
    }, 1000 + Math.random() * 2000);
    
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

// Document analysis endpoint
app.post('/api/ai/analyze-document', (req, res) => {
  try {
    const { file, context } = req.body;
    
    // Simulate document analysis
    setTimeout(() => {
      const documentAnalysis = [
        `تم تحليل المستند "${file.name}" بنجاح. يحتوي على معلومات مالية وتقارير أداء يمكنني مساعدتك في تحليلها.`,
        `المستند يتضمن بيانات مهمة حول الامتثال والمخاطر. يمكنني إستخراج النقاط الرئيسية وتقديم توصيات.`,
        `تحليل المستند يظهر مؤشرات أداء ومقاييس مالية. يمكنني مساعدتك في تقييم الوضع الحالي.`,
        `المستند يحتوي على سياسات وإجراءات. يمكنني مراجعتها وتقديم اقتراحات للتحسين.`
      ];
      
      const analysis = documentAnalysis[Math.floor(Math.random() * documentAnalysis.length)];
      
      res.json({
        analysis: analysis,
        document_type: file.type,
        file_size: file.size,
        processing_time: Math.round(1000 + Math.random() * 3000),
        extracted_data: {
          pages: Math.ceil(Math.random() * 10),
          words: Math.ceil(Math.random() * 5000),
          tables: Math.ceil(Math.random() * 5),
          images: Math.ceil(Math.random() * 3)
        }
      });
    }, 1500 + Math.random() * 2500);
    
  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({ error: 'Document analysis failed' });
  }
});

// Voice processing endpoint
app.post('/api/ai/process-voice', upload.single('audio'), (req, res) => {
  try {
    const { language } = req.body;
    const audioFile = req.file;
    
    // Simulate voice processing
    setTimeout(() => {
      const voiceResponses = [
        {
          transcription: 'مرحباً، أريد معرفة المزيد عن خدماتكم',
          response: 'أهلاً وسهلاً! يسعدني أن أخبرك عن خدمات شاهين للحوكمة. نحن نقدم حلول الذكاء الاصطناعي لإدارة المخاطر والامتثال.'
        },
        {
          transcription: 'كيف يمكنني الحصول على تجربة مجانية؟',
          response: 'يمكنك الحصول على تجربة مجانية لمدة 30 يوماً. سأساعدك في إعداد الحساب والبدء فوراً.'
        },
        {
          transcription: 'أحتاج مساعدة في تحليل المخاطر',
          response: 'بالطبع! يمكنني مساعدتك في تحليل وتقييم المخاطر باستخدام أحدث تقنيات الذكاء الاصطناعي.'
        }
      ];
      
      const randomResponse = voiceResponses[Math.floor(Math.random() * voiceResponses.length)];
      
      res.json({
        transcription: randomResponse.transcription,
        response: randomResponse.response,
        confidence: 0.88 + Math.random() * 0.11,
        duration: Math.random() * 10 + 2 // 2-12 seconds
      });
    }, 800 + Math.random() * 1200);
    
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ error: 'Voice processing failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Shahin GRC AI Backend running on port ${PORT}`);
  console.log(`🤖 AI Agent APIs available at http://localhost:${PORT}/api/ai/`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/ai/health`);
});

module.exports = app;