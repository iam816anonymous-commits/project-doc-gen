'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

const SAMPLES = [
  { id: 'hospital', name: 'Hospital Management System', file: 'Hospital_Management_System.json' },
  { id: 'library', name: 'Library Management System', file: 'Library_Management_System.json' },
  { id: 'attendance', name: 'Attendance Management System', file: 'Attendance_Management_System.json' },
  { id: 'resume', name: 'AI Resume Analyzer', file: 'AI_Resume_Analyzer.json' },
  { id: 'ecommerce', name: 'E-Commerce Platform', file: 'E-Commerce_Platform.json' }
];

export default function SamplesPage() {
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadSample = async (sample: any) => {
    setLoading(true);
    try {
      // In a real app, these would be in public or fetched from an API
      // For MVP, we'll simulate the data based on the docs created earlier
      const res = await fetch(`/samples/data/${sample.file}`);
      const data = await res.json();
      setSelected({ ...sample, data });
    } catch (err) {
      console.error('Failed to load sample');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Sample Project Packages</h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            See exactly what you get when you generate your report with ReportReady.
            Every package includes 17 sections, Viva Q&A, and PPT Outlines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSample(s)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${selected?.id === s.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-white text-slate-900 border-transparent hover:border-slate-200'}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${selected?.id === s.id ? 'text-blue-200' : 'text-slate-400'}`} />
                  <span className="font-black text-sm">{s.name}</span>
                </div>
              </button>
            ))}

            <Link href="/generate" className="block w-full bg-slate-900 text-white p-6 rounded-2xl text-center font-black mt-8 hover:bg-black transition">
              Generate Yours Now
            </Link>
          </div>

          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-white rounded-[2.5rem] border shadow-sm p-8 md:p-12 space-y-12">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                       <h2 className="text-3xl font-black text-slate-900 mb-2">{selected.name}</h2>
                       <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black uppercase">Sample Output</span>
                    </div>
                    <Link href="/generate" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm">Create Full Report</Link>
                  </div>

                  <div className="space-y-12">
                    <section>
                      <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" /> Abstract
                      </h3>
                      <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl">{selected.data.Abstract}</p>
                    </section>

                    <section>
                      <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" /> Objectives
                      </h3>
                      <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl whitespace-pre-wrap">{selected.data.Objectives}</p>
                    </section>

                    <section>
                      <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" /> Modules
                      </h3>
                      <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl whitespace-pre-wrap">{selected.data.Modules}</p>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8">
                       <section className="bg-slate-900 text-white p-8 rounded-3xl">
                          <h3 className="text-xl font-black mb-6 text-blue-400">Viva Questions</h3>
                          <p className="text-slate-300 font-medium whitespace-pre-wrap text-sm leading-loose">{selected.data['Viva Questions']}</p>
                       </section>
                       <section className="bg-blue-600 text-white p-8 rounded-3xl">
                          <h3 className="text-xl font-black mb-6 text-blue-200">PPT Outline</h3>
                          <p className="text-blue-50 font-medium whitespace-pre-wrap text-sm leading-loose">{selected.data['PPT Outline']}</p>
                       </section>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-dashed p-20 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-slate-300" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 mb-2">Select a Sample</h3>
                 <p className="text-slate-500 max-w-xs font-medium">Click on a project on the left to preview the quality of our generated documentation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
