# 🌐 Production Azure Deployment - Landing Page

## ✅ Production HTTPS URL

**Live Production URL:**
```
https://grc-landing-page-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io
```

**Click to open:** [https://grc-landing-page-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io](https://grc-landing-page-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io)

---

## 🔒 HTTPS Security Configuration

### ✅ All Assets Served Over HTTPS

**Status:** All CSS, JavaScript, fonts, and assets are configured to use HTTPS only.

**Security Headers Implemented:**
- ✅ **Strict-Transport-Security (HSTS)**: Forces HTTPS for 1 year
- ✅ **Content-Security-Policy**: Requires HTTPS for all external resources
- ✅ **X-Frame-Options**: Prevents clickjacking
- ✅ **X-Content-Type-Options**: Prevents MIME sniffing
- ✅ **X-XSS-Protection**: XSS protection enabled
- ✅ **Referrer-Policy**: Secure referrer policy

**External Resources (All HTTPS):**
- ✅ Google Fonts: `https://fonts.googleapis.com`
- ✅ Google Fonts Static: `https://fonts.gstatic.com`
- ✅ All images, CSS, JS served via HTTPS

---

## 📋 Azure Container App Details

**Container App:**
- **Name**: `grc-landing-page-prod`
- **Resource Group**: `rg-grc-assessment-prod`
- **Environment**: `grc-env-prod`
- **Status**: `Running`
- **HTTPS**: Enabled (Automatic SSL/TLS)

**Container Registry:**
- **Registry**: `grcacr202511012324.azurecr.io`
- **Image**: `grcacr202511012324.azurecr.io/landing-page:latest`
- **Build**: Latest production build with HTTPS security headers

**Deployment Configuration:**
- **Min Replicas**: 1
- **Max Replicas**: 3
- **CPU**: 0.5 vCPU
- **Memory**: 1.0 GiB
- **Auto-scaling**: Enabled
- **Zero Downtime**: Enabled

---

## 🚀 Quick Access

### Production URL
```
https://grc-landing-page-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io
```

### Azure Portal
Navigate to:
- Resource Group: `rg-grc-assessment-prod`
- Container App: `grc-landing-page-prod`

### Management Commands

**Check Status:**
```powershell
az containerapp show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --query "{Status:properties.runningStatus,FQDN:properties.configuration.ingress.fqdn}"
```

**View Logs:**
```powershell
az containerapp logs show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --follow
```

**Update Deployment:**
```powershell
az containerapp update `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --image grcacr202511012324.azurecr.io/landing-page:latest
```

---

## 🌍 Custom Domain (Pending DNS Configuration)

**Target Domain:** `www.shahin-ai.com`

**DNS Verification Required:**
- TXT Record: `asuid.www.shahin-ai.com`
- Value: `8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC`

See `CUSTOM_DOMAIN_SETUP.md` for complete instructions.

---

## ✅ Security Features

1. **HTTPS Only**: All traffic encrypted with TLS/SSL
2. **HSTS**: HTTP Strict Transport Security enabled
3. **CSP**: Content Security Policy restricts insecure resources
4. **Security Headers**: All recommended security headers configured
5. **Auto SSL**: Azure automatically provisions and renews SSL certificates

---

## 📊 Performance

- **Bundle Size**: 475.50 KB → 131.46 KB (gzipped)
- **CSS Size**: 57.67 KB → 8.89 KB (gzipped)
- **CDN**: Azure Container Apps with built-in CDN
- **Gzip**: Enabled for all text assets
- **Caching**: 1-year cache for static assets

---

## 🔄 Deployment Process

1. ✅ Build Docker image locally
2. ✅ Push to Azure Container Registry
3. ✅ Update Container App (zero downtime)
4. ✅ Automatic SSL certificate provisioning
5. ✅ Health checks and monitoring

---

## 📞 Support

**Azure Documentation:**
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Custom Domains](https://learn.microsoft.com/en-us/azure/container-apps/custom-domains-certificates)

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

