'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function ReferralDashboardClient() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Max 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('screenshot', file);

    try {
      const res = await fetch('/api/referrals/evidence', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        window.location.reload();
      } else {
        setError('Failed to upload. Please try again.');
      }
    } catch (_err) {
      setError('An error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="relative group">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50/50 rounded-2xl p-10 text-center transition-all">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-slate-900 font-bold text-lg">
            {uploading ? 'Uploading...' : 'Click to Upload Screenshot'}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            WhatsApp, Telegram, or Discord group share
          </p>
        </div>
      </div>
    </div>
  );
}
