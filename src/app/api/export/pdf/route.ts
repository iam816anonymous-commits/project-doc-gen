import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateProfessionalPDF } from '@/lib/pdf-renderer';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const userId = (await cookies()).get('user_id')?.value;

  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId) as any;
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const isPaymentsEnabled = process.env.ENABLE_PAYMENTS !== 'false';
  if (isPaymentsEnabled && project.is_paid !== 1) {
    return NextResponse.json({ error: 'Payment required' }, { status: 402 });
  }

  const content = JSON.parse(project.content);
  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(project.user_id) as any;

  // Check for template
  const template = db.prepare('SELECT * FROM university_templates WHERE university_name = ? AND status = "ACTIVE" ORDER BY created_at DESC LIMIT 1').get(project.university) as any;

  const pdfBuffer = await generateProfessionalPDF({
    title: project.title,
    university: project.university,
    studentName: user.email.split('@')[0],
    academicLevel: project.academic_level,
    sections: content,
    techStack: project.tech_stack,
    template: template || undefined
  });

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${project.title}_Report.pdf"`
    }
  });
}
