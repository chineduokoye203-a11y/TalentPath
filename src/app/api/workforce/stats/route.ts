import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/authorize";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = (session.user as any).id;
    const currentUser = await db.user.findUnique({ where: { id: userId } });
    if (!currentUser?.companyId) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User or company not found" } }, { status: 404 });
    }

    const companyId = currentUser.companyId;

    const totalEmployees = await db.user.count({
      where: { companyId, deletedAt: null },
    });

    const deptUserCounts = await db.user.groupBy({
      by: ["departmentId"],
      where: { companyId, deletedAt: null, departmentId: { not: null } },
      _count: { id: true },
    });

    const deptCountMap: Record<string, number> = {};
    deptUserCounts.forEach((d) => {
      if (d.departmentId) deptCountMap[d.departmentId] = d._count.id;
    });

    const totalSkillsAssessed = await db.employeeSkill.count({
      where: { user: { companyId, deletedAt: null } },
    });

    const totalSkillGaps = await db.skillGap.count({
      where: { user: { companyId, deletedAt: null } },
    });

    return NextResponse.json({
      success: true,
      data: { totalEmployees, deptCountMap, totalSkillsAssessed, totalSkillGaps },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}
