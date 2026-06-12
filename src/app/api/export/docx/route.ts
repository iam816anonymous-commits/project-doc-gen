import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as {
    id: string;
    user_id: string;
    title: string;
    content: string;
    is_paid: number;
  } | undefined;

  if (!project || project.is_paid !== 1 || project.user_id !== userId) {
    return NextResponse.json({ error: 'Unauthorized or not paid' }, { status: 403 });
  }

  const content = JSON.parse(project.content);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: Object.entries(content).flatMap(([section, text]) => [
          new Paragraph({
            text: section,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun(text as string)],
            spacing: { after: 200 },
          }),
        ]),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${project.title.replace(/\s+/g, '_')}_Documentation.docx"`,
    },
  });
}
