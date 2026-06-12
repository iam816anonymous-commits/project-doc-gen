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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
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
