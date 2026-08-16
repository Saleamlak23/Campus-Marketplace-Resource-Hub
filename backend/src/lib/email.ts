import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate verification token
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  token: string,
  name: string
) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@campusmarketplace.com',
    to: email,
    subject: 'Verify Your Email - Campus Marketplace',
    html: `
      <h1>Welcome to Campus Marketplace, ${name}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 16px 0;
      ">Verify Email</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// Verify email endpoint logic
export const verifyEmail = async (token: string) => {
  // Implementation will go here
  // This will validate the token and update user's emailVerified status
  console.log(`🔍 Verifying email with token: ${token}`);
};