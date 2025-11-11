@echo off
title Shahin GRC - Complete Cloudflare Setup
color 0B
echo.
echo ========================================
echo   Shahin GRC - Complete Cloudflare Setup
echo ========================================
echo.

:: Step 1: Login to Cloudflare (if not logged in)
echo [Step 1/6] Checking Cloudflare login...
wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Not logged in. Logging in...
    wrangler login
    if %errorlevel% neq 0 (
        echo ❌ Login failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Already logged in to Cloudflare
    wrangler whoami
)
echo.

:: Step 2: Build
echo [Step 2/6] Building frontend...
cd landing-page
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Build complete!
echo.

:: Step 3: Deploy to Cloudflare Pages
echo [Step 3/6] Deploying to Cloudflare Pages...
echo.
set PROJECT_NAME=shahin-grc-landing
wrangler pages deploy landing-page/dist --project-name=%PROJECT_NAME%
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Deployment may have failed or project already exists
    echo.
    echo You can also connect via GitHub:
    echo 1. Go to: https://dash.cloudflare.com
    echo 2. Pages → Create project → Connect to Git
    echo 3. Select: GitHub → www.shahin.com
    echo.
) else (
    echo.
    echo ✅ Deployed to Cloudflare Pages!
    echo.
)
echo.

:: Step 4: Setup Tunnel (optional)
echo [Step 4/6] Cloudflare Tunnel Setup (for backend)...
echo.
echo Do you want to set up Cloudflare Tunnel for the backend?
echo This will connect api.shahin-ai.com to localhost:3001
echo.
set /p SETUP_TUNNEL="Setup tunnel? (y/n): "
if /i "%SETUP_TUNNEL%"=="y" (
    echo.
    echo Running tunnel setup...
    call SETUP_CLOUDFLARE_TUNNEL.bat
) else (
    echo.
    echo Skipping tunnel setup. You can run it later:
    echo   SETUP_CLOUDFLARE_TUNNEL.bat
)
echo.

:: Step 5: Instructions
echo [Step 5/6] Post-Deployment Configuration
echo.
echo ========================================
echo   Next Steps (IMPORTANT!)
echo ========================================
echo.
echo 1. Set Environment Variables in Cloudflare Dashboard:
echo    - Go to: https://dash.cloudflare.com
echo    - Navigate to: Pages → %PROJECT_NAME% → Settings → Environment Variables
echo    - Add:
echo      * VITE_API_URL = https://api.shahin-ai.com/api
echo      * VITE_FRONTEND_URL = https://www.shahin-ai.com
echo.
echo 2. Connect GitHub Repository (for automatic deployments):
echo    - Go to: Pages → %PROJECT_NAME% → Settings → Builds & deployments
echo    - Click: "Connect to Git"
echo    - Select: GitHub
echo    - Authorize and select repository: www.shahin.com
echo    - Configure build settings:
echo      - Build command: cd landing-page && npm install && npm run build
echo      - Output directory: landing-page/dist
echo      - Root directory: /
echo.
echo 3. Add Custom Domain:
echo    - Go to: Pages → %PROJECT_NAME% → Custom domains
echo    - Add: www.shahin-ai.com
echo    - Wait for SSL certificate (< 5 minutes)
echo.
echo 4. Setup Backend Tunnel (if not done):
echo    - Run: SETUP_CLOUDFLARE_TUNNEL.bat
echo    - This connects api.shahin-ai.com to your backend
echo.
echo ========================================
echo.

:: Step 6: Open Dashboard
echo [Step 6/6] Opening Cloudflare Dashboard...
timeout /t 2 /nobreak >nul
start https://dash.cloudflare.com

echo.
echo ========================================
echo   Setup Complete! ✅
echo ========================================
echo.
echo Your application is being deployed to Cloudflare Pages!
echo.
echo Next: Follow the steps above to configure:
echo 1. Environment variables
echo 2. GitHub connection (for auto-deploy)
echo 3. Custom domain
echo 4. Backend tunnel
echo.
pause

