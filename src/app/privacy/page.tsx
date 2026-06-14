export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-[3rem] shadow-sm border border-slate-100">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-500 font-bold mb-10 pb-10 border-b">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2>1. Information We Collect</h2>
          <p>We collect your email address for authentication and project delivery. When you analyze a project, we collect metadata about your source code (e.g., tech stack, file names) but do not store your full source code permanently unless specifically requested for template contributions.</p>

          <h2>2. How We Use Information</h2>
          <p>Your data is used to:</p>
          <ul>
            <li>Provide and improve our AI generation service.</li>
            <li>Verify payments and grant premium access.</li>
            <li>Send important account notifications.</li>
            <li>Analyze user behavior to improve the student experience.</li>
          </ul>

          <h2>3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data. Payment screenshots are stored securely and are only accessible by our verification team.</p>

          <h2>4. Third-Party Services</h2>
          <p>We use Microsoft Clarity for behavior analysis and Google Gemini API for documentation generation. These providers have their own privacy policies.</p>
        </div>
      </div>
    </div>
  );
}
