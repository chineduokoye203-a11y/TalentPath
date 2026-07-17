import * as nodemailer from "nodemailer";
import { env } from "./env";
import { logger } from "./logger";

function createTransport() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
  });
}

const fromAddress = env.SMTP_FROM || '"TalentPath" <noreply@talentpath.com>';

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.ENABLE_EMAIL_NOTIFICATIONS) {
    logger("info", "Email notifications disabled. Skipping email.", { to, subject });
    return;
  }

  const transport = createTransport();
  if (!transport) {
    logger("warn", "SMTP not configured. Email not sent.", { to, subject });
    return;
  }

  try {
    await transport.sendMail({ from: fromAddress, to, subject, html });
    logger("info", "Email sent", { to, subject });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error instanceof Error ? (error as any).code : undefined;
    logger("error", "Failed to send email", { to, subject, error: errorMessage, code: errorCode });
  }
}

function getAppUrl(): string {
  return env.APP_URL || "http://localhost:3000";
}

export function renderInvitationEmail(firstName: string, token: string, role: string, companyName: string): string {
  const url = `${getAppUrl()}/activate?token=${token}`;
  const roleLabel: Record<string, string> = {
    EMPLOYEE: "Employee",
    MANAGER: "Manager",
    HR: "HR Administrator",
    LEADERSHIP: "Leadership",
    ADMINISTRATOR: "Administrator",
  };
  const displayRole = roleLabel[role] || role;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: hsl(9, 81%, 46%);">Welcome to TalentPath</h2>
      <p>Hello ${firstName},</p>
      <p>You've been invited to join ${companyName} on TalentPath.</p>
      <p><strong>Role:</strong> ${displayRole}</p>
      <p>Click below to activate your account.</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background: hsl(9, 81%, 46%); color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600;">Activate Account</a>
      <p style="margin-top: 24px; font-size: 14px; color: #666;">This link expires in 7 days. If you did not expect this invitation, you can ignore this email.</p>
    </div>
  `;
}

export function renderPasswordResetEmail(name: string, token: string): string {
  const url = `${getAppUrl()}/auth?mode=reset&token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: hsl(9, 81%, 46%);">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the button below to set a new password.</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background: hsl(9, 81%, 46%); color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600;">Reset Password</a>
      <p style="margin-top: 24px; font-size: 14px; color: #666;">This link expires in 1 hour. If you did not request a password reset, you can ignore this email.</p>
    </div>
  `;
}
