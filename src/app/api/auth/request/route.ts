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

    // --- EMAIL INTEGRATION POINT ---
    // In a real app, integrate an email service like Resend, SendGrid, or AWS SES here.
    // Example: await resend.emails.send({ to: email, subject: 'Your OTP', text: `OTP: ${otp}` });

    console.log(`
      --------------------------------------------------
      [AUTH] OTP for ${email}: ${otp}
      (This is the MVP console delivery. Integrate SMTP here for production.)
      --------------------------------------------------
    `);

    return NextResponse.json({
      success: true,
      message: 'OTP sent. For this beta version, check the server console logs to retrieve your 6-digit code.'
    });
  } catch (error) {
    console.error('Auth request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
