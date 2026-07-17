import { NextResponse } from "next/server";
import { userService } from "@/features/identity/services/user.service";
import { onboardingSkillsSchema } from "@/features/identity/validations/invitation.schema";
import { requireAuth } from "@/lib/authorize";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    if (!session.user?.id) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 401 });
    const body = await req.json();
    const data = onboardingSkillsSchema.parse(body);
    await userService.addUserSkills(session.user.id, data.skills);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues.map((e: any) => e.message).join("; ") } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message } }, { status: error.statusCode || 500 });
  }
}
