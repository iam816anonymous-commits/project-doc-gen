'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OTPLogin from '@/components/OTPLogin';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';

export default function GenerationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sourceType = searchParams.get('type') || 'manual';

  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<'auth' | 'input' | 'analyze' | 'confirm'>('auth');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Minimal inputs
  const [university, setUniversity] = useState('');
  const [level, setLevel] = useState('BTech');

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const res = await fetch('/api/auth/me'); // Simple endpoint to check cookie
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
        setProfile(data.profile);
        setStep('confirm');
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
      const res = await fetch('/api/analyze/github', { // I'll need to create this or use existing repo-analyzer
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setStep('confirm');
      }
    } catch (err) {
      alert('GitHub analysis failed');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
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
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            {step === 'input' ? 'Provide Your Project' :
             step === 'analyze' ? 'Analyzing Source...' :
             'Confirm Details'}
          </h1>
          <p className="text-slate-500 font-medium">Step {step === 'input' ? '1' : step === 'analyze' ? '2' : '3'} of 3</p>
        </div>

        {step === 'input' && (
          <div className="bg-white p-12 rounded-[2.5rem] border shadow-sm text-center">
            {sourceType === 'github' ? (
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="https://github.com/user/repo"
                  className="w-full px-6 py-4 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGitHubAnalysis(e.currentTarget.value);
                  }}
                />
                <p className="text-sm text-slate-400">Paste your public repository URL and press Enter</p>
              </div>
            ) : sourceType === 'manual' ? (
              <div className="space-y-6 text-left">
                <input
                  type="text"
                  placeholder="Project Title"
                  className="w-full px-6 py-4 rounded-xl border font-medium outline-none"
                  onChange={(e) => setProfile({ ...profile, title: e.target.value, techStack: [], features: [], modules: [] })}
                />
                <button
                   onClick={() => setStep('confirm')}
                   className="w-full bg-blue-600 text-white py-4 rounded-xl font-black"
                >
                   Continue →
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2rem] p-20 cursor-pointer hover:bg-slate-50 transition group">
                <Upload className="w-16 h-16 text-slate-300 group-hover:text-blue-600 mb-6 transition-colors" />
                <span className="text-xl font-black text-slate-900 mb-2">Click to Upload {sourceType.toUpperCase()}</span>
                <span className="text-slate-400 font-medium text-sm">Max file size 10MB</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept={sourceType === 'zip' ? '.zip' : sourceType === 'pdf' ? '.pdf' : '.docx'} />
              </label>
            )}
          </div>
        )}

        {step === 'analyze' && (
          <div className="bg-white p-12 rounded-[2.5rem] border shadow-sm flex flex-col items-center justify-center min-h-[400px]">
             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
             <p className="text-xl font-black text-slate-900 mb-2">Analyzing Project Content</p>
             <p className="text-slate-500 text-center max-w-sm">We're extracting tech stack, modules, and architecture from your {sourceType}.</p>
          </div>
        )}

        {step === 'confirm' && profile && (
          <div className="space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-green-500 w-6 h-6" /> Analysis Successful
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Project Title</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-xl border font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Detected Tech</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.techStack?.map((t: string) => <span key={t} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{t}</span>)}
                      {profile.techStack?.length === 0 && <span className="text-slate-400 text-xs">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Modules</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.modules?.map((m: string) => <span key={m} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{m}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white">
              <h3 className="text-xl font-black mb-6 italic">Almost Done! Just 2 more details:</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-xs font-black text-blue-200 uppercase tracking-widest mb-2 block">Your University</label>
                    <input
                      type="text"
                      placeholder="e.g. JNTU Hyderabad"
                      className="w-full px-6 py-4 bg-white/10 rounded-xl border border-white/20 font-bold text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="text-xs font-black text-blue-200 uppercase tracking-widest mb-2 block">Academic Level</label>
                    <select
                      className="w-full px-6 py-4 bg-white/10 rounded-xl border border-white/20 font-bold text-white outline-none focus:bg-white/20 transition"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="BTech">B.Tech / B.E.</option>
                      <option value="MCA">MCA</option>
                      <option value="BCA">BCA</option>
                      <option value="Diploma">Diploma</option>
                      <option value="MTech">M.Tech</option>
                    </select>
                 </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-black transition shadow-2xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Generate Complete Package →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
