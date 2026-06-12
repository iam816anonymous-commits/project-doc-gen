import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: string; email: string } | undefined;

    if (!user) {
      const id = uuidv4();
      db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(id, email);
      user = { id, email };
    }

    const response = NextResponse.json({ user });

    // Hardening Cookie Security
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
