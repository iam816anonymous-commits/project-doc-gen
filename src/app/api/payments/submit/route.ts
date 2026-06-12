import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!file || !projectId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Security: Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    // Security: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB allowed.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Security: Randomized filename to prevent overwrites and predictable URLs
    const extension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${extension}`;

    const uploadDir = path.join(process.cwd(), 'public/uploads/payments');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    // Security: Path traversal is mitigated by using path.join with process.cwd and a UUID-based filename
    await fs.writeFile(filePath, buffer);

    const submissionId = uuidv4();
    db.prepare(`
      INSERT INTO payment_submissions (id, user_id, project_id, screenshot_path, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(submissionId, userId, projectId, `/uploads/payments/${fileName}`, 'PENDING');

    return NextResponse.json({ success: true, submissionId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
