-- ==========================================
-- SANDBOX/PLAYGROUND SYSTEM MIGRATION
-- ==========================================
-- Creates tables for sandbox sessions, feedback, and contact messages

-- Add sandbox fields to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sandbox_expires_at TIMESTAMP;

-- Add sandbox user link to landing requests
ALTER TABLE landing_requests ADD COLUMN IF NOT EXISTS sandbox_user_id INTEGER REFERENCES users(id);
ALTER TABLE landing_requests ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(20);
ALTER TABLE landing_requests ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE landing_requests ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;

-- Sandbox sessions table
CREATE TABLE IF NOT EXISTS sandbox_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(50) NOT NULL, -- 'playground', 'demo', 'poc'
  source VARCHAR(100) DEFAULT 'landing-page',
  features JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP NOT NULL,
  last_accessed_at TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_sandbox_user (user_id),
  INDEX idx_sandbox_expires (expires_at),
  INDEX idx_sandbox_type (session_type)
);

-- Sandbox feedback table
CREATE TABLE IF NOT EXISTS sandbox_feedback (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sandbox_sessions(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  experience VARCHAR(50), -- 'excellent', 'good', 'fair', 'poor'
  features JSONB DEFAULT '[]', -- Array of liked features
  issues JSONB DEFAULT '[]', -- Array of encountered issues
  suggestions TEXT,
  would_recommend BOOLEAN DEFAULT FALSE,
  interested_in_purchase BOOLEAN DEFAULT FALSE,
  contact_for_followup BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_feedback_session (session_id),
  INDEX idx_feedback_rating (rating),
  INDEX idx_feedback_interested (interested_in_purchase)
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general', -- 'general', 'sales', 'support', 'partnership'
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'in_progress', 'resolved', 'closed'
  assigned_to INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_contact_email (email),
  INDEX idx_contact_status (status),
  INDEX idx_contact_type (type),
  INDEX idx_contact_created (created_at DESC)
);

-- Add demo flag to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add demo flag to assessments
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add demo flag to assessment_controls
ALTER TABLE assessment_controls ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Create index for demo data cleanup
CREATE INDEX IF NOT EXISTS idx_users_sandbox_expires ON users(sandbox_expires_at) WHERE is_sandbox = TRUE;
CREATE INDEX IF NOT EXISTS idx_orgs_demo ON organizations(is_demo) WHERE is_demo = TRUE;
CREATE INDEX IF NOT EXISTS idx_assessments_demo ON assessments(is_demo) WHERE is_demo = TRUE;

-- Create function to auto-cleanup expired sandbox data
CREATE OR REPLACE FUNCTION cleanup_expired_sandboxes()
RETURNS void AS $$
BEGIN
  -- Deactivate expired sandbox sessions
  UPDATE sandbox_sessions 
  SET is_active = FALSE 
  WHERE expires_at < NOW() AND is_active = TRUE;
  
  -- Deactivate expired sandbox users
  UPDATE users 
  SET is_active = FALSE 
  WHERE is_sandbox = TRUE 
    AND sandbox_expires_at < NOW() 
    AND is_active = TRUE;
    
  -- Note: Actual deletion is done separately to preserve feedback
  -- DELETE FROM users WHERE is_sandbox = TRUE AND sandbox_expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sandboxes', '0 * * * *', 'SELECT cleanup_expired_sandboxes()');

-- Comments for documentation
COMMENT ON TABLE sandbox_sessions IS 'Tracks temporary sandbox/playground sessions for visitors';
COMMENT ON TABLE sandbox_feedback IS 'Collects feedback from sandbox users about their experience';
COMMENT ON TABLE contact_messages IS 'Stores general contact form submissions from landing page';
COMMENT ON COLUMN users.is_sandbox IS 'Indicates if this is a temporary sandbox/demo user';
COMMENT ON COLUMN users.sandbox_expires_at IS 'Expiration timestamp for sandbox users';

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON sandbox_sessions TO app_user;
-- GRANT SELECT, INSERT ON sandbox_feedback TO app_user;
-- GRANT SELECT, INSERT, UPDATE ON contact_messages TO app_user;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Sandbox system migration completed successfully';
END $$;

