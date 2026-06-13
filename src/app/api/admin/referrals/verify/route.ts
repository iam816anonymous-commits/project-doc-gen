import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const adminToken = (await cookies()).get('admin_token')?.value;
    if (adminToken !== process.env.ADMIN_SECRET) {
       // Check header for API calls
       const adminSecret = request.headers.get('x-admin-secret');
       if (adminSecret !== process.env.ADMIN_SECRET) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
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
