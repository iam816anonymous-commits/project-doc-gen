'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    projectType: 'Web Development',
    techStack: '',
    problemStatement: '',
    features: '',
    teamSize: 1,
    academicLevel: 'BTech',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Project Details</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required type="text" name="title" placeholder="Project Title" onChange={handleChange} className="w-full p-2 border rounded"/>
          <select name="projectType" onChange={handleChange} className="w-full p-2 border rounded">
            <option>Web Development</option>
            <option>AI</option>
          </select>
          <input required type="text" name="techStack" placeholder="Tech Stack" onChange={handleChange} className="w-full p-2 border rounded"/>
          <textarea required name="problemStatement" placeholder="Problem Statement" onChange={handleChange} className="w-full p-2 border rounded"/>
          <textarea required name="features" placeholder="Features" onChange={handleChange} className="w-full p-2 border rounded"/>
          <input required type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded"/>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded">
            {loading ? 'Generating...' : 'Generate My Documentation'}
          </button>
        </form>
      </div>
    </div>
  );
}
