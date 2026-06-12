import Link from 'next/link';

export default function Home() {
  const samples = [
    { title: "Hospital Management", id: "f81d9ddf-ffd8-4fbc-8163-90c3af16dc9d" },
    { title: "AI Resume Analyzer", id: "74deee66-1701-4c54-bdcb-592f128ef81a" },
    { title: "E-Commerce Website", id: "8cce1396-d78c-49a7-979b-4e2f7e30e3fd" },
    { title: "Student Management", id: "c056c5da-dd0e-4e83-a762-997e637bd449" }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-bold text-blue-600">Jules</div>
        <nav className="flex items-center space-x-6">
          <Link href="#samples" className="text-gray-600 hover:text-blue-600 font-medium">View Samples</Link>
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
          <div className="flex flex-col items-center gap-4">
             <Link href="/generate" className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-2xl font-bold hover:bg-blue-700 transition shadow-xl inline-block">
               Generate My Package
             </Link>
             <p className="text-sm text-gray-500 italic">No credit card required to start previewing.</p>
          </div>
        </section>

        {/* Free Preview Value Prop */}
        <section className="py-12 bg-blue-50 border-y border-blue-100 text-center">
           <p className="text-blue-800 font-bold text-lg">
             ✨ Proof of Quality: Preview your Project Abstract & Objectives for FREE before you pay.
           </p>
        </section>

        {/* Outcomes / Real Samples */}
        <section id="samples" className="py-20 px-6 max-w-6xl mx-auto">
           <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Students buy outcomes, not features</h2>
           <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">Don&apos;t take our word for it. See the actual quality of documentation we generate for popular projects.</p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {samples.map((sample) => (
                <div key={sample.id} className="group border rounded-2xl overflow-hidden hover:border-blue-500 transition shadow-sm bg-white">
                   <div className="bg-gray-100 h-48 flex items-center justify-center font-mono text-gray-400 relative overflow-hidden">
                      <div className="absolute inset-0 p-4 opacity-50 select-none">
                         <div className="h-4 w-1/3 bg-gray-300 rounded mb-4"></div>
                         <div className="h-2 w-full bg-gray-200 rounded mb-2"></div>
                         <div className="h-2 w-full bg-gray-200 rounded mb-2"></div>
                         <div className="h-2 w-2/3 bg-gray-200 rounded mb-4"></div>
                         <div className="h-4 w-1/4 bg-gray-300 rounded mb-4"></div>
                         <div className="h-2 w-full bg-gray-200 rounded mb-2"></div>
                         <div className="h-2 w-5/6 bg-gray-200 rounded"></div>
                      </div>
                      <div className="z-10 bg-white/90 px-6 py-2 rounded-full border shadow-sm font-bold text-blue-600">
                         {sample.title}
                      </div>
                   </div>
                   <div className="p-6 flex justify-between items-center">
                      <div>
                         <h3 className="font-bold text-lg">{sample.title}</h3>
                         <p className="text-sm text-gray-500 italic">Full 17-section report ready</p>
                      </div>
                      {/* Note: guest view might be restricted by user_id cookie,
                          but for public samples we might need a special route or bypass.
                          For now, we link to the generate flow. */}
                      <Link href="/generate" className="text-blue-600 font-bold hover:underline">
                         View Preview →
                      </Link>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Pricing */}
        <section className="py-24 px-6 text-center bg-gray-50">
          <div className="max-w-md mx-auto bg-white p-12 rounded-3xl border-4 border-blue-600 shadow-2xl relative">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Launch Offer</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Package</h2>
            <div className="text-6xl font-black text-gray-900 mb-6">₹99</div>
            <ul className="text-left text-gray-600 space-y-4 mb-10">
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Full 17-Section Document</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Professional DOCX Download</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Print-Ready PDF Download</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 50+ Viva Questions & PPT Outline</li>
            </ul>
            <Link href="/generate" className="block w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition">
               Get My Report Now
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 max-w-4xl mx-auto text-center">
           <h2 className="text-3xl font-bold mb-12 text-gray-900 font-serif">Trusted by final year students</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 italic text-gray-600 font-serif">
              <div className="bg-white p-8 rounded-2xl border shadow-sm relative">
                 <span className="absolute top-4 left-4 text-6xl text-blue-100 font-serif">“</span>
                 &quot;This saved me weeks of work! The viva questions were exactly what my examiner asked.&quot;
                 <p className="mt-4 font-bold not-italic text-gray-900 font-sans">— Rahul, BTech Final Year</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border shadow-sm relative">
                 <span className="absolute top-4 left-4 text-6xl text-blue-100 font-serif">“</span>
                 &quot;Amazing quality for just ₹99. The SRS was very professional and well-structured.&quot;
                 <p className="mt-4 font-bold not-italic text-gray-900 font-sans">— Priya, MCA Student</p>
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
