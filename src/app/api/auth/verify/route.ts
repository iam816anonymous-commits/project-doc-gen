import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 });
    }

    const row = db.prepare(`
      SELECT * FROM auth_tokens
      WHERE email = ? AND token = ? AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC LIMIT 1
    `).get(email, token) as { email: string } | undefined;

    if (!row) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // OTP is valid, cleanup
    db.prepare('DELETE FROM auth_tokens WHERE email = ?').run(email);

    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: string; email: string } | undefined;

    if (!user) {
      const id = uuidv4();
      db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(id, email);
      user = { id, email };
    }

    const response = NextResponse.json({ success: true, user });

    // Set secure cookie
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
