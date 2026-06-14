import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'jules.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    free_generation_credits INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    project_type TEXT NOT NULL,
    tech_stack TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    features TEXT NOT NULL,
    team_size INTEGER,
    academic_level TEXT NOT NULL,
    content JSON NOT NULL,
    is_paid BOOLEAN DEFAULT 0,
    github_url TEXT,
    university TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payment_submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    screenshot_path TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS report_cache (
    id TEXT PRIMARY KEY,
    fingerprint TEXT UNIQUE NOT NULL,
    embedding JSON,
    project_title TEXT NOT NULL,
    category TEXT NOT NULL,
    tech_stack TEXT NOT NULL,
    features_json TEXT NOT NULL,
    academic_level TEXT NOT NULL,
    generated_content_json TEXT NOT NULL,
    github_url TEXT,
    university TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_fingerprint ON report_cache(fingerprint);
  CREATE INDEX IF NOT EXISTS idx_cache_title ON report_cache(project_title);

  CREATE TABLE IF NOT EXISTS auth_tokens (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agreement_acceptances (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    terms_version TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    what_was_useful TEXT,
    what_was_missing TEXT,
    what_confused_you TEXT,
    recommend BOOLEAN,
    comment TEXT,
    issue_type TEXT,
    page_url TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    reward_granted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_id TEXT NOT NULL,
    status TEXT DEFAULT 'REGISTERED', -- REGISTERED, CONVERTED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referred_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referral_evidence (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_path TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    verification_notes TEXT,
    group_name TEXT,
    member_count INTEGER,
    timestamp_visible BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    performed_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS otps (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'EDITOR', -- SUPERADMIN, EDITOR
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
  );

  CREATE TABLE IF NOT EXISTS university_templates (
    id TEXT PRIMARY KEY,
    university_name TEXT NOT NULL,
    department TEXT,
    regulation_year TEXT,
    degree_type TEXT,
    sample_file_path TEXT,
    cover_page_structure JSON,
    certificate_structure JSON,
    declaration_structure JSON,
    acknowledgement_structure JSON,
    heading_styles JSON,
    font_family TEXT,
    font_size INTEGER,
    page_margins JSON,
    line_spacing REAL,
    toc_structure JSON,
    reference_style TEXT,
    formatting_rules_json JSON,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, VERIFIED, ACTIVE
    confidence_score REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS template_contributions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    university_name TEXT NOT NULL,
    department TEXT,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- PDF, DOCX
    status TEXT DEFAULT 'PENDING', -- PENDING, ANALYZED, REJECTED
    reward_granted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_uni_name ON university_templates(university_name);
`);

// Handle migrations for existing tables
try {
  db.exec(`ALTER TABLE users ADD COLUMN referral_code TEXT`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE users ADD COLUMN referred_by TEXT`);
} catch (e) {}
try {
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE users ADD COLUMN free_generation_credits INTEGER DEFAULT 0`);
} catch (e) {}

export default db;
