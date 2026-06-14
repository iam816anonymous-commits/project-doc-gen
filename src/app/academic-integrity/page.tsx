export default function AcademicIntegrityPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Academic Integrity</h1>
        <p className="text-slate-500 font-bold mb-10 pb-10 border-b">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none prose-h2:text-2xl prose-h2:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
          <p className="text-lg font-bold text-blue-600 italic">ReportReady is designed to be a drafting assistant, not a replacement for your own learning and project work.</p>

          <p>We believe in empowering students to focus on solving complex engineering problems and writing code, while we help bridge the gap between their technical work and the required academic documentation.</p>

          <h2>Guidelines for Ethical Use</h2>
          <ul>
            <li><strong>Foundational Drafts:</strong> Use the generated documentation as a foundation or template. It provides the structure and academic tone, which you should then refine with your specific project implementation details.</li>
            <li><strong>Review & Verify:</strong> AI can sometimes hallucinate. Always review every section (especially System Requirements and Database Design) against your actual project.</li>
            <li><strong>Viva Preparation:</strong> Use the generated Viva questions to test your knowledge. Ensure you can explain every answer in your own words before your presentation.</li>
            <li><strong>Institutional Compliance:</strong> Consult your university or college&apos;s policy on using AI tools in academic submissions. Institutional rules vary and always take precedence.</li>
          </ul>

          <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 mt-12">
            <h3 className="text-blue-900 font-black mb-2 mt-0">Student Responsibility</h3>
            <p className="text-blue-800 text-sm mb-0">Most universities require students to declare the use of AI tools in their work. We strongly recommend transparency with your project guide or department head. Using this tool to deceive your institution is a violation of our terms and your academic code of conduct.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
