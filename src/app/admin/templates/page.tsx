'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Eye, Edit3, Trash2 } from 'lucide-react';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await fetch('/api/admin/templates');
    if (res.ok) {
      const data = await res.json();
      setTemplates(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) {
      fetchTemplates();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">University Templates</h1>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
          {templates.length} Active Templates
        </div>
      </div>

      <div className="grid gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black">{template.university_name}</h3>
              <p className="text-slate-500 font-medium">{template.department || 'All Departments'} • {template.degree_type || 'General'}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  template.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  template.status === 'VERIFIED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {template.status}
                </span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black">
                  Confidence: {(template.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              {template.status !== 'ACTIVE' && (
                <button
                  onClick={() => updateStatus(template.id, 'ACTIVE')}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                  title="Approve & Activate"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
              <button className="bg-slate-100 text-slate-700 p-2 rounded-lg hover:bg-slate-200 transition">
                <Eye className="w-5 h-5" />
              </button>
              <button className="bg-slate-100 text-slate-700 p-2 rounded-lg hover:bg-slate-200 transition">
                <Edit3 className="w-5 h-5" />
              </button>
              <button className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
            <p className="text-slate-400 font-bold uppercase tracking-widest">No templates found</p>
          </div>
        )}
      </div>
    </div>
  );
}
