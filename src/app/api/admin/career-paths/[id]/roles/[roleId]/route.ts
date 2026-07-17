import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorize";
import { careerService } from "@/features/career/services/career.service";
import { updateCareerRoleSchema } from "@/features/career/validations/career.schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> },
) {
  try {
    const session = await requireAuth();
    const { roleId } = await params;
    const body = await request.json();
    const data = updateCareerRoleSchema.parse(body);
    const userId = (session.user as { id: string }).id;
    const updated = await careerService.updateCareerRole(roleId, data, userId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "An error occurred" } },
      { status: error.name === "ZodError" ? 400 : error.statusCode || 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> },
) {
  try {
    const session = await requireAuth();
    const { roleId } = await params;
    const userId = (session.user as { id: string }).id;
    await careerService.deleteCareerRole(roleId, userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "An error occurred" } },
      { status: error.statusCode || 500 },
    );
  }
}
