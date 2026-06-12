'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', id);
    await fetch('/api/payments/submit', { method: 'POST', body: formData });
    router.push(`/project/${id}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Complete Payment</h1>
        <p>UPI ID: jules@upi</p>
        <input type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="my-4 block w-full"/>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">Submit Screenshot</button>
      </form>
    </div>
  );
}
