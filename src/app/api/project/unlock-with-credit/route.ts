import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = db.prepare('SELECT free_generation_credits FROM users WHERE id = ?').get(userId) as { free_generation_credits: number } | undefined;

    if (!user || user.free_generation_credits <= 0) {
      return NextResponse.json({ error: 'No free credits available' }, { status: 403 });
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    db.transaction(() => {
      db.prepare('UPDATE users SET free_generation_credits = free_generation_credits - 1 WHERE id = ?').run(userId);
      db.prepare('UPDATE projects SET is_paid = 1 WHERE id = ?').run(projectId);
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unlock error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
