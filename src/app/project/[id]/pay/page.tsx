'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !agreed) return;
    setLoading(true);

    try {
      // 1. Record agreement
      await fetch('/api/auth/accept-terms', { method: 'POST' });

      // 2. Submit payment
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', id);
      const res = await fetch('/api/payments/submit', { method: 'POST', body: formData });

      if (res.ok) {
        router.push(`/project/${id}`);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">

        {/* Left Side: Deliverables */}
        <div className="bg-slate-900 p-10 text-white relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 blur-[80px] opacity-20"></div>
           <Link href={`/project/${id}`} className="text-slate-400 font-bold hover:text-white transition block mb-12">← Back to Preview</Link>

           <h2 className="text-3xl font-black mb-8 leading-tight">Unlock Your <br/>Submission Kit</h2>

           <div className="space-y-6">
              {[
                { label: "17-Section Report", desc: "Professional PDF & DOCX formats." },
                { label: "Viva Preparation Kit", desc: "50+ Q&A tailored to your project." },
                { label: "PPT Presentation Kit", desc: "15 slides with speaker notes." },
                { label: "Project Synopsis", desc: "Ready for guide approval." },
                { label: "Architecture Design", desc: "Modules & database schema." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">✓</div>
                   <div>
                      <p className="font-black text-sm">{item.label}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Support Email</p>
              <p className="text-blue-400 font-bold">support@reportready.in</p>
           </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="p-10">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <h1 className="text-2xl font-black mb-2 text-slate-900">Final Step</h1>
            <p className="text-slate-500 font-medium mb-8">One-time payment of <span className="text-slate-900 font-black">₹99</span> to unlock everything.</p>

            <div className="space-y-8 flex-grow">
               <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Step 1: Pay via UPI</p>
                  <p className="text-3xl font-black text-slate-900 mb-6">pay@reportready</p>
                  <div className="w-40 h-40 bg-slate-200 mx-auto rounded-2xl mb-6 flex items-center justify-center border-2 border-dashed border-slate-300">
                     <span className="text-slate-400 font-bold text-sm text-center px-4">UPI QR Code <br/>Placeholder</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Scan the QR or pay to the ID above.</p>
               </div>

               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Step 2: Upload Screenshot</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-slate-100 file:text-slate-900 hover:file:bg-slate-200 transition cursor-pointer"
                  />
               </div>

               <div className="mb-8">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-0 outline-none transition-all"
                    />
                    <span className="text-sm text-slate-500 leading-tight font-medium">
                      I have read and agree to the {' '}
                      <Link href="/terms" target="_blank" className="text-blue-600 font-bold hover:underline">Terms</Link>, {' '}
                      <Link href="/privacy" target="_blank" className="text-blue-600 font-bold hover:underline">Privacy</Link>, and {' '}
                      <Link href="/academic-integrity" target="_blank" className="text-blue-600 font-bold hover:underline">Academic Integrity Notice</Link>.
                    </span>
                  </label>
               </div>
            </div>

            <button
              type="submit"
              disabled={!file || !agreed || loading}
              className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-2xl ${
                (!file || !agreed || loading)
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-100'
              }`}
            >
              {loading ? 'Processing...' : 'Unlock My Kit'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
