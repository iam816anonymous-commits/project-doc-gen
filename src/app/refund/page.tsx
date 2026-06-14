export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Refund Policy</h1>
        <p className="text-slate-500 font-bold mb-10 pb-10 border-b">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg font-bold text-slate-700">Due to the digital nature of our generated project documentation, all sales are final once the full report is unlocked.</p>

          <h2>Eligibility for Refund</h2>
          <p>We only issue refunds in the following specific cases:</p>
          <ul>
            <li><strong>Double Payment:</strong> If you were charged twice for the same project due to a technical error.</li>
            <li><strong>Failed Delivery:</strong> If you paid but the system failed to generate any documentation and our support team cannot resolve the issue within 48 hours.</li>
          </ul>

          <h2>Requesting a Refund</h2>
          <p>To request a refund, email support@reportready.in with your project ID and proof of payment. Requests must be made within 24 hours of purchase.</p>

          <h2>Exclusions</h2>
          <p>Refunds will not be granted for dissatisfaction with AI-generated content quality, as we provide a free preview (Abstract & Objectives) for every project before purchase.</p>
        </div>
      </div>
    </div>
  );
}
