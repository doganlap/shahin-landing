# 🚀 Shahin AI Platform - Production Deployment 
 
## Quick Start 
 
1. Upload this folder to your server 
2. Run: `chmod +x deploy.sh`   
3. Run: `./deploy.sh` 
4. Visit: https://shahin-ai.com 
 
## What's Included 
 
- ✅ Frontend build (optimized) 
- ✅ Backend API (multi-AI routing)  
- ✅ Nginx configuration 
- ✅ SSL setup (Let's Encrypt) 
- ✅ PM2 process management 
- ✅ Login gateway functionality 
 
## Manual Commands 
 
```bash 
# Check services 
pm2 status 
sudo systemctl status nginx 
 
# View logs  
pm2 logs shahin-api 
sudo tail -f /var/log/nginx/error.log 
 
# Restart services 
pm2 restart shahin-api 
sudo systemctl restart nginx 
``` 
