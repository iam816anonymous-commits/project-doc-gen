'use client';

import { useState } from 'react';
import { Check, X, MessageSquare, CreditCard, Share2, Star } from 'lucide-react';

export default function AdminTabs({ submissions, feedback, evidence, adminSecret }: any) {
  const [activeTab, setActiveTab] = useState('payments');

  const handleVerifyEvidence = async (id: string, status: string) => {
    const res = await fetch('/api/admin/referrals/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': adminSecret
      },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) window.location.reload();
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'payments' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CreditCard className="w-4 h-4" /> Payments
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'feedback' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquare className="w-4 h-4" /> Feedback
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'referrals' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Share2 className="w-4 h-4" /> Referral Proofs
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b">
                <tr>
                  <th className="pb-4">User</th>
                  <th className="pb-4">Project</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="text-sm">
                    <td className="py-4 font-medium text-gray-900">{sub.user_email}</td>
                    <td className="py-4 text-gray-600">{sub.project_title}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${sub.status === 'APPROVED' ? 'bg-green-100 text-green-700' : sub.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {sub.status === 'PENDING' && (
                        <div className="flex gap-2">
                           <a href={sub.screenshot_path} target="_blank" className="text-blue-600 hover:underline">View Proof</a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {feedback.map((f: any) => (
              <div key={f.id} className="p-4 bg-gray-50 rounded-xl border">
                <div className="flex justify-between mb-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-900 font-medium mb-1">{f.comment}</p>
                <p className="text-xs text-gray-500">— {f.user_email}</p>
              </div>
            ))}
            {feedback.length === 0 && <p className="text-center text-gray-400 py-10">No feedback yet.</p>}
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evidence.map((ev: any) => (
              <div key={ev.id} className="bg-gray-50 rounded-2xl border overflow-hidden">
                <div className="aspect-video relative group">
                  <img src={ev.image_path} alt="Evidence" className="w-full h-full object-cover" />
                  <a href={ev.image_path} target="_blank" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">View Full Size</a>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{ev.user_email}</p>
                  <p className="text-xs font-bold uppercase mb-4 tracking-wider">Status: <span className={ev.status === 'APPROVED' ? 'text-green-600' : ev.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'}>{ev.status}</span></p>

                  {ev.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleVerifyEvidence(ev.id, 'APPROVED')}
                        className="flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleVerifyEvidence(ev.id, 'REJECTED')}
                        className="flex items-center justify-center gap-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {evidence.length === 0 && <p className="col-span-full text-center text-gray-400 py-10">No referral proofs submitted yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
