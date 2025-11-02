-- Landing Page CMS Tables
-- Run this migration to create the landing page content and request tables

-- Landing content table (for hero text injection)
CREATE TABLE IF NOT EXISTS landing_content (
  id SERIAL PRIMARY KEY,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Landing requests table (for demo/POC requests)
CREATE TABLE IF NOT EXISTS landing_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  preferred_date DATE,
  preferred_time VARCHAR(20),
  access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('demo', 'poc')),
  package VARCHAR(100),
  features JSONB,
  message TEXT,
  lead_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'cancelled')),
  approval_token TEXT,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Prevent double booking for same date/time/type
  CONSTRAINT unique_booking UNIQUE (preferred_date, preferred_time, access_type, status) 
    WHERE status IN ('pending', 'approved', 'confirmed')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_landing_content_active ON landing_content(active, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_landing_requests_status ON landing_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_landing_requests_email ON landing_requests(email);
CREATE INDEX IF NOT EXISTS idx_landing_requests_date_time ON landing_requests(preferred_date, preferred_time, access_type);
CREATE INDEX IF NOT EXISTS idx_landing_requests_date ON landing_requests(preferred_date, access_type, status);

-- Insert default content
INSERT INTO landing_content (hero_title, hero_subtitle, active, updated_at)
VALUES (
  'شاهين للحوكمة — جاهزية سعودية من اليوم',
  'أتمتة امتثال PDPL وNCA ECC وNDMO بمساعد ذكي عربي للقطاع الحكومي — مع تقييمات سريعة وإدارة أدلة ولوحات قياس تنفيذية، داخل بيئة تجريبية آمنة.',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Grant permissions (adjust based on your setup)
-- GRANT SELECT ON landing_content TO public;
-- GRANT INSERT ON landing_requests TO public;
-- GRANT ALL ON landing_content TO admin_role;
-- GRANT ALL ON landing_requests TO admin_role;

