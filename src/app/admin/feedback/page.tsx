'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    const res = await fetch('/api/admin/feedback');
    if (res.ok) {
      const data = await res.json();
      setFeedbackList(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/admin/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) {
      fetchFeedback();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;

  const stats = {
    total: feedbackList.length,
    approved: feedbackList.filter(f => f.status === 'APPROVED').length,
    rejected: feedbackList.filter(f => f.status === 'REJECTED').length,
    pending: feedbackList.filter(f => f.status === 'PENDING').length,
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Founding Student Feedback</h1>
        <div className="flex gap-4">
           {Object.entries(stats).map(([label, value]) => (
             <div key={label} className="bg-white px-4 py-2 rounded-xl border shadow-sm">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">{label}</span>
                <span className="text-xl font-black">{value}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="grid gap-6">
        {feedbackList.map((f) => (
          <div key={f.id} className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                   <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                   <h3 className="font-black text-slate-900">{f.email}</h3>
                   <p className="text-slate-400 text-xs font-bold">{new Date(f.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-2xl font-black text-blue-600">{f.rating}/5</span>
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                   f.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                   f.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                 }`}>
                   {f.status}
                 </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">What was useful?</label>
                  <p className="text-slate-700 font-medium leading-relaxed">{f.what_was_useful}</p>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">What was missing?</label>
                  <p className="text-slate-700 font-medium leading-relaxed">{f.what_was_missing}</p>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">What confused you?</label>
                  <p className="text-slate-700 font-medium leading-relaxed">{f.what_confused_you}</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Recommend?</label>
                    {f.recommend ? (
                        <div className="flex items-center gap-2 text-green-600 font-black">
                           <ThumbsUp className="w-4 h-4" /> Yes
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-600 font-black">
                           <ThumbsDown className="w-4 h-4" /> No
                        </div>
                    )}
                  </div>
                  {f.reward_granted === 1 && (
                    <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-yellow-200">
                        Reward Granted
                    </div>
                  )}
               </div>
            </div>

            {f.status === 'PENDING' && (
              <div className="flex gap-4 border-t pt-6">
                <button
                  onClick={() => updateStatus(f.id, 'APPROVED')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-green-700 transition"
                >
                   <CheckCircle2 className="w-5 h-5" /> Approve & Reward
                </button>
                <button
                  onClick={() => updateStatus(f.id, 'REJECTED')}
                  className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-red-100 transition"
                >
                   <XCircle className="w-5 h-5" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {feedbackList.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
            <p className="text-slate-400 font-bold uppercase tracking-widest">No feedback submissions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
