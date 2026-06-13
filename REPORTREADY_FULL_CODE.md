FILE: src/components/OTPLogin.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OTPLogin({ onSuccess }: { onSuccess: (userId: string) => void }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) setStep('code');
      else setError(data.error);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (res.ok) onSuccess(data.userId);
      else setError(data.error);
    } catch (err) {
      setError('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border shadow-sm max-w-md mx-auto">
      <h2 className="text-2xl font-black mb-2">Login to Continue</h2>
      <p className="text-slate-500 mb-6 font-medium">We'll send a 6-digit code to your email.</p>

      {step === 'email' ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your student email"
            className="w-full px-6 py-4 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <input
            type="text"
            placeholder="6-digit code"
            className="w-full px-6 py-4 rounded-xl border font-black tracking-[1em] text-center focus:ring-2 focus:ring-blue-500 outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button type="button" onClick={() => setStep('email')} className="w-full text-blue-600 font-bold text-sm">Change Email</button>
        </form>
      )}
      {error && <p className="text-red-500 mt-4 font-bold text-sm">{error}</p>}
    </div>
  );
}
---
FILE: src/app/academic-integrity/page.tsx
export default function AcademicIntegrityPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 prose prose-blue">
      <h1>Academic Integrity Notice</h1>
      <p className="text-gray-500">Last Updated: June 15, 2026</p>

      <p>ReportReady is designed to be a <strong>drafting assistant</strong>, not a replacement for your own learning and project work.</p>

      <h2>Guidelines for Ethical Use:</h2>
      <ul>
        <li>Use the generated documentation as a foundation or template for your own writing.</li>
        <li>Review and rewrite sections to reflect your specific project implementation.</li>
        <li>Understand every part of the generated content, especially for Viva questions.</li>
        <li>Consult your institution&apos;s policy on using AI tools in academic submissions.</li>
      </ul>

      <p><strong>Note:</strong> Most universities require students to declare the use of AI tools in their work. We recommend transparency with your project guide.</p>
    </div>
  );
}
---
FILE: src/app/contact/page.tsx
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
---
FILE: src/app/api/export/docx/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as {
    id: string;
    user_id: string;
    title: string;
    content: string;
    is_paid: number;
  } | undefined;

  if (!project || project.is_paid !== 1 || project.user_id !== userId) {
    return NextResponse.json({ error: 'Unauthorized or not paid' }, { status: 403 });
  }

  const content = JSON.parse(project.content);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: Object.entries(content).flatMap(([section, text]) => [
          new Paragraph({
            text: section,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun(text as string)],
            spacing: { after: 200 },
          }),
        ]),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${project.title.replace(/\s+/g, '_')}_Documentation.docx"`,
    },
  });
}
---
FILE: src/app/api/export/pdf/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateProfessionalPDF } from '@/lib/pdf-renderer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  if (project.is_paid !== 1) return NextResponse.json({ error: 'Payment required' }, { status: 402 });

  const content = JSON.parse(project.content);
  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(project.user_id) as any;

  const pdfBuffer = await generateProfessionalPDF({
    title: project.title,
    university: project.university,
    studentName: user.email.split('@')[0],
    academicLevel: project.academic_level,
    sections: content,
    techStack: project.tech_stack
  });

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${project.title}_Report.pdf"`
    }
  });
}
---
FILE: src/app/api/analyze/github/route.ts
import { NextResponse } from 'next/server';
import { ProjectProfiler } from '@/lib/project-profiler';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const profile = await ProjectProfiler.fromGitHub(url);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
---
FILE: src/app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { ProjectProfiler } from '@/lib/project-profiler';
import mime from 'mime-types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // MIME Detection
    const detectedMime = mime.lookup(file.name);
    if (!detectedMime) {
       return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Basic malicious check (size and simple string match for common patterns)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    let profile;
    if (type === 'zip' && detectedMime === 'application/zip') {
      profile = await ProjectProfiler.fromZip(buffer, file.name);
    } else if (type === 'pdf' && detectedMime === 'application/pdf') {
      profile = await ProjectProfiler.fromPDF(buffer);
    } else if (type === 'docx' && (detectedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      profile = await ProjectProfiler.fromDocx(buffer);
    } else {
      return NextResponse.json({ error: 'Mismatched file type and extension' }, { status: 400 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('File analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze file' }, { status: 500 });
  }
}
---
FILE: src/app/api/payments/submit/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!file || !projectId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Security: Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    // Security: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB allowed.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Security: Randomized filename to prevent overwrites and predictable URLs
    const extension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${extension}`;

    const uploadDir = path.join(process.cwd(), 'public/uploads/payments');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    // Security: Path traversal is mitigated by using path.join with process.cwd and a UUID-based filename
    await fs.writeFile(filePath, buffer);

    const submissionId = uuidv4();
    db.prepare(`
      INSERT INTO payment_submissions (id, user_id, project_id, screenshot_path, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(submissionId, userId, projectId, `/uploads/payments/${fileName}`, 'PENDING');

    return NextResponse.json({ success: true, submissionId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/referrals/evidence/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('screenshot') as File;

    if (!file) {
      return NextResponse.json({ error: 'No screenshot provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${uuidv4()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'referrals');

    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const dbPath = `/uploads/referrals/${fileName}`;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO referral_evidence (id, user_id, image_path)
      VALUES (?, ?, ?)
    `).run(id, userId, dbPath);

    return NextResponse.json({ success: true, path: dbPath });
  } catch (error) {
    console.error('Evidence upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/referrals/status/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ eligible: false });
    }

    const stats = db.prepare(`
      SELECT
        SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) as converted
      FROM referrals
      WHERE referrer_id = ?
    `).get(userId) as { converted: number };

    const evidence = db.prepare(`
      SELECT COUNT(*) as approved FROM referral_evidence
      WHERE user_id = ? AND status = 'APPROVED'
    `).get(userId) as { approved: number };

    const isEligible = (stats?.converted || 0) > 0 || (evidence?.approved || 0) > 0;

    return NextResponse.json({ eligible: isEligible });
  } catch (_error) {
    return NextResponse.json({ eligible: false });
  }
}
---
FILE: src/app/api/feedback/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO feedback (id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `).run(id, userId, rating, comment);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/admin/referrals/verify/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const adminToken = (await cookies()).get('admin_token')?.value;
    if (adminToken !== process.env.ADMIN_SECRET) {
       // Check header for API calls
       const adminSecret = request.headers.get('x-admin-secret');
       if (adminSecret !== process.env.ADMIN_SECRET) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
    }

    const { id, status, notes } = await request.json();

    db.prepare('UPDATE referral_evidence SET status = ?, verification_notes = ? WHERE id = ?').run(status, notes, id);

    await logAudit('REFERRAL_VERIFY', 'ADMIN', { id, status, notes });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Referral verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/admin/verify-payment/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const adminToken = (await cookies()).get('admin_token')?.value;
    if (adminToken !== process.env.ADMIN_SECRET) {
       const adminSecret = request.headers.get('x-admin-secret');
       if (adminSecret !== process.env.ADMIN_SECRET) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
    }

    const { submissionId, action } = await request.json();

    if (action === 'APPROVE') {
      const submission = db.prepare('SELECT * FROM payment_submissions WHERE id = ?').get(submissionId) as any;
      if (submission) {
        db.prepare('UPDATE payment_submissions SET status = "APPROVED", verified_at = datetime("now") WHERE id = ?').run(submissionId);
        db.prepare('UPDATE projects SET is_paid = 1 WHERE id = ?').run(submission.project_id);

        await logAudit('PAYMENT_APPROVE', 'ADMIN', { submissionId, projectId: submission.project_id });
      }
    } else {
      db.prepare('UPDATE payment_submissions SET status = "REJECTED" WHERE id = ?').run(submissionId);
      await logAudit('PAYMENT_REJECT', 'ADMIN', { submissionId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/generate/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { generateProjectDocumentation, generateProjectEmbedding } from '@/lib/gemini';
import { createFingerprint, calculateSimilarity } from '@/lib/similarity';
import { analyzeGitHubRepo } from '@/lib/repository-analyzer';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const details = await request.json();
    const cookieStore = await cookies();
    let userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting for generation
    const recentGens = db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND generated_at > datetime("now", "-1 hour")').get(userId) as { count: number };
    if (recentGens.count >= 5) {
      return NextResponse.json({ error: 'Generation limit reached. Please try again in an hour.' }, { status: 429 });
    }

    // 1. Multi-Source Analysis
    let sourceAnalysis = details.profile || null;

    // profile is already prepared by the client using the ProjectProfiler or passed directly
    // This allows the "Smart Confirmation" step to happen on the client.

    // 2. Fingerprint and Cache Lookup
    const fingerprint = createFingerprint({
      title: details.title,
      category: details.projectType,
      techStack: details.techStack,
      features: details.features,
      academicLevel: details.academicLevel,
      githubUrl: details.githubUrl || '',
      university: details.university || 'Standard'
    });

    const cached = db.prepare('SELECT generated_content_json FROM report_cache WHERE fingerprint = ?').get(fingerprint) as { generated_content_json: string } | undefined;

    let content;
    if (cached) {
      console.log('Cache hit for fingerprint:', fingerprint);
      content = JSON.parse(cached.generated_content_json);
    } else {
      // 2. Similarity Check
      const similarReports = db.prepare('SELECT id, project_title, tech_stack, features_json, generated_content_json FROM report_cache ORDER BY created_at DESC LIMIT 50').all() as any[];

      let bestMatch = null;
      for (const report of similarReports) {
        // Parse features_json if it's a JSON string, otherwise use as is
        let reportFeatures = report.features_json;
        try {
          const parsed = JSON.parse(report.features_json);
          if (typeof parsed === 'string') reportFeatures = parsed;
          else if (Array.isArray(parsed)) reportFeatures = parsed.join(', ');
        } catch (e) {
          // Not JSON, use as is
        }

        const similarity = calculateSimilarity(
          { title: details.title, techStack: details.techStack, features: details.features },
          { title: report.project_title, techStack: report.tech_stack, features: reportFeatures }
        );

        if (similarity > 90) {
          console.log(`High similarity match (${similarity.toFixed(2)}%) found with report: ${report.id}`);
          bestMatch = JSON.parse(report.generated_content_json);
          break;
        }
      }

      if (bestMatch) {
        content = bestMatch;
      } else {
        // 3. Gemini Generation
        try {
          content = await generateProjectDocumentation({
            title: details.title,
            category: details.projectType,
            techStack: details.techStack,
            features: details.features,
            problemStatement: details.problemStatement,
            academicLevel: details.academicLevel,
            university: details.university,
            repoAnalysis: sourceAnalysis || undefined
          });

          // 4. Cache the result
          const embedding = await generateProjectEmbedding(`${details.title} ${details.projectType} ${details.techStack} ${details.features}`);
          db.prepare(`
            INSERT INTO report_cache (id, fingerprint, embedding, project_title, category, tech_stack, features_json, academic_level, generated_content_json, github_url, university)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), fingerprint, JSON.stringify(embedding), details.title, details.projectType, details.techStack, JSON.stringify(details.features), details.academicLevel, JSON.stringify(content), details.githubUrl || null, details.university || 'Standard');
        } catch (error) {
          console.error('Gemini error, falling back to templates:', error);
          // Fallback or re-throw
          throw error;
        }
      }
    }

    const projectId = uuidv4();
    db.prepare(`
      INSERT INTO projects (
        id, user_id, title, project_type, tech_stack,
        problem_statement, features, team_size,
        academic_level, content, github_url, university
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      userId,
      details.title,
      details.projectType,
      details.techStack,
      details.problemStatement,
      details.features,
      details.teamSize,
      details.academicLevel,
      JSON.stringify(content),
      details.githubUrl || null,
      details.university || 'Standard'
    );

    return NextResponse.json({ projectId, content });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/auth/accept-terms/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = uuidv4();
    const termsVersion = '2026-06-15'; // Current version

    db.prepare(`
      INSERT INTO agreement_acceptances (id, user_id, terms_version)
      VALUES (?, ?, ?)
    `).run(id, userId, termsVersion);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Accept terms error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return NextResponse.json({ userId });
}
---
FILE: src/app/api/auth/request/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    db.prepare('INSERT INTO auth_tokens (id, email, token, expires_at) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), email, otp, expiresAt);

    // --- EMAIL INTEGRATION POINT ---
    // In a real app, integrate an email service like Resend, SendGrid, or AWS SES here.
    // Example: await resend.emails.send({ to: email, subject: 'Your OTP', text: `OTP: ${otp}` });

    console.log(`
      --------------------------------------------------
      [AUTH] OTP for ${email}: ${otp}
      (This is the MVP console delivery. Integrate SMTP here for production.)
      --------------------------------------------------
    `);

    return NextResponse.json({
      success: true,
      message: 'OTP sent. For this beta version, check the server console logs to retrieve your 6-digit code.'
    });
  } catch (error) {
    console.error('Auth request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/auth/verify/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 });
    }

    const row = db.prepare(`
      SELECT * FROM auth_tokens
      WHERE email = ? AND token = ? AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC LIMIT 1
    `).get(email, token) as { email: string } | undefined;

    if (!row) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // OTP is valid, cleanup
    db.prepare('DELETE FROM auth_tokens WHERE email = ?').run(email);

    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: string; email: string } | undefined;

    if (!user) {
      const id = uuidv4();
      db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(id, email);
      user = { id, email };
    }

    const response = NextResponse.json({ success: true, user });

    // Set secure cookie
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/auth/otp/request/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Rate limiting (basic implementation for MVP)
    const recentOtps = db.prepare('SELECT COUNT(*) as count FROM otps WHERE email = ? AND created_at > datetime("now", "-5 minutes")').get(email) as { count: number };
    if (recentOtps.count >= 3) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    db.prepare('INSERT INTO otps (id, email, code, expires_at) VALUES (?, ?, ?, ?)').run(uuidv4(), email, code, expiresAt);

    // In a real app, send email here. For now, log to console for beta access.
    console.log(`[AUTH] OTP for ${email}: ${code}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/api/auth/otp/verify/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const otp = db.prepare('SELECT * FROM otps WHERE email = ? AND code = ? AND expires_at > datetime("now")').get(email, code) as { id: string } | undefined;

    if (!otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // OTP is valid, consume it
    db.prepare('DELETE FROM otps WHERE id = ?').run(otp.id);

    // Get or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: string } | undefined;
    if (!user) {
      const userId = uuidv4();
      const referralCode = `READY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      db.prepare('INSERT INTO users (id, email, referral_code) VALUES (?, ?, ?)').run(userId, email, referralCode);
      user = { id: userId };
    }

    const cookieStore = await cookies();
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
---
FILE: src/app/referrals/page.tsx
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { Users, UserPlus, Zap, Share2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import ReferralDashboardClient from './ReferralDashboardClient';

export default async function ReferralDashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to view your referrals</h1>
          <Link href="/" className="text-blue-600 hover:underline">Go to Home</Link>
        </div>
      </div>
    );
  }

  const user = db.prepare('SELECT referral_code FROM users WHERE id = ?').get(userId) as { referral_code: string };

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'REGISTERED' THEN 1 ELSE 0 END) as registered,
      SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) as converted
    FROM referrals
    WHERE referrer_id = ?
  `).get(userId) as { total: number, registered: number, converted: number };

  const evidence = db.prepare(`
    SELECT * FROM referral_evidence
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as any[];

  const isEligible = (stats?.converted || 0) > 0 || evidence.some(e => e.status === 'APPROVED');

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Referral Program</h1>
          <p className="text-slate-600 mt-2">Share ReportReady with your friends and get 50% discount.</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Referral Code</p>
              <div className="flex items-center gap-3">
                <code className="text-2xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  {user?.referral_code || 'N/A'}
                </code>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Your Discount Status</p>
              <div className="flex items-center gap-2">
                {isEligible ? (
                  <span className="flex items-center gap-1.5 text-green-600 font-bold text-xl">
                    <CheckCircle className="w-6 h-6" /> Eligible (₹49)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 font-bold text-xl">
                    <Clock className="w-6 h-6" /> Standard (₹99)
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-end">
              <div className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                <Share2 className="w-4 h-4" /> Share Link
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-slate-500 font-medium">Total Referrals</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.total || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-slate-500 font-medium">Joined</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.registered || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-slate-500 font-medium">Converted (Paid)</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.converted || 0}</p>
          </div>
        </div>

        {/* Manual Evidence Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Social Share Verification</h2>
            <p className="text-slate-500 mt-1">
              If you shared ReportReady in your college groups, upload a screenshot to get a manual discount.
            </p>
          </div>

          <div className="p-8">
            <ReferralDashboardClient />
          </div>

          {evidence.length > 0 && (
            <div className="px-8 pb-8">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Previous Submissions</h3>
              <div className="space-y-4">
                {evidence.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
                        <img src={item.image_path} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</p>
                        <p className="font-medium text-slate-900">Share Screenshot</p>
                      </div>
                    </div>
                    <div>
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <CheckCircle className="w-3 h-3" /> APPROVED
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                          <AlertCircle className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
---
FILE: src/app/referrals/ReferralDashboardClient.tsx
'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function ReferralDashboardClient() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Max 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('screenshot', file);

    try {
      const res = await fetch('/api/referrals/evidence', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        window.location.reload();
      } else {
        setError('Failed to upload. Please try again.');
      }
    } catch (_err) {
      setError('An error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="relative group">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50/50 rounded-2xl p-10 text-center transition-all">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-slate-900 font-bold text-lg">
            {uploading ? 'Uploading...' : 'Click to Upload Screenshot'}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            WhatsApp, Telegram, or Discord group share
          </p>
        </div>
      </div>
    </div>
  );
}
---
FILE: src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-black text-blue-600 flex items-center gap-2">
          <span className="bg-blue-600 text-white p-1 rounded-lg text-sm">📝</span>
          ReportReady
        </div>
        <nav className="flex items-center space-x-8">
          <Link href="#how-it-works" className="text-slate-600 hover:text-blue-600 font-bold text-sm hidden md:block">How It Works</Link>
          <Link href="#samples" className="text-slate-600 hover:text-blue-600 font-bold text-sm hidden md:block">Sample Reports</Link>
          <Link href="/generate" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Generate My Report
          </Link>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center">
             <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-blue-100">
               ✨ Built for Final Year Students
             </div>
             <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
               Project Submission <br/>
               <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Tomorrow?</span>
             </h1>
             <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-bold">
               Get Complete Report + Viva + PPT in Minutes. <br/>
               <span className="text-slate-500 font-medium">Upload Any Project Format. We handle the rest.</span>
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/generate" className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl text-xl font-black hover:bg-blue-700 transition shadow-2xl shadow-blue-200 inline-block">
                  Generate My Report
                </Link>
                <Link href="#samples" className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-2xl text-xl font-black border-2 border-slate-200 hover:border-slate-300 transition inline-block">
                  View Sample Report
                </Link>
             </div>
             <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-50 grayscale">
                <span className="font-bold text-slate-400">JNTU</span>
                <span className="font-bold text-slate-400">VTU</span>
                <span className="font-bold text-slate-400">Anna University</span>
                <span className="font-bold text-slate-400">MAKAUT</span>
                <span className="font-bold text-slate-400">KTU</span>
             </div>
          </div>
        </section>

        {/* Source Selection Section */}
        <section id="generate" className="py-24 bg-white px-6">
           <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-4">Start Here</h2>
              <p className="text-slate-500 mb-12">Select your project source to begin automatic analysis.</p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                 {[
                   { label: 'GitHub Repo', icon: '🔗', type: 'github' },
                   { label: 'Upload ZIP', icon: '📦', type: 'zip' },
                   { label: 'Upload PDF', icon: '📄', type: 'pdf' },
                   { label: 'Upload DOCX', icon: '📝', type: 'docx' },
                   { label: 'Describe Manually', icon: '⌨️', type: 'manual' }
                 ].map((source, i) => (
                   <Link key={i} href={`/generate?type=${source.type}`} className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-blue-600 hover:bg-white transition-all group">
                      <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">{source.icon}</span>
                      <span className="font-black text-slate-900">{source.label}</span>
                   </Link>
                 ))}
              </div>
           </div>
        </section>

        {/* The Workflow */}
        <section id="how-it-works" className="py-24 bg-slate-50 px-6">
           <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-black text-slate-900 mb-4">Submission Ready in 3 Steps</h2>
                <p className="text-slate-500">Stop wasting weeks on documentation. Focus on your code.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { step: "01", title: "Select Your Source", desc: "Upload code (ZIP), link GitHub, or provide an existing draft report (PDF/DOCX)." },
                   { step: "02", title: "Analyze & Extract", desc: "Our engine extracts your tech stack, features, and system architecture automatically." },
                   { step: "03", title: "Unlock Your Kit", desc: "Download your 17-section project report, 50+ Viva Q&A, and professional PPT slides." }
                 ].map((item, i) => (
                   <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group">
                      <div className="text-6xl font-black text-slate-100 group-hover:text-blue-50 transition-colors mb-6">{item.step}</div>
                      <h3 className="text-2xl font-black mb-4 text-slate-900">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Why Students Use ReportReady */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">Why Final Year Students <br/>Trust ReportReady</h2>
              <div className="space-y-8">
                {[
                  { title: "Saves 40+ Hours", desc: "Writing a 70-page project report takes weeks. We do it in 2 minutes." },
                  { title: "Viva Preparation Built-in", desc: "Get 50+ tailored Viva questions with answers to help you clear your presentation." },
                  { title: "Direct GitHub Sync", desc: "No manual copying. We infer your modules directly from your source code." },
                  { title: "University Standard", desc: "Generates professional content suitable for BTech, MCA, and Diploma submissions." }
                ].map((reason, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">✓</div>
                    <div>
                      <h4 className="font-black text-slate-900 mb-1">{reason.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{reason.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 blur-[80px] opacity-30"></div>
               <h3 className="text-2xl font-black mb-8">What You Get:</h3>
               <ul className="space-y-4">
                  {[
                    "17-Section Project Documentation",
                    "Full Project Synopsis",
                    "50+ Viva Questions & Answers",
                    "15-Slide PPT Presentation Kit",
                    "System Architecture & Modules",
                    "Database Schema Design",
                    "DOCX & PDF Formats"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium border-b border-slate-800 pb-3 last:border-0">
                      <span className="text-blue-500">◈</span> {item}
                    </li>
                  ))}
               </ul>
            </div>
          </div>
        </section>

        {/* Sample Output Section */}
        <section id="samples" className="py-24 px-6 bg-blue-600 text-white">
           <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-4xl font-black mb-16">See the Quality for Yourself</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: "Abstract", desc: "Professional summary of your work." },
                   { label: "Viva Questions", desc: "Expected Q&A for your defense." },
                   { label: "PPT Outline", desc: "Structure for your presentation." },
                   { label: "Arch. Section", desc: "System modules & design." }
                 ].map((sample, i) => (
                   <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-left">
                      <div className="bg-white text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl mb-6">📄</div>
                      <h3 className="text-xl font-black mb-2">{sample.label}</h3>
                      <p className="text-blue-100 text-sm font-medium leading-relaxed">{sample.desc}</p>
                   </div>
                 ))}
              </div>
              <div className="mt-16">
                 <Link href="/generate" className="bg-white text-blue-600 px-10 py-5 rounded-2xl text-xl font-black hover:bg-slate-50 transition shadow-2xl inline-block">
                    View Full Example Reports
                 </Link>
              </div>
           </div>
        </section>

        {/* Pricing Card */}
        <section className="py-32 px-6">
          <div className="max-w-lg mx-auto bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest">Limited Offer</div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Unlock Your Full Kit</h2>
            <p className="text-slate-500 font-medium mb-8 italic">Everything you need for submission.</p>
            <div className="flex items-center justify-center gap-2 mb-10">
              <span className="text-slate-400 line-through text-2xl font-bold">₹499</span>
              <span className="text-6xl font-black text-slate-900">₹99</span>
              <span className="text-blue-600 font-black">/ project</span>
            </div>
            <Link href="/generate" className="block w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition shadow-xl shadow-blue-100">
               Get ReportReady Now
            </Link>
            <p className="mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest">Instant Access • PDF & DOCX • Viva Kit</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 max-w-3xl mx-auto border-t border-slate-100">
           <h2 className="text-4xl font-black text-slate-900 mb-16 text-center">Frequently Asked Questions</h2>
           <div className="space-y-12">
              {[
                { q: "Is the report university-standard?", a: "Yes. The generated documentation follows standard academic structures required by JNTU, VTU, Anna University, and others." },
                { q: "What if I don't have a GitHub URL?", a: "You can manually enter your project details and features. Our AI will still generate the complete documentation package for you." },
                { q: "How long does it take?", a: "Usually less than 2 minutes. The analysis and generation happen in real-time." },
                { q: "Can I edit the report later?", a: "Absolutely. We provide both DOCX and PDF formats. You can edit the DOCX file to add university-specific logos or guide names." }
              ].map((faq, i) => (
                <div key={i} className="border-b border-slate-100 pb-8 last:border-0">
                   <h4 className="text-xl font-black text-slate-900 mb-3">Q: {faq.q}</h4>
                   <p className="text-slate-500 leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
}
---
FILE: src/app/disclaimer/page.tsx
export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 prose prose-blue">
      <h1>Disclaimer</h1>
      <p className="text-gray-500">Last Updated: June 15, 2026</p>

      <p>The content generated by ReportReady is intended for educational and assistant purposes only. While we strive for high quality, the AI may occasionally produce inaccurate or outdated information.</p>

      <p><strong>Use at your own risk:</strong> ReportReady does not guarantee that the generated documentation will meet specific college or university requirements. Users must review and verify all content before submission.</p>

      <p>ReportReady AI is not affiliated with any educational institution.</p>
    </div>
  );
}
---
FILE: src/app/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 prose prose-blue">
      <h1>Terms of Service</h1>
      <p className="text-gray-500">Last Updated: June 15, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By using ReportReady, you agree to be bound by these terms. If you do not agree, do not use the service.</p>

      <h2>2. Description of Service</h2>
      <p>ReportReady is an AI-powered project documentation generator designed to assist students in creating academic reports.</p>

      <h2>3. User Responsibilities</h2>
      <p>Users are responsible for the accuracy of the input provided and must use the generated content in accordance with their institution&apos;s academic integrity policies.</p>

      <h2>4. Intellectual Property</h2>
      <p>The system and its original content are owned by ReportReady AI. The generated documentation is for the user&apos;s personal academic use.</p>

      <h2>5. Limitation of Liability</h2>
      <p>ReportReady is provided &quot;as is&quot; without any warranties. We are not liable for any academic or professional consequences resulting from the use of our generated content.</p>
    </div>
  );
}
---
FILE: src/app/feedback/page.tsx
'use client';

import { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (_err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h1>
          <p className="text-slate-600 mb-8">
            Your feedback helps us improve ReportReady for students like you.
          </p>
          <Link
            href="/"
            className="inline-block w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-8 py-10 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">We Value Your Feedback</h1>
            <p className="text-blue-100">Help us make ReportReady better</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4 text-center">
                How would you rate your experience?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hover || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-semibold text-slate-700 mb-2">
                What did you like? What was missing?
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
---
FILE: src/app/refund/page.tsx
export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 prose prose-blue">
      <h1>Refund Policy</h1>
      <p className="text-gray-500">Last Updated: June 15, 2026</p>

      <p>Since ReportReady provides digital, non-tangible goods that are generated instantly, we generally do not offer refunds once the full documentation package is unlocked.</p>

      <p>However, if you encounter a technical issue that prevents you from downloading your package, please contact us within 24 hours of payment for assistance or a potential refund.</p>
    </div>
  );
}
---
FILE: src/app/admin/page.tsx
import db from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminTabs from './AdminTabs';

export const dynamic = 'force-dynamic';

interface Submission {
  id: string;
  user_id: string;
  project_id: string;
  screenshot_path: string;
  status: string;
  submitted_at: string;
  verified_at: string | null;
  project_title: string;
  user_email: string;
}

export default async function AdminPage() {
  // Admin protection: Compare cookie with ADMIN_SECRET environment variable
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;

  if (adminToken !== process.env.ADMIN_SECRET) {
    return redirect('/');
  }

  const submissions = db.prepare(`
    SELECT s.*, p.title as project_title, u.email as user_email
    FROM payment_submissions s
    JOIN projects p ON s.project_id = p.id
    JOIN users u ON s.user_id = u.id
    ORDER BY s.submitted_at DESC
  `).all() as Submission[];

  const feedback = db.prepare(`
    SELECT f.*, u.email as user_email
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `).all();

  const evidence = db.prepare(`
    SELECT e.*, u.email as user_email
    FROM referral_evidence e
    JOIN users u ON e.user_id = u.id
    ORDER BY e.submitted_at DESC
  `).all();

  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM projects) as total_projects,
      (SELECT COUNT(*) FROM payment_submissions) as total_submissions,
      (SELECT COUNT(*) FROM payment_submissions WHERE status = 'APPROVED') as approved_payments,
      (SELECT COUNT(*) FROM projects WHERE is_paid = 1) as paid_projects,
      (SELECT COUNT(*) FROM report_cache) as cached_reports
    FROM users LIMIT 1
  `).get() as {
    total_users: number,
    total_projects: number,
    total_submissions: number,
    approved_payments: number,
    paid_projects: number,
    cached_reports: number
  } || { total_users: 0, total_projects: 0, total_submissions: 0, approved_payments: 0, paid_projects: 0, cached_reports: 0 };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-12">
           {[
             { label: 'Total Users', val: stats.total_users },
             { label: 'Projects Generated', val: stats.total_projects },
             { label: 'Cached Reports', val: stats.cached_reports },
             { label: 'Screenshots Uploaded', val: stats.total_submissions },
             { label: 'Payments Approved', val: stats.approved_payments },
             { label: 'Revenue (₹)', val: stats.approved_payments * 99 }
           ].map((s, i) => (
             <div key={i} className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.val}</p>
             </div>
           ))}
        </div>

        <AdminTabs
          submissions={submissions}
          feedback={feedback}
          evidence={evidence}
        />
      </div>
    </div>
  );
}
---
FILE: src/app/admin/AdminTabs.tsx
'use client';

import { useState } from 'react';
import { Check, X, MessageSquare, CreditCard, Share2, Star } from 'lucide-react';

export default function AdminTabs({ submissions, feedback, evidence }: any) {
  const [activeTab, setActiveTab] = useState('payments');

  const handleVerifyEvidence = async (id: string, status: string) => {
    const notes = prompt('Enter verification notes (optional):');
    const res = await fetch('/api/admin/referrals/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, status, notes })
    });
    if (res.ok) window.location.reload();
  };

  const handleVerifyPayment = async (submissionId: string, action: string) => {
    const res = await fetch('/api/admin/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, action })
    });
    if (res.ok) window.location.reload();
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'payments' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CreditCard className="w-4 h-4" /> Payments
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'feedback' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquare className="w-4 h-4" /> Feedback
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-colors ${activeTab === 'referrals' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Share2 className="w-4 h-4" /> Referral Proofs
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b">
                <tr>
                  <th className="pb-4">User</th>
                  <th className="pb-4">Project</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="text-sm">
                    <td className="py-4 font-medium text-gray-900">{sub.user_email}</td>
                    <td className="py-4 text-gray-600">{sub.project_title}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${sub.status === 'APPROVED' ? 'bg-green-100 text-green-700' : sub.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {sub.status === 'PENDING' && (
                        <div className="flex gap-2">
                           <a href={sub.screenshot_path} target="_blank" className="text-blue-600 hover:underline mr-4">View Proof</a>
                           <button onClick={() => handleVerifyPayment(sub.id, 'APPROVE')} className="text-green-600 hover:underline font-bold">Approve</button>
                           <button onClick={() => handleVerifyPayment(sub.id, 'REJECT')} className="text-red-600 hover:underline ml-2">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {feedback.map((f: any) => (
              <div key={f.id} className="p-4 bg-gray-50 rounded-xl border">
                <div className="flex justify-between mb-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-900 font-medium mb-1">{f.comment}</p>
                <p className="text-xs text-gray-500">— {f.user_email}</p>
              </div>
            ))}
            {feedback.length === 0 && <p className="text-center text-gray-400 py-10">No feedback yet.</p>}
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evidence.map((ev: any) => (
              <div key={ev.id} className="bg-gray-50 rounded-2xl border overflow-hidden">
                <div className="aspect-video relative group">
                  <img src={ev.image_path} alt="Evidence" className="w-full h-full object-cover" />
                  <a href={ev.image_path} target="_blank" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">View Full Size</a>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{ev.user_email}</p>
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-gray-400">GROUP: {ev.group_name || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-gray-400">MEMBERS: {ev.member_count || '?'}</p>
                    <p className="text-[10px] font-bold text-gray-400">TS VISIBLE: {ev.timestamp_visible ? 'YES' : 'NO'}</p>
                  </div>
                  <p className="text-xs font-bold uppercase mb-2 tracking-wider">Status: <span className={ev.status === 'APPROVED' ? 'text-green-600' : ev.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'}>{ev.status}</span></p>
                  {ev.verification_notes && <p className="text-[10px] text-blue-600 mb-4 bg-blue-50 p-2 rounded italic">Note: {ev.verification_notes}</p>}

                  {ev.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleVerifyEvidence(ev.id, 'APPROVED')}
                        className="flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleVerifyEvidence(ev.id, 'REJECTED')}
                        className="flex items-center justify-center gap-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {evidence.length === 0 && <p className="col-span-full text-center text-gray-400 py-10">No referral proofs submitted yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
---
FILE: src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { validateEnv } from "@/lib/env";
import Link from "next/link";

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
  title: "Create Next App",
  description: "Generated by create next app",
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
        <main className="flex-grow">
          {children}
        </main>

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
---
FILE: src/app/project/[id]/pay/page.tsx
'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !agreed) return;
    setLoading(true);

    try {
      // 1. Record agreement
      await fetch('/api/auth/accept-terms', { method: 'POST' });

      // 2. Submit payment
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', id);
      const res = await fetch('/api/payments/submit', { method: 'POST', body: formData });

      if (res.ok) {
        router.push(`/project/${id}`);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">

        {/* Left Side: Deliverables */}
        <div className="bg-slate-900 p-10 text-white relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 blur-[80px] opacity-20"></div>
           <Link href={`/project/${id}`} className="text-slate-400 font-bold hover:text-white transition block mb-12">← Back to Preview</Link>

           <h2 className="text-3xl font-black mb-8 leading-tight">Unlock Your <br/>Submission Kit</h2>

           <div className="space-y-6">
              {[
                { label: "17-Section Report", desc: "Professional PDF & DOCX formats." },
                { label: "Viva Preparation Kit", desc: "50+ Q&A tailored to your project." },
                { label: "PPT Presentation Kit", desc: "15 slides with speaker notes." },
                { label: "Project Synopsis", desc: "Ready for guide approval." },
                { label: "Architecture Design", desc: "Modules & database schema." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">✓</div>
                   <div>
                      <p className="font-black text-sm">{item.label}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Support Email</p>
              <p className="text-blue-400 font-bold">support@reportready.in</p>
           </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="p-10">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <h1 className="text-2xl font-black mb-2 text-slate-900">Final Step</h1>
            <p className="text-slate-500 font-medium mb-8">One-time payment of <span className="text-slate-900 font-black">₹99</span> to unlock everything.</p>

            <div className="space-y-8 flex-grow">
               <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Step 1: Pay via UPI</p>
                  <p className="text-3xl font-black text-slate-900 mb-6">pay@reportready</p>
                  <div className="w-40 h-40 bg-slate-200 mx-auto rounded-2xl mb-6 flex items-center justify-center border-2 border-dashed border-slate-300">
                     <span className="text-slate-400 font-bold text-sm text-center px-4">UPI QR Code <br/>Placeholder</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Scan the QR or pay to the ID above.</p>
               </div>

               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Step 2: Upload Screenshot</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-slate-100 file:text-slate-900 hover:file:bg-slate-200 transition cursor-pointer"
                  />
               </div>

               <div className="mb-8">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-0 outline-none transition-all"
                    />
                    <span className="text-sm text-slate-500 leading-tight font-medium">
                      I have read and agree to the {' '}
                      <Link href="/terms" target="_blank" className="text-blue-600 font-bold hover:underline">Terms</Link>, {' '}
                      <Link href="/privacy" target="_blank" className="text-blue-600 font-bold hover:underline">Privacy</Link>, and {' '}
                      <Link href="/academic-integrity" target="_blank" className="text-blue-600 font-bold hover:underline">Academic Integrity Notice</Link>.
                    </span>
                  </label>
               </div>
            </div>

            <button
              type="submit"
              disabled={!file || !agreed || loading}
              className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-2xl ${
                (!file || !agreed || loading)
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-100'
              }`}
            >
              {loading ? 'Processing...' : 'Unlock My Kit'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
---
FILE: src/app/project/[id]/page.tsx
import db from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { SECTIONS } from '@/lib/prompts';
import Link from 'next/link';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as {
    id: string;
    user_id: string;
    title: string;
    tech_stack: string;
    academic_level: string;
    university: string;
    content: string;
    is_paid: number;
    github_url: string;
    project_type: string;
  } | undefined;

  if (!project) notFound();
  if (project.user_id !== userId) redirect('/');

  const content = JSON.parse(project.content);
  const isPaid = project.is_paid === 1;
  const freeSections = ["Abstract", "Objectives"];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-8 py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <Link href="/" className="bg-slate-100 p-2 rounded-xl hover:bg-slate-200 transition">🏠</Link>
             <div>
               <h1 className="text-2xl font-black text-slate-900 leading-tight">{project.title}</h1>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{project.university} • {project.academic_level}</p>
             </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {!isPaid ? (
              <Link href={`/project/${project.id}/pay`} className="w-full md:w-auto bg-green-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-700 transition shadow-xl shadow-green-100 flex items-center justify-center gap-2">
                <span>🔓</span> Unlock Full Report (₹99)
              </Link>
            ) : (
              <div className="flex gap-4 w-full md:w-auto">
                <a href={`/api/export/pdf?projectId=${project.id}`} className="flex-1 md:flex-none text-center bg-blue-600 text-white px-6 py-4 rounded-xl font-black shadow-lg shadow-blue-100">Download PDF</a>
                <a href={`/api/export/docx?projectId=${project.id}`} className="flex-1 md:flex-none text-center bg-white text-blue-600 border-2 border-blue-600 px-6 py-4 rounded-xl font-black shadow-lg shadow-blue-50">Download DOCX</a>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
        {/* Project Intelligence Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <p className={`font-black ${isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                {isPaid ? '✓ Submission Ready' : '⚠ Ready to Unlock'}
              </p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Repository</p>
              <p className="font-black text-slate-900 truncate">
                {project.github_url ? '✓ Detected' : 'Manual Entry'}
              </p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Tech Stack</p>
              <p className="font-black text-slate-900">{project.tech_stack}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Kit Content</p>
              <p className="font-black text-blue-600">Report + PPT + Viva</p>
           </div>
        </div>

        <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white mb-16 relative overflow-hidden shadow-2xl shadow-blue-100">
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full"></div>
           <div className="max-w-2xl relative">
              <h2 className="text-3xl font-black mb-4">Your Project Report is Generated!</h2>
              <p className="text-blue-100 font-medium mb-8 leading-relaxed">
                We&apos;ve analyzed your {project.project_type} project and prepared a 17-section comprehensive documentation package tailored for {project.university} guidelines.
              </p>
              {!isPaid && (
                 <Link href={`/project/${project.id}/pay`} className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black inline-block hover:bg-slate-50 transition">
                    Unlock Full Submission Kit Now →
                 </Link>
              )}
           </div>
        </div>

        {/* Content Viewer */}
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <section key={section} className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-6 flex items-center gap-3">
                <span className="text-blue-600">#</span> {section}
              </h2>

              {!isPaid && !freeSections.includes(section) ? (
                <div className="relative">
                   <div className="space-y-4 filter blur-md opacity-20 select-none">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                         <p className="font-black text-slate-900 mb-4">Unlock to view full {section}</p>
                         <Link href={`/project/${project.id}/pay`} className="text-blue-600 font-black hover:underline">Complete Payment →</Link>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none prose-p:font-medium prose-p:leading-loose text-slate-600 whitespace-pre-wrap">
                  {content[section]}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      <div className="bg-slate-900 text-white py-12 px-8 text-center mt-20">
         <p className="font-black text-xl mb-4 italic">Need help with your project?</p>
         <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Contact us at <span className="text-blue-400 font-bold">support@reportready.in</span> if you have any questions about your generated report.
         </p>
      </div>
    </div>
  );
}
---
FILE: src/app/generate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OTPLogin from '@/components/OTPLogin';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';

export default function GenerationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sourceType = searchParams.get('type') || 'manual';

  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<'auth' | 'input' | 'analyze' | 'confirm'>('auth');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Minimal inputs
  const [university, setUniversity] = useState('');
  const [level, setLevel] = useState('BTech');

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const res = await fetch('/api/auth/me'); // Simple endpoint to check cookie
      if (res.ok) {
        const data = await res.json();
        setUserId(data.userId);
        setStep('input');
      }
    };
    checkSession();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStep('analyze');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', sourceType);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setStep('confirm');
      } else {
        alert(data.error);
        setStep('input');
      }
    } catch (err) {
      alert('Analysis failed');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubAnalysis = async (url: string) => {
    setLoading(true);
    setStep('analyze');
    try {
      const res = await fetch('/api/analyze/github', { // I'll need to create this or use existing repo-analyzer
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setStep('confirm');
      }
    } catch (err) {
      alert('GitHub analysis failed');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: profile.title,
          projectType: profile.inferredCategory || 'Web Development',
          techStack: profile.techStack.join(', '),
          features: profile.features.join(', '),
          problemStatement: profile.problemStatement || 'Automated generation',
          teamSize: 1,
          academicLevel: level,
          university,
          profile
        })
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/project/${data.projectId}`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'auth') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <OTPLogin onSuccess={(uid) => { setUserId(uid); setStep('input'); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            {step === 'input' ? 'Provide Your Project' :
             step === 'analyze' ? 'Analyzing Source...' :
             'Confirm Details'}
          </h1>
          <p className="text-slate-500 font-medium">Step {step === 'input' ? '1' : step === 'analyze' ? '2' : '3'} of 3</p>
        </div>

        {step === 'input' && (
          <div className="bg-white p-12 rounded-[2.5rem] border shadow-sm text-center">
            {sourceType === 'github' ? (
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="https://github.com/user/repo"
                  className="w-full px-6 py-4 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGitHubAnalysis(e.currentTarget.value);
                  }}
                />
                <p className="text-sm text-slate-400">Paste your public repository URL and press Enter</p>
              </div>
            ) : sourceType === 'manual' ? (
              <div className="space-y-6 text-left">
                <input
                  type="text"
                  placeholder="Project Title"
                  className="w-full px-6 py-4 rounded-xl border font-medium outline-none"
                  onChange={(e) => setProfile({ ...profile, title: e.target.value, techStack: [], features: [], modules: [] })}
                />
                <button
                   onClick={() => setStep('confirm')}
                   className="w-full bg-blue-600 text-white py-4 rounded-xl font-black"
                >
                   Continue →
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[2rem] p-20 cursor-pointer hover:bg-slate-50 transition group">
                <Upload className="w-16 h-16 text-slate-300 group-hover:text-blue-600 mb-6 transition-colors" />
                <span className="text-xl font-black text-slate-900 mb-2">Click to Upload {sourceType.toUpperCase()}</span>
                <span className="text-slate-400 font-medium text-sm">Max file size 10MB</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept={sourceType === 'zip' ? '.zip' : sourceType === 'pdf' ? '.pdf' : '.docx'} />
              </label>
            )}
          </div>
        )}

        {step === 'analyze' && (
          <div className="bg-white p-12 rounded-[2.5rem] border shadow-sm flex flex-col items-center justify-center min-h-[400px]">
             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
             <p className="text-xl font-black text-slate-900 mb-2">Analyzing Project Content</p>
             <p className="text-slate-500 text-center max-w-sm">We're extracting tech stack, modules, and architecture from your {sourceType}.</p>
          </div>
        )}

        {step === 'confirm' && profile && (
          <div className="space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-green-500 w-6 h-6" /> Analysis Successful
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Project Title</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 rounded-xl border font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Detected Tech</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.techStack?.map((t: string) => <span key={t} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{t}</span>)}
                      {profile.techStack?.length === 0 && <span className="text-slate-400 text-xs">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Modules</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.modules?.map((m: string) => <span key={m} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{m}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white">
              <h3 className="text-xl font-black mb-6 italic">Almost Done! Just 2 more details:</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-xs font-black text-blue-200 uppercase tracking-widest mb-2 block">Your University</label>
                    <input
                      type="text"
                      placeholder="e.g. JNTU Hyderabad"
                      className="w-full px-6 py-4 bg-white/10 rounded-xl border border-white/20 font-bold text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="text-xs font-black text-blue-200 uppercase tracking-widest mb-2 block">Academic Level</label>
                    <select
                      className="w-full px-6 py-4 bg-white/10 rounded-xl border border-white/20 font-bold text-white outline-none focus:bg-white/20 transition"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      <option value="BTech">B.Tech / B.E.</option>
                      <option value="MCA">MCA</option>
                      <option value="BCA">BCA</option>
                      <option value="Diploma">Diploma</option>
                      <option value="MTech">M.Tech</option>
                    </select>
                 </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-black transition shadow-2xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Generate Complete Package →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
---
FILE: src/app/generate/details/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Github, Upload } from 'lucide-react';

function DetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'manual';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    title: '',
    projectType: 'Web Development',
    techStack: '',
    problemStatement: '',
    features: '',
    teamSize: 1,
    academicLevel: 'BTech',
    university: 'Standard',
    email: '',
    otp: '',
    githubUrl: '',
    sourceType: source
  });

  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (res.ok) {
        setStep('otp');
      } else {
        alert('Failed to send OTP.');
      }
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verify OTP
      const authRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, token: formData.otp }),
      });

      if (!authRes.ok) {
        alert('Invalid OTP.');
        setLoading(false);
        return;
      }

      // 2. Generate Content
      // Note: In a real app, files would be uploaded to S3 or processed here.
      // For this MVP version, we'll pass the metadata to the API.
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.projectId) {
        router.push(`/project/${data.projectId}`);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 text-center">
           <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto">📧</div>
           <h1 className="text-2xl font-black mb-2 text-slate-900">Verify Your Email</h1>
           <p className="text-slate-500 mb-8 font-medium">We&apos;ve sent a 6-digit code to <br/><span className="text-slate-900 font-bold">{formData.email}</span></p>
           <form onSubmit={handleVerifyAndGenerate} className="space-y-6">
              <input
                required
                type="text"
                name="otp"
                maxLength={6}
                value={formData.otp}
                onChange={handleChange}
                placeholder="000000"
                className="w-full text-center text-4xl tracking-[0.5em] font-black p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-0 outline-none transition-colors"
              />
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition disabled:bg-blue-300 shadow-xl shadow-blue-100"
              >
                {loading ? 'Generating Report...' : 'Verify & Generate'}
              </button>
              <button type="button" onClick={() => setStep('details')} className="text-sm text-slate-400 font-bold hover:text-blue-600 transition">Change email</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
           <Link href="/generate" className="text-blue-600 font-black mb-4 inline-block hover:underline">← Change Source</Link>
           <h1 className="text-4xl font-black text-slate-900 mb-4">Complete Your Intake</h1>
           <p className="text-slate-500 font-medium italic">
             {source === 'github' ? 'Analyzing GitHub Repository...' :
              source === 'zip' ? 'Processing Source ZIP...' :
              source === 'draft' ? 'Extracting from Existing Report...' :
              'Manual Project Description'}
           </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <form onSubmit={handleRequestOTP} className="space-y-8">

            {/* Source Specific Input */}
            {source === 'github' && (
              <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <label className="block text-sm font-black uppercase tracking-widest mb-3">GitHub Repository URL</label>
                <div className="flex gap-4">
                  <div className="bg-white/10 p-4 rounded-xl flex items-center justify-center">
                    <Github className="w-6 h-6" />
                  </div>
                  <input
                    type="url"
                    name="githubUrl"
                    required
                    placeholder="https://github.com/username/project-repo"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="flex-grow p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:bg-white/20 focus:outline-none transition-all text-lg font-medium"
                  />
                </div>
              </div>
            )}

            {(source === 'zip' || source === 'draft') && (
              <div className={`${source === 'zip' ? 'bg-blue-600' : 'bg-amber-500'} p-8 rounded-3xl text-white shadow-xl relative overflow-hidden`}>
                <label className="block text-sm font-black uppercase tracking-widest mb-3">
                  {source === 'zip' ? 'Upload Source Code (ZIP)' : 'Upload Existing Report (PDF/DOCX)'}
                </label>
                <div className="relative group cursor-pointer border-2 border-dashed border-white/30 hover:border-white/60 rounded-2xl p-8 text-center transition-all">
                  <input
                    type="file"
                    required
                    accept={source === 'zip' ? '.zip' : '.pdf,.docx'}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 mb-2" />
                    <p className="font-bold text-lg">
                      {file ? file.name : `Click to Upload ${source === 'zip' ? 'ZIP' : 'Draft'}`}
                    </p>
                    <p className="text-white/70 text-sm">Max file size: 20MB</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Project Title</label>
                <input required type="text" name="title" placeholder="E-commerce Website" value={formData.title} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"/>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium">
                  <option>Web Development</option>
                  <option>Artificial Intelligence</option>
                  <option>Mobile Application</option>
                  <option>Internet of Things (IoT)</option>
                  <option>Cybersecurity</option>
                  <option>Cloud Computing</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tech Stack</label>
              <input required type="text" name="techStack" placeholder="React, Node.js, MongoDB, Tailwind CSS" value={formData.techStack} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"/>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Problem Statement</label>
              <textarea required name="problemStatement" placeholder="What is the real-world problem your project solves?" value={formData.problemStatement} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" rows={3}/>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Key Features</label>
              <textarea required name="features" placeholder="User Auth, Admin Dashboard, Payment Integration..." value={formData.features} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" rows={3}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Academic Level</label>
                <select name="academicLevel" value={formData.academicLevel} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium">
                  <option>Diploma</option>
                  <option>BCA</option>
                  <option>MCA</option>
                  <option>BTech</option>
                  <option>MTech</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">University Format</label>
                <select name="university" value={formData.university} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium">
                  <option value="Standard">Standard Academic Format</option>
                  <option>JNTU</option>
                  <option>VTU</option>
                  <option>Anna University</option>
                  <option>Osmania University</option>
                  <option>Mumbai University</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <div className="space-y-2 mb-8">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Your Email (to receive report)</label>
                <input required type="email" name="email" placeholder="student@example.com" value={formData.email} onChange={handleChange} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all font-medium"/>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition shadow-xl shadow-blue-100">
                {loading ? 'Processing...' : 'Generate Project Kit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailsForm />
    </Suspense>
  );
}
---
FILE: src/app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 prose prose-blue">
      <h1>Privacy Policy</h1>
      <p className="text-gray-500">Last Updated: June 15, 2026</p>

      <h2>1. Information We Collect</h2>
      <p>We collect your email for authentication and project details (title, tech stack, etc.) to generate your documentation.</p>

      <h2>2. How We Use Information</h2>
      <p>Your information is used solely to provide and improve our service. We do not sell your personal data.</p>

      <h2>3. Data Security</h2>
      <p>We implement industry-standard security measures to protect your data. Payment screenshots are used only for manual verification.</p>

      <h2>4. Cookies</h2>
      <p>We use essential cookies to manage your session and authentication status.</p>
    </div>
  );
}
---
FILE: src/lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'jules.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    project_type TEXT NOT NULL,
    tech_stack TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    features TEXT NOT NULL,
    team_size INTEGER,
    academic_level TEXT NOT NULL,
    content JSON NOT NULL,
    is_paid BOOLEAN DEFAULT 0,
    github_url TEXT,
    university TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payment_submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    screenshot_path TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS report_cache (
    id TEXT PRIMARY KEY,
    fingerprint TEXT UNIQUE NOT NULL,
    embedding JSON,
    project_title TEXT NOT NULL,
    category TEXT NOT NULL,
    tech_stack TEXT NOT NULL,
    features_json TEXT NOT NULL,
    academic_level TEXT NOT NULL,
    generated_content_json TEXT NOT NULL,
    github_url TEXT,
    university TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_fingerprint ON report_cache(fingerprint);
  CREATE INDEX IF NOT EXISTS idx_cache_title ON report_cache(project_title);

  CREATE TABLE IF NOT EXISTS auth_tokens (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agreement_acceptances (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    terms_version TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL,
    referred_id TEXT NOT NULL,
    status TEXT DEFAULT 'REGISTERED', -- REGISTERED, CONVERTED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referred_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referral_evidence (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_path TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    verification_notes TEXT,
    group_name TEXT,
    member_count INTEGER,
    timestamp_visible BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    performed_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS otps (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Handle migrations for existing tables
try {
  db.exec(`ALTER TABLE users ADD COLUMN referral_code TEXT`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE users ADD COLUMN referred_by TEXT`);
} catch (e) {}
try {
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)`);
} catch (e) {}

export default db;
---
FILE: src/lib/audit.ts
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function logAudit(action: string, performedBy: string, details?: any) {
  try {
    const id = uuidv4();
    db.prepare('INSERT INTO audit_logs (id, action, performed_by, details) VALUES (?, ?, ?, ?)')
      .run(id, action, performedBy, details ? JSON.stringify(details) : null);
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
---
FILE: src/lib/pdf-renderer.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface ReportData {
  title: string;
  university: string;
  studentName: string;
  academicLevel: string;
  sections: Record<string, string>;
  techStack: string;
}

export async function generateProfessionalPDF(data: ReportData) {
  const doc = new jsPDF();
  const { title, university, studentName, academicLevel, sections } = data;

  // 1. Cover Page
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT REPORT', 105, 40, { align: 'center' });

  doc.setFontSize(16);
  doc.text('On', 105, 55, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(0, 51, 153);
  doc.text(title.toUpperCase(), 105, 75, { align: 'center', maxWidth: 170 });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Submitted in partial fulfillment of the requirements for the award of', 105, 110, { align: 'center' });
  doc.text(`${academicLevel} Degree`, 105, 120, { align: 'center' });

  doc.text('Submitted By:', 105, 160, { align: 'center' });
  doc.setFontSize(16);
  doc.text(studentName || 'Student Name', 105, 170, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Under the Guidance of:', 105, 200, { align: 'center' });
  doc.text('Project Guide Name', 105, 210, { align: 'center' });

  doc.text(university, 105, 260, { align: 'center' });
  doc.addPage();

  // 2. Certificate & Declaration (Placeholders)
  doc.setFontSize(18);
  doc.text('CERTIFICATE', 105, 30, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`This is to certify that the project entitled "${title}" is a bonafide work carried out by ${studentName} under our supervision...`, 20, 50, { maxWidth: 170 });
  doc.addPage();

  // 3. Table of Contents
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TABLE OF CONTENTS', 20, 30);
  let y = 50;
  const tocSections = Object.keys(sections);
  tocSections.forEach((s, i) => {
     doc.setFontSize(12);
     doc.text(`${i+1}. ${s}`, 20, y);
     doc.text('.....', 160, y);
     y += 10;
  });
  doc.addPage();

  // 4. Content Sections
  tocSections.forEach((sectionName) => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(sectionName, 20, 30);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const content = sections[sectionName];
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 45);
    doc.addPage();
  });

  return doc.output('arraybuffer');
}
---
FILE: src/lib/similarity.ts
import crypto from 'crypto';

interface ProjectData {
  title: string;
  techStack: string;
  features: string;
  [key: string]: string | number | boolean | null | undefined;
}

export function createFingerprint(data: Record<string, string | number | boolean | null | undefined>): string {
  const normalized = JSON.stringify(data, Object.keys(data).sort()).toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function calculateSimilarity(a: ProjectData, b: ProjectData): number {
  let score = 0;
  const total = 3;

  // Title similarity (basic)
  if (a.title.toLowerCase() === b.title.toLowerCase()) score += 1;
  else if (a.title.toLowerCase().includes(b.title.toLowerCase()) || b.title.toLowerCase().includes(a.title.toLowerCase())) score += 0.5;

  // Tech stack overlap
  const stackA = new Set(a.techStack.toLowerCase().split(',').map((s: string) => s.trim()));
  const stackB = new Set(b.techStack.toLowerCase().split(',').map((s: string) => s.trim()));
  const intersection = new Set([...stackA].filter(x => stackB.has(x)));
  score += intersection.size / Math.max(stackA.size, stackB.size);

  // Features overlap
  const featA = new Set(a.features.toLowerCase().split(',').map((s: string) => s.trim()));
  const featB = new Set(b.features.toLowerCase().split(',').map((s: string) => s.trim()));
  const featIntersection = new Set([...featA].filter(x => featB.has(x)));
  score += featIntersection.size / Math.max(featA.size, featB.size);

  return (score / total) * 100;
}
---
FILE: src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  ADMIN_SECRET: z.string().min(8, "ADMIN_SECRET must be at least 8 characters"),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
    throw new Error('Environment validation failed');
  }

  return result.data;
}
---
FILE: src/lib/prompts.ts
export interface ProjectDetails {
  title: string;
  projectType: string;
  techStack: string;
  problemStatement: string;
  features: string;
  teamSize: number;
  academicLevel: string;
}

export const SECTIONS = [
  "Title Page",
  "Abstract",
  "Introduction",
  "Problem Statement",
  "Objectives",
  "Existing System",
  "Proposed System",
  "System Requirements",
  "Methodology",
  "Modules",
  "Database Design",
  "Testing Strategy",
  "Future Scope",
  "Conclusion",
  "References",
  "Viva Questions",
  "PPT Outline",
  "Viva Preparation Kit",
  "PPT Presentation Kit"
];

export function getSectionTemplate(section: string, details: ProjectDetails): string {
  const { title, projectType, techStack, problemStatement, features, academicLevel } = details;

  const base = `Project: ${title}\nCategory: ${projectType}\nStack: ${techStack}\nLevel: ${academicLevel}\n\n`;

  switch (section) {
    case "Abstract":
      return `${base}This project, "${title}", aims to address the following problem: ${problemStatement}. Built using ${techStack}, the system provides key features such as ${features}. This documentation package is tailored for ${academicLevel} level standards.`;
    case "Introduction":
      return `${base}The development of "${title}" is a response to the growing need in the ${projectType} domain. By leveraging ${techStack}, this project provides a robust solution for ${problemStatement.toLowerCase()}.`;
    case "System Requirements":
      return `${base}Hardware:\n- Processor: i5 or above\n- RAM: 8GB or above\n\nSoftware:\n- Operating System: Windows/Linux/MacOS\n- Tech Stack: ${techStack}`;
    case "Viva Questions":
      return `1. What is the main objective of ${title}?\n2. Why did you choose ${techStack}?\n3. How does this system solve ${problemStatement}?\n4. Explain the ${features.split(',')[0] || 'core'} module.\n5. What are the future enhancements possible?`;
    case "PPT Outline":
      return `Slide 1: Title & Team\nSlide 2: Problem Statement\nSlide 3: Proposed Solution\nSlide 4: Tech Stack\nSlide 5: Architecture\nSlide 6: Key Features\nSlide 7: Conclusion`;
    default:
      return `${base}This is a detailed placeholder for the "${section}" section of the ${title} project documentation. In a production environment, this content would be further enriched with specific domain knowledge for ${projectType} and ${techStack}.`;
  }
}
---
FILE: src/lib/project-profiler.ts
import AdmZip from 'adm-zip';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeGitHubRepo, RepoAnalysis } from './repository-analyzer';

export interface ProjectProfile {
  title: string;
  techStack: string[];
  features: string[];
  modules: string[];
  database?: string;
  architecture?: string;
  problemStatement?: string;
  objectives?: string[];
  methodology?: string;
}

export class ProjectProfiler {
  static async fromGitHub(url: string): Promise<ProjectProfile> {
    const analysis = await analyzeGitHubRepo(url);
    if (!analysis) {
       return {
         title: url.split('/').pop() || 'Untitled Project',
         techStack: [],
         features: [],
         modules: [],
         architecture: 'Standard'
       };
    }
    return {
      title: url.split('/').pop() || 'Untitled Project',
      techStack: analysis.tech_stack || [],
      features: analysis.features || [],
      modules: analysis.modules || [],
      database: analysis.database,
      architecture: 'Model-View-Controller (MVC)' // Default or inferred
    };
  }

  static async fromZip(buffer: Buffer, originalName: string): Promise<ProjectProfile> {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const techStack: Set<string> = new Set();
    const modules: Set<string> = new Set();

    entries.forEach(entry => {
      const name = entry.entryName;
      if (name.endsWith('package.json')) techStack.add('Node.js');
      if (name.endsWith('requirements.txt')) techStack.add('Python');
      if (name.endsWith('.java')) techStack.add('Java');
      if (name.endsWith('.php')) techStack.add('PHP');
      if (name.endsWith('.cpp')) techStack.add('C++');

      const parts = name.split('/');
      if (parts.length > 1 && !parts[0].startsWith('.')) {
        modules.add(parts[0]);
      }
    });

    return {
      title: originalName.replace('.zip', ''),
      techStack: Array.from(techStack),
      features: ['Automated Content Processing', 'Data Management'], // Inferred
      modules: Array.from(modules).slice(0, 5),
      architecture: 'Inferred Modular Architecture'
    };
  }

  static async fromPDF(buffer: Buffer): Promise<ProjectProfile> {
    const data = await pdf(buffer);
    const text = data.text;

    // Basic extraction logic
    const titleMatch = text.match(/Title:\s*(.*)/i) || text.match(/Project Report On\s*(.*)/i);
    const objectivesMatch = text.match(/Objectives:\s*([\s\S]*?)(?=\n\n|\n[A-Z])/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : 'Extracted Project',
      techStack: ['Detected from PDF content'],
      features: ['Content extracted from PDF'],
      modules: ['Core System'],
      problemStatement: 'Extracted from uploaded report',
      objectives: objectivesMatch ? objectivesMatch[1].split('\n').filter(l => l.trim()) : []
    };
  }

  static async fromDocx(buffer: Buffer): Promise<ProjectProfile> {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    return {
      title: 'Extracted from DOCX',
      techStack: ['Detected from DOCX content'],
      features: ['Parsed from document'],
      modules: ['General Module'],
      methodology: 'Analysis of provided documentation'
    };
  }
}
---
FILE: src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

import { RepoAnalysis } from "./repository-analyzer";

import { ProjectProfile } from "./project-profiler";

export interface ProjectInputs {
  title: string;
  category: string;
  techStack: string;
  features: string;
  problemStatement: string;
  academicLevel: string;
  university?: string;
  repoAnalysis?: ProjectProfile;
}

export async function generateProjectDocumentation(inputs: ProjectInputs, retryCount = 0): Promise<Record<string, string>> {
  const repoContext = inputs.repoAnalysis ? `
    GitHub Repository Context:
    - Analyzed Tech Stack: ${inputs.repoAnalysis.techStack?.join(", ")}
    - Identified Modules: ${inputs.repoAnalysis.modules?.join(", ")}
    - Identified Database: ${inputs.repoAnalysis.database}
    - Repository Features: ${inputs.repoAnalysis.features?.join(", ")}
  ` : "";

  const prompt = `
    Generate complete academic project documentation in JSON format for the following project:
    Title: ${inputs.title}
    Category: ${inputs.category}
    Tech Stack: ${inputs.techStack}
    Features: ${inputs.features}
    Problem Statement: ${inputs.problemStatement}
    Academic Level: ${inputs.academicLevel}
    ${repoContext}

    The JSON must contain exactly these keys:
    "Title Page", "Abstract", "Introduction", "Problem Statement", "Objectives", "Existing System", "Proposed System", "System Requirements", "Methodology", "Modules", "Database Design", "Testing Strategy", "Future Scope", "Conclusion", "References", "Viva Questions", "PPT Outline", "Viva Preparation Kit", "PPT Presentation Kit"

    Requirements:
    - Formal academic tone, adhering to ${inputs.university || 'standard academic'} formatting guidelines.
    - No markdown formatting inside the values.
    - High quality, original content.
    - Minimum 300 words for Abstract and Introduction.
    - "Viva Preparation Kit" must include 50 questions with detailed expected answers.
    - "PPT Presentation Kit" must include a 10-15 slide deck outline with speaker notes for each slide.
    - Suitable for ${inputs.academicLevel} level.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse JSON (strip markdown code blocks if present)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const content = JSON.parse(jsonStr);

    // Validation
    const requiredSections = [
      "Title Page", "Abstract", "Introduction", "Problem Statement", "Objectives", "Existing System",
      "Proposed System", "System Requirements", "Methodology", "Modules", "Database Design", "Testing Strategy",
      "Future Scope", "Conclusion", "References", "Viva Questions", "PPT Outline"
    ];

    const missing = requiredSections.filter(s => !content[s] || content[s].length < 50);
    if (missing.length > 0 && retryCount < 1) {
      console.warn(`Validation failed for sections: ${missing.join(", ")}. Retrying...`);
      return generateProjectDocumentation(inputs, retryCount + 1);
    }

    return content;
  } catch (error) {
    console.error("Gemini generation failed:", error);
    if (retryCount < 1) {
      console.log("Retrying Gemini generation...");
      return generateProjectDocumentation(inputs, retryCount + 1);
    }
    throw error;
  }
}

export async function generateProjectEmbedding(text: string) {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return null;
  }
}
---
FILE: src/lib/repository-analyzer.ts
import axios from 'axios';

export interface RepoAnalysis {
  title: string;
  tech_stack: string[];
  modules: string[];
  database: string;
  features: string[];
  confidence_score: number;
  architecture: string;
}

export async function analyzeGitHubRepo(url: string): Promise<RepoAnalysis | null> {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    // 1. Fetch Key Files Content
    const keyFiles = ['README.md', 'package.json', 'requirements.txt', 'pom.xml', 'go.mod', 'manage.py', 'composer.json'];
    const fileContents: Record<string, string> = {};

    for (const fileName of keyFiles) {
      try {
        const fileRes = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/contents/${fileName}`);
        fileContents[fileName] = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
      } catch {
        // Not found
      }
    }

    // 2. Project Structure
    let structure: string[] = [];
    try {
      const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/main?recursive=1`).catch(() =>
        axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/master?recursive=1`)
      );
      structure = treeRes.data.tree.map((t: { path: string }) => t.path);
    } catch {
      // Ignore
    }

    // 3. Tech Stack Detection
    const techStack: string[] = [];

    // Frontend
    if (fileContents['package.json']?.includes('"react"')) techStack.push('React');
    if (fileContents['package.json']?.includes('"@angular/core"')) techStack.push('Angular');
    if (fileContents['package.json']?.includes('"vue"')) techStack.push('Vue.js');
    if (fileContents['package.json']?.includes('"next"')) techStack.push('Next.js');

    // Backend
    if (fileContents['package.json']) techStack.push('Node.js');
    if (fileContents['pom.xml']) techStack.push('Java', 'Spring Boot');
    if (fileContents['requirements.txt'] || fileContents['manage.py']) techStack.push('Python', 'Django');
    if (fileContents['requirements.txt']?.includes('flask')) techStack.push('Flask');
    if (fileContents['composer.json']) techStack.push('PHP', 'Laravel');

    // 4. Database Detection
    let database = 'Unknown';
    const allContent = Object.values(fileContents).join(' ').toLowerCase();

    if (structure.some(p => p.includes('mongo')) || allContent.includes('mongoose') || allContent.includes('mongodb')) database = 'MongoDB';
    else if (structure.some(p => p.includes('mysql')) || allContent.includes('mysql')) database = 'MySQL';
    else if (structure.some(p => p.includes('postgres')) || allContent.includes('postgresql') || allContent.includes('psycopg2')) database = 'PostgreSQL';
    else if (structure.some(p => p.includes('sqlite')) || allContent.includes('sqlite')) database = 'SQLite';
    else if (allContent.includes('prisma') || allContent.includes('sequelize')) database = 'SQL';

    // 5. Feature Detection
    const features: string[] = [];
    if (structure.some(p => p.includes('auth') || p.includes('login') || p.includes('signup'))) features.push('Authentication');
    if (structure.some(p => p.includes('api') || p.includes('routes/'))) features.push('REST API');
    if (structure.some(p => p.includes('dashboard') || p.includes('admin'))) features.push('Dashboard');
    if (structure.some(p => p.includes('payment') || p.includes('stripe') || p.includes('razorpay'))) features.push('Payment Gateway');
    if (structure.some(p => p.includes('chat') || p.includes('socket'))) features.push('Real-time Chat');
    if (structure.some(p => p.includes('upload') || p.includes('storage'))) features.push('File Uploads');

    // 6. Architecture Inference
    let architecture = 'Monolithic';
    if (structure.some(p => p.includes('microservice'))) architecture = 'Microservices';
    else if (structure.some(p => p.includes('client/') && p.includes('server/'))) architecture = 'Client-Server (MERN/PERN)';
    else if (structure.some(p => p.includes('src/components'))) architecture = 'Component-Based';

    // 7. Confidence Score
    let score = 0;
    if (techStack.length > 0) score += 0.4;
    if (database !== 'Unknown') score += 0.2;
    if (features.length > 0) score += 0.2;
    if (fileContents['README.md']) score += 0.2;

    return {
      title: cleanRepo.replace(/-/g, ' ').replace(/_/g, ' '),
      tech_stack: techStack,
      modules: features,
      database,
      features,
      architecture,
      confidence_score: score
    };
  } catch (error) {
    console.error('GitHub analysis failed:', error);
    return null;
  }
}
---
