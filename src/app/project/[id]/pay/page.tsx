'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

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
      await fetch('/api/payments/submit', { method: 'POST', body: formData });

      router.push(`/project/${id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Unlock Full Kit</h1>

          <div className="bg-blue-50 p-6 rounded-xl mb-8 border border-blue-100">
            <p className="text-sm text-blue-600 font-bold mb-2 uppercase tracking-wide">Step 1: Pay ₹99 via UPI</p>
            <p className="text-xl font-black text-gray-900 mb-4">jules@upi</p>
            <p className="text-xs text-blue-500">Scan QR or pay to the ID above and take a screenshot.</p>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-600 font-bold mb-3 uppercase tracking-wide">Step 2: Upload Screenshot</p>
            <input
              type="file"
              required
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
            />
          </div>

          <div className="mb-8">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 leading-tight">
                I have read and agree to the {' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms of Service</a>, {' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>, {' '}
                <a href="/disclaimer" target="_blank" className="text-blue-600 hover:underline">Disclaimer</a>, and {' '}
                <a href="/academic-integrity" target="_blank" className="text-blue-600 hover:underline">Academic Integrity Notice</a>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || !agreed || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
              (!file || !agreed || loading)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit & Unlock Kit'}
          </button>
        </form>
      </div>
    </div>
  );
}
