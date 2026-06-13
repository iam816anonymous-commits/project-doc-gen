import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = uuidv4();
    const termsVersion = '2026-06-15'; // Current version

    db.prepare(`
      INSERT INTO agreement_acceptances (id, user_id, terms_version)
      VALUES (?, ?, ?)
    `).run(id, userId, termsVersion);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Accept terms error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
