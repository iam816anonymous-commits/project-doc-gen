import db from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { SECTIONS } from '@/lib/prompts';
import Link from 'next/link';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as {
    id: string;
    user_id: string;
    title: string;
    tech_stack: string;
    academic_level: string;
    content: string;
    is_paid: number;
  } | undefined;

  if (!project) notFound();
  if (project.user_id !== userId) redirect('/');

  const content = JSON.parse(project.content);
  const isPaid = project.is_paid === 1;
  const freeSections = ["Abstract", "Objectives"];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        {!isPaid && (
          <Link href={`/project/${project.id}/pay`} className="bg-green-600 text-white px-6 py-2 rounded">
            Unlock Full Package - ₹99
          </Link>
        )}
        <div className="space-y-12 mt-8">
          {SECTIONS.map((section) => (
            <section key={section}>
              <h2 className="text-2xl font-bold border-b">{section}</h2>
              {!isPaid && !freeSections.includes(section) ? (
                <p className="blur-sm">Content Locked</p>
              ) : (
                <p>{content[section]}</p>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
