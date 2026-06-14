'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OTPLogin from '@/components/OTPLogin';
import { Loader2, Upload, CheckCircle2, ChevronRight, GraduationCap, Building2, User } from 'lucide-react';

export default function GenerationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sourceType = searchParams.get('type') || 'manual';

  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<'auth' | 'input' | 'analyze' | 'confirm'>('auth');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // MANDATORY MANUAL FIELDS (Post-Analysis)
  const [studentName, setStudentName] = useState('');
  const [university, setUniversity] = useState('');
  const [level, setLevel] = useState('BTech');

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserId(data.userId);
        setStep('input');
      }
    };
    checkSession();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStep('analyze');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', sourceType);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('pending_project_profile', JSON.stringify(data.profile));
        router.push('/generate/review');
        localStorage.setItem('pending_project_profile', JSON.stringify(data.profile));
        router.push('/generate/review');
      } else {
        alert(data.error);
        setStep('input');
      }
    } catch (err) {
      alert('Analysis failed');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubAnalysis = async (url: string) => {
    setLoading(true);
    setStep('analyze');
    try {
      const res = await fetch('/api/analyze/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('pending_project_profile', JSON.stringify(data.profile));
        router.push('/generate/review');
      } else {
        alert(data.error || 'GitHub analysis failed');
        setStep('input');
      }
    } catch (err) {
      alert('GitHub analysis failed');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

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

  if (step === 'auth') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <OTPLogin onSuccess={(uid) => { setUserId(uid); setStep('input'); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
            {step === 'input' ? (sourceType === 'manual' ? 'Describe Your Project' : 'Upload Your Project') : 'Analyzing Source...'}
          </h1>
          <p className="text-slate-500 font-medium">
             {step === 'input' ? 'Select your source file or link' : 'Identifying tech stack and features...'}
          </p>
        </div>

        {step === 'input' && (
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border shadow-sm text-center">
            {sourceType === 'github' ? (
              <div className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
                    <label className="block text-xs font-black uppercase tracking-widest mb-4 opacity-70">GitHub Repository URL</label>
                    <input
                      type="text"
                      placeholder="https://github.com/user/repo"
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 font-medium focus:bg-white/20 outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGitHubAnalysis(e.currentTarget.value);
                      }}
                    />
                    <p className="text-xs text-white/50 mt-4">We will analyze your code to extract modules and tech stack.</p>
                </div>
                <button
                  onClick={(e) => {
                    const input = (e.currentTarget.previousElementSibling as HTMLDivElement).querySelector('input');
                    if (input) handleGitHubAnalysis(input.value);
                  }}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition"
                >
                    Start Analysis
                </button>
              </div>
            ) : sourceType === 'manual' ? (
              <div className="space-y-6 text-left">
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Project Title</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Based Resume Screener"
                      className="w-full px-6 py-4 rounded-xl border-2 border-slate-100 font-bold focus:border-blue-600 outline-none transition-all"
                      onChange={(e) => setProfile({ ...profile, title: e.target.value, techStack: [], features: [], modules: [] })}
                    />
                </div>
                <button
                   onClick={() => {
                     localStorage.setItem('pending_project_profile', JSON.stringify({ ...profile, techStack: [], features: [], modules: [], architecture: 'Manual Entry' }));
                     router.push('/generate/review');
                   }}
                   className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                   Continue <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 md:p-20 cursor-pointer hover:bg-slate-50 transition group">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10" />
                </div>
                <span className="text-2xl font-black text-slate-900 mb-2">Upload {sourceType.toUpperCase()}</span>
                <span className="text-slate-400 font-medium">Max file size 10MB</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept={sourceType === 'zip' ? '.zip' : sourceType === 'pdf' ? '.pdf' : '.docx'} />
              </label>
            )}
          </div>
        )}

        {step === 'analyze' && (
          <div className="bg-white p-12 rounded-[2.5rem] border shadow-sm flex flex-col items-center justify-center min-h-[400px]">
             <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-black text-blue-600">AI</div>
             </div>
             <p className="text-2xl font-black text-slate-900 mb-2">Analyzing Project Content</p>
             <p className="text-slate-500 text-center max-w-sm font-medium">We&apos;re extracting tech stack, modules, and architecture from your source files.</p>
          </div>
        )}
      </div>
    </div>
  );
}
