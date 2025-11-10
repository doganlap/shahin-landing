#!/bin/bash
# Azure App Service Startup Command
# This runs after deployment to serve the static files

# Install a simple static file server if not present
if ! command -v serve &> /dev/null; then
    echo "Installing serve..."
    npm install -g serve
fi

# Serve the built files
echo "🚀 Starting Shahin GRC Landing Page..."
echo "Serving files from: /home/site/wwwroot/dist"

cd /home/site/wwwroot

# Check if dist exists, if not try to build
if [ ! -d "dist" ]; then
    echo "⚠️  dist folder not found, attempting build..."
    npm install
    npm run build
fi

# Start the server
serve -s dist -l 8080
