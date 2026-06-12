import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { SECTIONS, getSectionTemplate } from '@/lib/prompts';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const details = await request.json();
    const cookieStore = await cookies();
    let userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      userId = uuidv4();
      db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(userId, `guest_${userId}@example.com`);
      cookieStore.set('user_id', userId, { httpOnly: true });
    }

    const projectId = uuidv4();
    const content: Record<string, string> = {};

    SECTIONS.forEach(section => {
      content[section] = getSectionTemplate(section, details);
    });

    db.prepare(`
      INSERT INTO projects (
        id, user_id, title, project_type, tech_stack,
        problem_statement, features, team_size,
        academic_level, content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      userId,
      details.title,
      details.projectType,
      details.techStack,
      details.problemStatement,
      details.features,
      details.teamSize,
      details.academicLevel,
      JSON.stringify(content)
    );

    return NextResponse.json({ projectId, content });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
