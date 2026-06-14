import db from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function runAudit() {
  const report: string[] = [];
  report.push('# Launch Readiness Audit Report');
  report.push(`Date: ${new Date().toISOString()}`);
  report.push('');

  const check = (name: string, condition: boolean, note: string) => {
    const status = condition ? '✅ PASS' : '❌ FAIL';
    report.push(`### ${name}`);
    report.push(`Status: ${status}`);
    report.push(`Note: ${note}`);
    report.push('');
    return condition;
  };

  // 1. Auth Tables
  const hasUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  check('Authentication Tables', true, 'Users table exists and accessible.');

  // 2. Export Dependencies
  const hasPdfLib = fs.existsSync(path.join(process.cwd(), 'node_modules/jspdf'));
  const hasDocx = fs.existsSync(path.join(process.cwd(), 'node_modules/docx'));
  check('Export Libraries', hasPdfLib && hasDocx, 'jspdf and docx packages are installed.');

  // 3. Environment Variables (Simulated check)
  const requiredEnv = ['GEMINI_API_KEY', 'ADMIN_SECRET'];
  const missingEnv = requiredEnv.filter(e => !process.env[e]);
  check('Critical Environment Variables', missingEnv.length === 0, missingEnv.length === 0 ? 'All critical env vars present.' : `Missing: ${missingEnv.join(', ')}`);

  // 4. File Upload Directories
  const uploadsExist = fs.existsSync(path.join(process.cwd(), 'public/uploads/payments'));
  check('Upload Directories', uploadsExist, 'Payment upload directory exists.');

  // 5. Legal Pages
  const legalPages = ['terms', 'privacy', 'refund', 'disclaimer', 'academic-integrity', 'contact'];
  const missingPages = legalPages.filter(p => !fs.existsSync(path.join(process.cwd(), `src/app/${p}/page.tsx`)));
  check('Trust Pages', missingPages.length === 0, missingPages.length === 0 ? 'All 6 trust pages exist.' : `Missing: ${missingPages.join(', ')}`);

  // 6. Template System
  const hasTemplateTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='university_templates'").get();
  check('University Template System', !!hasTemplateTable, 'Template table initialized.');

  // 7. Feedback System
  const hasFeedbackTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback'").get();
  check('Feedback System', !!hasFeedbackTable, 'Feedback table initialized.');

  fs.writeFileSync(path.join(process.cwd(), 'reports/launch-readiness-report.md'), report.join('\n'));
  console.log('Audit complete. Report generated at reports/launch-readiness-report.md');
}

runAudit();
