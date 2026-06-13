import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateProfessionalPDF } from '@/lib/pdf-renderer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  if (project.is_paid !== 1) return NextResponse.json({ error: 'Payment required' }, { status: 402 });

  const content = JSON.parse(project.content);
  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(project.user_id) as any;

  const pdfBuffer = await generateProfessionalPDF({
    title: project.title,
    university: project.university,
    studentName: user.email.split('@')[0],
    academicLevel: project.academic_level,
    sections: content,
    techStack: project.tech_stack
  });

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${project.title}_Report.pdf"`
    }
  });
}
