'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OTPLogin({ onSuccess }: { onSuccess: (userId: string) => void }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) setStep('code');
      else setError(data.error);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (res.ok) onSuccess(data.userId);
      else setError(data.error);
    } catch (err) {
      setError('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border shadow-sm max-w-md mx-auto">
      <h2 className="text-2xl font-black mb-2">Login to Continue</h2>
      <p className="text-slate-500 mb-6 font-medium">We&apos;ll send a 6-digit code to your email.</p>

      {step === 'email' ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your student email"
            className="w-full px-6 py-4 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <input
            type="text"
            placeholder="6-digit code"
            className="w-full px-6 py-4 rounded-xl border font-black tracking-[1em] text-center focus:ring-2 focus:ring-blue-500 outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button type="button" onClick={() => setStep('email')} className="w-full text-blue-600 font-bold text-sm">Change Email</button>
        </form>
      )}
      {error && <p className="text-red-500 mt-4 font-bold text-sm">{error}</p>}
    </div>
  );
}
