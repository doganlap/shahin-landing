#!/usr/bin/env node

/**
 * Test Agent Connection Before Deployment
 * This script tests all AI services to ensure agent is ready for deployment
 */

require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(url, method = 'GET', body = null, timeout = 5000) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testAgentConnection() {
  log('\n🧪 Testing Agent Connection Before Deployment...', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  const results = {
    agentStatus: null,
    agentTest: null,
    agentHealth: null,
    aiHealth: null,
    agentConnect: null,
    overall: { ready: false, message: '' }
  };

  // Test 1: Agent Status
  log('\n1️⃣ Testing Agent Status...', 'blue');
  const statusResult = await testEndpoint(`${API_BASE_URL}/agent/status`);
  results.agentStatus = statusResult;
  
  if (statusResult.success) {
    log('   ✅ Agent status endpoint responding', 'green');
    if (statusResult.data.agent && statusResult.data.agent.connected) {
      log(`   ✅ Agent connected to: ${statusResult.data.agent.activeService || 'unknown'}`, 'green');
      log(`   ✅ Available services: ${statusResult.data.agent.availableServices?.length || 0}`, 'green');
    } else {
      log('   ⚠️  Agent not connected', 'yellow');
    }
  } else {
    log(`   ❌ Agent status test failed: ${statusResult.error || statusResult.status}`, 'red');
  }

  // Test 2: Agent Test Endpoint
  log('\n2️⃣ Testing Agent Pre-Deployment Test...', 'blue');
  const testResult = await testEndpoint(`${API_BASE_URL}/agent/test`);
  results.agentTest = testResult;
  
  if (testResult.success && testResult.data) {
    log('   ✅ Agent test endpoint responding', 'green');
    if (testResult.data.readyForDeployment) {
      log('   ✅ Agent ready for deployment!', 'green');
      log(`   ✅ Available services:`, 'green');
      if (testResult.data.testResults) {
        if (testResult.data.testResults.localLLM?.available) {
          log('      • Local LLM: Available', 'green');
        } else {
          log('      • Local LLM: Not available', 'yellow');
        }
        if (testResult.data.testResults.azureOpenAI?.available) {
          log('      • Azure OpenAI: Available', 'green');
        } else {
          log('      • Azure OpenAI: Not available', 'yellow');
        }
        if (testResult.data.testResults.openAIPublic?.available) {
          log('      • OpenAI Public: Available', 'green');
        } else {
          log('      • OpenAI Public: Not available', 'yellow');
        }
      }
    } else {
      log('   ❌ Agent NOT ready for deployment', 'red');
      log(`   ❌ ${testResult.data.testResults?.overall?.message || 'No AI services available'}`, 'red');
    }
  } else {
    log(`   ❌ Agent test failed: ${testResult.error || testResult.status}`, 'red');
  }

  // Test 3: Agent Health
  log('\n3️⃣ Testing Agent Health...', 'blue');
  const healthResult = await testEndpoint(`${API_BASE_URL}/agent/health`);
  results.agentHealth = healthResult;
  
  if (healthResult.success && healthResult.data?.healthy) {
    log('   ✅ Agent health check passed', 'green');
  } else {
    log('   ❌ Agent health check failed', 'red');
  }

  // Test 4: AI Health
  log('\n4️⃣ Testing AI Service Health...', 'blue');
  const aiHealthResult = await testEndpoint(`${API_BASE_URL}/ai/health`);
  results.aiHealth = aiHealthResult;
  
  if (aiHealthResult.success && aiHealthResult.data) {
    log('   ✅ AI health endpoint responding', 'green');
    if (aiHealthResult.data.localLLM) {
      log(`   ℹ️  Local LLM: ${aiHealthResult.data.localLLM.status}`, 
          aiHealthResult.data.localLLM.status === 'connected' ? 'green' : 'yellow');
    }
    if (aiHealthResult.data.services) {
      const services = Object.keys(aiHealthResult.data.services);
      log(`   ℹ️  Configured services: ${services.join(', ')}`, 'cyan');
    }
  } else {
    log('   ❌ AI health check failed', 'red');
  }

  // Test 5: Agent Connect
  log('\n5️⃣ Testing Agent Connection...', 'blue');
  const connectResult = await testEndpoint(`${API_BASE_URL}/agent/connect`, 'POST', {});
  results.agentConnect = connectResult;
  
  if (connectResult.success && connectResult.data?.agent?.connected) {
    log('   ✅ Agent connection successful', 'green');
    log(`   ✅ Active service: ${connectResult.data.agent.service?.name || 'unknown'}`, 'green');
  } else {
    log('   ❌ Agent connection failed', 'red');
    if (connectResult.data?.message) {
      log(`   ❌ ${connectResult.data.message}`, 'red');
    }
  }

  // Test 6: Chat Endpoint (requires connected agent)
  log('\n6️⃣ Testing Chat Endpoint (requires connected agent)...', 'blue');
  const chatResult = await testEndpoint(`${API_BASE_URL}/ai/chat`, 'POST', {
    message: 'مرحباً',
    context: { mode: 'test' }
  });
  
  if (chatResult.success && chatResult.data?.message) {
    log('   ✅ Chat endpoint working', 'green');
    log(`   ✅ Response source: ${chatResult.data.source || 'unknown'}`, 'green');
  } else if (chatResult.status === 503) {
    log('   ❌ Chat endpoint requires agent connection', 'red');
    log('   ❌ Please ensure at least one AI service is configured and available', 'red');
  } else {
    log(`   ❌ Chat endpoint failed: ${chatResult.error || chatResult.status}`, 'red');
  }

  // Overall Assessment
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Deployment Readiness Assessment', 'cyan');
  log('='.repeat(60), 'cyan');

  const readyForDeployment = results.agentTest?.data?.readyForDeployment || false;
  const agentConnected = results.agentConnect?.data?.agent?.connected || false;
  const chatWorking = chatResult.success || false;

  if (readyForDeployment && agentConnected && chatWorking) {
    log('\n✅ READY FOR DEPLOYMENT', 'green');
    log('   • Agent test passed', 'green');
    log('   • Agent connected to AI service', 'green');
    log('   • Chat endpoint working', 'green');
    results.overall.ready = true;
    results.overall.message = 'Agent is ready for deployment';
  } else {
    log('\n❌ NOT READY FOR DEPLOYMENT', 'red');
    if (!readyForDeployment) {
      log('   • Agent test failed - No AI services available', 'red');
      log('   • Please configure at least one AI service:', 'yellow');
      log('     1. Local LLM (Ollama/LM Studio)', 'yellow');
      log('     2. Azure OpenAI (set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY)', 'yellow');
      log('     3. OpenAI Public API (set OPENAI_API_KEY)', 'yellow');
    }
    if (!agentConnected) {
      log('   • Agent not connected to any AI service', 'red');
    }
    if (!chatWorking) {
      log('   • Chat endpoint not working', 'red');
    }
    results.overall.ready = false;
    results.overall.message = 'Agent requires configuration before deployment';
  }

  log('\n' + '='.repeat(60), 'cyan');
  
  // Exit with appropriate code
  process.exit(readyForDeployment && agentConnected && chatWorking ? 0 : 1);
}

// Run tests
testAgentConnection().catch(error => {
  log(`\n❌ Test script failed: ${error.message}`, 'red');
  process.exit(1);
});

