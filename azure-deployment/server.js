const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('.'));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`🚀 Shahin AI Platform running on port ${port}`);
  console.log(`🌐 Visit: http://localhost:${port}`);
});