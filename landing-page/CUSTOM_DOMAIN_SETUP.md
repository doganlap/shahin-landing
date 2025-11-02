# Custom Domain Setup for www.shahin-ai.com

## ✅ Deployment Complete

The production landing page has been successfully deployed to Azure Container Apps:

- **Container App**: `grc-landing-page-prod`
- **Resource Group**: `rg-grc-assessment-prod`
- **Current FQDN**: `grc-landing-page-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io`
- **HTTPS URL**: `https://grc-landing-page-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io`

## 🔧 Custom Domain Configuration Required

To configure the custom domain `www.shahin-ai.com`, you need to complete DNS verification:

### Step 1: Add DNS TXT Record

Add the following TXT record to your DNS provider for the domain `shahin-ai.com`:

**Record Type**: `TXT`
**Host/Name**: `asuid.www`
**Value**: `8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC`
**TTL**: `3600` (or default)

**Full Record**:
```
Name: asuid.www.shahin-ai.com
Type: TXT
Value: 8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC
```

### Step 2: Verify DNS Propagation

Wait for DNS propagation (usually 5-30 minutes). Verify the TXT record exists:

```powershell
# Check TXT record
nslookup -type=TXT asuid.www.shahin-ai.com
```

### Step 3: Add Custom Domain to Container App

Once DNS is verified, run:

```powershell
az containerapp hostname add `
    --hostname www.shahin-ai.com `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod
```

### Step 4: Configure DNS A/CNAME Record

After the hostname is added, Azure will provide an IP address or CNAME target. Configure one of these:

**Option A: CNAME Record (Recommended)**
```
Name: www
Type: CNAME
Value: grc-landing-page-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io
```

**Option B: A Record (If IP provided)**
Check the Container App configuration for the specific IP address after hostname is added.

### Step 5: Verify Custom Domain

After DNS propagation, verify the custom domain:

```powershell
# Check custom domains
az containerapp show `
    --name grc-landing-page-prod `
    --resource-group rg-grc-assessment-prod `
    --query properties.configuration.ingress.customDomains `
    --output table
```

## 📋 Quick Reference

**Container App Details:**
- **Name**: `grc-landing-page-prod`
- **Resource Group**: `rg-grc-assessment-prod`
- **Container Registry**: `grcacr202511012324.azurecr.io`
- **Image**: `grcacr202511012324.azurecr.io/landing-page:latest`
- **Environment**: `grc-env-prod`
- **Verification ID**: `8DE2F28050DE80AFB0E96FEC52B0AE8FB267794D79320E3FA6C1FD34671732EC`

**Current Status:**
- ✅ Docker image built and pushed
- ✅ Container App updated with new image
- ✅ HTTPS enabled (automatic)
- ⏳ Custom domain pending DNS verification

## 🔍 Troubleshooting

### If DNS verification fails:

1. **Check TXT record format**: Ensure no extra spaces or quotes
2. **Wait for propagation**: DNS changes can take up to 48 hours
3. **Verify record**: Use `nslookup` or `dig` to confirm the record exists
4. **Check domain ownership**: Ensure you have DNS management rights for `shahin-ai.com`

### If custom domain doesn't work after adding:

1. **Check DNS propagation**: Verify A/CNAME record is correctly configured
2. **Check Container App status**: Ensure the app is running
3. **Verify SSL certificate**: Azure automatically provisions SSL certificates for custom domains

## 📞 Support

For Azure Container Apps documentation:
- https://learn.microsoft.com/en-us/azure/container-apps/custom-domains-certificates

