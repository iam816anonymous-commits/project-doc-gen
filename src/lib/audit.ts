import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function logAudit(action: string, performedBy: string, details?: any) {
  try {
    const id = uuidv4();
    db.prepare('INSERT INTO audit_logs (id, action, performed_by, details) VALUES (?, ?, ?, ?)')
      .run(id, action, performedBy, details ? JSON.stringify(details) : null);
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
