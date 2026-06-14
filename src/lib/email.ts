/**
 * Production Email System Hook (Resend)
 *
 * To activate:
 * 1. npm install resend
 * 2. Add RESEND_API_KEY to environment variables
 */

export async function sendOTPEmail(email: string, code: string) {
  if (process.env.NODE_ENV === 'production' && process.env.RESEND_API_KEY) {
    // try {
    //   const { Resend } = await import('resend');
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from: 'ReportReady <auth@reportready.in>',
    //     to: email,
    //     subject: 'Your ReportReady Access Code',
    //     text: `Your login code is: ${code}`,
    //   });
    // } catch (err) {
    //   console.error('Failed to send email:', err);
    // }
  }

  // Always log to console for development/beta
  console.log(`[AUTH] OTP for ${email}: ${code}`);
}
