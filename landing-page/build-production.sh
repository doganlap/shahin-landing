#!/bin/bash

# Production Build Script for Shahin GRC Landing Page
# This script builds the application for production using Docker

set -e  # Exit on any error

echo "🚀 Starting production build..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build -t shahin-landing-page:latest -f Dockerfile .

echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo -e "${YELLOW}To run the container:${NC}"
echo "  docker run -d -p 4000:80 --name shahin-landing shahin-landing-page:latest"
echo ""
echo -e "${YELLOW}Or use docker-compose:${NC}"
echo "  docker-compose up -d"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "  docker logs -f shahin-landing"
echo ""
echo -e "${YELLOW}To stop the container:${NC}"
echo "  docker stop shahin-landing"
echo "  docker rm shahin-landing"

