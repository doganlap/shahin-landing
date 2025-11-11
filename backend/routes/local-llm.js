const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Local LLM Management Routes
const LOCAL_LLM_ENDPOINT = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1';
const LOCAL_LLM_MODEL = process.env.LOCAL_LLM_MODEL || 'llama-3.2-3b-instruct';

/**
 * GET /api/local-llm/models
 * List available local LLM models
 */
router.get('/models', async (req, res) => {
  try {
    const response = await fetch(`${LOCAL_LLM_ENDPOINT}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        models: data.data || data.models || [],
        endpoint: LOCAL_LLM_ENDPOINT,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(response.status).json({
        success: false,
        error: 'Failed to fetch models',
        status: response.status
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: LOCAL_LLM_ENDPOINT,
      message: 'Local LLM server not available. Make sure Ollama or LM Studio is running.'
    });
  }
});

/**
 * POST /api/local-llm/chat
 * Direct chat with local LLM
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, model, temperature = 0.7, max_tokens = 1000 } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetch(`${LOCAL_LLM_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || LOCAL_LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ذكي متخصص في الحوكمة وإدارة المخاطر والامتثال للشركات السعودية. تجيب بالعربية دائماً.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: temperature,
        max_tokens: max_tokens,
        stream: false
      }),
      timeout: 60000 // 60 second timeout for local LLM
    });

    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        message: data.choices?.[0]?.message?.content || data.response || 'No response',
        model: data.model || model || LOCAL_LLM_MODEL,
        usage: data.usage,
        source: 'Local LLM',
        timestamp: new Date().toISOString()
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        success: false,
        error: errorText,
        status: response.status
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Local LLM server not available. Make sure Ollama or LM Studio is running on ' + LOCAL_LLM_ENDPOINT
    });
  }
});

/**
 * GET /api/local-llm/health
 * Check local LLM server health
 */
router.get('/health', async (req, res) => {
  try {
    // Try to get models list as health check
    const response = await fetch(`${LOCAL_LLM_ENDPOINT}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000
    });

    if (response.ok) {
      res.json({
        status: 'healthy',
        endpoint: LOCAL_LLM_ENDPOINT,
        model: LOCAL_LLM_MODEL,
        available: true,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(response.status).json({
        status: 'unhealthy',
        endpoint: LOCAL_LLM_ENDPOINT,
        available: false,
        error: `HTTP ${response.status}`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      endpoint: LOCAL_LLM_ENDPOINT,
      available: false,
      error: error.message,
      message: 'Local LLM server not running. Start Ollama or LM Studio.',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/local-llm/generate
 * Generate text with local LLM
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, model, temperature = 0.7, max_tokens = 1000 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await fetch(`${LOCAL_LLM_ENDPOINT}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || LOCAL_LLM_MODEL,
        prompt: prompt,
        temperature: temperature,
        max_tokens: max_tokens,
        stream: false
      }),
      timeout: 60000
    });

    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        text: data.choices?.[0]?.text || data.response || 'No response',
        model: data.model || model || LOCAL_LLM_MODEL,
        usage: data.usage,
        source: 'Local LLM',
        timestamp: new Date().toISOString()
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        success: false,
        error: errorText,
        status: response.status
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Local LLM server not available'
    });
  }
});

module.exports = router;

