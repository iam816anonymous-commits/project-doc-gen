import { NextResponse } from 'next/server';
import { ProjectProfiler } from '@/lib/project-profiler';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const profile = await ProjectProfiler.fromGitHub(url);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
