'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    title: '',
    projectType: 'Web Development',
    techStack: '',
    problemStatement: '',
    features: '',
    teamSize: 1,
    academicLevel: 'BTech',
    email: '',
    otp: '',
    githubUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) {
        setStep('otp');
      } else {
        alert('Failed to send OTP.');
      }
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verify OTP
      const authRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, token: formData.otp }),
      });

      if (!authRes.ok) {
        alert('Invalid OTP.');
        setLoading(false);
        return;
      }

      // 2. Generate Content
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.projectId) {
        router.push(`/project/${data.projectId}`);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border text-center">
           <h1 className="text-2xl font-bold mb-4">Verify Identity</h1>
           <p className="text-gray-600 mb-8">We&apos;ve sent a 6-digit code to <strong>{formData.email}</strong></p>
           <form onSubmit={handleVerifyAndGenerate} className="space-y-6">
              <input
                required
                type="text"
                name="otp"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
                placeholder="000000"
                className="w-full text-center text-3xl tracking-widest font-mono p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:bg-blue-300 shadow-md"
              >
                {loading ? 'Verifying & Generating...' : 'Verify & Generate'}
              </button>
              <button type="button" onClick={() => setStep('details')} className="text-sm text-gray-500 hover:underline">Change email</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Project Details</h1>
        <p className="text-center text-gray-500 mb-8 italic">New: Paste GitHub URL to auto-fill (Beta)</p>

        <form onSubmit={handleRequestOTP} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8">
             <label className="block text-sm font-bold text-blue-800 mb-2">GitHub Repository URL (Optional)</label>
             <input
                type="url"
                name="githubUrl"
                placeholder="https://github.com/user/project"
                value={formData.githubUrl}
                onChange={handleChange}
                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
             />
             <p className="text-xs text-blue-600 mt-2">✨ Automatic analysis of README, code structure, and dependencies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required type="text" name="title" placeholder="Project Title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded"/>
            <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full p-2 border rounded">
              <option>Web Development</option>
              <option>AI</option>
              <option>Mobile App</option>
              <option>IoT</option>
              <option>Cybersecurity</option>
            </select>
          </div>
          <input required type="text" name="techStack" placeholder="Tech Stack (e.g. React, Node.js)" value={formData.techStack} onChange={handleChange} className="w-full p-2 border rounded"/>
          <textarea required name="problemStatement" placeholder="What problem does it solve?" value={formData.problemStatement} onChange={handleChange} className="w-full p-2 border rounded" rows={3}/>
          <textarea required name="features" placeholder="List key features..." value={formData.features} onChange={handleChange} className="w-full p-2 border rounded" rows={3}/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select name="academicLevel" value={formData.academicLevel} onChange={handleChange} className="w-full p-2 border rounded">
              <option>Diploma</option>
              <option>BCA</option>
              <option>MCA</option>
              <option>BTech</option>
              <option>MTech</option>
            </select>
            <input type="number" name="teamSize" value={formData.teamSize} onChange={handleChange} min="1" className="w-full p-2 border rounded"/>
          </div>
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded"/>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded font-bold text-lg">
            {loading ? 'Sending OTP...' : 'Generate Documentation'}
          </button>
        </form>
      </div>
    </div>
  );
}
