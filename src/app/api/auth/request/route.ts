import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    db.prepare('INSERT INTO auth_tokens (id, email, token, expires_at) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), email, otp, expiresAt);

    // In a real app, send email here. For MVP, we log it.
    console.log(`[AUTH] OTP for ${email}: ${otp}`);

    return NextResponse.json({ success: true, message: 'OTP sent to email (check console for now)' });
  } catch (error) {
    console.error('Auth request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
