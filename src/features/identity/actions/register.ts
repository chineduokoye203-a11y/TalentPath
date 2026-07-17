"use server";

import { z } from "zod";
import { userService } from "../services/user.service";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";

const signUpSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function signUpAction(formData: FormData) {
  try {
    const data = signUpSchema.parse(Object.fromEntries(formData));
    await userService.signUp(data.companyName, data.email, data.password);
    return { success: true };
  } catch (error) {
    const errorName = (error as any)?.constructor?.name || typeof error;
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger("error", "Sign up failed", { name: errorName, message: errorMsg });
    if (error instanceof ZodError) {
      const messages = error.issues.map((e) => e.message).join("; ");
      return { success: false, error: messages };
    }
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: `Sign up failed: ${errorMsg}` };
  }
}
