# Production Build Script for Shahin GRC Landing Page (PowerShell)
# This script builds the application for production using Docker

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting production build..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Building Docker image..." -ForegroundColor Blue
docker build -t shahin-landing-page:latest -f Dockerfile .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the container:" -ForegroundColor Yellow
    Write-Host "  docker run -d -p 4000:80 --name shahin-landing shahin-landing-page:latest"
    Write-Host ""
    Write-Host "Or use docker-compose:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d"
    Write-Host ""
    Write-Host "To view logs:" -ForegroundColor Yellow
    Write-Host "  docker logs -f shahin-landing"
    Write-Host ""
    Write-Host "To stop the container:" -ForegroundColor Yellow
    Write-Host "  docker stop shahin-landing"
    Write-Host "  docker rm shahin-landing"
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

