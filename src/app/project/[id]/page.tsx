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
    university: string;
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
      <main className="flex-1 p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">{project.title}</h1>
            <p className="text-gray-500 font-medium">{project.university} • {project.academic_level} • {project.tech_stack}</p>
          </div>
          {!isPaid && (
            <Link href={`/project/${project.id}/pay`} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg">
              Unlock Complete Submission Kit - ₹99
            </Link>
          )}
          {isPaid && (
            <div className="flex gap-4">
              <a href={`/api/export/pdf?projectId=${project.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">PDF</a>
              <a href={`/api/export/docx?projectId=${project.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">DOCX</a>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-12 text-center">
           <p className="text-blue-800 font-bold">📦 Complete Submission Kit: Documentation, Viva Prep & PPT Presentation included.</p>
        </div>

        <div className="space-y-16">
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
