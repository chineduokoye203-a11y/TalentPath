import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sendEmail, renderPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_EXPIRY_HOURS = 1;

export const passwordResetService = {
  async requestReset(email: string): Promise<void> {
    const user = await db.user.findUnique({ where: { email, deletedAt: null } });
    if (!user) {
      return;
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await db.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    await sendEmail(
      email,
      "Reset your TalentPath password",
      renderPasswordResetEmail(user.name, token),
    );
    logger("info", "Password reset requested", { email });
  },

  async validateToken(token: string): Promise<{ email: string }> {
    const record = await db.passwordResetToken.findUnique({ where: { token } });
    if (!record) throw new NotFoundError("Invalid or expired reset token");
    if (record.usedAt) throw new ValidationError("This reset link has already been used");
    if (record.expiresAt < new Date()) throw new ValidationError("This reset link has expired");
    return { email: record.email };
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await db.passwordResetToken.findUnique({ where: { token } });
    if (!record) throw new NotFoundError("Invalid reset token");
    if (record.usedAt) throw new ValidationError("This reset link has already been used");
    if (record.expiresAt < new Date()) throw new ValidationError("This reset link has expired");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { email: record.email },
      data: { passwordHash },
    });

    await db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
  },
};
