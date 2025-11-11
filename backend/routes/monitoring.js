const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Monitoring endpoints for local development
// These endpoints don't require authentication for easy local monitoring

/**
 * GET /api/monitoring/status
 * Get system and API status (public endpoint for local monitoring)
 */
router.get('/status', async (req, res) => {
  try {
    const os = require('os');
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // Check API keys status
    const apiStatus = {
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        keyPreview: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'Not configured',
        valid: false,
        lastChecked: null
      },
      googleGemini: {
        configured: !!process.env.GOOGLE_GEMINI_API_KEY,
        keyPreview: process.env.GOOGLE_GEMINI_API_KEY ? `${process.env.GOOGLE_GEMINI_API_KEY.substring(0, 10)}...` : 'Not configured',
        valid: false,
        lastChecked: null
      },
      azureOpenAI: {
        configured: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY),
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'Not configured',
        valid: false,
        lastChecked: null
      },
      anthropic: {
        configured: !!process.env.ANTHROPIC_API_KEY,
        keyPreview: process.env.ANTHROPIC_API_KEY ? `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...` : 'Not configured',
        valid: false,
        lastChecked: null
      },
      localLLM: {
        configured: !!process.env.LOCAL_LLM_ENDPOINT,
        endpoint: process.env.LOCAL_LLM_ENDPOINT || 'Not configured',
        valid: false,
        lastChecked: null
      }
    };

    // Quick test of API keys (non-blocking)
    const testPromises = [];

    if (apiStatus.openai.configured) {
      testPromises.push(
        fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
          timeout: 3000
        })
        .then(response => {
          apiStatus.openai.valid = response.ok;
          apiStatus.openai.lastChecked = new Date().toISOString();
        })
        .catch(() => {
          apiStatus.openai.valid = false;
          apiStatus.openai.lastChecked = new Date().toISOString();
        })
      );
    }

    if (apiStatus.googleGemini.configured) {
      testPromises.push(
        fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`, {
          timeout: 3000
        })
        .then(response => {
          apiStatus.googleGemini.valid = response.ok;
          apiStatus.googleGemini.lastChecked = new Date().toISOString();
        })
        .catch(() => {
          apiStatus.googleGemini.valid = false;
          apiStatus.googleGemini.lastChecked = new Date().toISOString();
        })
      );
    }

    if (apiStatus.localLLM.configured) {
      testPromises.push(
        fetch(`${process.env.LOCAL_LLM_ENDPOINT}/models`, {
          timeout: 2000
        })
        .then(response => {
          apiStatus.localLLM.valid = response.ok;
          apiStatus.localLLM.lastChecked = new Date().toISOString();
        })
        .catch(() => {
          apiStatus.localLLM.valid = false;
          apiStatus.localLLM.lastChecked = new Date().toISOString();
        })
      );
    }

    // Wait for all tests to complete (with timeout)
    await Promise.race([
      Promise.all(testPromises),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: {
          total: Math.round(totalMemory / 1024 / 1024) + ' MB',
          used: Math.round(usedMemory / 1024 / 1024) + ' MB',
          free: Math.round(freeMemory / 1024 / 1024) + ' MB',
          usagePercent: Math.round((usedMemory / totalMemory) * 100)
        },
        cpu: os.cpus().length,
        platform: os.platform(),
        nodeVersion: process.version
      },
      apiKeys: apiStatus,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3001
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/health
 * Simple health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

