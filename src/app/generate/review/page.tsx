'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ChevronRight, GraduationCap, Building2, User, Loader2, Edit3 } from 'lucide-react';

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [university, setUniversity] = useState('');
  const [level, setLevel] = useState('BTech');

  useEffect(() => {
    const data = sessionStorage.getItem('pending_project_profile');
    if (data) {
      setProfile(JSON.parse(data));
    } else {
      router.push('/generate');
    }
  }, [router]);

  const handleGenerate = async () => {
    if (!studentName || !university) {
      alert('Please fill Student Name and University');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: profile.title,
          projectType: profile.inferredCategory || 'Web Development',
          techStack: profile.techStack.join(', '),
          features: profile.features.join(', '),
          problemStatement: profile.problemStatement || 'Automated generation',
          teamSize: 1,
          studentName,
          academicLevel: level,
          university,
          profile
        })
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.removeItem('pending_project_profile');
        router.push(`/project/${data.projectId}`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Verify Project Intelligence</h1>
          <p className="text-slate-500 font-medium">Our AI identified these details. Please confirm or edit.</p>
        </div>

        <div className="space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <CheckCircle2 className="w-32 h-32 text-green-500" />
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Project Title</label>
                  <div className="relative group">
                    <input
                        type="text"
                        value={profile.title}
                        onChange={(e) => setProfile({...profile, title: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white font-bold text-slate-900 outline-none transition-all"
                    />
                    <Edit3 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Detected Tech Stack</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.techStack?.map((t: string) => (
                        <span key={t} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1">
                            {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Modules & Features</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.features?.map((f: string) => <span key={f} className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-black">{f}</span>)}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-900 rounded-3xl text-white">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Inferred Architecture</span>
                        <span className="bg-blue-600 text-[10px] font-black px-2 py-1 rounded uppercase">AI Match</span>
                    </div>
                    <p className="text-lg font-bold">{profile.architecture || 'Modular Monolithic'}</p>
                    <p className="text-xs text-slate-400 mt-2">Database: {profile.database || 'SQLite (Inferred)'}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl shadow-blue-200">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-xl"><GraduationCap className="w-6 h-6" /></span>
                Final Submission Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">Student Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input
                        type="text"
                        placeholder="Your Full Name"
                        className="w-full pl-12 pr-6 py-4 bg-white/10 rounded-xl border border-white/20 font-bold text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">Your University</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input
                        type="text"
                        placeholder="e.g. JNTU Hyderabad"
                        className="w-full pl-12 pr-6 py-4 bg-white/10 rounded-xl border border-white/20 font-bold text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        />
                    </div>
                 </div>
                 <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">Academic Level</label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {['Diploma', 'BCA', 'MCA', 'BTech', 'MTech'].map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => setLevel(l)}
                                className={`py-3 rounded-xl font-black text-xs border transition-all ${level === l ? 'bg-white text-blue-600 border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                 </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 md:py-8 rounded-[2.5rem] font-black text-xl md:text-2xl flex items-center justify-center gap-4 hover:bg-black transition shadow-2xl shadow-slate-200"
            >
              {loading ? <Loader2 className="animate-spin w-8 h-8" /> : (
                <>
                    Looks Correct — Generate Report
                    <ChevronRight className="w-8 h-8" />
                </>
              )}
            </button>
            <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">Includes: DOCX + PDF • Viva Q&A • PPT Outline</p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div>Loading Review...</div>}>
      <ReviewContent />
    </Suspense>
  );
}
