# 🌐 Landing Page - Complete Package

## What's Included

All landing page files for the Shahin GRC marketing website with integrated sandbox system.

---

## 📂 Folder Structure

```
landing-page/
├── App.jsx                              # Main React app
├── DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1  # Deployment script
├── components/                          # All React components (13)
│   ├── Header.jsx                       # Navigation header
│   ├── Hero.jsx                         # Hero section
│   ├── Footer.jsx                       # Footer with branding
│   ├── UnifiedLogo.jsx                  # Brand logo component
│   ├── TrustBar.jsx                     # Trust indicators
│   ├── TargetSectors.jsx                # Sector showcase
│   ├── TransformationStory.jsx          # 4-chapter story
│   ├── PlatformDemo.jsx                 # Platform demo
│   ├── DashboardPreview.jsx             # Dashboard preview
│   ├── FloatingNav.jsx                  # Floating navigation
│   ├── QuickSectionNav.jsx              # Quick nav
│   ├── QuickAccess.jsx                  # Quick access panel
│   ├── Pricing.jsx                      # Pricing section
│   ├── DemoBooking.jsx                  # (from frontend/components)
│   └── TryDemoButton.jsx                # (from frontend/components)
└── config/                              # Configuration files
    ├── package.json                     # Dependencies
    ├── vite.config.js                   # Vite config
    ├── tailwind.config.js               # Tailwind config
    ├── Dockerfile                       # Docker build
    ├── nginx.conf                       # Nginx config
    ├── index.html                       # HTML template
    ├── manifest.json                    # PWA manifest
    └── useScrollSpy.js                  # Custom hook
```

---

## 🚀 Deployment

### Quick Deploy to Azure

```powershell
# From sandbox-system/landing-page/
.\DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1
```

### Manual Deploy

**Step 1: Copy files to landing page directory**
```powershell
# Copy components
Copy-Item components/* ../../landing-page/src/components/ -Force

# Copy config
Copy-Item config/package.json ../../landing-page/
Copy-Item config/vite.config.js ../../landing-page/
Copy-Item config/tailwind.config.js ../../landing-page/
Copy-Item config/Dockerfile ../../landing-page/
Copy-Item config/nginx.conf ../../landing-page/

# Copy App
Copy-Item App.jsx ../../landing-page/src/
```

**Step 2: Install dependencies**
```powershell
cd ../../landing-page
npm install
```

**Step 3: Build**
```powershell
npm run build
```

**Step 4: Deploy to Azure**
```powershell
.\DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1
```

---

## 🎨 Landing Page Features

### 1. Hero Section
- ✅ Unified Arabic/English logo
- ✅ Main value proposition
- ✅ CTA buttons (Login, Try Demo, Book Demo)
- ✅ Animated background

### 2. Navigation
- ✅ Auto-hide header on scroll
- ✅ Scroll progress bar
- ✅ Active section tracking
- ✅ Floating side navigation
- ✅ Quick up/down navigation
- ✅ Mobile responsive menu

### 3. Dashboard Preview
- ✅ Interactive preview
- ✅ AI Agent Panel (6 agents)
- ✅ KPI cards
- ✅ Pre-filled demo data

### 4. Target Sectors
- ✅ 7 Saudi sectors
- ✅ Control counts per sector
- ✅ Framework tags
- ✅ Total: 3,200+ controls

### 5. Transformation Story
- ✅ 4-chapter cinematic gallery
- ✅ 3D rotating screens
- ✅ Saudi Arabic language
- ✅ Human-realistic animations
- ✅ Auto-play with controls

### 6. Platform Demo
- ✅ Interactive 4-step workflow
- ✅ Process demonstrations
- ✅ Smooth transitions
- ✅ Digital visual content

### 7. Trust Indicators
- ✅ 40+ Saudi Regulators
- ✅ 117 Total Frameworks
- ✅ 3,200+ Pre-loaded Controls
- ✅ 100% Arabic Support

### 8. Pricing
- ✅ Multiple tiers
- ✅ Feature comparison
- ✅ Arabic/English labels
- ✅ CTA buttons

### 9. Footer
- ✅ DoganConsult attribution
- ✅ Links to doganconsult.com
- ✅ Unified logo
- ✅ Social media links

---

## 🔌 Integrated Features

### Sandbox System
- ✅ Try Demo button (one-click access)
- ✅ Demo booking form (3-step)
- ✅ Creates temporary accounts
- ✅ Pre-populates demo data
- ✅ Backend API integration

### Services
- ✅ sandboxService.js (from frontend/services)
- ✅ bookingService.js (from frontend/services)

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:
```env
# Backend API
VITE_API_URL=https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api

# Frontend URL
VITE_FRONTEND_URL=https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io

# Optional: Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_AZURE_INSIGHTS_KEY=your-insights-key
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🎯 Component Usage

### Add Try Demo Button
```jsx
import TryDemoButton from './components/TryDemoButton'

// In any component:
<TryDemoButton variant="primary" size="large" />
<TryDemoButton variant="secondary" size="medium" />
<TryDemoButton variant="outline" size="small" />
```

### Add Demo Booking
```jsx
import { useState } from 'react'
import DemoBooking from './components/DemoBooking'

const [isDemoOpen, setIsDemoOpen] = useState(false)
const [bookingType, setBookingType] = useState('demo') // or 'poc'

<button onClick={() => setIsDemoOpen(true)}>Book Demo</button>
<DemoBooking 
  isOpen={isDemoOpen} 
  onClose={() => setIsDemoOpen(false)}
  type={bookingType}
/>
```

### Use Services
```javascript
import { quickAccessSandbox } from './services/sandboxService'
import { submitBooking } from './services/bookingService'

// Create sandbox
const session = await quickAccessSandbox()

// Submit booking
const result = await submitBooking(formData)
```

---

## 🏗️ Build Configuration

### Dockerfile (Multi-stage)
```dockerfile
# Stage 1: Build
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY public/logo.svg /usr/share/nginx/html/logo.svg
COPY public/manifest.json /usr/share/nginx/html/manifest.json
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
- ✅ SPA routing (fallback to index.html)
- ✅ Gzip compression
- ✅ Security headers
- ✅ Static asset caching (365 days)

---

## 🎨 Styling

### Tailwind Configuration
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1e40af',
        'brand-secondary': '#059669',
        'brand-accent': '#10b981',
        'brand-gold': '#f59e0b'
      },
      fontFamily: {
        'arabic': ['Tajawal', 'Cairo', 'sans-serif'],
        'english': ['Inter', 'Roboto', 'sans-serif']
      }
    }
  }
}
```

---

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1280px - 1920px)
- ✅ Tablet (768px - 1280px)
- ✅ Mobile (320px - 768px)

All components are fully responsive with:
- Mobile-first approach
- Touch-friendly interactions
- Optimized images
- Fast loading

---

## 🌍 Internationalization

### Arabic-First Design
- ✅ RTL (Right-to-Left) support
- ✅ Arabic font optimization
- ✅ Bilingual content
- ✅ Language-specific styling

### Implementation
```jsx
<div className="font-arabic" dir="rtl">
  Arabic Content
</div>
<div className="font-english" dir="ltr">
  English Content
</div>
```

---

## ⚡ Performance

### Optimization Features
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Minified assets
- ✅ Gzip compression
- ✅ Browser caching

### Build Stats
- index.html: ~1 KB
- CSS Bundle: ~27 KB (gzip: 5 KB)
- JS Bundle: ~297 KB (gzip: 92 KB)

---

## 🔒 Security

### Headers Configured
```nginx
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

---

## 🐛 Troubleshooting

### Build Fails
```powershell
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Styles Not Loading
```powershell
# Rebuild Tailwind
npx tailwindcss -i ./src/styles/index.css -o ./dist/output.css
```

### Components Not Found
```powershell
# Ensure all imports are correct
# Check file paths in imports
```

---

## 📞 Support

**Developed by:** DoganConsult  
**Email:** Ahmet@doganconsult.com  
**Website:** https://doganconsult.com  

---

## ✅ Deployment Checklist

- [ ] Copy components to landing-page/src/components/
- [ ] Copy services to landing-page/src/services/
- [ ] Copy config files to landing-page/
- [ ] Set environment variables (.env)
- [ ] Install dependencies (npm install)
- [ ] Build locally (npm run build)
- [ ] Test locally (npm run preview)
- [ ] Deploy to Azure
- [ ] Verify HTTPS URL works
- [ ] Test Try Demo button
- [ ] Test booking form
- [ ] Test all navigation
- [ ] Verify mobile responsive
- [ ] Check Arabic/English switching
- [ ] Monitor logs for errors

---

**Status:** ✅ Complete & Ready to Deploy  
**Last Updated:** November 2, 2025

