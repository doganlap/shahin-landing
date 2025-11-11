@echo off
title Shahin GRC - Deploy to Cloudflare NOW
color 0B
echo.
echo ========================================
echo   Shahin GRC - Deploy to Cloudflare
echo ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

:: Step 1: Build
echo [Step 1/3] Building for production...
cd landing-page
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
cd ..
echo ✅ Build complete!
echo.

:: Step 2: Verify build output
echo [Step 2/3] Verifying build output...
if not exist "landing-page\dist\index.html" (
    echo ❌ Build output not found!
    pause
    exit /b 1
)
echo ✅ Build output verified
echo.

:: Step 3: Deploy options
echo [Step 3/3] Deployment Options
echo.
echo ========================================
echo   Deployment Methods
echo ========================================
echo.
echo Option 1: Cloudflare Dashboard (Recommended)
echo   - Go to https://dash.cloudflare.com
echo   - Navigate to Pages
echo   - Create new project or upload dist folder
echo   - Upload: landing-page\dist
echo.
echo Option 2: Wrangler CLI
echo   - Install: npm install -g wrangler
echo   - Login: wrangler login
echo   - Deploy: wrangler pages deploy landing-page\dist --project-name=shahin-grc-landing
echo.
echo Option 3: Git Integration
echo   - Push code to Git repository
echo   - Connect repository to Cloudflare Pages
echo   - Configure build settings
echo.
echo ========================================
echo   Ready to Deploy!
echo ========================================
echo.
echo Build output: landing-page\dist
echo.
echo Opening Cloudflare Dashboard...
timeout /t 2 /nobreak >nul
start https://dash.cloudflare.com

echo.
echo ========================================
echo   Deployment Instructions
echo ========================================
echo.
echo 1. In Cloudflare Dashboard:
echo    - Go to Pages
echo    - Click "Create a project"
echo    - Choose "Upload assets"
echo    - Select the "landing-page\dist" folder
echo    - Click "Upload and Deploy"
echo.
echo 2. Set Environment Variables:
echo    - VITE_API_URL = https://api.shahin-ai.com/api
echo    - VITE_FRONTEND_URL = https://www.shahin-ai.com
echo.
echo 3. Configure Custom Domain:
echo    - Add custom domain: www.shahin-ai.com
echo    - Wait for SSL certificate
echo.
echo Press any key to continue...
pause >nul

echo.
echo ========================================
echo   Deployment Setup Complete!
echo ========================================
echo.
echo Next: Follow the instructions above to deploy
echo Build output is ready in: landing-page\dist
echo.
pause

