import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-black text-blue-600 flex items-center gap-2">
          <span className="bg-blue-600 text-white p-1 rounded-lg text-sm">📝</span>
          ReportReady
        </div>
        <nav className="flex items-center space-x-8">
          <Link href="#how-it-works" className="text-slate-600 hover:text-blue-600 font-bold text-sm hidden md:block">How It Works</Link>
          <Link href="#samples" className="text-slate-600 hover:text-blue-600 font-bold text-sm hidden md:block">Sample Reports</Link>
          <Link href="/generate" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Generate My Report
          </Link>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center">
             <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-blue-100">
               ✨ Built for Final Year Students
             </div>
             <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
               Project Submission <br/>
               <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Tomorrow?</span>
             </h1>
             <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-bold">
               Get Complete Report + Viva + PPT in Minutes. <br/>
               <span className="text-slate-500 font-medium">Upload Any Project Format. We handle the rest.</span>
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/generate" className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl text-xl font-black hover:bg-blue-700 transition shadow-2xl shadow-blue-200 inline-block">
                  Generate My Report
                </Link>
                <Link href="#samples" className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-2xl text-xl font-black border-2 border-slate-200 hover:border-slate-300 transition inline-block">
                  View Sample Report
                </Link>
             </div>
             <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-50 grayscale">
                <span className="font-bold text-slate-400">JNTU</span>
                <span className="font-bold text-slate-400">VTU</span>
                <span className="font-bold text-slate-400">Anna University</span>
                <span className="font-bold text-slate-400">MAKAUT</span>
                <span className="font-bold text-slate-400">KTU</span>
             </div>
          </div>
        </section>

        {/* Source Selection Section */}
        <section id="generate" className="py-24 bg-white px-6">
           <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-4">Start Here</h2>
              <p className="text-slate-500 mb-12">Upload your project to get started.</p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                 {[
                   { label: 'GitHub Repo', icon: '🔗', type: 'github' },
                   { label: 'Upload ZIP', icon: '📦', type: 'zip' },
                   { label: 'Upload PDF', icon: '📄', type: 'pdf' },
                   { label: 'Upload DOCX', icon: '📝', type: 'docx' },
                   { label: 'Describe Manually', icon: '⌨️', type: 'manual' }
                 ].map((source, i) => (
                   <Link key={i} href={`/generate?type=${source.type}`} className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-blue-600 hover:bg-white transition-all group">
                      <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">{source.icon}</span>
                      <span className="font-black text-slate-900">{source.label}</span>
                   </Link>
                 ))}
              </div>
           </div>
        </section>

        {/* The Workflow */}
        <section id="how-it-works" className="py-24 bg-slate-50 px-6">
           <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-black text-slate-900 mb-4">Submission Ready in 3 Steps</h2>
                <p className="text-slate-500">Stop wasting weeks on documentation. Focus on your code.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { step: "01", title: "Upload Project", desc: "Upload code (ZIP), link GitHub, or provide an existing draft report (PDF/DOCX)." },
                   { step: "02", title: "Get Insights", desc: "Our engine extracts your tech stack, features, and system architecture automatically." },
                   { step: "03", title: "Unlock Your Kit", desc: "Download your 17-section project report, 50+ Viva Q&A, and professional PPT slides." }
                 ].map((item, i) => (
                   <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group">
                      <div className="text-6xl font-black text-slate-100 group-hover:text-blue-50 transition-colors mb-6">{item.step}</div>
                      <h3 className="text-2xl font-black mb-4 text-slate-900">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Why Students Use ReportReady */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">Clear Your Final Year Project <br/>Submission This Week</h2>
              <div className="space-y-8">
                {[
                  { title: "Ready-to-submit project report", desc: "Get a comprehensive 17-section documentation package that meets university standards instantly." },
                  { title: "Clear Your Viva with Confidence", desc: "Get 50+ tailored Viva questions with detailed answers to help you clear your presentation." },
                  { title: "Upload your project & get report", desc: "Simply upload your GitHub repo or ZIP code. We extract tech stack and modules automatically." },
                  { title: "Finish your report in minutes", desc: "Saves 40+ hours of manual writing. Focus on your project demo, not the paperwork." }
                ].map((reason, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">✓</div>
                    <div>
                      <h4 className="font-black text-slate-900 mb-1">{reason.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{reason.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 blur-[80px] opacity-30"></div>
               <h3 className="text-2xl font-black mb-8">What You Get:</h3>
               <ul className="space-y-4">
                  {[
                    "17-Section Project Documentation",
                    "Full Project Synopsis",
                    "50+ Viva Questions & Answers",
                    "15-Slide PPT Presentation Kit",
                    "System Architecture & Modules",
                    "Database Schema Design",
                    "DOCX & PDF Formats"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium border-b border-slate-800 pb-3 last:border-0">
                      <span className="text-blue-500">◈</span> {item}
                    </li>
                  ))}
               </ul>
            </div>
          </div>
        </section>

        {/* Sample Output Section */}
        <section id="samples" className="py-24 px-6 bg-blue-600 text-white">
           <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl font-black mb-16">See the Quality for Yourself</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: "Abstract", desc: "Professional summary of your work." },
                   { label: "Viva Questions", desc: "Expected Q&A for your defense." },
                   { label: "PPT Outline", desc: "Structure for your presentation." },
                   { label: "Arch. Section", desc: "System modules & design." }
                 ].map((sample, i) => (
                   <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-left">
                      <div className="bg-white text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl mb-6">📄</div>
                      <h3 className="text-xl font-black mb-2">{sample.label}</h3>
                      <p className="text-blue-100 text-sm font-medium leading-relaxed">{sample.desc}</p>
                   </div>
                 ))}
              </div>
              <div className="mt-16">
                 <Link href="/generate" className="bg-white text-blue-600 px-10 py-5 rounded-2xl text-xl font-black hover:bg-slate-50 transition shadow-2xl inline-block">
                    View Full Example Reports
                 </Link>
              </div>
           </div>
        </section>

        {/* Pricing Card */}
        <section className="py-32 px-6">
          <div className="max-w-lg mx-auto bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest">Limited Offer</div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Complete Submission Kit</h2>
            <p className="text-slate-500 font-medium mb-8 italic">Everything you need to clear your project.</p>
            <div className="flex items-center justify-center gap-2 mb-10">
              <span className="text-slate-400 line-through text-2xl font-bold">₹499</span>
              <span className="text-6xl font-black text-slate-900">₹99</span>
              <span className="text-blue-600 font-black">/ project</span>
            </div>
            <Link href="/generate" className="block w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition shadow-xl shadow-blue-100">
               Get ReportReady Now
            </Link>
            <p className="mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest">Instant Access • PDF & DOCX • Viva Kit</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 max-w-3xl mx-auto border-t border-slate-100">
           <h2 className="text-4xl font-black text-slate-900 mb-16 text-center">Frequently Asked Questions</h2>
           <div className="space-y-12">
              {[
                { q: "Is the report university-standard?", a: "Yes. The generated documentation follows standard academic structures required by JNTU, VTU, Anna University, and others." },
                { q: "What if I don't have a GitHub URL?", a: "You can manually enter your project details and features. Our AI will still generate the complete documentation package for you." },
                { q: "How long does it take?", a: "Usually less than 2 minutes. The analysis and generation happen in real-time." },
                { q: "Can I edit the report later?", a: "Absolutely. We provide both DOCX and PDF formats. You can edit the DOCX file to add university-specific logos or guide names." }
              ].map((faq, i) => (
                <div key={i} className="border-b border-slate-100 pb-8 last:border-0">
                   <h4 className="text-xl font-black text-slate-900 mb-3">Q: {faq.q}</h4>
                   <p className="text-slate-500 leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
}
