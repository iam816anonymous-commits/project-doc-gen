'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) router.push('/admin');
    else alert('Invalid credentials');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-xl">
           <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 text-center mb-8">Admin Access</h1>
        <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
             <label className="text-xs font-black uppercase tracking-widest text-slate-400">Username</label>
             <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:border-blue-600 transition" />
           </div>
           <div className="space-y-2">
             <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:border-blue-600 transition" />
           </div>
           <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition shadow-xl shadow-blue-100">
             {loading ? 'Logging in...' : 'Sign In'}
           </button>
        </form>
      </div>
    </div>
  );
}
