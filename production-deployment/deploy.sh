#!/bin/bash 
# Shahin AI Quick Deployment 
set -e 
echo "🚀 Deploying Shahin AI Platform..." 
 
# Install system packages 
sudo apt update && sudo apt install -y nginx nodejs npm certbot python3-certbot-nginx 
sudo npm install -g pm2 
 
# Create directories 
sudo mkdir -p /var/www/shahin-ai.com 
sudo mkdir -p /opt/shahin-api 
 
# Deploy files 
sudo cp -r frontend/* /var/www/shahin-ai.com/ 
sudo cp -r backend/* /opt/shahin-api/ 
sudo chown -R www-data:www-data /var/www/shahin-ai.com 
sudo chown -R $USER:$USER /opt/shahin-api 
 
# Install dependencies and start services 
cd /opt/shahin-api 
npm install --production 
pm2 start server.js --name shahin-api 
pm2 save && pm2 startup 
 
# Configure Nginx 
sudo cp ../nginx-shahin-ai.conf /etc/nginx/sites-available/ 
sudo ln -sf /etc/nginx/sites-available/nginx-shahin-ai.conf /etc/nginx/sites-enabled/ 
sudo rm -f /etc/nginx/sites-enabled/default 
sudo nginx -t && sudo systemctl restart nginx 
 
# Setup SSL 
sudo certbot --nginx -d shahin-ai.com -d www.shahin-ai.com 
 
echo "✅ Deployment Complete! Visit https://shahin-ai.com" 
