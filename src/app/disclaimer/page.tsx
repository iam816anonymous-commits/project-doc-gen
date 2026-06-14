export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Disclaimer</h1>
        <p className="text-slate-500 font-bold mb-10 pb-10 border-b">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2>1. "As-Is" Basis</h2>
          <p>ReportReady is provided on an "as-is" and "as-available" basis. We make no warranties, expressed or implied, regarding the accuracy, reliability, or completeness of the AI-generated documentation.</p>

          <h2>2. Academic Outcome</h2>
          <p>We do not guarantee any specific academic grade or result from using our service. Your final project grade depends entirely on your implementation, presentation, and institutional evaluation.</p>

          <h2>3. No Professional Advice</h2>
          <p>The information provided by ReportReady (especially system architecture and database design) is for informational purposes and should not be considered professional engineering advice.</p>

          <h2>4. Limitation of Liability</h2>
          <p>ReportReady shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our service.</p>
        </div>
      </div>
    </div>
  );
}
