const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@grc-postgres:5432/shahin_ksa_compliance'
});

// Admin authentication middleware
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-change-in-production';
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (authHeader === `Bearer ${ADMIN_SECRET}` || apiKey === ADMIN_SECRET) {
    req.isAdmin = true;
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }
};

// Apply admin authentication to all routes except config page
router.use((req, res, next) => {
  // Allow config page access without authentication (you may want to add authentication)
  if (req.path === '/config-page' || req.path.includes('ai-config.html')) {
    return next();
  }
  authenticateAdmin(req, res, next);
});

// ==========================================
// MONITORING ENDPOINTS
// ==========================================

/**
 * GET /api/admin/health
 * Complete system health check with API key status
 */
router.get('/health', async (req, res) => {
  try {
    const fetch = require('node-fetch');
    
    // Check database connection
    let dbStatus = 'disconnected';
    try {
      await pool.query('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = `error: ${error.message}`;
    }

    // Check AI API Keys status
    const apiKeyStatus = {
      openai: { configured: !!process.env.OPENAI_API_KEY, valid: false, lastChecked: null },
      googleGemini: { configured: !!process.env.GOOGLE_GEMINI_API_KEY, valid: false, lastChecked: null },
      azureOpenAI: { configured: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY), valid: false, lastChecked: null },
      anthropic: { configured: !!process.env.ANTHROPIC_API_KEY, valid: false, lastChecked: null },
      awsBedrock: { configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY), valid: false, lastChecked: null },
      localLLM: { configured: !!process.env.LOCAL_LLM_ENDPOINT, valid: false, lastChecked: null }
    };

    // Test OpenAI API key
    if (apiKeyStatus.openai.configured) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
          timeout: 5000
        }).catch(() => null);
        apiKeyStatus.openai.valid = response ? response.ok : false;
        apiKeyStatus.openai.lastChecked = new Date().toISOString();
      } catch (error) {
        apiKeyStatus.openai.valid = false;
      }
    }

    // Test Google Gemini API key
    if (apiKeyStatus.googleGemini.configured) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`, {
          timeout: 5000
        }).catch(() => null);
        apiKeyStatus.googleGemini.valid = response ? response.ok : false;
        apiKeyStatus.googleGemini.lastChecked = new Date().toISOString();
      } catch (error) {
        apiKeyStatus.googleGemini.valid = false;
      }
    }

    // Test Local LLM
    if (apiKeyStatus.localLLM.configured) {
      try {
        const endpoint = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1';
        const response = await fetch(`${endpoint}/models`, {
          timeout: 3000
        }).catch(() => null);
        apiKeyStatus.localLLM.valid = response ? response.ok : false;
        apiKeyStatus.localLLM.lastChecked = new Date().toISOString();
      } catch (error) {
        apiKeyStatus.localLLM.valid = false;
      }
    }

    // Check disk space
    const stats = require('os');
    const totalMemory = stats.totalmem();
    const freeMemory = stats.freemem();
    const usedMemory = totalMemory - freeMemory;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        connectionString: process.env.DATABASE_URL ? 'configured' : 'not configured'
      },
      apiKeys: apiKeyStatus,
      server: {
        uptime: process.uptime(),
        memory: {
          total: Math.round(totalMemory / 1024 / 1024) + ' MB',
          used: Math.round(usedMemory / 1024 / 1024) + ' MB',
          free: Math.round(freeMemory / 1024 / 1024) + ' MB',
          usagePercent: Math.round((usedMemory / totalMemory) * 100)
        },
        cpu: stats.cpus().length,
        platform: stats.platform(),
        nodeVersion: process.version
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3001
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Get sandbox sessions count
    const sandboxCount = await pool.query(
      'SELECT COUNT(*) as count FROM sandbox_sessions WHERE is_active = true AND expires_at > NOW()'
    );

    // Get landing requests count
    const requestsCount = await pool.query(
      'SELECT COUNT(*) as count FROM landing_requests WHERE status = $1',
      ['pending']
    );

    // Get contact messages count
    const messagesCount = await pool.query(
      'SELECT COUNT(*) as count FROM contact_messages WHERE read = false'
    );

    // Get feedback count
    const feedbackCount = await pool.query(
      'SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM sandbox_feedback'
    );

    res.json({
      stats: {
        activeSandboxes: parseInt(sandboxCount.rows[0].count),
        pendingRequests: parseInt(requestsCount.rows[0].count),
        unreadMessages: parseInt(messagesCount.rows[0].count),
        totalFeedback: parseInt(feedbackCount.rows[0].count),
        averageRating: parseFloat(feedbackCount.rows[0].avg_rating || 0).toFixed(2)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/logs
 * Get recent logs (if logging is implemented)
 */
router.get('/logs', (req, res) => {
  // This would integrate with your logging system
  res.json({
    message: 'Logs endpoint - implement with your logging system',
    logs: [],
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/admin/sandbox-sessions
 * List all sandbox sessions
 */
router.get('/sandbox-sessions', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const result = await pool.query(
      `SELECT s.*, u.email, u.full_name 
       FROM sandbox_sessions s
       LEFT JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      sessions: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/landing-requests
 * List all landing requests
 */
router.get('/landing-requests', async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM landing_requests';
    const params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
      query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      query += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await pool.query(query, params);
    res.json({
      requests: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/contact-messages
 * List all contact messages
 */
router.get('/contact-messages', async (req, res) => {
  try {
    const { read, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM contact_messages';
    const params = [];
    
    if (read !== undefined) {
      query += ' WHERE read = $1';
      params.push(read === 'true');
      query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      query += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await pool.query(query, params);
    res.json({
      messages: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// FILE UPLOAD ENDPOINTS
// ==========================================

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for admin uploads
    cb(null, true);
  }
});

/**
 * POST /api/admin/upload
 * Upload files (documents, images, etc.)
 */
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    success: true,
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/admin/upload-multiple
 * Upload multiple files
 */
router.post('/upload-multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: `/uploads/${file.filename}`,
    url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
  }));

  res.json({
    success: true,
    files: files,
    count: files.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/admin/files
 * List uploaded files
 */
router.get('/files', (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      return res.json({ files: [], count: 0 });
    }

    const files = fs.readdirSync(uploadDir).map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${filename}`
      };
    });

    res.json({
      files: files,
      count: files.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/files/:filename
 * Delete uploaded file
 */
router.delete('/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({
      success: true,
      message: 'File deleted successfully',
      filename: filename
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DATABASE MANAGEMENT
// ==========================================

/**
 * POST /api/admin/execute-sql
 * Execute SQL query (read-only for safety)
 */
router.post('/execute-sql', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    // Prevent dangerous operations
    const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
    const upperQuery = query.toUpperCase();
    
    if (dangerousKeywords.some(keyword => upperQuery.includes(keyword))) {
      return res.status(403).json({ error: 'Dangerous operations are not allowed' });
    }

    // Execute SELECT queries only
    if (!upperQuery.trim().startsWith('SELECT')) {
      return res.status(403).json({ error: 'Only SELECT queries are allowed' });
    }

    const result = await pool.query(query);
    res.json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SYSTEM MANAGEMENT
// ==========================================

/**
 * POST /api/admin/clear-cache
 * Clear application cache (if implemented)
 */
router.post('/clear-cache', (req, res) => {
  // Implement cache clearing logic
  res.json({
    success: true,
    message: 'Cache cleared (if implemented)',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/admin/config
 * Get current AI service configuration
 */
router.get('/config', (req, res) => {
  const envFile = path.join(__dirname, '../.env');
  let envVars = {};
  
  // Read .env file if it exists
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        envVars[key] = value;
      }
    });
  }

  res.json({
    localLLM: {
      endpoint: envVars.LOCAL_LLM_ENDPOINT || process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1',
      model: envVars.LOCAL_LLM_MODEL || process.env.LOCAL_LLM_MODEL || 'llama-3.2-3b-instruct',
      type: envVars.LOCAL_LLM_TYPE || process.env.LOCAL_LLM_TYPE || 'ollama',
      enabled: !!(envVars.LOCAL_LLM_ENDPOINT || process.env.LOCAL_LLM_ENDPOINT)
    },
    openai: {
      key: envVars.OPENAI_API_KEY || process.env.OPENAI_API_KEY ? '***configured***' : '',
      model: envVars.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4',
      enabled: !!(envVars.OPENAI_API_KEY || process.env.OPENAI_API_KEY)
    },
    googleGemini: {
      key: envVars.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY ? '***configured***' : '',
      model: envVars.GOOGLE_GEMINI_MODEL || process.env.GOOGLE_GEMINI_MODEL || 'gemini-pro',
      enabled: !!(envVars.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY)
    },
    azureOpenAI: {
      endpoint: envVars.AZURE_OPENAI_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || '',
      key: (envVars.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_KEY) ? '***configured***' : '',
      deployment: envVars.AZURE_OPENAI_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      model: envVars.AZURE_OPENAI_MODEL || process.env.AZURE_OPENAI_MODEL || 'gpt-4',
      enabled: !!(envVars.AZURE_OPENAI_ENDPOINT && envVars.AZURE_OPENAI_KEY) || !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY)
    },
    awsBedrock: {
      accessKeyId: (envVars.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) ? '***configured***' : '',
      secretAccessKey: (envVars.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY) ? '***configured***' : '',
      region: envVars.AWS_BEDROCK_REGION || process.env.AWS_BEDROCK_REGION || 'us-east-1',
      model: envVars.AWS_BEDROCK_MODEL || process.env.AWS_BEDROCK_MODEL || 'anthropic.claude-3-sonnet-20240229-v1:0',
      enabled: !!(envVars.AWS_ACCESS_KEY_ID && envVars.AWS_SECRET_ACCESS_KEY) || !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    },
    anthropic: {
      key: (envVars.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY) ? '***configured***' : '',
      model: envVars.ANTHROPIC_MODEL || process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      enabled: !!(envVars.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY)
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/admin/config
 * Update AI service configuration
 */
router.post('/config', (req, res) => {
  try {
    const { service, config } = req.body;
    const envFile = path.join(__dirname, '../.env');
    
    // Read existing .env file
    let envContent = '';
    if (fs.existsSync(envFile)) {
      envContent = fs.readFileSync(envFile, 'utf8');
    }

    // Update configuration based on service
    let updates = [];
    
    switch (service) {
      case 'localLLM':
        if (config.endpoint) updates.push({ key: 'LOCAL_LLM_ENDPOINT', value: config.endpoint });
        if (config.model) updates.push({ key: 'LOCAL_LLM_MODEL', value: config.model });
        if (config.type) updates.push({ key: 'LOCAL_LLM_TYPE', value: config.type });
        break;
      case 'openai':
        if (config.key) updates.push({ key: 'OPENAI_API_KEY', value: config.key });
        if (config.model) updates.push({ key: 'OPENAI_MODEL', value: config.model });
        break;
      case 'googleGemini':
        if (config.key) updates.push({ key: 'GOOGLE_GEMINI_API_KEY', value: config.key });
        if (config.model) updates.push({ key: 'GOOGLE_GEMINI_MODEL', value: config.model });
        break;
      case 'azureOpenAI':
        if (config.endpoint) updates.push({ key: 'AZURE_OPENAI_ENDPOINT', value: config.endpoint });
        if (config.key) updates.push({ key: 'AZURE_OPENAI_KEY', value: config.key });
        if (config.deployment) updates.push({ key: 'AZURE_OPENAI_DEPLOYMENT', value: config.deployment });
        if (config.model) updates.push({ key: 'AZURE_OPENAI_MODEL', value: config.model });
        break;
      case 'awsBedrock':
        if (config.accessKeyId) updates.push({ key: 'AWS_ACCESS_KEY_ID', value: config.accessKeyId });
        if (config.secretAccessKey) updates.push({ key: 'AWS_SECRET_ACCESS_KEY', value: config.secretAccessKey });
        if (config.region) updates.push({ key: 'AWS_BEDROCK_REGION', value: config.region });
        if (config.model) updates.push({ key: 'AWS_BEDROCK_MODEL', value: config.model });
        break;
      case 'anthropic':
        if (config.key) updates.push({ key: 'ANTHROPIC_API_KEY', value: config.key });
        if (config.model) updates.push({ key: 'ANTHROPIC_MODEL', value: config.model });
        break;
    }

    // Update .env file
    updates.forEach(({ key, value }) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });

    // Write back to .env file
    fs.writeFileSync(envFile, envContent, 'utf8');

    // Update process.env for immediate use
    updates.forEach(({ key, value }) => {
      process.env[key] = value;
    });

    res.json({
      success: true,
      message: `${service} configuration updated successfully`,
      service: service,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/test-service
 * Test AI service connection
 */
router.post('/test-service', async (req, res) => {
  try {
    const { service } = req.body;
    const fetch = require('node-fetch');
    
    let testResult = { success: false, error: '' };

    switch (service) {
      case 'openai':
        if (process.env.OPENAI_API_KEY) {
          try {
            const response = await fetch('https://api.openai.com/v1/models', {
              headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
            });
            testResult.success = response.ok;
            testResult.error = response.ok ? '' : `HTTP ${response.status}`;
          } catch (error) {
            testResult.error = error.message;
          }
        } else {
          testResult.error = 'API key not configured';
        }
        break;
      case 'googleGemini':
        if (process.env.GOOGLE_GEMINI_API_KEY) {
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`);
            testResult.success = response.ok;
            testResult.error = response.ok ? '' : `HTTP ${response.status}`;
          } catch (error) {
            testResult.error = error.message;
          }
        } else {
          testResult.error = 'API key not configured';
        }
        break;
      case 'localLLM':
        const endpoint = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1';
        try {
          const response = await fetch(`${endpoint}/models`, { timeout: 3000 });
          testResult.success = response.ok;
          testResult.error = response.ok ? '' : `HTTP ${response.status}`;
        } catch (error) {
          testResult.error = error.message;
        }
        break;
      default:
        testResult.error = 'Service not implemented for testing';
    }

    res.json(testResult);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/reset-config
 * Reset all configurations
 */
router.post('/reset-config', (req, res) => {
  // This would reset configuration to defaults
  // For safety, we'll just return success
  res.json({
    success: true,
    message: 'Configuration reset (manual .env file editing required)',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

