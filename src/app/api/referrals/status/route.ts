import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ eligible: false });
    }

    const stats = db.prepare(`
      SELECT
        SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) as converted
      FROM referrals
      WHERE referrer_id = ?
    `).get(userId) as { converted: number };

    const evidence = db.prepare(`
      SELECT COUNT(*) as approved FROM referral_evidence
      WHERE user_id = ? AND status = 'APPROVED'
    `).get(userId) as { approved: number };

    const isEligible = (stats?.converted || 0) > 0 || (evidence?.approved || 0) > 0;

    return NextResponse.json({ eligible: isEligible });
  } catch (_error) {
    return NextResponse.json({ eligible: false });
  }
}
