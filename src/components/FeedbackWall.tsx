'use client';

import { useState } from 'react';
import { Send, Loader2, Star } from 'lucide-react';

export default function FeedbackWall({ projectId }: { projectId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, projectId })
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-100 p-8 rounded-[2rem] text-center">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">✓</div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Feedback Received!</h3>
        <p className="text-slate-500 font-medium">Thank you for helping us improve ReportReady.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4">
           🧪 Beta Testing
        </div>
        <h2 className="text-2xl font-black text-slate-900">Help Us Improve</h2>
        <p className="text-slate-500 font-medium">Generate unlimited reports. In return, tell us what you think.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setRating(n)} className={`w-10 h-10 rounded-xl transition ${rating >= n ? 'text-yellow-400' : 'text-slate-200'}`}>
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Thoughts</label>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium text-sm outline-none focus:ring-2 focus:ring-blue-600 min-h-[120px]"
            placeholder="What was useful? What was wrong? What should be added?"
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-black transition"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Feedback</>}
        </button>
      </form>
    </div>
  );
}
