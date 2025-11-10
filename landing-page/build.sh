#!/bin/bash

# Azure App Service Build Script for Vite/React Landing Page
# This script runs during deployment on Azure

echo "🚀 Starting Shahin GRC Landing Page Build..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# Set build-time environment variables
export VITE_API_URL="${VITE_API_URL:-https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api}"
export VITE_FRONTEND_URL="${VITE_FRONTEND_URL:-https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io}"

echo "🔧 Environment Variables:"
echo "  VITE_API_URL=$VITE_API_URL"
echo "  VITE_FRONTEND_URL=$VITE_FRONTEND_URL"

# Build the application
echo "🏗️  Building application..."
npm run build

# Verify build output
if [ -d "dist" ]; then
    echo "✅ Build successful! Contents of dist:"
    ls -la dist/
    echo ""
    echo "📊 Build size:"
    du -sh dist/
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "🎉 Build complete!"
