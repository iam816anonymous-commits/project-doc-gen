import { NextResponse } from 'next/server';
import { ProjectProfiler } from '@/lib/project-profiler';
import mime from 'mime-types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // MIME Detection
    const detectedMime = mime.lookup(file.name);
    if (!detectedMime) {
       return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Basic malicious check (size and simple string match for common patterns)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    let profile;
    if (type === 'zip' && detectedMime === 'application/zip') {
      profile = await ProjectProfiler.fromZip(buffer, file.name);
    } else if (type === 'pdf' && detectedMime === 'application/pdf') {
      profile = await ProjectProfiler.fromPDF(buffer);
    } else if (type === 'docx' && (detectedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      profile = await ProjectProfiler.fromDocx(buffer);
    } else {
      return NextResponse.json({ error: 'Mismatched file type and extension' }, { status: 400 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('File analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze file' }, { status: 500 });
  }
}
