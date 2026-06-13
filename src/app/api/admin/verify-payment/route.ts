import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const adminToken = (await cookies()).get('admin_token')?.value;
    if (adminToken !== process.env.ADMIN_SECRET) {
       const adminSecret = request.headers.get('x-admin-secret');
       if (adminSecret !== process.env.ADMIN_SECRET) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
    }

    const { submissionId, action } = await request.json();

    if (action === 'APPROVE') {
      const submission = db.prepare('SELECT * FROM payment_submissions WHERE id = ?').get(submissionId) as any;
      if (submission) {
        db.prepare('UPDATE payment_submissions SET status = "APPROVED", verified_at = datetime("now") WHERE id = ?').run(submissionId);
        db.prepare('UPDATE projects SET is_paid = 1 WHERE id = ?').run(submission.project_id);

        await logAudit('PAYMENT_APPROVE', 'ADMIN', { submissionId, projectId: submission.project_id });
      }
    } else {
      db.prepare('UPDATE payment_submissions SET status = "REJECTED" WHERE id = ?').run(submissionId);
      await logAudit('PAYMENT_REJECT', 'ADMIN', { submissionId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
