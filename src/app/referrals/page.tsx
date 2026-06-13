import { cookies } from 'next/headers';
import db from '@/lib/db';
import { Users, UserPlus, Zap, Share2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import ReferralDashboardClient from './ReferralDashboardClient';

export default async function ReferralDashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to view your referrals</h1>
          <Link href="/" className="text-blue-600 hover:underline">Go to Home</Link>
        </div>
      </div>
    );
  }

  const user = db.prepare('SELECT referral_code FROM users WHERE id = ?').get(userId) as { referral_code: string };

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'REGISTERED' THEN 1 ELSE 0 END) as registered,
      SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) as converted
    FROM referrals
    WHERE referrer_id = ?
  `).get(userId) as { total: number, registered: number, converted: number };

  const evidence = db.prepare(`
    SELECT * FROM referral_evidence
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as any[];

  const isEligible = (stats?.converted || 0) > 0 || evidence.some(e => e.status === 'APPROVED');

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Referral Program</h1>
          <p className="text-slate-600 mt-2">Share ReportReady with your friends and get 50% discount.</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Referral Code</p>
              <div className="flex items-center gap-3">
                <code className="text-2xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  {user?.referral_code || 'N/A'}
                </code>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Your Discount Status</p>
              <div className="flex items-center gap-2">
                {isEligible ? (
                  <span className="flex items-center gap-1.5 text-green-600 font-bold text-xl">
                    <CheckCircle className="w-6 h-6" /> Eligible (₹49)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 font-bold text-xl">
                    <Clock className="w-6 h-6" /> Standard (₹99)
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-end">
              <div className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                <Share2 className="w-4 h-4" /> Share Link
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-slate-500 font-medium">Total Referrals</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.total || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-slate-500 font-medium">Joined</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.registered || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-slate-500 font-medium">Converted (Paid)</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.converted || 0}</p>
          </div>
        </div>

        {/* Manual Evidence Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Social Share Verification</h2>
            <p className="text-slate-500 mt-1">
              If you shared ReportReady in your college groups, upload a screenshot to get a manual discount.
            </p>
          </div>

          <div className="p-8">
            <ReferralDashboardClient />
          </div>

          {evidence.length > 0 && (
            <div className="px-8 pb-8">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Previous Submissions</h3>
              <div className="space-y-4">
                {evidence.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
                        <img src={item.image_path} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</p>
                        <p className="font-medium text-slate-900">Share Screenshot</p>
                      </div>
                    </div>
                    <div>
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> APPROVED
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                          <AlertCircle className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
