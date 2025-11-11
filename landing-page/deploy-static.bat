@echo off
REM Deploy Static Site to Azure App Service
echo.
echo ========================================
echo   Creating Azure Static Site Package
echo ========================================
echo.

cd /d "d:\Projects\www.shahin.com\landing-page"

if not exist "dist" (
    echo Building application...
    call npm run build
)

echo Creating web.config for static files...

REM Copy web.config into dist
copy web.config dist\web.config

REM Copy health check files
copy public\health dist\health
copy public\healthz dist\healthz
copy public\ready dist\ready
copy public\live dist\live
copy public\error.html dist\error.html

echo Creating deployment package...
if exist "azure-deploy.zip" del "azure-deploy.zip"
cd dist
tar -a -c -f ..\azure-deploy.zip *
cd ..

echo.
echo ========================================
echo   Package Ready: azure-deploy.zip
echo ========================================
echo.
echo Deploying to Azure...

az webapp deploy --resource-group Consultant --name shahin-ai --src-path azure-deploy.zip --type zip --async false

echo.
echo ========================================
echo   Deployment Complete!
echo   URL: https://shahin-ai.azurewebsites.net
echo ========================================
echo.

pause
