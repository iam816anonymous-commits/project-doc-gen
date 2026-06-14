import { sendOTPEmail } from "@/lib/email";
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Rate limiting
    const recentOtps = db.prepare('SELECT COUNT(*) as count FROM otps WHERE email = ? AND created_at > datetime("now", "-5 minutes")').get(email) as { count: number };
    if (recentOtps.count >= 3) {
      return NextResponse.json({ error: 'Too many requests. Please try again in 5 minutes.' }, { status: 429 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(code, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    db.prepare('INSERT INTO otps (id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)').run(uuidv4(), email, codeHash, expiresAt);

    await sendOTPEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
