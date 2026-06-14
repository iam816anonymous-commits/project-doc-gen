'use client';

import { useState } from 'react';
import { Upload, ChevronRight, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function ContributeTemplatePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [university, setUniversity] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contribute/templates', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      alert('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border shadow-xl text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4">Awesome!</h1>
            <p className="text-slate-500 font-medium mb-8">
                Thank you for contributing. Our team will verify the formatting and grant you 1 Free Premium Credit once it&apos;s active.
            </p>
            <Link href="/" className="block w-full bg-slate-900 text-white py-4 rounded-xl font-black">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
             🏛️ University Template Program
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Help Us Improve Formatting</h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Upload an approved report from your university. We&apos;ll extract the formatting rules and reward you with 1 Free Premium Credit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[2.5rem] border shadow-sm space-y-10">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">University Name</label>
              <div className="relative">
                 <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                 <input
                    name="university"
                    required
                    type="text"
                    placeholder="e.g. JNTU Anantapur"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                 />
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sample Report (PDF)</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-8 cursor-pointer hover:bg-slate-50 transition group">
                   <Upload className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                   <span className="text-xs font-black text-slate-900">Select PDF</span>
                   <input name="file" type="file" accept=".pdf" className="hidden" />
                </label>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sample Report (DOCX)</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-8 cursor-pointer hover:bg-slate-50 transition group">
                   <Upload className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                   <span className="text-xs font-black text-slate-900">Select DOCX</span>
                   <input type="file" accept=".docx" className="hidden" />
                </label>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes (Optional)</label>
              <textarea
                 name="department"
                 placeholder="Mention department or any specific formatting rules we should know..."
                 className="w-full p-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium min-h-[120px]"
              />
           </div>

           <button
             disabled={loading}
             className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition shadow-2xl shadow-blue-100 disabled:opacity-50"
           >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>Submit Contribution <ChevronRight className="w-6 h-6" /></>
              )}
           </button>

           <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Reward: 1 Free Premium Credit upon activation</p>
        </form>
      </div>
    </div>
  );
}
