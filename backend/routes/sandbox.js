const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shahin_grc'
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ==========================================
// SANDBOX/PLAYGROUND ROUTES (Public)
// ==========================================

/**
 * CREATE SANDBOX SESSION
 * POST /api/sandbox/create
 * Creates a temporary demo account with pre-populated data
 */
router.post('/create', async (req, res) => {
  try {
    const {
      email,
      name,
      source,
      sessionType,
      expiresIn,
      features,
      metadata
    } = req.body;

    // Generate unique sandbox username
    const sandboxUsername = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempPassword = Math.random().toString(36).substr(2, 12) + 'A1!'; // Random but meets requirements
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Calculate expiration (default 24 hours)
    const expirationHours = expiresIn ? expiresIn / 3600 : 24;
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    // Create sandbox user
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_sandbox, 
       sandbox_expires_at, is_active, created_at)
       VALUES ($1, $2, $3, $4, 'assessor', true, $5, true, NOW())
       RETURNING id, username, email, full_name`,
      [sandboxUsername, email, hashedPassword, name || 'Demo User', expiresAt]
    );

    const user = userResult.rows[0];

    // Create sandbox session record
    const sessionResult = await pool.query(
      `INSERT INTO sandbox_sessions (user_id, session_type, source, features, metadata, 
       expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, session_type, expires_at`,
      [user.id, sessionType || 'playground', source || 'landing-page', 
       JSON.stringify(features || {}), JSON.stringify(metadata || {}), expiresAt]
    );

    const session = sessionResult.rows[0];

    // Create demo organization for user
    const orgResult = await pool.query(
      `INSERT INTO organizations (name, type, country, is_demo, created_by, created_at)
       VALUES ($1, 'private_sector', 'SA', true, $2, NOW())
       RETURNING id, name`,
      [`${name || 'Demo'} Organization`, user.id]
    );

    const org = orgResult.rows[0];

    // Link user to organization
    await pool.query(
      `INSERT INTO user_organizations (user_id, organization_id, role, created_at)
       VALUES ($1, $2, 'admin', NOW())`,
      [user.id, org.id]
    );

    // Pre-populate demo data
    await populateSandboxData(user.id, org.id, sessionType);

    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: 'assessor',
        isSandbox: true,
        sessionId: session.id,
        orgId: org.id
      },
      JWT_SECRET,
      { expiresIn: `${expirationHours}h` }
    );

    // Log sandbox creation
    console.log(`Sandbox session created: ${session.id} for user: ${user.username}`);

    res.json({
      success: true,
      sessionId: session.id,
      accessToken: accessToken,
      username: sandboxUsername,
      password: tempPassword, // Send only once for initial login
      expiresAt: expiresAt.toISOString(),
      message: 'Sandbox session created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name
      },
      organization: {
        id: org.id,
        name: org.name
      }
    });

  } catch (error) {
    console.error('Sandbox creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create sandbox session',
      message: error.message 
    });
  }
});

/**
 * REQUEST GUIDED DEMO
 * POST /api/sandbox/guided-demo
 * Creates sandbox + books a guided demo session
 */
router.post('/guided-demo', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      preferredDate,
      preferredTime,
      sector,
      companySize,
      message
    } = req.body;

    // Create landing request (demo booking)
    const requestResult = await pool.query(
      `INSERT INTO landing_requests (name, company, email, phone, preferred_date, 
       access_type, package, features, message, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'demo', $6, $7, $8, 'pending', NOW())
       RETURNING id`,
      [name, company, email, phone, preferredDate, companySize, sector, message || '']
    );

    const bookingId = requestResult.rows[0].id;

    // Create sandbox session
    const sandboxRequest = {
      email,
      name,
      source: 'guided-demo',
      sessionType: 'demo',
      expiresIn: 7 * 24 * 60 * 60, // 7 days for guided demo
      features: { all: true },
      metadata: { bookingId, phone, company }
    };

    // Reuse sandbox creation logic
    const sandboxUsername = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempPassword = Math.random().toString(36).substr(2, 12) + 'A1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const userResult = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_sandbox, 
       sandbox_expires_at, is_active, created_at)
       VALUES ($1, $2, $3, $4, 'assessor', true, $5, true, NOW())
       RETURNING id, username`,
      [sandboxUsername, email, hashedPassword, name, expiresAt]
    );

    const user = userResult.rows[0];

    // Link sandbox to booking
    await pool.query(
      `UPDATE landing_requests SET sandbox_user_id = $1 WHERE id = $2`,
      [user.id, bookingId]
    );

    const accessToken = jwt.sign(
      { userId: user.id, username: user.username, role: 'assessor', isSandbox: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      bookingId: bookingId,
      message: 'Guided demo booked successfully',
      sandboxSession: {
        sessionId: user.id,
        accessToken: accessToken,
        username: sandboxUsername,
        password: tempPassword,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Guided demo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to book guided demo',
      message: error.message
    });
  }
});

/**
 * SEND SANDBOX FEEDBACK
 * POST /api/sandbox/:sessionId/feedback
 */
router.post('/:sessionId/feedback', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      rating,
      experience,
      features,
      issues,
      suggestions,
      wouldRecommend,
      interestedInPurchase,
      contactForFollowup
    } = req.body;

    await pool.query(
      `INSERT INTO sandbox_feedback (session_id, rating, experience, features, issues, 
       suggestions, would_recommend, interested_in_purchase, contact_for_followup, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [sessionId, rating, experience, JSON.stringify(features || []), 
       JSON.stringify(issues || []), suggestions || '', wouldRecommend, 
       interestedInPurchase, contactForFollowup]
    );

    // Emit event for admin notification
    global.io?.emit('sandbox:feedback-received', { sessionId, rating, interestedInPurchase });

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Sandbox feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

/**
 * CONTACT FORM
 * POST /api/contact
 */
router.post('/contact', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      subject,
      message,
      type
    } = req.body;

    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, company, subject, message, 
       type, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', NOW())
       RETURNING id`,
      [name, email, phone || null, company || null, subject, message, type || 'general']
    );

    const ticketId = `CONTACT-${result.rows[0].id}`;

    // Emit event for admin notification
    global.io?.emit('contact:new-message', { ticketId, name, email, type });

    res.json({
      success: true,
      message: 'Message sent successfully. We will contact you soon.',
      ticketId: ticketId
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Populate sandbox with demo data
 */
async function populateSandboxData(userId, orgId, sessionType) {
  try {
    // Get sample frameworks (e.g., NCA ECC, PDPL)
    const frameworksResult = await pool.query(
      `SELECT id, name_en, name_ar FROM frameworks 
       WHERE name_en IN ('NCA-ECC', 'PDPL', 'NDMO') 
       LIMIT 3`
    );

    if (frameworksResult.rows.length === 0) return;

    const frameworks = frameworksResult.rows;

    // Create demo assessments for each framework
    for (const fw of frameworks) {
      const assessmentResult = await pool.query(
        `INSERT INTO assessments (title, description, framework_id, organization_id, 
         status, assigned_to, created_by, is_demo, created_at)
         VALUES ($1, $2, $3, $4, 'in_progress', $5, $5, true, NOW())
         RETURNING id`,
        [
          `Demo Assessment: ${fw.name_en}`,
          `This is a demo assessment for ${fw.name_en} framework`,
          fw.id,
          orgId,
          userId
        ]
      );

      const assessmentId = assessmentResult.rows[0].id;

      // Get sample controls for this framework
      const controlsResult = await pool.query(
        `SELECT id FROM framework_controls 
         WHERE framework_id = $1 
         LIMIT 10`,
        [fw.id]
      );

      // Add some control assessments with demo statuses
      for (let i = 0; i < controlsResult.rows.length; i++) {
        const control = controlsResult.rows[i];
        const statuses = ['compliant', 'partially_compliant', 'non_compliant', 'not_assessed'];
        const randomStatus = statuses[i % statuses.length];

        await pool.query(
          `INSERT INTO assessment_controls (assessment_id, control_id, status, 
           implementation_status, notes, is_demo, created_at)
           VALUES ($1, $2, $3, $4, $5, true, NOW())`,
          [
            assessmentId,
            control.id,
            randomStatus,
            randomStatus === 'compliant' ? 'implemented' : 'in_progress',
            `Demo note for control ${i + 1}`
          ]
        );
      }
    }

    console.log(`Demo data populated for user ${userId}`);
  } catch (error) {
    console.error('Error populating sandbox data:', error);
  }
}

module.exports = router;

