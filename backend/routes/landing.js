const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shahin_grc'
});
const nodemailer = require('nodemailer');

// ==========================================
// LANDING PAGE CMS ROUTES
// ==========================================

// Middleware stubs (adjust to your auth middleware)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  // Simplified: attach user (replace with JWT verification)
  req.user = { id: 1, role: 'admin' };
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET landing content (public)
router.get('/content', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM landing_content WHERE active = true ORDER BY updated_at DESC LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.json({
        heroTitle: 'شاهين للحوكمة — جاهزية سعودية من اليوم',
        heroSubtitle: 'أتمتة امتثال PDPL وNCA ECC وNDMO بمساعد ذكي عربي للقطاع الحكومي — مع تقييمات سريعة وإدارة أدلة ولوحات قياس تنفيذية، داخل بيئة تجريبية آمنة.'
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching landing content:', error);
    res.status(500).json({ error: 'Failed to fetch landing content' });
  }
});

// POST visitor request (public)
router.post('/requests', async (req, res) => {
  try {
    const { name, company, email, phone, date, type, package: pkg, features } = req.body;
    const result = await pool.query(
      `INSERT INTO landing_requests (name, company, email, phone, preferred_date, access_type, package, features, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())
       RETURNING *`,
      [name, company, email, phone, date, type, pkg, JSON.stringify(features)]
    );
    
    // Emit event for admins
    global.io?.emit('landing:new-request', result.rows[0]);
    
    res.json({ success: true, request: result.rows[0] });
  } catch (error) {
    console.error('Error creating landing request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// ==========================================
// ADMIN ROUTES (require authentication)
// ==========================================

// GET all landing requests (admin)
router.get('/admin/requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM landing_requests';
    const params = [];
    if (status && status !== 'all') {
      query += ' WHERE status = $1';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC LIMIT 200';
    
    const result = await pool.query(query, params);
    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Error fetching landing requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// POST approve request (admin)
router.post('/admin/requests/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { sendEmail } = req.body;
    
    // Get request details
    const reqResult = await pool.query('SELECT * FROM landing_requests WHERE id = $1', [id]);
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    const request = reqResult.rows[0];
    
    // Generate token
    const token = Buffer.from(`${request.email}|${Date.now()}|${request.access_type}`).toString('base64');
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${request.access_type}?token=${encodeURIComponent(token)}`;
    
    // Update status
    await pool.query(
      'UPDATE landing_requests SET status = $1, approved_at = NOW(), approval_token = $2 WHERE id = $3',
      ['approved', token, id]
    );
    
    // Send email if requested
    let emailSent = false;
    if (sendEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@shahinksa.com',
          to: request.email,
          subject: request.access_type === 'demo' ? 'تفعيل العرض التجريبي - شاهين' : 'تفعيل إثبات المفهوم - شاهين',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #f9fafb;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <h2 style="color: #059669; margin-bottom: 16px;">مرحبًا ${request.name}</h2>
                <p style="color: #374151; line-height: 1.6;">تم الموافقة على طلبك للوصول إلى ${request.access_type === 'demo' ? 'العرض التجريبي' : 'إثبات المفهوم'}.</p>
                <p style="color: #374151; line-height: 1.6;">يمكنك الآن الدخول إلى المنصة عبر الرابط التالي:</p>
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${link}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #059669, #10b981); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">ابدأ الآن</a>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">صلاحية الوصول: ${request.access_type === 'demo' ? 'يوم واحد' : '٤ أيام'}</p>
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">الحزمة: ${request.package}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">فريق شاهين للحوكمة<br/>المملكة العربية السعودية</p>
              </div>
            </div>
          `
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    }
    
    res.json({
      success: true,
      message: emailSent ? 'تم إرسال رسالة التأكيد' : 'تمت الموافقة',
      token,
      link,
      emailSent
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// POST reject request (admin)
router.post('/admin/requests/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    await pool.query(
      'UPDATE landing_requests SET status = $1, rejected_at = NOW(), rejection_reason = $2 WHERE id = $3',
      ['rejected', reason, id]
    );
    
    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// GET landing content (admin)
router.get('/admin/content', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM landing_content WHERE active = true ORDER BY updated_at DESC LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.json({
        heroTitle: 'شاهين للحوكمة — جاهزية سعودية من اليوم',
        heroSubtitle: 'أتمتة امتثال PDPL وNCA ECC وNDMO بمساعد ذكي عربي للقطاع الحكومي — مع تقييمات سريعة وإدارة أدلة ولوحات قياس تنفيذية، داخل بيئة تجريبية آمنة.'
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching landing content:', error);
    res.status(500).json({ error: 'Failed to fetch landing content' });
  }
});

// PUT landing content (admin)
router.put('/admin/content', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { heroTitle, heroSubtitle } = req.body;
    
    // Deactivate old content
    await pool.query('UPDATE landing_content SET active = false');
    
    // Insert new content
    const result = await pool.query(
      `INSERT INTO landing_content (hero_title, hero_subtitle, active, updated_at, updated_by)
       VALUES ($1, $2, true, NOW(), $3)
       RETURNING *`,
      [heroTitle, heroSubtitle, req.user.id]
    );
    
    res.json({ success: true, content: result.rows[0] });
  } catch (error) {
    console.error('Error updating landing content:', error);
    res.status(500).json({ error: 'Failed to update landing content' });
  }
});

module.exports = router;

