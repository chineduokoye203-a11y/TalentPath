import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role: string }).role;

    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { teamId: true, companyId: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 },
      );
    }

    const where: any = { deletedAt: null };

    if (userRole === "MANAGER" && currentUser.teamId) {
      where.teamId = currentUser.teamId;
      where.id = { not: userId };
    } else if (userRole === "HR" || userRole === "LEADERSHIP") {
      where.companyId = currentUser.companyId;
    } else {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
        { status: 403 },
      );
    }

    const members = await db.user.findMany({
      where,
      include: {
        department: true,
        team: true,
        employeeSkills: { include: { skill: true } },
        learningEnrollments: { include: { resource: true } },
      },
    });

    const result = members.map((member) => {
      const skillCount = member.employeeSkills.length;
      const completedEnrollments = member.learningEnrollments.filter(
        (e) => e.status === "COMPLETED",
      );
      const learningProgress =
        member.learningEnrollments.length > 0
          ? Math.round((completedEnrollments.length / member.learningEnrollments.length) * 100)
          : 0;
      const hasSkillGaps = member.employeeSkills.length === 0;

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        avatarUrl: member.avatarUrl,
        department: member.department,
        team: member.team,
        skillCount,
        learningProgress,
        hasSkillGaps,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleError(error);
  }
}
