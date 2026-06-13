import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { TemplateExtractor } from '@/lib/template-extractor';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const university = formData.get('university') as string;
    const department = formData.get('department') as string;
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!file || !university) {
      return NextResponse.json({ error: 'File and University are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'uploads', 'contributions');
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${uuidv4()}_${file.name}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const contributionId = uuidv4();
    db.prepare(`
      INSERT INTO template_contributions (id, user_id, university_name, department, file_path, file_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(contributionId, userId || null, university, department || null, filePath, file.name.endsWith('.pdf') ? 'PDF' : 'DOCX');

    // Trigger background extraction
    (async () => {
       try {
         const profile = await TemplateExtractor.extract(buffer, file.name.endsWith('.pdf') ? 'PDF' : 'DOCX');
         const templateId = uuidv4();
         db.prepare(`
           INSERT INTO university_templates (
             id, university_name, department, cover_page_structure, certificate_structure,
             declaration_structure, acknowledgement_structure, heading_styles, font_family,
             font_size, page_margins, line_spacing, toc_structure, reference_style,
             formatting_rules_json, status, sample_file_path
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         `).run(
           templateId, university, profile.department || department,
           JSON.stringify(profile.cover_page_structure), JSON.stringify(profile.certificate_structure),
           JSON.stringify(profile.declaration_structure), JSON.stringify(profile.acknowledgement_structure),
           JSON.stringify(profile.heading_styles), profile.font_family,
           profile.font_size, JSON.stringify(profile.page_margins), profile.line_spacing,
           JSON.stringify(profile.toc_structure), profile.reference_style,
           JSON.stringify(profile.formatting_rules_json), 'DRAFT', filePath
         );

         db.prepare('UPDATE template_contributions SET status = "ANALYZED" WHERE id = ?').run(contributionId);
       } catch (err) {
         console.error('Background extraction failed:', err);
       }
    })();

    return NextResponse.json({ success: true, message: 'Thank you for your contribution! Our team will review it.' });
  } catch (error) {
    console.error('Contribution error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
