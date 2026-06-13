'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UnlockActions({ projectId, hasCredits }: { projectId: string, hasCredits: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleUnlockWithCredit = async () => {
    if (!confirm('Use 1 Free Credit to unlock this project?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/project/unlock-with-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Unlock failed');
      }
    } catch (err) {
      alert('Unlock failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link href={`/project/${projectId}/pay`} className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black inline-block hover:bg-slate-50 transition text-center">
        Unlock with Payment (₹99)
      </Link>
      {hasCredits && (
        <button
          onClick={handleUnlockWithCredit}
          disabled={loading}
          className="bg-blue-500 text-white border-2 border-white/20 px-8 py-4 rounded-2xl font-black inline-block hover:bg-blue-400 transition disabled:opacity-50"
        >
          {loading ? 'Unlocking...' : 'Unlock with 1 Free Credit'}
        </button>
      )}
    </div>
  );
}
