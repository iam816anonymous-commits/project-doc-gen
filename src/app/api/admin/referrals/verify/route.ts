import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { getAdmin } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, notes } = await request.json();

    db.prepare('UPDATE referral_evidence SET status = ?, verification_notes = ? WHERE id = ?').run(status, notes, id);

    await logAudit('REFERRAL_VERIFY', 'ADMIN', { id, status, notes });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Referral verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
