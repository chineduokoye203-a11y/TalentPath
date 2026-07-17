"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { loginSchema } from "../validations/auth.schema";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";


export async function loginAction(formData: FormData) {
  try {
    const data = loginSchema.parse(Object.fromEntries(formData));

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    const errorName = (error as any)?.constructor?.name || typeof error;
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger("error", "Login failed", { name: errorName, message: errorMsg, error: String(error) });
    const isRedirect = error instanceof Error && (error.message === "NEXT_REDIRECT" || (error as any).digest?.startsWith("NEXT_REDIRECT"));
    if (isRedirect) {
      throw error;
    }
    
    if (error instanceof ZodError) {
      const messages = error.issues.map((e) => e.message).join("; ");
      return { success: false, error: messages };
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: `Login failed: ${errorMsg}` };
      }
    }
    return { success: false, error: `Login failed: ${errorName}: ${errorMsg}` };
  }
}
