'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, ChevronRight, GraduationCap, Building2, User, Edit2 } from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [studentName, setStudentName] = useState('');
  const [university, setUniversity] = useState('');
  const [level, setLevel] = useState('BTech');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stage, setStage] = useState(0);

  const STAGES = [
    "Analyzing Project Structure",
    "Detecting Technologies",
    "Extracting Modules",
    "Building Documentation",
    "Generating Viva Questions",
    "Preparing Submission Kit",
    "Finalizing Report"
  ];

  useEffect(() => {
    const savedProfile = localStorage.getItem('pending_project_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
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
    setStage(0);

    // Simulate progress while waiting for API
    const interval = setInterval(() => {
        setStage(s => s < STAGES.length - 1 ? s + 1 : s);
    }, 3000);

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
      clearInterval(interval);
      if (res.ok) {
        setStage(STAGES.length - 1);
        setTimeout(() => {
            localStorage.removeItem('pending_project_profile');
            router.push(`/project/${data.projectId}`);
        }, 1000);
      } else {
        alert(data.error);
        setLoading(false);
      }
    } catch (err) {
      clearInterval(interval);
      alert('Generation failed');
      setLoading(false);
    }
  };

  if (!profile) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border shadow-xl text-center">
            <div className="relative mb-12 flex justify-center">
                <div className="w-32 h-32 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-black text-blue-600 text-2xl">
                    {Math.round(((stage + 1) / STAGES.length) * 100)}%
                </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">{STAGES[stage]}</h2>
            <p className="text-slate-500 font-medium">Please wait, we&apos;re preparing your complete submission kit...</p>

            <div className="mt-12 space-y-3">
                {STAGES.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-left">
                        <div className={`w-2 h-2 rounded-full ${i < stage ? 'bg-green-500' : i === stage ? 'bg-blue-600 animate-pulse' : 'bg-slate-200'}`}></div>
                        <span className={`text-xs font-bold ${i < stage ? 'text-slate-400 line-through' : i === stage ? 'text-blue-600' : 'text-slate-300'}`}>{s}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
           <h1 className="text-3xl font-black text-slate-900 mb-2">Confirm Project Details</h1>
           <p className="text-slate-500 font-medium">We identified these details from your source.</p>
        </div>

        <div className="space-y-8">
            {/* Extracted Intel */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <CheckCircle2 className="w-32 h-32 text-green-500" />
              </div>

              <div className="flex justify-between items-center mb-8 border-b pb-6">
                <h3 className="text-xl font-black text-slate-900">Project Intelligence</h3>
                <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 font-bold text-sm flex items-center gap-1">
                   <Edit2 className="w-4 h-4" /> {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Project Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => setProfile({...profile, title: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white font-bold text-slate-900 outline-none transition-all"
                    />
                  ) : (
                    <p className="text-xl font-black text-slate-900">{profile.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Tech Stack</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.techStack?.map((t: string) => <span key={t} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-black">{t}</span>)}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Key Features</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.features?.map((f: string) => <span key={f} className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-black">{f}</span>)}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-900 rounded-3xl text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-2">Inferred Architecture</span>
                    <p className="text-lg font-bold">{profile.architecture || 'Modular Architecture'}</p>
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="bg-blue-600 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl shadow-blue-200">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-xl"><GraduationCap className="w-6 h-6" /></span>
                Your Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-12 pr-6 py-4 bg-white/10 rounded-xl border border-white/20 font-bold text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] block">University</label>
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
                    Generate My Report Kit
                    <ChevronRight className="w-8 h-8" />
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
}
