import { NextResponse } from "next/server";
import { learningService } from "@/features/learning/services/learning.service";
import { requireAuth } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const enrollments = await learningService.getEmployeeEnrollments(session.user.id);
    return NextResponse.json({ success: true, data: enrollments });
  } catch (error) {
    return handleError(error);
  }
}
