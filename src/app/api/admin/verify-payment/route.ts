import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Admin
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;

    if (adminToken !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const submissionId = formData.get('submissionId') as string;
    const action = formData.get('action') as string;

    if (!submissionId || !action) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const verifiedAt = new Date().toISOString();

    const submission = db.prepare('SELECT project_id FROM payment_submissions WHERE id = ?').get(submissionId) as { project_id: string } | undefined;

    if (!submission) {
       return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    db.transaction(() => {
      db.prepare('UPDATE payment_submissions SET status = ?, verified_at = ? WHERE id = ?')
        .run(status, verifiedAt, submissionId);

      if (status === 'APPROVED') {
        db.prepare('UPDATE projects SET is_paid = 1 WHERE id = ?').run(submission.project_id);
      }
    })();

    revalidatePath(`/project/${submission.project_id}`);
    revalidatePath('/admin');

    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
