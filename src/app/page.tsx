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
          <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium">How It Works</Link>
          <Link href="#samples" className="text-gray-600 hover:text-blue-600 font-medium hidden md:block">View Samples</Link>
          <Link href="/generate" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Generate Now
          </Link>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gray-50 py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
             <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-6 inline-block">New: GitHub Integration Beta</span>
             <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
               Paste GitHub Repository <br/>
               <span className="text-blue-600">Get Complete Documentation</span>
             </h1>
             <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
               Built a project but hate writing reports? Jules analyzes your code structure and generates a full academic submission kit in minutes.
             </p>
             <div className="flex flex-col items-center gap-4">
                <Link href="/generate" className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-2xl font-bold hover:bg-blue-700 transition shadow-xl inline-block">
                  Generate My Submission Kit
                </Link>
                <p className="text-sm text-gray-500 italic">Trusted by 100+ students from JNTU, VTU, and Anna University.</p>
             </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-white px-6">
           <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">3 Simple Steps to Submission</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                 <div>
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
                    <h3 className="text-xl font-bold mb-2">Paste GitHub URL</h3>
                    <p className="text-gray-600">Provide your repository link. We support React, Python, Java, Node.js and more.</p>
                 </div>
                 <div>
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
                    <h3 className="text-xl font-bold mb-2">AI Code Analysis</h3>
                    <p className="text-gray-600">Our engine analyzes your README, dependencies, and project structure automatically.</p>
                 </div>
                 <div>
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
                    <h3 className="text-xl font-bold mb-2">Download Kit</h3>
                    <p className="text-gray-600">Get your 17-section Report, PPT Outline, and Viva Questions instantly.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Outcomes Section */}
        <section id="samples" className="py-20 px-6 max-w-6xl mx-auto bg-gray-50 rounded-3xl my-10">
           <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Students buy outcomes, not features</h2>
           <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">See the documentation quality generated for actual repositories.</p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {samples.map((sample) => (
                <div key={sample.id} className="group border rounded-2xl overflow-hidden hover:border-blue-500 transition shadow-sm bg-white">
                   <div className="bg-gray-100 h-40 flex items-center justify-center relative overflow-hidden">
                      <div className="z-10 bg-white/90 px-6 py-2 rounded-full border shadow-sm font-bold text-blue-600">
                         {sample.title}
                      </div>
                   </div>
                   <div className="p-6 flex justify-between items-center">
                      <div>
                         <h3 className="font-bold text-lg">{sample.title}</h3>
                         <p className="text-sm text-gray-500 italic">Complete Submission Kit ready</p>
                      </div>
                      <Link href="/generate" className="text-blue-600 font-bold hover:underline">
                         Try it now →
                      </Link>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Pricing */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-md mx-auto bg-white p-12 rounded-3xl border-4 border-blue-600 shadow-2xl relative">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">MVP Pricing</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Submission Kit</h2>
            <div className="text-6xl font-black text-gray-900 mb-6">₹99</div>
            <ul className="text-left text-gray-600 space-y-4 mb-10">
              <li className="flex items-center font-medium"><span className="text-green-500 mr-2">✓</span> Full GitHub Repo Analysis</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Professional DOCX & PDF</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 50+ Viva Q&A & PPT Kit</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> University Format Tailoring</li>
            </ul>
            <Link href="/generate" className="block w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition">
               Unlock My Kit Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12 px-6 text-center text-gray-500">
        <p>© 2024 Jules AI. Focus on coding, let us handle the report.</p>
      </footer>
    </div>
  );
}
