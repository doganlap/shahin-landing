# 🎮 Sandbox/Playground Implementation Complete

## ✅ What Has Been Implemented

Your Shahin GRC landing page now has a **complete sandbox/playground system** that allows visitors to:
1. **Try the app instantly** without registration
2. **Book demos** with backend integration
3. **Submit feedback** from sandbox sessions
4. **Contact you** through integrated forms

---

## 🏗️ Architecture Overview

```
Landing Page (React)
    ↓
Sandbox Service (Frontend)
    ↓
Backend API (Production)
    ↓
PostgreSQL Database
    ↓
Creates Temporary Users + Demo Data
```

---

## 📦 What Was Created

### 1. Frontend Components & Services

#### **Services Created:**

**`landing-page/src/services/sandboxService.js`**
- ✅ `createSandboxSession()` - Creates temporary demo account
- ✅ `quickAccessSandbox()` - One-click demo access
- ✅ `requestGuidedDemo()` - Books demo + creates sandbox
- ✅ `sendSandboxFeedback()` - Collects user feedback
- ✅ `sendContactMessage()` - General contact form
- ✅ `getRecentSandboxSessions()` - Track user's sandbox history
- ✅ `reopenSandboxSession()` - Resume previous sandbox

**`landing-page/src/services/bookingService.js`** (Updated)
- ✅ Connected to production backend API
- ✅ Points to: `https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api`

#### **Components Created:**

**`landing-page/src/components/TryDemoButton.jsx`**
- ✅ One-click "Try Now" button
- ✅ Creates sandbox session automatically
- ✅ Opens app in new tab with temporary access
- ✅ Shows loading and success states
- ✅ 3 variants: primary, secondary, outline
- ✅ 3 sizes: small, medium, large

---

### 2. Backend API Endpoints

#### **`backend/routes/sandbox.js`** (NEW)

**Public Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sandbox/create` | POST | Create instant sandbox session |
| `/api/sandbox/guided-demo` | POST | Book demo + create sandbox |
| `/api/sandbox/:id/feedback` | POST | Submit sandbox feedback |
| `/api/contact` | POST | General contact form |

**What Each Endpoint Does:**

**1. Create Sandbox Session**
```javascript
POST /api/sandbox/create
{
  "email": "user@example.com",
  "name": "John Doe",
  "sessionType": "playground", // 'playground', 'demo', or 'poc'
  "expiresIn": 86400 // 24 hours in seconds
}

Response:
{
  "sessionId": "123",
  "accessToken": "eyJhbGc...",
  "username": "sandbox_1234567890_abc123",
  "password": "temp_pass_A1!",
  "sandboxUrl": "https://grc-frontend-prod...?token=...",
  "expiresAt": "2025-11-03T10:00:00Z"
}
```

**What Happens Automatically:**
1. ✅ Creates temporary user account
2. ✅ Creates demo organization
3. ✅ Pre-populates with sample assessments
4. ✅ Adds demo controls and frameworks
5. ✅ Generates access token (JWT)
6. ✅ Sets 24-hour expiration
7. ✅ Returns login credentials

**2. Guided Demo Request**
```javascript
POST /api/sandbox/guided-demo
{
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "+966 50 123 4567",
  "company": "Acme Corp",
  "preferredDate": "2025-11-05",
  "preferredTime": "10:00 AM"
}

Response:
{
  "bookingId": 456,
  "sandboxSession": {
    "sessionId": "789",
    "accessToken": "...",
    "username": "demo_...",
    "password": "..."
  }
}
```

**What Happens:**
1. ✅ Creates booking in database
2. ✅ Creates 7-day sandbox session
3. ✅ Links sandbox to booking
4. ✅ Admin gets notified
5. ✅ User gets access immediately

**3. Sandbox Feedback**
```javascript
POST /api/sandbox/:sessionId/feedback
{
  "rating": 5,
  "experience": "excellent",
  "features": ["ai_agents", "dashboards", "arabic_ui"],
  "issues": [],
  "suggestions": "Great platform!",
  "wouldRecommend": true,
  "interestedInPurchase": true,
  "contactForFollowup": true
}
```

**4. Contact Form**
```javascript
POST /api/contact
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "phone": "+966 50 987 6543",
  "company": "Tech Corp",
  "subject": "Pricing inquiry",
  "message": "I'd like to know more about your enterprise plan",
  "type": "sales" // 'general', 'sales', 'support', 'partnership'
}
```

---

### 3. Database Schema

#### **`backend/migrations/002_sandbox_system.sql`** (NEW)

**Tables Created:**

**1. `sandbox_sessions`**
- Tracks all sandbox/playground sessions
- Links to user accounts
- Stores session type, features, metadata
- Tracks expiration and access count

**2. `sandbox_feedback`**
- Collects feedback from sandbox users
- Ratings, experience, features, issues
- Purchase interest tracking
- Follow-up requests

**3. `contact_messages`**
- General contact form submissions
- Subject, message, type (sales/support/etc.)
- Status tracking (new, in_progress, resolved)
- Can be assigned to team members

**Fields Added to Existing Tables:**
- `users.is_sandbox` - Identifies sandbox users
- `users.sandbox_expires_at` - Expiration timestamp
- `landing_requests.sandbox_user_id` - Links booking to sandbox
- `organizations.is_demo` - Marks demo organizations
- `assessments.is_demo` - Marks demo assessments

---

## 🚀 How It Works - User Flow

### Flow 1: Instant Sandbox Access

```
1. Visitor clicks "Try Now" button on landing page
   ↓
2. Frontend calls createSandboxSession()
   ↓
3. Backend creates:
   - Temporary user (sandbox_1234567890_abc123)
   - Demo organization
   - 3 sample assessments (NCA-ECC, PDPL, NDMO)
   - 10 sample controls per assessment
   - Pre-filled with demo data
   ↓
4. Backend returns access token
   ↓
5. Frontend opens app in new tab with token
   ↓
6. User is logged in automatically
   ↓
7. User explores full app with demo data
   ↓
8. Session expires after 24 hours (auto-cleanup)
```

### Flow 2: Guided Demo with Booking

```
1. Visitor fills demo booking form
   ↓
2. Frontend submits booking data
   ↓
3. Backend creates:
   - Booking record (landing_requests table)
   - 7-day sandbox session
   - Links sandbox to booking
   ↓
4. Admin gets notification (real-time via Socket.IO)
   ↓
5. User gets immediate sandbox access
   ↓
6. Admin contacts user at scheduled time
   ↓
7. Admin guides user through sandbox
```

---

## 🎯 How to Use This System

### For Visitors (Landing Page)

**Option 1: Instant Try**
```jsx
// Add this button anywhere on landing page
import TryDemoButton from './components/TryDemoButton'

<TryDemoButton 
  variant="primary"  // or 'secondary', 'outline'
  size="large"       // or 'medium', 'small'
/>
```

**Option 2: Book Guided Demo**
- Existing DemoBooking component already updated
- Now creates sandbox automatically
- User gets instant access while waiting for scheduled demo

### For Administrators

**View Sandbox Sessions:**
```sql
-- All active sandbox sessions
SELECT * FROM sandbox_sessions 
WHERE is_active = TRUE 
AND expires_at > NOW()
ORDER BY created_at DESC;

-- Feedback from high-interest users
SELECT s.*, f.*
FROM sandbox_sessions s
JOIN sandbox_feedback f ON s.id = f.session_id
WHERE f.interested_in_purchase = TRUE
AND f.contact_for_followup = TRUE
ORDER BY f.rating DESC;
```

**Monitor Conversions:**
```sql
-- Sandbox users who booked demos
SELECT u.email, u.full_name, 
       s.session_type, s.created_at,
       r.preferred_date, r.status
FROM users u
JOIN sandbox_sessions s ON u.id = s.user_id
JOIN landing_requests r ON u.id = r.sandbox_user_id
WHERE u.is_sandbox = TRUE
ORDER BY s.created_at DESC;
```

---

## 🔐 Security Features

### Session Security
- ✅ **JWT Tokens** - Secure, short-lived (24 hours)
- ✅ **Auto-Expiration** - Sessions auto-deactivate
- ✅ **Isolated Data** - Each sandbox has separate demo data
- ✅ **No Real Data Access** - Sandboxes can't see production data

### User Isolation
- ✅ `is_sandbox` flag prevents confusion
- ✅ `is_demo` flag on all demo data
- ✅ Separate cleanup routines
- ✅ Cannot upgrade sandbox to real account (prevents abuse)

### Rate Limiting (Recommended to Add)
```javascript
// Add to backend/routes/sandbox.js
const rateLimit = require('express-rate-limit');

const sandboxLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 sandbox creations per IP
  message: 'Too many sandbox requests. Please try again later.'
});

router.post('/create', sandboxLimiter, async (req, res) => {
  // ... existing code
});
```

---

## 🧹 Data Cleanup

### Auto-Cleanup Function
```sql
-- Run this periodically (via cron or pg_cron)
SELECT cleanup_expired_sandboxes();

-- Manually cleanup old sandbox data (30+ days old)
DELETE FROM users 
WHERE is_sandbox = TRUE 
AND sandbox_expires_at < NOW() - INTERVAL '30 days';

DELETE FROM sandbox_sessions
WHERE expires_at < NOW() - INTERVAL '30 days';
```

### Cleanup Schedule (Recommended)
```sql
-- Requires pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Hourly: Deactivate expired sessions
SELECT cron.schedule(
  'cleanup-sandboxes-hourly',
  '0 * * * *',
  $$SELECT cleanup_expired_sandboxes()$$
);

-- Daily: Delete very old sandbox data
SELECT cron.schedule(
  'cleanup-sandboxes-daily',
  '0 2 * * *',
  $$DELETE FROM users WHERE is_sandbox = TRUE AND sandbox_expires_at < NOW() - INTERVAL '30 days'$$
);
```

---

## 📊 Analytics & Tracking

### Events Tracked
- `sandbox_created` - New sandbox session
- `sandbox_reopened` - User returned to existing sandbox
- `sandbox_error` - Creation failed
- `feedback_submitted` - User submitted feedback
- `contact_submitted` - Contact form submitted
- `guided_demo_requested` - Guided demo booked

### Integration with Analytics Platforms
```javascript
// Already integrated in sandboxService.js:
- Google Analytics 4
- Azure Application Insights
- Facebook Pixel (optional)
- LinkedIn Insight Tag (optional)
```

---

## 🔧 Configuration

### Environment Variables Needed

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/shahin_grc

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend URL (for sandbox redirects)
FRONTEND_URL=https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io

# Optional: Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend** (`landing-page/.env`):
```env
# Backend API
VITE_API_URL=https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api

# Frontend URL
VITE_FRONTEND_URL=https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io

# Optional: Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_AZURE_INSIGHTS_KEY=your-insights-key
```

---

## 🚀 Deployment Steps

### 1. Run Database Migration
```bash
# In backend directory
psql $DATABASE_URL < migrations/002_sandbox_system.sql
```

### 2. Add Sandbox Route to Backend
```javascript
// backend/server.js or app.js
const sandboxRoutes = require('./routes/sandbox');
app.use('/api/sandbox', sandboxRoutes);

// Also add contact route
app.post('/api/contact', sandboxRoutes);
```

### 3. Deploy Backend
```bash
# Build and deploy backend
cd backend
docker build -t grc-backend:latest .
az containerapp update --name grc-backend-prod \
  --resource-group rg-grc-assessment-prod \
  --image grcacr202511012324.azurecr.io/grc-backend:latest
```

### 4. Deploy Landing Page
```bash
# Build and deploy landing page
cd landing-page
.\DEPLOY_LANDING_PAGE_AZURE_CONTAINERAPP.ps1
```

---

## 📝 Next Steps & Recommendations

### Immediate (Required):
1. ✅ Run database migration
2. ✅ Add sandbox routes to backend
3. ✅ Deploy backend with new routes
4. ✅ Deploy landing page with Try Demo button
5. ✅ Test sandbox creation end-to-end

### Short-term (Recommended):
6. ⬜ Add rate limiting to sandbox endpoints
7. ⬜ Set up email notifications for bookings
8. ⬜ Configure analytics tracking
9. ⬜ Add admin dashboard to view sandbox sessions
10. ⬜ Set up automated cleanup job (pg_cron)

### Long-term (Optional):
11. ⬜ Add video tutorials within sandbox
12. ⬜ Track feature usage in sandbox sessions
13. ⬜ A/B test different sandbox durations
14. ⬜ Add guided tours for first-time sandbox users
15. ⬜ Integrate with CRM (HubSpot, Salesforce, etc.)

---

## 🎓 Usage Examples

### Example 1: Add Try Demo to Hero Section
```jsx
// In Hero.jsx
import TryDemoButton from './TryDemoButton'

<div className="flex gap-4">
  <TryDemoButton variant="primary" size="large" />
  <button className="secondary-button">احجز عرض توضيحي</button>
</div>
```

### Example 2: Add to Header
```jsx
// In Header.jsx
import TryDemoButton from './TryDemoButton'

<div className="flex items-center gap-4">
  <a href="/login">تسجيل الدخول</a>
  <TryDemoButton variant="secondary" size="medium" />
</div>
```

### Example 3: Collect Feedback After Sandbox
```javascript
// In your main app (not landing page)
import { sendSandboxFeedback } from '../services/sandboxService'

const handleFeedback = async () => {
  await sendSandboxFeedback(sessionId, {
    rating: 5,
    experience: 'excellent',
    features: ['ai_agents', 'dashboards'],
    wouldRecommend: true,
    interestedInPurchase: true
  })
}
```

---

## 🐛 Troubleshooting

### Issue: Sandbox not creating
**Check:**
1. Backend API is reachable
2. Database migration ran successfully
3. JWT_SECRET is set
4. CORS is configured correctly

### Issue: Sandbox expires immediately
**Check:**
1. Server timezone is correct
2. `sandbox_expires_at` is set properly
3. Frontend and backend times are synchronized

### Issue: Demo data not showing
**Check:**
1. Framework data exists in database
2. `populateSandboxData()` function completed
3. `is_demo` flags are set correctly

---

## ✅ Success Criteria

Your sandbox system is working correctly when:
- ✅ Clicking "Try Now" opens app in new tab
- ✅ User is logged in automatically
- ✅ Demo assessments and controls are visible
- ✅ User can navigate full app
- ✅ Session expires after set time
- ✅ Feedback can be submitted
- ✅ Contact form works
- ✅ Admin can see sandbox sessions in database

---

## 📞 Support

**Implementation by:** DoganConsult  
**Questions?** Email: Ahmet@doganconsult.com  
**Documentation:** This file + code comments  

---

**🎉 Your sandbox/playground system is now complete and ready to convert visitors into customers!**

*Last updated: November 2, 2025*  
*System Status: Implemented, ready for deployment*

