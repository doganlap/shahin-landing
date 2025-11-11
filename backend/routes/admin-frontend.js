const express = require('express');
const router = express.Router();
const path = require('path');

// Simple admin frontend HTML
router.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shahin GRC - Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            padding: 30px;
        }
        h1 {
            color: #667eea;
            margin-bottom: 30px;
            text-align: center;
        }
        .auth-section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 5px;
        }
        input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        button {
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        button:hover { background: #5568d3; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-card h3 {
            color: #667eea;
            font-size: 24px;
            margin: 10px 0;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #667eea;
            color: white;
        }
        .upload-area {
            border: 2px dashed #667eea;
            padding: 40px;
            text-align: center;
            border-radius: 5px;
            margin: 20px 0;
            cursor: pointer;
        }
        .upload-area:hover {
            background: #f0f0f0;
        }
        .file-list {
            list-style: none;
            margin: 10px 0;
        }
        .file-list li {
            padding: 10px;
            background: white;
            margin: 5px 0;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .status {
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
        }
        .status.healthy { background: #4caf50; color: white; }
        .status.error { background: #f44336; color: white; }
        .status.warning { background: #ff9800; color: white; }
        .hidden { display: none; }
        .api-key-item {
            padding: 10px;
            margin: 5px 0;
            background: white;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .api-key-name {
            font-weight: bold;
            color: #667eea;
        }
        .monitoring-active {
            background: #4caf50;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Shahin GRC Admin Dashboard</h1>
        
        <div class="auth-section">
            <h2>Authentication</h2>
            <input type="password" id="adminSecret" placeholder="Enter Admin Secret" />
            <button onclick="authenticate()">Login</button>
            <span id="authStatus"></span>
        </div>

        <div id="dashboard" class="hidden">
            <!-- Health Status -->
            <div class="section">
                <h2>System Health</h2>
                <button onclick="checkHealth()">Refresh Health</button>
                <button onclick="startMonitoring()">Start Monitoring</button>
                <button onclick="stopMonitoring()">Stop Monitoring</button>
                <div id="healthStatus"></div>
            </div>

            <!-- API Keys Status -->
            <div class="section">
                <h2>API Keys Status</h2>
                <button onclick="checkAPIKeys()">Check API Keys</button>
                <div id="apiKeysStatus"></div>
            </div>

            <!-- Statistics -->
            <div class="section">
                <h2>Statistics</h2>
                <button onclick="loadStats()">Refresh Stats</button>
                <div class="stats-grid" id="statsGrid"></div>
            </div>

            <!-- File Upload -->
            <div class="section">
                <h2>File Upload</h2>
                <div class="upload-area" onclick="document.getElementById('fileInput').click()">
                    <p>Click to upload files</p>
                    <input type="file" id="fileInput" multiple style="display: none" onchange="uploadFiles()" />
                </div>
                <button onclick="listFiles()">Refresh File List</button>
                <ul class="file-list" id="fileList"></ul>
            </div>

            <!-- Sandbox Sessions -->
            <div class="section">
                <h2>Sandbox Sessions</h2>
                <button onclick="loadSandboxSessions()">Refresh</button>
                <div id="sandboxSessions"></div>
            </div>

            <!-- Landing Requests -->
            <div class="section">
                <h2>Landing Requests</h2>
                <button onclick="loadLandingRequests()">Refresh</button>
                <div id="landingRequests"></div>
            </div>

            <!-- Contact Messages -->
            <div class="section">
                <h2>Contact Messages</h2>
                <button onclick="loadContactMessages()">Refresh</button>
                <div id="contactMessages"></div>
            </div>

            <!-- AI Configuration -->
            <div class="section">
                <h2>AI Configuration</h2>
                <button onclick="window.open('/ai-config', '_blank')">Open AI Config</button>
                <p>Configure OpenAI, Google Gemini, Azure OpenAI, AWS Bedrock, and Anthropic Claude</p>
            </div>
        </div>
    </div>

    <script>
        let adminSecret = '';
        let monitoringInterval = null;

        function authenticate() {
            adminSecret = document.getElementById('adminSecret').value;
            if (!adminSecret) {
                alert('Please enter admin secret');
                return;
            }
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('authStatus').textContent = '✓ Authenticated';
            document.getElementById('authStatus').style.color = 'green';
            checkHealth();
            loadStats();
            checkAPIKeys();
        }

        function startMonitoring() {
            if (monitoringInterval) {
                alert('Monitoring is already active');
                return;
            }
            monitoringInterval = setInterval(() => {
                checkHealth();
                checkAPIKeys();
                loadStats();
            }, 30000); // Check every 30 seconds
            document.getElementById('authStatus').innerHTML += ' <span class="monitoring-active">Monitoring Active</span>';
        }

        function stopMonitoring() {
            if (monitoringInterval) {
                clearInterval(monitoringInterval);
                monitoringInterval = null;
                document.getElementById('authStatus').textContent = '✓ Authenticated';
                document.getElementById('authStatus').style.color = 'green';
            }
        }

        async function apiCall(endpoint, method = 'GET', body = null) {
            const headers = {
                'Authorization': \`Bearer \${adminSecret}\`,
                'Content-Type': 'application/json'
            };

            const options = {
                method,
                headers
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            try {
                const response = await fetch(\`/api/admin\${endpoint}\`, options);
                const data = await response.json();
                return { success: response.ok, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        async function checkHealth() {
            const result = await apiCall('/health');
            if (result.success) {
                const health = result.data;
                document.getElementById('healthStatus').innerHTML = \`
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>Database</h3>
                            <p class="status \${health.database.status === 'connected' ? 'healthy' : 'error'}">
                                \${health.database.status}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h3>Memory Usage</h3>
                            <p>\${health.server.memory.usagePercent}%</p>
                            <p>\${health.server.memory.used} / \${health.server.memory.total}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Uptime</h3>
                            <p>\${Math.round(health.server.uptime / 60)} minutes</p>
                        </div>
                        <div class="stat-card">
                            <h3>Node Version</h3>
                            <p>\${health.server.nodeVersion}</p>
                        </div>
                    </div>
                \`;
            }
        }

        async function checkAPIKeys() {
            const result = await apiCall('/health');
            if (result.success && result.data.apiKeys) {
                const apiKeys = result.data.apiKeys;
                const apiKeysHtml = Object.entries(apiKeys).map(([key, status]) => \`
                    <div class="api-key-item">
                        <div>
                            <span class="api-key-name">\${key.toUpperCase()}</span>
                            <span class="status \${status.configured ? (status.valid ? 'healthy' : 'warning') : 'error'}">
                                \${status.configured ? (status.valid ? 'Valid' : 'Invalid/Error') : 'Not Configured'}
                            </span>
                        </div>
                        <div>
                            \${status.lastChecked ? new Date(status.lastChecked).toLocaleTimeString() : 'Never checked'}
                        </div>
                    </div>
                \`).join('');
                document.getElementById('apiKeysStatus').innerHTML = apiKeysHtml;
            }
        }

        async function loadStats() {
            const result = await apiCall('/stats');
            if (result.success) {
                const stats = result.data.stats;
                document.getElementById('statsGrid').innerHTML = \`
                    <div class="stat-card">
                        <h3>\${stats.activeSandboxes}</h3>
                        <p>Active Sandboxes</p>
                    </div>
                    <div class="stat-card">
                        <h3>\${stats.pendingRequests}</h3>
                        <p>Pending Requests</p>
                    </div>
                    <div class="stat-card">
                        <h3>\${stats.unreadMessages}</h3>
                        <p>Unread Messages</p>
                    </div>
                    <div class="stat-card">
                        <h3>\${stats.averageRating}</h3>
                        <p>Average Rating</p>
                    </div>
                \`;
            }
        }

        async function uploadFiles() {
            const fileInput = document.getElementById('fileInput');
            const files = fileInput.files;
            if (!files.length) return;

            const formData = new FormData();
            for (let file of files) {
                formData.append('files', file);
            }

            try {
                const response = await fetch('/api/admin/upload-multiple', {
                    method: 'POST',
                    headers: {
                        'Authorization': \`Bearer \${adminSecret}\`
                    },
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    alert(\`Uploaded \${result.count} file(s)\`);
                    listFiles();
                }
            } catch (error) {
                alert('Upload failed: ' + error.message);
            }
        }

        async function listFiles() {
            const result = await apiCall('/files');
            if (result.success) {
                const files = result.data.files;
                const fileList = document.getElementById('fileList');
                fileList.innerHTML = files.map(file => \`
                    <li>
                        <span>\${file.filename} (\${(file.size / 1024).toFixed(2)} KB)</span>
                        <button onclick="deleteFile('\${file.filename}')">Delete</button>
                    </li>
                \`).join('');
            }
        }

        async function deleteFile(filename) {
            if (!confirm('Delete this file?')) return;
            const result = await apiCall(\`/files/\${filename}\`, 'DELETE');
            if (result.success) {
                listFiles();
            }
        }

        async function loadSandboxSessions() {
            const result = await apiCall('/sandbox-sessions?limit=10');
            if (result.success) {
                const sessions = result.data.sessions;
                document.getElementById('sandboxSessions').innerHTML = \`
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Created</th>
                            <th>Expires</th>
                            <th>Active</th>
                        </tr>
                        \${sessions.map(s => \`
                            <tr>
                                <td>\${s.id}</td>
                                <td>\${s.email || 'N/A'}</td>
                                <td>\${new Date(s.created_at).toLocaleString()}</td>
                                <td>\${new Date(s.expires_at).toLocaleString()}</td>
                                <td>\${s.is_active ? 'Yes' : 'No'}</td>
                            </tr>
                        \`).join('')}
                    </table>
                \`;
            }
        }

        async function loadLandingRequests() {
            const result = await apiCall('/landing-requests?limit=10');
            if (result.success) {
                const requests = result.data.requests;
                document.getElementById('landingRequests').innerHTML = \`
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                        \${requests.map(r => \`
                            <tr>
                                <td>\${r.id}</td>
                                <td>\${r.name}</td>
                                <td>\${r.email}</td>
                                <td>\${r.status}</td>
                                <td>\${new Date(r.created_at).toLocaleString()}</td>
                            </tr>
                        \`).join('')}
                    </table>
                \`;
            }
        }

        async function loadContactMessages() {
            const result = await apiCall('/contact-messages?limit=10');
            if (result.success) {
                const messages = result.data.messages;
                document.getElementById('contactMessages').innerHTML = \`
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject</th>
                            <th>Read</th>
                            <th>Created</th>
                        </tr>
                        \${messages.map(m => \`
                            <tr>
                                <td>\${m.id}</td>
                                <td>\${m.name}</td>
                                <td>\${m.email}</td>
                                <td>\${m.subject}</td>
                                <td>\${m.read ? 'Yes' : 'No'}</td>
                                <td>\${new Date(m.created_at).toLocaleString()}</td>
                            </tr>
                        \`).join('')}
                    </table>
                \`;
            }
        }
    </script>
</body>
</html>
  `);
});

module.exports = router;

