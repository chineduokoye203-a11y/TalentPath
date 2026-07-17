import { NextResponse } from "next/server";
import { passwordResetService } from "@/features/identity/services/password-reset.service";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = resetPasswordSchema.parse(body);

    await passwordResetService.resetPassword(data.token, data.password);

    return NextResponse.json({ success: true, message: "Password has been reset successfully." });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: error.issues.map((e: any) => e.message).join("; ") } },
        { status: 400 },
      );
    }
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message || "An error occurred" } },
      { status },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Token is required" } },
        { status: 400 },
      );
    }

    const data = await passwordResetService.validateToken(token);
    return NextResponse.json({ success: true, data: { email: maskEmail(data.email) } });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message || "Invalid token" } },
      { status },
    );
  }
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name[0]}***@${domain}`;
}
