require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch'); // Add this dependency
const app = express();
const PORT = process.env.PORT || 3001;

// AI Service Providers Configuration
const AI_SERVICES = {
  AZURE_OPENAI: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    key: process.env.AZURE_OPENAI_KEY,
    enabled: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY)
  },
  AZURE_COGNITIVE: {
    visionEndpoint: process.env.AZURE_COMPUTER_VISION_ENDPOINT,
    speechEndpoint: process.env.AZURE_SPEECH_ENDPOINT,
    key: process.env.AZURE_COGNITIVE_KEY,
    enabled: !!(process.env.AZURE_COMPUTER_VISION_ENDPOINT && process.env.AZURE_COGNITIVE_KEY)
  },
  OPENAI_PUBLIC: {
    endpoint: 'https://api.openai.com/v1',
    key: process.env.OPENAI_API_KEY,
    enabled: !!process.env.OPENAI_API_KEY
  },
  HUGGINGFACE: {
    endpoint: 'https://api-inference.huggingface.co',
    key: process.env.HUGGINGFACE_API_KEY,
    enabled: !!process.env.HUGGINGFACE_API_KEY
  }
};

// Middleware - CORS Configuration for Production
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:4000', 
    'http://localhost:4001',
    'https://shahin-ai.com',
    'https://www.shahin-ai.com',
    'https://landing.shahin-ai.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
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

// Intelligent AI Service Router
const routeToAvailableAI = async (requestType, data) => {
  const errors = [];

  // Try Azure OpenAI first for chat and image tasks
  if ((requestType === 'chat' || requestType === 'image') && AI_SERVICES.AZURE_OPENAI.enabled) {
    try {
      const response = await callAzureOpenAI(requestType, data);
      if (response) return { source: 'Azure OpenAI', ...response };
    } catch (error) {
      errors.push(`Azure OpenAI: ${error.message}`);
    }
  }

  // Try Azure Cognitive Services for image and speech
  if ((requestType === 'image' || requestType === 'voice') && AI_SERVICES.AZURE_COGNITIVE.enabled) {
    try {
      const response = await callAzureCognitive(requestType, data);
      if (response) return { source: 'Azure Cognitive Services', ...response };
    } catch (error) {
      errors.push(`Azure Cognitive: ${error.message}`);
    }
  }

  // Try OpenAI Public API
  if ((requestType === 'chat' || requestType === 'image') && AI_SERVICES.OPENAI_PUBLIC.enabled) {
    try {
      const response = await callOpenAIPublic(requestType, data);
      if (response) return { source: 'OpenAI API', ...response };
    } catch (error) {
      errors.push(`OpenAI Public: ${error.message}`);
    }
  }

  // Try Hugging Face as fallback
  if (AI_SERVICES.HUGGINGFACE.enabled) {
    try {
      const response = await callHuggingFace(requestType, data);
      if (response) return { source: 'Hugging Face', ...response };
    } catch (error) {
      errors.push(`Hugging Face: ${error.message}`);
    }
  }

  // If all fail, return local fallback
  console.log('Using local fallback - Service errors:', errors.join('; '));
  return { source: 'Local Fallback (Smart Routing)', ...generateLocalResponse(requestType, data) };
};

// Azure OpenAI Integration
const callAzureOpenAI = async (requestType, data) => {
  const { endpoint, key } = AI_SERVICES.AZURE_OPENAI;
  
  if (requestType === 'chat') {
    const response = await fetch(`${endpoint}/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': key
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ذكي متخصص في الحوكمة وإدارة المخاطر والامتثال للشركات السعودية. تجيب بالعربية دائماً.'
          },
          {
            role: 'user',
            content: data.message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        message: result.choices?.[0]?.message?.content || 'تم الرد بنجاح',
        type: 'text'
      };
    }
  } else if (requestType === 'image') {
    const response = await fetch(`${endpoint}/openai/deployments/gpt-4-vision/chat/completions?api-version=2024-02-15-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': key
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'حلل هذه الصورة واشرح محتواها بالعربية، مع التركيز على أي معلومات متعلقة بالأعمال أو الحوكمة.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: data.image
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        analysis: result.choices?.[0]?.message?.content || 'تم تحليل الصورة بنجاح',
        confidence: 0.9
      };
    }
  }

  throw new Error('Azure OpenAI request failed');
};

// Azure Cognitive Services Integration
const callAzureCognitive = async (requestType, data) => {
  if (requestType === 'image') {
    const { visionEndpoint, key } = AI_SERVICES.AZURE_COGNITIVE;
    
    const response = await fetch(`${visionEndpoint}/vision/v3.2/analyze?visualFeatures=Description,Tags,Objects&language=ar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': key
      },
      body: JSON.stringify({
        url: data.image.startsWith('http') ? data.image : null
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        analysis: result.description?.captions?.[0]?.text || 'تم تحليل الصورة بنجاح',
        confidence: result.description?.captions?.[0]?.confidence || 0.8,
        tags: result.tags?.map(tag => tag.name) || []
      };
    }
  }

  throw new Error('Azure Cognitive Services request failed');
};

// OpenAI Public API Integration
const callOpenAIPublic = async (requestType, data) => {
  const { endpoint, key } = AI_SERVICES.OPENAI_PUBLIC;

  if (requestType === 'chat') {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant specializing in governance, risk management, and compliance for Saudi companies. Always respond in Arabic.'
          },
          {
            role: 'user',
            content: data.message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        message: result.choices?.[0]?.message?.content || 'تم الرد بنجاح',
        type: 'text'
      };
    } else {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('OpenAI API quota exceeded - please check billing');
      } else if (response.status === 401) {
        throw new Error('OpenAI API authentication failed - invalid key');
      } else {
        throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
      }
    }
  }

  throw new Error('OpenAI Public API request failed - unsupported request type');
};

// Hugging Face Integration
const callHuggingFace = async (requestType, data) => {
  const { endpoint, key } = AI_SERVICES.HUGGINGFACE;

  if (requestType === 'chat') {
    const response = await fetch(`${endpoint}/models/microsoft/DialoGPT-large`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        inputs: data.message
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        message: Array.isArray(result) ? result[0]?.generated_text : 'تم الرد بنجاح',
        type: 'text'
      };
    }
  } else if (requestType === 'image') {
    const response = await fetch(`${endpoint}/models/Salesforce/blip-image-captioning-large`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        inputs: data.image
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        analysis: Array.isArray(result) ? result[0]?.generated_text : 'تم تحليل الصورة',
        confidence: 0.7
      };
    }
  }

  throw new Error('Hugging Face request failed');
};

// Local fallback responses
const generateLocalResponse = (requestType, data) => {
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

  if (data.message) {
    const message = data.message.toLowerCase();
    if (message.includes('سعر') || message.includes('تكلفة') || message.includes('باقة')) {
      return { message: getRandomResponse('pricing') };
    } else if (message.includes('امتثال') || message.includes('قانون') || message.includes('نظام')) {
      return { message: getRandomResponse('compliance') };
    } else if (message.includes('تحليل') || message.includes('تقرير') || message.includes('بيانات')) {
      return { message: getRandomResponse('analysis') };
    }
  }

  return { 
    message: getRandomResponse('general'),
    note: 'Using local fallback - OpenAI quota may be exceeded'
  };
};

// API Routes

// Enhanced health check with multi-service status
app.get('/api/ai/health', (req, res) => {
  const serviceStatus = {};
  let availableCapabilities = ['chat_fallback', 'image_fallback', 'document_analysis', 'voice_processing'];

  // Check each AI service status
  if (AI_SERVICES.AZURE_OPENAI.enabled) {
    serviceStatus.azureOpenAI = 'configured';
    availableCapabilities.push('azure_chat', 'azure_vision');
  }

  if (AI_SERVICES.AZURE_COGNITIVE.enabled) {
    serviceStatus.azureCognitive = 'configured';
    availableCapabilities.push('azure_vision', 'azure_speech');
  }

  if (AI_SERVICES.OPENAI_PUBLIC.enabled) {
    serviceStatus.openAIPublic = 'configured_quota_check_needed';
    availableCapabilities.push('openai_chat', 'openai_vision');
  }

  if (AI_SERVICES.HUGGINGFACE.enabled) {
    serviceStatus.huggingFace = 'configured';
    availableCapabilities.push('hf_chat', 'hf_vision');
  }

  res.json({ 
    status: 'active', 
    service: 'Shahin GRC Multi-Modal AI Assistant',
    version: '2.0.0',
    capabilities: [...new Set(availableCapabilities)], // Remove duplicates
    services: serviceStatus,
    intelligentRouting: true,
    autoFallback: true,
    timestamp: new Date().toISOString()
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

// Enhanced chat endpoint with multi-source AI
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Use intelligent AI routing
    const result = await routeToAvailableAI('chat', { message, context });
    
    res.json({
      type: 'text',
      message: result.message,
      source: result.source,
      context: {
        agent: 'ARIA',
        timestamp: new Date().toISOString(),
        mode: context?.mode || 'chat',
        aiService: result.source
      }
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Enhanced image analysis endpoint with multi-source AI
app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { image, context } = req.body;
    
    // Use intelligent AI routing for image analysis
    const result = await routeToAvailableAI('image', { image, context });
    
    res.json({
      analysis: result.analysis || result.message,
      confidence: result.confidence || 0.85,
      source: result.source,
      detected_elements: result.tags || ['text', 'document', 'content'],
      language_detected: ['ar', 'en'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ 
      error: 'Image analysis failed', 
      details: error.message,
      fallback: true
    });
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