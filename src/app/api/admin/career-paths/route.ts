import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorize";
import { careerService } from "@/features/career/services/career.service";
import { createCareerPathSchema } from "@/features/career/validations/career.schema";
import { db } from "@/lib/db";

async function resolveCompanyId(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { companyId: true } });
  if (!user?.companyId) throw new Error("User does not belong to a company");
  return user.companyId;
}

export async function GET() {
  try {
    const session = await requireAuth();
    const companyId = await resolveCompanyId((session.user as { id: string }).id);
    const paths = await careerService.getCareerPaths(companyId);
    return NextResponse.json({ success: true, data: paths });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Unauthorized" } },
      { status: error.statusCode || 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = createCareerPathSchema.parse(body);
    const userId = (session.user as { id: string }).id;
    const path = await careerService.createCareerPath(data, userId);
    return NextResponse.json({ success: true, data: path });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "An error occurred" } },
      { status: error.name === "ZodError" ? 400 : error.statusCode || 500 },
    );
  }
}
