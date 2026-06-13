export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 prose prose-blue">
      <h1>Contact Us</h1>
      <p className="text-gray-500">Last Updated: June 15, 2026</p>

      <p>For support, business inquiries, or technical issues, please reach out to us:</p>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
        <p className="font-bold text-blue-900 mb-1">Email Support</p>
        <p className="text-blue-700">support@reportready.in</p>
      </div>

      <p className="mt-8">Our team typically responds within 24-48 hours during business days.</p>
    </div>
  );
}
