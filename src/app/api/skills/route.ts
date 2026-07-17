import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorize";
import { skillService } from "@/features/skills/services/skill.service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const employeeSkills = await skillService.getEmployeeSkills(userId);
      return NextResponse.json({ success: true, data: employeeSkills });
    }

    const [skills, categories] = await Promise.all([
      skillService.listSkills(0, 200),
      skillService.getCategories(),
    ]);
    return NextResponse.json({ success: true, data: { skills: skills.data, categories } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message || "Unauthorized" } }, { status: 401 });
  }
}
