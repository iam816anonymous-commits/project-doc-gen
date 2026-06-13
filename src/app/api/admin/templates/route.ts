import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;
  if (!sessionId) return null;

  const session = db.prepare('SELECT admin_id FROM admin_sessions WHERE id = ? AND expires_at > datetime("now")').get(sessionId) as { admin_id: string } | undefined;
  return session?.admin_id || null;
}

export async function GET() {
  const adminId = await checkAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const templates = db.prepare('SELECT * FROM university_templates ORDER BY created_at DESC').all();
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const adminId = await checkAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const { id, status } = data;

  db.prepare('UPDATE university_templates SET status = ? WHERE id = ?').run(status, id);
  return NextResponse.json({ success: true });
}
