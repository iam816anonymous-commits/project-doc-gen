import { Mail, MessageCircle, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Contact Us</h1>
          <p className="text-slate-500 font-medium">We&apos;re here to help you with your project documentation.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                 <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-2">Email Support</h3>
              <p className="text-slate-500 mb-6 font-medium">For refund requests, technical issues, or bulk university inquiries.</p>
              <a href="mailto:support@reportready.in" className="text-blue-600 font-black text-lg hover:underline">support@reportready.in</a>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mb-6">
                 <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-2">WhatsApp Support</h3>
              <p className="text-slate-500 mb-6 font-medium">For quick help with generation or payment verification.</p>
              <a href="https://wa.me/91XXXXXXXXXX" className="bg-green-600 text-white px-8 py-3 rounded-xl font-black hover:bg-green-700 transition">Chat Now</a>
           </div>
        </div>

        <div className="mt-12 bg-slate-900 text-white p-12 rounded-[3rem] text-center">
           <h3 className="text-2xl font-black mb-4">Response Time</h3>
           <p className="text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
             We typically respond to emails within 12-24 hours. WhatsApp support is available from 10 AM to 8 PM IST.
           </p>
        </div>
      </div>
    </div>
  );
}
