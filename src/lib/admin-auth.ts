import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function getAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;

  if (!sessionId) return null;

  const session = db.prepare(`
    SELECT a.* FROM admin_sessions s
    JOIN admins a ON s.admin_id = a.id
    WHERE s.id = ? AND s.expires_at > datetime("now")
  `).get(sessionId) as any;

  return session || null;
}
