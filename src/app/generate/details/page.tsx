'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Github, Upload } from 'lucide-react';

function DetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'manual';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    title: '',
    projectType: 'Web Development',
    techStack: '',
    problemStatement: '',
    features: '',
    teamSize: 1,
    academicLevel: 'BTech',
    university: 'Standard',
    email: '',
    otp: '',
    githubUrl: '',
    sourceType: source
  });

  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) {
        setStep('otp');
      } else {
        alert('Failed to send OTP.');
      }
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verify OTP
      const authRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, token: formData.otp }),
      });

      if (!authRes.ok) {
        alert('Invalid OTP.');
        setLoading(false);
        return;
      }

      // 2. Generate Content
      // Note: In a real app, files would be uploaded to S3 or processed here.
      // For this MVP version, we'll pass the metadata to the API.
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.projectId) {
        router.push(`/project/${data.projectId}`);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 text-center">
           <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto">📧</div>
           <h1 className="text-2xl font-black mb-2 text-slate-900">Verify Your Email</h1>
           <p className="text-slate-500 mb-8 font-medium">We&apos;ve sent a 6-digit code to <br/><span className="text-slate-900 font-bold">{formData.email}</span></p>
           <form onSubmit={handleVerifyAndGenerate} className="space-y-6">
              <input
                required
                type="text"
                name="otp"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
                placeholder="000000"
                className="w-full text-center text-4xl tracking-[0.5em] font-black p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-0 outline-none transition-colors"
              />
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition disabled:bg-blue-300 shadow-xl shadow-blue-100"
              >
                {loading ? 'Generating Report...' : 'Verify & Generate'}
              </button>
              <button type="button" onClick={() => setStep('details')} className="text-sm text-slate-400 font-bold hover:text-blue-600 transition">Change email</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
           <Link href="/generate" className="text-blue-600 font-black mb-4 inline-block hover:underline">← Change Source</Link>
           <h1 className="text-4xl font-black text-slate-900 mb-4">Complete Your Intake</h1>
           <p className="text-slate-500 font-medium italic">
             {source === 'github' ? 'Analyzing GitHub Repository...' :
              source === 'zip' ? 'Processing Source ZIP...' :
              source === 'draft' ? 'Extracting from Existing Report...' :
              'Manual Project Description'}
           </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <form onSubmit={handleRequestOTP} className="space-y-8">

            {/* Source Specific Input */}
            {source === 'github' && (
              <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <label className="block text-sm font-black uppercase tracking-widest mb-3">GitHub Repository URL</label>
                <div className="flex gap-4">
                  <div className="bg-white/10 p-4 rounded-xl flex items-center justify-center">
                    <Github className="w-6 h-6" />
                  </div>
                  <input
                    type="url"
                    name="githubUrl"
                    required
                    placeholder="https://github.com/username/project-repo"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="flex-grow p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:bg-white/20 focus:outline-none transition-all text-lg font-medium"
                  />
                </div>
              </div>
            )}

            {(source === 'zip' || source === 'draft') && (
              <div className={`${source === 'zip' ? 'bg-blue-600' : 'bg-amber-500'} p-8 rounded-3xl text-white shadow-xl relative overflow-hidden`}>
                <label className="block text-sm font-black uppercase tracking-widest mb-3">
                  {source === 'zip' ? 'Upload Source Code (ZIP)' : 'Upload Existing Report (PDF/DOCX)'}
                </label>
                <div className="relative group cursor-pointer border-2 border-dashed border-white/30 hover:border-white/60 rounded-2xl p-8 text-center transition-all">
                  <input
                    type="file"
                    required
                    accept={source === 'zip' ? '.zip' : '.pdf,.docx'}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 mb-2" />
                    <p className="font-bold text-lg">
                      {file ? file.name : `Click to Upload ${source === 'zip' ? 'ZIP' : 'Draft'}`}
                    </p>
                    <p className="text-white/70 text-sm">Max file size: 20MB</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Project Title</label>
                <input required type="text" name="title" placeholder="E-commerce Website" value={formData.title} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"/>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium">
                  <option>Web Development</option>
                  <option>Artificial Intelligence</option>
                  <option>Mobile Application</option>
                  <option>Internet of Things (IoT)</option>
                  <option>Cybersecurity</option>
                  <option>Cloud Computing</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tech Stack</label>
              <input required type="text" name="techStack" placeholder="React, Node.js, MongoDB, Tailwind CSS" value={formData.techStack} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"/>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Problem Statement</label>
              <textarea required name="problemStatement" placeholder="What is the real-world problem your project solves?" value={formData.problemStatement} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" rows={3}/>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Key Features</label>
              <textarea required name="features" placeholder="User Auth, Admin Dashboard, Payment Integration..." value={formData.features} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" rows={3}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Academic Level</label>
                <select name="academicLevel" value={formData.academicLevel} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium">
                  <option>Diploma</option>
                  <option>BCA</option>
                  <option>MCA</option>
                  <option>BTech</option>
                  <option>MTech</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">University Format</label>
                <select name="university" value={formData.university} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium">
                  <option value="Standard">Standard Academic Format</option>
                  <option>JNTU</option>
                  <option>VTU</option>
                  <option>Anna University</option>
                  <option>Osmania University</option>
                  <option>Mumbai University</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <div className="space-y-2 mb-8">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Your Email (to receive report)</label>
                <input required type="email" name="email" placeholder="student@example.com" value={formData.email} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"/>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition shadow-xl shadow-blue-100">
                {loading ? 'Processing...' : 'Generate Project Kit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailsForm />
    </Suspense>
  );
}
