const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Agent Control Routes - Frontend controlled agent connection
const AI_SERVICES = {
  LOCAL_LLM: {
    endpoint: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1',
    model: process.env.LOCAL_LLM_MODEL || 'llama-3.2-3b-instruct',
    enabled: true
  },
  AZURE_OPENAI: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    key: process.env.AZURE_OPENAI_KEY,
    enabled: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY)
  },
  OPENAI_PUBLIC: {
    endpoint: 'https://api.openai.com/v1',
    key: process.env.OPENAI_API_KEY,
    enabled: !!process.env.OPENAI_API_KEY
  }
};

// Agent connection status
let agentStatus = {
  connected: false,
  activeService: null,
  lastCheck: null,
  services: {}
};

// Test all AI services and return available ones
const testAIServices = async () => {
  const availableServices = [];
  const serviceStatus = {};

  // Test Local LLM
  if (AI_SERVICES.LOCAL_LLM.enabled) {
    try {
      const response = await fetch(`${AI_SERVICES.LOCAL_LLM.endpoint}/models`, {
        method: 'GET',
        timeout: 3000
      }).catch(() => null);

      if (response && response.ok) {
        availableServices.push({
          id: 'local-llm',
          name: 'Local LLM',
          endpoint: AI_SERVICES.LOCAL_LLM.endpoint,
          model: AI_SERVICES.LOCAL_LLM.model,
          type: 'local',
          status: 'available'
        });
        serviceStatus.localLLM = 'available';
      } else {
        serviceStatus.localLLM = 'unavailable';
      }
    } catch (error) {
      serviceStatus.localLLM = 'error';
    }
  }

  // Test Azure OpenAI
  if (AI_SERVICES.AZURE_OPENAI.enabled) {
    try {
      const response = await fetch(`${AI_SERVICES.AZURE_OPENAI.endpoint}/openai/deployments`, {
        method: 'GET',
        headers: {
          'api-key': AI_SERVICES.AZURE_OPENAI.key
        },
        timeout: 5000
      }).catch(() => null);

      if (response && response.ok) {
        availableServices.push({
          id: 'azure-openai',
          name: 'Azure OpenAI',
          endpoint: AI_SERVICES.AZURE_OPENAI.endpoint,
          type: 'cloud',
          status: 'available'
        });
        serviceStatus.azureOpenAI = 'available';
      } else {
        serviceStatus.azureOpenAI = 'unavailable';
      }
    } catch (error) {
      serviceStatus.azureOpenAI = 'error';
    }
  }

  // Test OpenAI Public
  if (AI_SERVICES.OPENAI_PUBLIC.enabled) {
    try {
      const response = await fetch(`${AI_SERVICES.OPENAI_PUBLIC.endpoint}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AI_SERVICES.OPENAI_PUBLIC.key}`
        },
        timeout: 5000
      }).catch(() => null);

      if (response && response.ok) {
        availableServices.push({
          id: 'openai-public',
          name: 'OpenAI Public',
          endpoint: AI_SERVICES.OPENAI_PUBLIC.endpoint,
          type: 'cloud',
          status: 'available'
        });
        serviceStatus.openAIPublic = 'available';
      } else {
        serviceStatus.openAIPublic = 'unavailable';
      }
    } catch (error) {
      serviceStatus.openAIPublic = 'error';
    }
  }

  // Update agent status
  agentStatus = {
    connected: availableServices.length > 0,
    activeService: availableServices.length > 0 ? availableServices[0].id : null,
    lastCheck: new Date().toISOString(),
    services: serviceStatus,
    availableServices: availableServices
  };

  return {
    connected: agentStatus.connected,
    availableServices: availableServices,
    serviceStatus: serviceStatus,
    timestamp: agentStatus.lastCheck
  };
};

/**
 * GET /api/agent/status
 * Get agent connection status and available services
 */
router.get('/status', async (req, res) => {
  try {
    const status = await testAIServices();
    res.json({
      success: true,
      agent: {
        connected: status.connected,
        active: status.connected,
        availableServices: status.availableServices,
        serviceStatus: status.serviceStatus,
        lastCheck: status.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      agent: {
        connected: false,
        active: false
      }
    });
  }
});

/**
 * POST /api/agent/connect
 * Connect agent to AI service (frontend controlled)
 */
router.post('/connect', async (req, res) => {
  try {
    const { serviceId } = req.body;
    
    // Test all services first
    const status = await testAIServices();
    
    if (!status.connected) {
      return res.status(503).json({
        success: false,
        error: 'No AI services available',
        message: 'Please check your AI service configuration. Local LLM, Azure OpenAI, or OpenAI API must be available.'
      });
    }

    // If serviceId provided, try to use it
    let selectedService = status.availableServices[0]; // Default to first available
    if (serviceId) {
      const foundService = status.availableServices.find(s => s.id === serviceId);
      if (foundService) {
        selectedService = foundService;
      }
    }

    agentStatus.activeService = selectedService.id;
    agentStatus.connected = true;

    res.json({
      success: true,
      message: 'Agent connected successfully',
      agent: {
        connected: true,
        active: true,
        activeService: selectedService.id,
        service: selectedService,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      agent: {
        connected: false,
        active: false
      }
    });
  }
});

/**
 * POST /api/agent/disconnect
 * Disconnect agent (frontend controlled)
 */
router.post('/disconnect', (req, res) => {
  agentStatus.connected = false;
  agentStatus.activeService = null;

  res.json({
    success: true,
    message: 'Agent disconnected',
    agent: {
      connected: false,
      active: false,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * POST /api/agent/switch-service
 * Switch to different AI service (frontend controlled)
 */
router.post('/switch-service', async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        error: 'serviceId is required'
      });
    }

    const status = await testAIServices();
    const service = status.availableServices.find(s => s.id === serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not available',
        availableServices: status.availableServices.map(s => s.id)
      });
    }

    agentStatus.activeService = serviceId;
    agentStatus.connected = true;

    res.json({
      success: true,
      message: `Switched to ${service.name}`,
      agent: {
        connected: true,
        active: true,
        activeService: serviceId,
        service: service,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/test
 * Test agent connection before deployment
 */
router.get('/test', async (req, res) => {
  try {
    const testResults = {
      localLLM: { available: false, error: null },
      azureOpenAI: { available: false, error: null },
      openAIPublic: { available: false, error: null },
      overall: { connected: false, message: '' }
    };

    // Test Local LLM
    if (AI_SERVICES.LOCAL_LLM.enabled) {
      try {
        const response = await fetch(`${AI_SERVICES.LOCAL_LLM.endpoint}/models`, {
          method: 'GET',
          timeout: 3000
        });
        testResults.localLLM.available = response.ok;
      } catch (error) {
        testResults.localLLM.error = error.message;
      }
    }

    // Test Azure OpenAI
    if (AI_SERVICES.AZURE_OPENAI.enabled) {
      try {
        const response = await fetch(`${AI_SERVICES.AZURE_OPENAI.endpoint}/openai/deployments`, {
          method: 'GET',
          headers: {
            'api-key': AI_SERVICES.AZURE_OPENAI.key
          },
          timeout: 5000
        });
        testResults.azureOpenAI.available = response.ok;
      } catch (error) {
        testResults.azureOpenAI.error = error.message;
      }
    }

    // Test OpenAI Public
    if (AI_SERVICES.OPENAI_PUBLIC.enabled) {
      try {
        const response = await fetch(`${AI_SERVICES.OPENAI_PUBLIC.endpoint}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${AI_SERVICES.OPENAI_PUBLIC.key}`
          },
          timeout: 5000
        });
        testResults.openAIPublic.available = response.ok;
      } catch (error) {
        testResults.openAIPublic.error = error.message;
      }
    }

    // Determine overall status
    const anyAvailable = testResults.localLLM.available || 
                         testResults.azureOpenAI.available || 
                         testResults.openAIPublic.available;

    testResults.overall.connected = anyAvailable;
    testResults.overall.message = anyAvailable 
      ? 'Agent ready for deployment - At least one AI service is available'
      : 'Agent not ready - No AI services available. Please configure at least one AI service.';

    res.json({
      success: anyAvailable,
      testResults: testResults,
      readyForDeployment: anyAvailable,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      readyForDeployment: false
    });
  }
});

/**
 * GET /api/agent/health
 * Continuous health check for agent
 */
router.get('/health', async (req, res) => {
  try {
    const status = await testAIServices();
    
    res.json({
      healthy: status.connected,
      agent: {
        connected: status.connected,
        active: status.connected,
        activeService: agentStatus.activeService,
        availableServices: status.availableServices.length,
        lastCheck: status.timestamp
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      healthy: false,
      error: error.message,
      agent: {
        connected: false,
        active: false
      }
    });
  }
});

module.exports = router;

