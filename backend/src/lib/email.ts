import { config } from '../config/env';

export async function sendVerificationCode(email: string, code: string) {
  const subject = 'Verify your Campus Marketplace account';
  const html = `<p>Welcome to Campus Marketplace.</p><p>Your verification code is <strong>${code}</strong>.</p><p>This code expires in 4 minutes.</p>`;

  if (!config.email.resendApiKey) {
    console.log(`[email] Verification code for ${email}: ${code}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.email.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: config.email.from, to: [email], subject, html }),
  });

  if (!response.ok) throw new Error('Unable to send verification email');
}