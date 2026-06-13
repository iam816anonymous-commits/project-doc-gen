import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const otp = db.prepare('SELECT * FROM otps WHERE email = ? AND code = ? AND expires_at > datetime("now")').get(email, code) as { id: string } | undefined;

    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // OTP is valid, consume it
    db.prepare('DELETE FROM otps WHERE id = ?').run(otp.id);

    // Get or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: string } | undefined;
    if (!user) {
      const userId = uuidv4();
      const referralCode = `READY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      db.prepare('INSERT INTO users (id, email, referral_code) VALUES (?, ?, ?)').run(userId, email, referralCode);
      user = { id: userId };
    }

    const cookieStore = await cookies();
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
