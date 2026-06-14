export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Terms of Service</h1>
        <p className="text-slate-500 font-bold mb-10 pb-10 border-b">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>By using ReportReady, you agree to these terms and our Academic Integrity policy. If you do not agree, please do not use our service.</p>

          <h2>2. Service Description</h2>
          <p>ReportReady provides an AI-powered drafting assistant for academic project documentation. The content generated is intended to be used as a template or starting point only.</p>

          <h2>3. User Responsibilities</h2>
          <p>You are responsible for:</p>
          <ul>
            <li>Providing accurate project information.</li>
            <li>Verifying the accuracy of all generated content.</li>
            <li>Complying with your educational institution&apos;s rules regarding AI usage.</li>
          </ul>

          <h2>4. Payments & Delivery</h2>
          <p>Full project kits are unlocked upon verification of payment. We reserve the right to refuse service if fraudulent activity is suspected.</p>

          <h2>5. Intellectual Property</h2>
          <p>You retain ownership of the project details you provide. ReportReady grants you a non-exclusive license to use the generated content for your personal academic requirements.</p>
        </div>
      </div>
    </div>
  );
}
