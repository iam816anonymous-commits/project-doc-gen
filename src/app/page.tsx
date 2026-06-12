import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-bold text-blue-600">Jules</div>
        <nav>
          <Link href="/generate" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Generate Now
          </Link>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gray-50 py-24 px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 max-w-5xl mx-auto leading-tight">
            Stop Worrying About <span className="text-blue-600">Project Documentation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Get your complete BTech, MCA, or BCA project documentation package in just 2 minutes. ₹99 only.
          </p>
          <Link href="/generate" className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-2xl font-bold hover:bg-blue-700 transition shadow-xl inline-block">
            Generate My Package
          </Link>
          <p className="mt-4 text-sm text-gray-500 italic">No credit card required to start previewing.</p>
        </section>

        {/* What You Get */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Everything you need for submission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Project Synopsis', desc: '100% approval-ready synopsis with abstract and objectives.' },
              { title: 'Full SRS & Report', desc: 'Detailed 17-section documentation covering Methodology to Testing.' },
              { title: 'Viva & PPT', desc: 'Over 50+ potential viva questions and a complete PPT structure.' },
              { title: 'DOCX & PDF', desc: 'Download in standard academic formats ready to print.' },
              { title: 'Tech Stack Specific', desc: 'Content tailored to your React, Python, Java or any other stack.' },
              { title: 'Instant Delivery', desc: 'Unlock your package immediately after simple UPI payment.' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center text-blue-600 text-xl font-bold">✓</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sample Preview Section */}
        <section className="bg-blue-600 py-20 px-6 text-white text-center">
          <h2 className="text-3xl font-bold mb-8">See it in action</h2>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 overflow-hidden">
             <div className="bg-gray-100 p-8 rounded-xl text-left">
                <div className="h-4 w-1/4 bg-blue-200 rounded mb-4"></div>
                <div className="h-8 w-3/4 bg-gray-200 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-400 font-mono text-sm">
                   [SAMPLE GENERATED CONTENT FOR &quot;AI RESUME ANALYZER&quot;]
                </div>
             </div>
          </div>
          <p className="mt-10 text-lg opacity-90">Tailored documentation for AI, Web, Mobile, IoT, and more.</p>
        </section>

        {/* Pricing */}
        <section className="py-24 px-6 text-center bg-gray-50">
          <div className="max-w-md mx-auto bg-white p-12 rounded-3xl border-4 border-blue-600 shadow-2xl relative">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">MVP Launch Offer</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Full Project Package</h2>
            <div className="text-6xl font-black text-gray-900 mb-6">₹99</div>
            <ul className="text-left text-gray-600 space-y-4 mb-10">
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Full DOCX Download</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Full PDF Download</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Viva Questions</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> PPT Presentation Structure</li>
            </ul>
            <Link href="/generate" className="block w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition">
               Get Started Now
            </Link>
          </div>
        </section>

        {/* Testimonials Placeholder */}
        <section className="py-20 px-6 max-w-4xl mx-auto text-center">
           <h2 className="text-3xl font-bold mb-12">What students are saying</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 italic text-gray-600">
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                 &quot;This saved me weeks of work! The viva questions were exactly what my examiner asked.&quot;
                 <p className="mt-4 font-bold not-italic text-gray-900">— Rahul, BTech Final Year</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                 &quot;Amazing quality for just ₹99. The SRS was very professional and well-structured.&quot;
                 <p className="mt-4 font-bold not-italic text-gray-900">— Priya, MCA Student</p>
              </div>
           </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12 px-6 text-center text-gray-500">
        <div className="mb-6 flex justify-center space-x-6">
           <Link href="/generate" className="hover:text-blue-600 transition">Generate</Link>
           <Link href="/" className="hover:text-blue-600 transition">Privacy Policy</Link>
           <Link href="/" className="hover:text-blue-600 transition">Contact Us</Link>
        </div>
        <p>© 2024 Jules AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
