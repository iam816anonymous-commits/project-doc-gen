import db from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { SECTIONS } from '@/lib/prompts';
import Link from 'next/link';
import { cookies } from 'next/headers';
import TestingModeBanner from '@/components/TestingModeBanner';
import FeedbackWall from '@/components/FeedbackWall';

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
    github_url: string;
    project_type: string;
  } | undefined;

  if (!project) notFound();
  if (project.user_id !== userId) redirect('/');

  const content = JSON.parse(project.content);
  const isPaymentsEnabled = process.env.ENABLE_PAYMENTS !== 'false';
  const isPaid = !isPaymentsEnabled || project.is_paid === 1;
  const freeSections = ["Abstract", "Objectives"];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!isPaymentsEnabled && <TestingModeBanner />}
      <header className="bg-white border-b px-8 py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <Link href="/" className="bg-slate-100 p-2 rounded-xl hover:bg-slate-200 transition">🏠</Link>
             <div>
               <h1 className="text-2xl font-black text-slate-900 leading-tight">{project.title}</h1>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{project.university} • {project.academic_level}</p>
             </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {!isPaid ? (
              <Link href={`/project/${project.id}/pay`} className="w-full md:w-auto bg-green-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-700 transition shadow-xl shadow-green-100 flex items-center justify-center gap-2">
                <span>🔓</span> Unlock Full Report (₹99)
              </Link>
            ) : (
              <div className="flex gap-4 w-full md:w-auto">
                <a href={`/api/export/pdf?projectId=${project.id}`} className="flex-1 md:flex-none text-center bg-blue-600 text-white px-6 py-4 rounded-xl font-black shadow-lg shadow-blue-100">Download PDF</a>
                <a href={`/api/export/docx?projectId=${project.id}`} className="flex-1 md:flex-none text-center bg-white text-blue-600 border-2 border-blue-600 px-6 py-4 rounded-xl font-black shadow-lg shadow-blue-50">Download DOCX</a>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
        {/* Project Intelligence Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <p className={`font-black ${isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                {isPaid ? '✓ Submission Ready' : '⚠ Ready to Unlock'}
              </p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Repository</p>
              <p className="font-black text-slate-900 truncate">
                {project.github_url ? '✓ Detected' : 'Manual Entry'}
              </p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Tech Stack</p>
              <p className="font-black text-slate-900">{project.tech_stack}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Kit Content</p>
              <p className="font-black text-blue-600">Report + PPT + Viva</p>
           </div>
        </div>

        <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white mb-16 relative overflow-hidden shadow-2xl shadow-blue-100">
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full"></div>
           <div className="max-w-2xl relative">
              <h2 className="text-3xl font-black mb-4">Your Project Report is Generated!</h2>
              <p className="text-blue-100 font-medium mb-8 leading-relaxed">
                We&apos;ve analyzed your {project.project_type} project and prepared a 17-section comprehensive documentation package tailored for {project.university} guidelines.
              </p>
              {!isPaid ? (
                 <Link href={`/project/${project.id}/pay`} className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black inline-block hover:bg-slate-50 transition">
                    Unlock Full Submission Kit Now →
                 </Link>
              ) : (
                 !isPaymentsEnabled && (
                    <div className="mt-8">
                       <FeedbackWall projectId={project.id} />
                    </div>
                 )
              )}
           </div>
        </div>

        {/* Content Viewer */}
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <section key={section} className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-6 flex items-center gap-3">
                <span className="text-blue-600">#</span> {section}
              </h2>

              {!isPaid && !freeSections.includes(section) ? (
                <div className="relative">
                   <div className="space-y-4 filter blur-md opacity-20 select-none">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                         <p className="font-black text-slate-900 mb-4">Unlock to view full {section}</p>
                         <Link href={`/project/${project.id}/pay`} className="text-blue-600 font-black hover:underline">Complete Payment →</Link>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none prose-p:font-medium prose-p:leading-loose text-slate-600 whitespace-pre-wrap">
                  {content[section]}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      <div className="bg-slate-900 text-white py-12 px-8 text-center mt-20">
         <p className="font-black text-xl mb-4 italic">Need help with your project?</p>
         <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Contact us at <span className="text-blue-400 font-bold">support@reportready.in</span> if you have any questions about your generated report.
         </p>
      </div>
    </div>
  );
}
