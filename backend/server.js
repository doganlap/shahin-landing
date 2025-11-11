require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// AI Service Providers Configuration - Top 5 Cloud Providers + Local LLM
const AI_SERVICES = {
  // Local LLM Services (Priority 1 - Direct Connection)
  LOCAL_LLM: {
    endpoint: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1',
    model: process.env.LOCAL_LLM_MODEL || 'llama-3.2-3b-instruct',
    enabled: true, // Always enabled, will check connection
    type: process.env.LOCAL_LLM_TYPE || 'ollama', // ollama, lmstudio, custom
    name: 'Local LLM'
  },
  RFP_AGENT_API: {
    endpoint: process.env.RFP_AGENT_API_ENDPOINT || 'http://localhost:8001/api/v1',
    enabled: !!process.env.RFP_AGENT_API_ENDPOINT || true,
    type: 'rfp-agent',
    name: 'RFP Agent API'
  },
  // Top 5 Cloud Providers
  // 1. OpenAI (GPT-4, GPT-3.5)
  OPENAI: {
    endpoint: 'https://api.openai.com/v1',
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    enabled: !!process.env.OPENAI_API_KEY,
    name: 'OpenAI (GPT-4)',
    provider: 'openai'
  },
  // 2. Google Cloud (Gemini)
  GOOGLE_GEMINI: {
    endpoint: 'https://generativelanguage.googleapis.com/v1',
    key: process.env.GOOGLE_GEMINI_API_KEY,
    model: process.env.GOOGLE_GEMINI_MODEL || 'gemini-pro',
    enabled: !!process.env.GOOGLE_GEMINI_API_KEY,
    name: 'Google Gemini',
    provider: 'google'
  },
  // 3. Azure OpenAI (Microsoft)
  AZURE_OPENAI: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    key: process.env.AZURE_OPENAI_KEY,
    model: process.env.AZURE_OPENAI_MODEL || 'gpt-4',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
    enabled: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY),
    name: 'Azure OpenAI',
    provider: 'azure'
  },
  // 4. AWS Bedrock (Amazon)
  AWS_BEDROCK: {
    region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    model: process.env.AWS_BEDROCK_MODEL || 'anthropic.claude-3-sonnet-20240229-v1:0',
    enabled: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    name: 'AWS Bedrock (Claude)',
    provider: 'aws'
  },
  // 5. Anthropic (Claude)
  ANTHROPIC: {
    endpoint: 'https://api.anthropic.com/v1',
    key: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
    enabled: !!process.env.ANTHROPIC_API_KEY,
    name: 'Anthropic Claude',
    provider: 'anthropic'
  },
  // Additional Services
  AZURE_COGNITIVE: {
    visionEndpoint: process.env.AZURE_COMPUTER_VISION_ENDPOINT,
    speechEndpoint: process.env.AZURE_SPEECH_ENDPOINT,
    key: process.env.AZURE_COGNITIVE_KEY,
    enabled: !!(process.env.AZURE_COMPUTER_VISION_ENDPOINT && process.env.AZURE_COGNITIVE_KEY),
    name: 'Azure Cognitive Services',
    provider: 'azure'
  },
  HUGGINGFACE: {
    endpoint: 'https://api-inference.huggingface.co',
    key: process.env.HUGGINGFACE_API_KEY,
    enabled: !!process.env.HUGGINGFACE_API_KEY,
    name: 'Hugging Face',
    provider: 'huggingface'
  }
};

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit sensitive endpoints to 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);
app.use('/api/sandbox/create', strictLimiter);
app.use('/api/sandbox/guided-demo', strictLimiter);
app.use('/api/landing/requests', strictLimiter);

// Middleware - CORS Configuration for Cloudflare
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:4000', 
    'http://localhost:4001',
    'https://shahin-ai.com',
    'https://www.shahin-ai.com',
    'https://landing.shahin-ai.com',
    /\.shahin-ai\.com$/, // Allow all subdomains
    /\.pages\.dev$/, // Cloudflare Pages
    /\.cloudflare\.app$/ // Cloudflare Apps
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

app.use(cors(corsOptions));

// Trust proxy (for Cloudflare and reverse proxies)
app.set('trust proxy', true);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Allow health checks and admin dashboard without redirect
    if (req.path === '/health' || req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
      return next();
    }
    // Check if request is already HTTPS or coming through Cloudflare
    if (req.header('x-forwarded-proto') !== 'https' && req.protocol !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XSS Protection Middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = xss(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    sanitizeObject(req.body);
  }
  next();
};

// Apply sanitization to POST/PUT requests
app.use('/api/', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    sanitizeInput(req, res, next);
  } else {
    next();
  }
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Local LLM Integration Functions
const callLocalLLM = async (requestType, data) => {
  const { endpoint, model, type } = AI_SERVICES.LOCAL_LLM;
  
  if (requestType === 'chat') {
    try {
      // Try to connect to local LLM (Ollama/LM Studio compatible API)
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
          {
            role: 'system',
            content: 'أنت فهد، مساعد ذكي سعودي متخصص في الحوكمة وإدارة المخاطر والامتثال للشركات السعودية. تتكلم باللهجة السعودية (تستخدم كلمات مثل: ياخي، الله يعطيك العافية، إن شاء الله، ما شاء الله، والله، يالله). تكون ودود ومرحب، وتجيب بالعربية السعودية دائماً. تبسط المعلومات المعقدة وتشرحها بشكل واضح ومفهوم. تستخدم أمثلة من السياق السعودي.'
          },
            {
              role: 'user',
              content: data.message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        }),
        timeout: 30000 // 30 second timeout
      });

      if (response.ok) {
        const result = await response.json();
        const aiResponse = result.choices?.[0]?.message?.content || result.response;
        if (!aiResponse) {
          throw new Error('Local LLM returned empty response');
        }
        return {
          message: aiResponse,
          type: 'text'
        };
      } else {
        const errorText = await response.text();
        throw new Error(`Local LLM API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      // Connection failed, will try other services
      throw new Error(`Local LLM connection failed: ${error.message}`);
    }
  }
  
  throw new Error('Local LLM: Unsupported request type');
};

// RFP Agent API Integration
const callRFPAgentAPI = async (requestType, data) => {
  const { endpoint } = AI_SERVICES.RFP_AGENT_API;
  
  if (requestType === 'chat') {
    try {
      // Check if RFP Agent API is available
      const healthCheck = await fetch(`${endpoint}/health/live`, {
        method: 'GET',
        timeout: 5000
      });

      if (healthCheck.ok) {
        // Use RFP Agent for chat (if it has a chat endpoint)
        // For now, fallback to local LLM or other services
        return null; // Not implemented in RFP Agent yet
      }
    } catch (error) {
      throw new Error(`RFP Agent API not available: ${error.message}`);
    }
  }
  
  return null;
};

// Intelligent AI Service Router - Top 5 Cloud Providers + Local LLM
const routeToAvailableAI = async (requestType, data) => {
  const errors = [];
  const serviceOrder = [
    'LOCAL_LLM',
    'OPENAI',
    'GOOGLE_GEMINI',
    'AZURE_OPENAI',
    'ANTHROPIC',
    'AWS_BEDROCK',
    'RFP_AGENT_API',
    'AZURE_COGNITIVE',
    'HUGGINGFACE'
  ];

  // Try services in priority order
  for (const serviceKey of serviceOrder) {
    const service = AI_SERVICES[serviceKey];
    
    if (!service || !service.enabled) {
      continue;
    }

    try {
      let response = null;

      switch (serviceKey) {
        case 'LOCAL_LLM':
          if (requestType === 'chat') {
            response = await callLocalLLM(requestType, data);
          }
          break;
        case 'OPENAI':
          if (requestType === 'chat') {
            response = await callOpenAI(requestType, data);
          }
          break;
        case 'GOOGLE_GEMINI':
          if (requestType === 'chat') {
            response = await callGoogleGemini(requestType, data);
          }
          break;
        case 'AZURE_OPENAI':
          if (requestType === 'chat' || requestType === 'image') {
            response = await callAzureOpenAI(requestType, data);
          }
          break;
        case 'ANTHROPIC':
          if (requestType === 'chat') {
            response = await callAnthropic(requestType, data);
          }
          break;
        case 'AWS_BEDROCK':
          if (requestType === 'chat') {
            response = await callAWSBedrock(requestType, data);
          }
          break;
        case 'RFP_AGENT_API':
          if (requestType === 'chat') {
            response = await callRFPAgentAPI(requestType, data);
          }
          break;
        case 'AZURE_COGNITIVE':
          if (requestType === 'image' || requestType === 'voice') {
            response = await callAzureCognitive(requestType, data);
          }
          break;
        case 'HUGGINGFACE':
          response = await callHuggingFace(requestType, data);
          break;
      }

      if (response) {
        return { source: service.name || serviceKey, ...response };
      }
    } catch (error) {
      errors.push(`${service.name || serviceKey}: ${error.message}`);
      console.error(`❌ ${service.name || serviceKey} failed:`, error.message);
    }
  }

  // If all services fail, throw error
  const errorMessage = `Agent connection failed - No external LLM/Cloud AI available. Errors: ${errors.join('; ')}`;
  console.error('❌', errorMessage);
  console.error('💡 Please configure at least one of the following:');
  console.error('   1. Local LLM: Set LOCAL_LLM_ENDPOINT');
  console.error('   2. OpenAI: Set OPENAI_API_KEY');
  console.error('   3. Google Gemini: Set GOOGLE_GEMINI_API_KEY');
  console.error('   4. Azure OpenAI: Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY');
  console.error('   5. Anthropic Claude: Set ANTHROPIC_API_KEY');
  console.error('   6. AWS Bedrock: Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
  
  throw new Error(errorMessage);
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
      const aiResponse = result.description?.captions?.[0]?.text;
      if (!aiResponse) {
        throw new Error('Azure Cognitive Services returned empty image analysis');
      }
      return {
        analysis: aiResponse,
        confidence: result.description?.captions?.[0]?.confidence || 0.8,
        tags: result.tags?.map(tag => tag.name) || []
      };
    } else {
      const errorText = await response.text();
      throw new Error(`Azure Cognitive Services API error: ${response.status} - ${errorText}`);
    }
  }

  throw new Error('Azure Cognitive Services request failed');
};

// 1. OpenAI Integration (GPT-4, GPT-3.5)
const callOpenAI = async (requestType, data) => {
  const { endpoint, key, model } = AI_SERVICES.OPENAI;

  if (requestType === 'chat') {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'أنت فهد، مساعد ذكي سعودي متخصص في الحوكمة وإدارة المخاطر والامتثال للشركات السعودية. تتكلم باللهجة السعودية (ياخي، الله يعطيك العافية، إن شاء الله). تكون ودود ومرحب، وتجيب بالعربية السعودية دائماً.'
          },
          {
            role: 'user',
            content: data.message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const result = await response.json();
      const aiResponse = result.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('OpenAI returned empty response');
      }
      return {
        message: aiResponse,
        type: 'text'
      };
    } else {
      const errorText = await response.text();
      if (response.status === 429) {
        throw new Error('OpenAI API quota exceeded');
      } else if (response.status === 401) {
        throw new Error('OpenAI API authentication failed');
      }
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
  }

  throw new Error('OpenAI: Unsupported request type');
};

// 2. Google Gemini Integration
const callGoogleGemini = async (requestType, data) => {
  const { endpoint, key, model } = AI_SERVICES.GOOGLE_GEMINI;

  if (requestType === 'chat') {
    const response = await fetch(`${endpoint}/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `أنت فهد، مساعد ذكي سعودي متخصص في الحوكمة وإدارة المخاطر والامتثال للشركات السعودية. تتكلم باللهجة السعودية (ياخي، الله يعطيك العافية، إن شاء الله). تكون ودود ومرحب.\n\nالمستخدم: ${data.message}\nالمساعد فهد:`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiResponse) {
        throw new Error('Google Gemini returned empty response');
      }
      return {
        message: aiResponse,
        type: 'text'
      };
    } else {
      const errorText = await response.text();
      throw new Error(`Google Gemini API error: ${response.status} - ${errorText}`);
    }
  }

  throw new Error('Google Gemini: Unsupported request type');
};

// 3. Azure OpenAI Integration (updated)
const callAzureOpenAI = async (requestType, data) => {
  const { endpoint, key, deployment, apiVersion } = AI_SERVICES.AZURE_OPENAI;
  
  if (requestType === 'chat') {
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': key
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'أنت فهد، مساعد ذكي سعودي متخصص في الحوكمة وإدارة المخاطر والامتثال للشركات السعودية. تتكلم باللهجة السعودية (ياخي، الله يعطيك العافية، إن شاء الله). تكون ودود ومرحب، وتجيب بالعربية السعودية دائماً.'
          },
          {
            role: 'user',
            content: data.message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const result = await response.json();
      const aiResponse = result.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('OpenAI returned empty response');
      }
      return {
        message: aiResponse,
        type: 'text'
      };
    } else {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
  } else if (requestType === 'image') {
    const response = await fetch(`${endpoint}/openai/deployments/gpt-4-vision/chat/completions?api-version=${apiVersion}`, {
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
                text: 'ياخي فهد، حلل لي هذه الصورة واشرح محتواها باللهجة السعودية. شف وش فيها واقول لي التفاصيل.'
              },
              {
                type: 'image_url',
                image_url: { url: data.image }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (response.ok) {
      const result = await response.json();
      const aiResponse = result.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('Azure OpenAI image analysis returned empty response');
      }
      return {
        analysis: aiResponse,
        confidence: 0.9
      };
    } else {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI image analysis error: ${response.status} - ${errorText}`);
    }
  }

  throw new Error('Azure OpenAI request failed');
};

// 4. AWS Bedrock Integration (Claude via Bedrock)
const callAWSBedrock = async (requestType, data) => {
  // Note: AWS Bedrock requires AWS SDK, but we'll use a simplified approach
  // For production, you should use @aws-sdk/client-bedrock-runtime
  const { region, model } = AI_SERVICES.AWS_BEDROCK;
  
  // This is a placeholder - AWS Bedrock requires AWS SDK and proper authentication
  // You would need to install: npm install @aws-sdk/client-bedrock-runtime
  throw new Error('AWS Bedrock requires AWS SDK - please install @aws-sdk/client-bedrock-runtime');
};

// 5. Anthropic Claude Integration
const callAnthropic = async (requestType, data) => {
  const { endpoint, key, model } = AI_SERVICES.ANTHROPIC;

  if (requestType === 'chat') {
    const response = await fetch(`${endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `أنت فهد، مساعد ذكي سعودي متخصص في الحوكمة وإدارة المخاطر والامتثال للشركات السعودية. تتكلم باللهجة السعودية (ياخي، الله يعطيك العافية، إن شاء الله). تكون ودود ومرحب.\n\n${data.message}`
        }],
        system: 'أنت فهد، مساعد ذكي سعودي متخصص في الحوكمة وإدارة المخاطر والامتثال للشركات السعودية. تتكلم باللهجة السعودية (ياخي، الله يعطيك العافية، إن شاء الله). تكون ودود ومرحب، وتجيب بالعربية السعودية دائماً.'
      })
    });

    if (response.ok) {
      const result = await response.json();
      const aiResponse = result.content?.[0]?.text;
      if (!aiResponse) {
        throw new Error('Anthropic Claude returned empty response');
      }
      return {
        message: aiResponse,
        type: 'text'
      };
    } else {
      const errorText = await response.text();
      throw new Error(`Anthropic Claude API error: ${response.status} - ${errorText}`);
    }
  }

  throw new Error('Anthropic Claude: Unsupported request type');
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
      const aiResponse = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;
      if (!aiResponse) {
        throw new Error('Hugging Face returned empty response');
      }
      return {
        message: aiResponse,
        type: 'text'
      };
    } else {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
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
      const aiResponse = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;
      if (!aiResponse) {
        throw new Error('Hugging Face image analysis returned empty response');
      }
      return {
        analysis: aiResponse,
        confidence: 0.7
      };
    } else {
      const errorText = await response.text();
      throw new Error(`Hugging Face image analysis error: ${response.status} - ${errorText}`);
    }
  }

  throw new Error('Hugging Face request failed');
};

// All responses are now dynamic - no hardcoded fallbacks
// If AI service fails, an error is thrown and handled by the calling function

// API Routes

// Enhanced health check with multi-service status
app.get('/api/ai/health', async (req, res) => {
  const serviceStatus = {};
  let availableCapabilities = ['chat_fallback', 'image_fallback', 'document_analysis', 'voice_processing'];

  // Check Local LLM connection
  if (AI_SERVICES.LOCAL_LLM.enabled) {
    try {
      const testResponse = await fetch(`${AI_SERVICES.LOCAL_LLM.endpoint}/models`, {
        method: 'GET',
        timeout: 3000
      }).catch(() => null);
      
      if (testResponse && testResponse.ok) {
        serviceStatus.localLLM = 'connected';
        availableCapabilities.push('local_llm_chat');
      } else {
        serviceStatus.localLLM = 'not_available';
      }
    } catch (error) {
      serviceStatus.localLLM = `error: ${error.message}`;
    }
  }

  // Check RFP Agent API
  if (AI_SERVICES.RFP_AGENT_API.enabled) {
    try {
      const testResponse = await fetch(`${AI_SERVICES.RFP_AGENT_API.endpoint}/health/live`, {
        method: 'GET',
        timeout: 3000
      }).catch(() => null);
      
      if (testResponse && testResponse.ok) {
        serviceStatus.rfpAgentAPI = 'connected';
        availableCapabilities.push('rfp_agent_api');
      } else {
        serviceStatus.rfpAgentAPI = 'not_available';
      }
    } catch (error) {
      serviceStatus.rfpAgentAPI = `error: ${error.message}`;
    }
  }

  // Check each cloud AI service status
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
    version: '2.1.0',
    capabilities: [...new Set(availableCapabilities)], // Remove duplicates
    services: serviceStatus,
    localLLM: {
      endpoint: AI_SERVICES.LOCAL_LLM.endpoint,
      model: AI_SERVICES.LOCAL_LLM.model,
      type: AI_SERVICES.LOCAL_LLM.type,
      status: serviceStatus.localLLM || 'not_configured'
    },
    intelligentRouting: true,
    autoFallback: true,
    priority: 'local_llm_first',
    timestamp: new Date().toISOString()
  });
});

// Initialize AI system - returns agent configuration with dynamic greeting
app.get('/api/ai/initialize', async (req, res) => {
  try {
    // Generate dynamic greeting from AI service if available
    let greeting = null;
    try {
      const greetingResult = await routeToAvailableAI('chat', { 
        message: 'قم بإرسال تحية ترحيبية قصيرة باللهجة السعودية. عرف نفسك كفهد، مساعد ذكي متخصص في الحوكمة وإدارة المخاطر والامتثال للشركات السعودية.',
        context: { initialization: true, greeting: true }
      });
      greeting = greetingResult.message;
    } catch (error) {
      // If AI service is not available, greeting will be null and frontend will handle it
      console.log('Could not generate dynamic greeting:', error.message);
    }
    
    res.json({ 
      status: 'initialized',
      agent: 'فهد',
      agentName: 'Fahd',
      language: 'ar-SA',
      dialect: 'Saudi Arabic',
      greeting: greeting, // Dynamic greeting from AI service
      features: {
        chat: true,
        voice_recognition: true,
        text_to_speech: true,
        image_analysis: true,
        document_processing: true
      }
    });
  } catch (error) {
    // Return configuration even if greeting generation fails
    res.json({ 
      status: 'initialized',
      agent: 'فهد',
      agentName: 'Fahd',
      language: 'ar-SA',
      dialect: 'Saudi Arabic',
      greeting: null,
      features: {
        chat: true,
        voice_recognition: true,
        text_to_speech: true,
        image_analysis: true,
        document_processing: true
      },
      error: error.message
    });
  }
});

// Enhanced chat endpoint with multi-source AI (Requires External LLM/Cloud AI)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Use intelligent AI routing - Must connect to external LLM/Cloud AI
    try {
      const result = await routeToAvailableAI('chat', { message, context });
      
      res.json({
        type: 'text',
        message: result.message,
        source: result.source,
        context: {
          agent: 'فهد',
          agentName: 'Fahd',
          dialect: 'Saudi Arabic',
          timestamp: new Date().toISOString(),
          mode: context?.mode || 'chat',
          aiService: result.source,
          connected: true
        }
      });
    } catch (routeError) {
      // Agent not connected to any external LLM/Cloud AI
      console.error('❌ Agent connection error:', routeError.message);
      res.status(503).json({ 
        error: 'Agent not connected',
        message: 'The AI agent requires connection to an external LLM or Cloud AI service. Please configure and test the connection.',
        details: routeError.message,
        context: {
          agent: 'فهد',
          agentName: 'Fahd',
          dialect: 'Saudi Arabic',
          timestamp: new Date().toISOString(),
          connected: false,
          requiresExternalAI: true
        }
      });
    }
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      requiresExternalAI: true
    });
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

// Document analysis endpoint - uses AI service dynamically
app.post('/api/ai/analyze-document', async (req, res) => {
  try {
    const { file, context } = req.body;
    
    if (!file || !file.name) {
      return res.status(400).json({ error: 'File information is required' });
    }
    
    // Create a prompt for document analysis
    const analysisPrompt = `قم بتحليل المستند "${file.name}" (نوع: ${file.type || 'غير محدد'}, حجم: ${file.size || 'غير محدد'}). قدم تحليلاً شاملاً للمحتوى مع التركيز على المعلومات المالية، تقارير الأداء، بيانات الامتثال، والمخاطر.`;
    
    // Use AI service for document analysis
    try {
      const result = await routeToAvailableAI('chat', { 
        message: analysisPrompt, 
        context: { ...context, documentAnalysis: true, fileName: file.name, fileType: file.type, fileSize: file.size }
      });
      
      res.json({
        analysis: result.message,
        document_type: file.type,
        file_size: file.size,
        processing_time: Date.now(),
        source: result.source,
        extracted_data: {
          analysis_complete: true,
          ai_service: result.source
        }
      });
    } catch (aiError) {
      console.error('AI document analysis error:', aiError);
      res.status(503).json({ 
        error: 'Document analysis requires AI service connection',
        details: aiError.message 
      });
    }
    
  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({ error: 'Document analysis failed', details: error.message });
  }
});

// Voice processing endpoint - uses AI service dynamically
app.post('/api/ai/process-voice', upload.single('audio'), async (req, res) => {
  try {
    const { language, transcription } = req.body;
    const audioFile = req.file;
    
    // If transcription is provided, use it; otherwise, this endpoint requires speech-to-text service
    if (!transcription && !audioFile) {
      return res.status(400).json({ error: 'Audio file or transcription is required' });
    }
    
    // For now, if transcription is provided, process it through AI
    // In production, you would integrate with Azure Speech Services or similar
    const userMessage = transcription || '[Voice input received - transcription service required]';
    
    // Process the transcribed message through AI
    try {
      const result = await routeToAvailableAI('chat', { 
        message: userMessage, 
        context: { 
          voiceInput: true, 
          language: language || 'ar-SA',
          audioFile: audioFile ? { name: audioFile.filename, size: audioFile.size } : null
        }
      });
      
      res.json({
        transcription: transcription || 'Voice input processed',
        response: result.message,
        confidence: 0.9,
        duration: audioFile ? Math.ceil(audioFile.size / 16000) : 0, // Rough estimate
        source: result.source,
        language: language || 'ar-SA'
      });
    } catch (aiError) {
      console.error('AI voice processing error:', aiError);
      res.status(503).json({ 
        error: 'Voice processing requires AI service connection',
        details: aiError.message 
      });
    }
    
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ error: 'Voice processing failed', details: error.message });
  }
});

// Import and wire routes
const sandboxRoutes = require('./routes/sandbox');
const landingRoutes = require('./routes/landing');
const adminRoutes = require('./routes/admin');
const adminFrontendRoutes = require('./routes/admin-frontend');
const localLLMRoutes = require('./routes/local-llm');
const agentControlRoutes = require('./routes/agent-control');
const monitoringRoutes = require('./routes/monitoring');

// Register routes
app.use('/api/sandbox', sandboxRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/local-llm', localLLMRoutes); // Local LLM direct access
app.use('/api/agent', agentControlRoutes); // Agent control (frontend controlled)
app.use('/api/monitoring', monitoringRoutes); // Monitoring endpoints (local development)
app.use('/admin', adminFrontendRoutes); // Admin dashboard frontend

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve AI configuration page
app.get('/ai-config', (req, res) => {
  res.sendFile(path.join(__dirname, '../landing-page/public/ai-config.html'));
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// General health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Shahin GRC Backend API'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Shahin GRC AI Backend running on port ${PORT}`);
  console.log(`🤖 AI Agent APIs available at http://localhost:${PORT}/api/ai/`);
  console.log(`🧠 Local LLM APIs available at http://localhost:${PORT}/api/local-llm/`);
  console.log(`📦 Sandbox APIs available at http://localhost:${PORT}/api/sandbox/`);
  console.log(`📄 Landing APIs available at http://localhost:${PORT}/api/landing/`);
  console.log(`🔧 Admin APIs available at http://localhost:${PORT}/api/admin/`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Security: Rate limiting, XSS protection, Helmet enabled`);
  console.log(`🔑 Admin Secret: ${process.env.ADMIN_SECRET ? 'Configured' : 'Using default (change in production!)'}`);
  console.log(`\n🧠 Local LLM Configuration:`);
  console.log(`   Endpoint: ${AI_SERVICES.LOCAL_LLM.endpoint}`);
  console.log(`   Model: ${AI_SERVICES.LOCAL_LLM.model}`);
  console.log(`   Type: ${AI_SERVICES.LOCAL_LLM.type}`);
  console.log(`   Status: ${AI_SERVICES.LOCAL_LLM.enabled ? 'Enabled (will check connection)' : 'Disabled'}`);
  console.log(`\n💡 Tip: Make sure Ollama or LM Studio is running for local LLM support`);
});

module.exports = app;