import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userService } from "@/features/identity/services/user.service";
import { onboardingProfileSchema } from "@/features/identity/validations/invitation.schema";
import { requireAuth } from "@/lib/authorize";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user?.id;
    if (!userId) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 401 });

    let profile = await db.profile.findUnique({ where: { userId } });

    if (!profile) {
      const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
      if (user) {
        const invitation = await db.invitation.findFirst({
          where: { email: user.email, status: "ACCEPTED" },
          orderBy: { acceptedAt: "desc" },
          select: { jobTitle: true, departmentId: true },
        });
        if (invitation?.jobTitle || invitation?.departmentId) {
          const data: Record<string, any> = {};
          if (invitation.jobTitle) data.jobTitle = invitation.jobTitle;
          profile = { userId, ...data } as any;
        }
      }
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message } }, { status: error.statusCode || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    if (!session.user?.id) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 401 });
    const body = await req.json();
    const data = onboardingProfileSchema.parse(body);
    await userService.updateProfile(session.user.id, data);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues.map((e: any) => e.message).join("; ") } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message } }, { status: error.statusCode || 500 });
  }
}
