import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage();
  const { height } = page.getSize();
  let y = height - 50;

  for (const [section, text] of Object.entries(content)) {
    if (y < 100) {
      page = pdfDoc.addPage();
      y = height - 50;
    }

    page.drawText(section, { x: 50, y, size: 18, font: boldFont, color: rgb(0, 0, 0.8) });
    y -= 30;

    const lines = (text as string).split('\n');
    for (const line of lines) {
      const words = line.split(' ');
      let currentLine = '';

      for (const word of words) {
        if (currentLine.length + word.length > 80) {
          page.drawText(currentLine, { x: 50, y, size: 12, font });
          y -= 15;
          currentLine = word + ' ';
          if (y < 50) {
            page = pdfDoc.addPage();
            y = height - 50;
          }
        } else {
          currentLine += word + ' ';
        }
      }
      page.drawText(currentLine, { x: 50, y, size: 12, font });
      y -= 15;
    }
    y -= 20;
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${project.title.replace(/\s+/g, '_')}_Documentation.pdf"`,
    },
  });
}
