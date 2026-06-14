'use client';

import { useState } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';

export default function FeedbackUI() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment })
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100 text-center">
        <h3 className="text-xl font-black text-green-800 mb-2">Thank you!</h3>
        <p className="text-green-600 font-medium">Your feedback helps us improve ReportReady for all students.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-blue-600" /> Help Us Improve
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className={`p-2 rounded-xl transition-all ${rating >= s ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}
              >
                <Star className={`w-8 h-8 ${rating >= s ? 'fill-yellow-400' : ''}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Suggestions or Missing Features?</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:border-blue-600 transition"
            rows={3}
            placeholder="Tell us what more you need for your project submission..."
          />
        </div>
        <button
          type="submit"
          disabled={!rating}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition"
        >
          <Send className="w-4 h-4" /> Submit Feedback
        </button>
      </form>
    </div>
  );
}
