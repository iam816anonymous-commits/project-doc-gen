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

  const feedback = db.prepare(`
    SELECT f.*, u.email
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `).all();
  return NextResponse.json(feedback);
}

export async function POST(request: Request) {
  const adminId = await checkAdmin();
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const { id, status } = data;

  const f = db.prepare('SELECT * FROM feedback WHERE id = ?').get(id) as any;
  if (!f) return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });

  db.transaction(() => {
    db.prepare('UPDATE feedback SET status = ? WHERE id = ?').run(status, id);

    if (status === 'APPROVED' && f.reward_granted === 0) {
      // Check if user already got a reward from another feedback
      const alreadyRewarded = db.prepare('SELECT id FROM feedback WHERE user_id = ? AND reward_granted = 1').get(f.user_id);
      if (!alreadyRewarded) {
        db.prepare('UPDATE users SET free_generation_credits = free_generation_credits + 1 WHERE id = ?').run(f.user_id);
        db.prepare('UPDATE feedback SET reward_granted = 1 WHERE id = ?').run(id);
      }
    }
  })();

  return NextResponse.json({ success: true });
}
