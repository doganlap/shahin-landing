@echo off
REM Quick Deploy to Azure App Service
REM This script zips the dist folder and deploys to Azure

echo.
echo ========================================
echo   Azure App Service Deployment
echo   Shahin GRC Landing Page
echo ========================================
echo.

cd /d "d:\Projects\www.shahin.com\landing-page"

REM Check if dist folder exists
if not exist "dist" (
    echo Error: dist folder not found!
    echo Please run: npm run build
    pause
    exit /b 1
)

echo [1/3] Creating deployment package...
if exist "deploy.zip" del "deploy.zip"
tar -a -c -f deploy.zip -C dist .

echo [2/3] Deployment package created: deploy.zip
echo.
echo [3/3] To deploy to Azure:
echo.
echo Option A - Using Azure CLI:
echo   az webapp deployment source config-zip --resource-group rg-grc-assessment-prod --name shahin-ai --src deploy.zip
echo.
echo Option B - Using Azure Portal:
echo   1. Go to Azure Portal
echo   2. Navigate to your App Service
echo   3. Go to Deployment Center
echo   4. Upload deploy.zip
echo.
echo Option C - Using VS Code:
echo   1. Open Azure extension
echo   2. Right-click your App Service
echo   3. Select "Deploy to Web App"
echo   4. Choose the 'dist' folder
echo.

pause
