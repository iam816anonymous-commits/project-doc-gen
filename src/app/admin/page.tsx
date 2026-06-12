import db from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Submission {
  id: string;
  user_id: string;
  project_id: string;
  screenshot_path: string;
  status: string;
  submitted_at: string;
  verified_at: string | null;
  project_title: string;
  user_email: string;
}

export default async function AdminPage() {
  const submissions = db.prepare(`
    SELECT s.*, p.title as project_title, u.email as user_email
    FROM payment_submissions s
    JOIN projects p ON s.project_id = p.id
    JOIN users u ON s.user_id = u.id
    ORDER BY s.submitted_at DESC
  `).all() as Submission[];

  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM projects) as total_projects,
      (SELECT COUNT(*) FROM payment_submissions) as total_submissions,
      (SELECT COUNT(*) FROM payment_submissions WHERE status = 'APPROVED') as approved_payments,
      (SELECT COUNT(*) FROM projects WHERE is_paid = 1) as paid_projects,
      (SELECT COUNT(*) FROM report_cache) as cached_reports
    FROM users LIMIT 1
  `).get() as {
    total_users: number,
    total_projects: number,
    total_submissions: number,
    approved_payments: number,
    paid_projects: number,
    cached_reports: number
  } || { total_users: 0, total_projects: 0, total_submissions: 0, approved_payments: 0, paid_projects: 0, cached_reports: 0 };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-12">
           {[
             { label: 'Total Users', val: stats.total_users },
             { label: 'Projects Generated', val: stats.total_projects },
             { label: 'Cached Reports', val: stats.cached_reports },
             { label: 'Screenshots Uploaded', val: stats.total_submissions },
             { label: 'Payments Approved', val: stats.approved_payments },
             { label: 'Revenue (₹)', val: stats.approved_payments * 99 }
           ].map((s, i) => (
             <div key={i} className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.val}</p>
             </div>
           ))}
        </div>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">User</th>
              <th className="border p-2">Project</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.id}>
                <td className="border p-2">{sub.user_email}</td>
                <td className="border p-2">{sub.project_title}</td>
                <td className="border p-2">{sub.status}</td>
                <td className="border p-2">
                  {sub.status === 'PENDING' && (
                    <form action="/api/admin/verify-payment" method="POST">
                      <input type="hidden" name="submissionId" value={sub.id} />
                      <button name="action" value="APPROVE" className="text-green-600 mr-2">Approve</button>
                      <button name="action" value="REJECT" className="text-red-600">Reject</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
