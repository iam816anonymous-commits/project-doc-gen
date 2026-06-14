import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { validateEnv } from "@/lib/env";
import Link from "next/link";
import Script from "next/script";
import FeedbackUI from "@/components/FeedbackUI";
import WhatsAppSupport from "@/components/WhatsAppSupport";

// Fail fast if environment variables are missing
validateEnv();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReportReady",
  description: "Generate complete project reports, viva questions, PPT outlines and submission kits from GitHub repositories, ZIP projects, PDFs and DOCX files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {process.env.NODE_ENV === 'production' && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "x6rkv1d79i");
            `}
          </Script>
        )}
        <main className="flex-grow">
          {children}
        </main>
        <FeedbackUI />
        <WhatsAppSupport />

        <footer className="bg-slate-50 border-t py-16 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 text-2xl font-black text-blue-600 mb-4">
                <span className="bg-blue-600 text-white p-1.5 rounded-lg text-lg">📝</span>
                ReportReady
              </Link>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                Empowering students to focus on coding while we handle the documentation.
                The most trusted project report generator for BTech, MCA, and Diploma students.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Legal</h3>
              <ul className="space-y-4 text-sm text-slate-600">
                <li><Link href="/terms" className="hover:text-blue-600 transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600 transition">Privacy Policy</Link></li>
                <li><Link href="/disclaimer" className="hover:text-blue-600 transition">Disclaimer</Link></li>
                <li><Link href="/refund" className="hover:text-blue-600 transition">Refund Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Support</h3>
              <ul className="space-y-4 text-sm text-slate-600">
                <li><Link href="/academic-integrity" className="hover:text-blue-600 transition">Academic Integrity</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600 transition">Contact Us</Link></li>
                <li><span className="text-slate-400">support@reportready.in</span></li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
            © 2026 ReportReady AI. Built for students, by students.
          </div>
        </footer>
      </body>
    </html>
  );
}
