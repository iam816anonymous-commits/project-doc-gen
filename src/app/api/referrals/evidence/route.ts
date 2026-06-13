import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: Request) {
  try {
    const userId = (await cookies()).get('user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const groupName = formData.get('groupName') as string;
    const memberCount = formData.get('memberCount') as string;
    const timestampVisible = formData.get('timestampVisible') === 'true';

    if (!file) return NextResponse.json({ error: 'Screenshot required' }, { status: 400 });

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WEBP images are allowed' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'referrals');
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const relativePath = `/uploads/referrals/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const id = uuidv4();
    db.prepare(`
      INSERT INTO referral_evidence (id, user_id, image_path, group_name, member_count, timestamp_visible)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, relativePath, groupName, parseInt(memberCount) || 0, timestampVisible ? 1 : 0);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Referral evidence upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
