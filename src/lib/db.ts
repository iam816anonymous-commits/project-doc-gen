import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'jules.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
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
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    payment_status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
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
`);

export default db;
