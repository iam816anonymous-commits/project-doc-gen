'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Loader2, Send, CheckCircle2 } from 'lucide-react';

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [useful, setUseful] = useState('');
  const [missing, setMissing] = useState('');
  const [confused, setConfused] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, useful, missing, confused, recommend })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-12 rounded-[3rem] border shadow-xl">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12" />
           </div>
           <h1 className="text-3xl font-black text-slate-900 mb-4">Feedback Received!</h1>
           <p className="text-slate-500 font-medium mb-8">
              Thank you for being a founding student. Our team will review your feedback and grant your free credit within 24 hours.
           </p>
           <button
             onClick={() => router.push('/')}
             className="w-full bg-slate-900 text-white py-4 rounded-xl font-black"
           >
              Return Home
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-black text-slate-900 mb-4">Founding Student Feedback</h1>
           <p className="text-slate-500 font-medium italic">Help us improve ReportReady and get 1 Free Premium Unlock.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] border shadow-sm space-y-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overall Rating</label>
              <div className="flex gap-4">
                 {[1, 2, 3, 4, 5].map((num) => (
                   <button
                     key={num}
                     type="button"
                     onClick={() => setRating(num)}
                     className={`w-12 h-12 rounded-xl font-black text-xl transition ${rating === num ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                   >
                     {num}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">What was useful?</label>
              <textarea
                className="w-full p-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition min-h-[120px] font-medium"
                placeholder="Be specific about the sections, AI intelligence, or ease of use..."
                value={useful}
                onChange={(e) => setUseful(e.target.value)}
                required
              />
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">What was missing?</label>
              <textarea
                className="w-full p-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition min-h-[120px] font-medium"
                placeholder="What sections or features would you like to see?"
                value={missing}
                onChange={(e) => setMissing(e.target.value)}
                required
              />
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">What confused you?</label>
              <textarea
                className="w-full p-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition min-h-[120px] font-medium"
                placeholder="Was anything hard to find or understand?"
                value={confused}
                onChange={(e) => setConfused(e.target.value)}
                required
              />
           </div>

           <div className="flex items-center gap-4 py-4 border-t">
              <label className="text-sm font-bold text-slate-700">Would you recommend this to a classmate?</label>
              <div className="flex gap-2">
                 <button
                   type="button"
                   onClick={() => setRecommend(true)}
                   className={`px-4 py-2 rounded-lg font-black text-xs ${recommend ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                 >
                    YES
                 </button>
                 <button
                   type="button"
                   onClick={() => setRecommend(false)}
                   className={`px-4 py-2 rounded-lg font-black text-xs ${!recommend ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                 >
                    NO
                 </button>
              </div>
           </div>

           <button
             disabled={loading || (useful.length + missing.length + confused.length < 100)}
             className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                   Submit & Claim Reward <Send className="w-5 h-5" />
                </>
              )}
           </button>
           <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              Minimum 100 characters required across all fields
           </p>
        </form>
      </div>
    </div>
  );
}
