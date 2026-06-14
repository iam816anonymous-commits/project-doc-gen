'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, Star, Send, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function FeedbackUI() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [issueType, setIssueType] = useState('Feedback');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          issueType,
          pageUrl: pathname,
          useful: comment, // Mapping to existing schema
          missing: 'From floating button',
          confused: `Detailed feedback provided via floating UI`,
          recommend: true
        })
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setComment('');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to send feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-[100] flex items-center gap-2 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">Found a problem?</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-[2rem] border shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <h3 className="font-black">Send Feedback</h3>
            <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">✓</div>
                <p className="font-bold text-slate-900">Thank you!</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Type</label>
                   <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                   >
                     <option>Feedback</option>
                     <option>Bug Report</option>
                     <option>Missing Feature</option>
                     <option>Content Quality</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</label>
                   <div className="flex gap-2">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => setRating(n)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${rating >= n ? 'text-yellow-400' : 'text-slate-200'}`}>
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full p-4 bg-slate-50 rounded-xl border-none font-medium text-sm outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px]"
                    placeholder="Describe your issue or suggestion..."
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Feedback</>}
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}
