import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('screenshot') as File;

    if (!file) {
      return NextResponse.json({ error: 'No screenshot provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${uuidv4()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'referrals');

    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const dbPath = `/uploads/referrals/${fileName}`;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO referral_evidence (id, user_id, image_path)
      VALUES (?, ?, ?)
    `).run(id, userId, dbPath);

    return NextResponse.json({ success: true, path: dbPath });
  } catch (error) {
    console.error('Evidence upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
