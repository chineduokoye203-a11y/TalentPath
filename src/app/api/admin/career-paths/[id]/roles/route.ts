import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorize";
import { careerService } from "@/features/career/services/career.service";
import { createCareerRoleSchema } from "@/features/career/validations/career.schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id: careerPathId } = await params;
    const body = await request.json();
    const data = createCareerRoleSchema.parse(body);
    const userId = (session.user as { id: string }).id;
    const role = await careerService.createCareerRole(careerPathId, data, userId);
    return NextResponse.json({ success: true, data: role });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "An error occurred" } },
      { status: error.name === "ZodError" ? 400 : error.statusCode || 500 },
    );
  }
}
