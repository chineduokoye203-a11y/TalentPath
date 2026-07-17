import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  try {
    const session = await requireAuth();
    const { employeeId } = await params;

    const employee = await db.user.findUnique({
      where: { id: employeeId, deletedAt: null },
      include: {
        department: true,
        team: true,
        employeeSkills: {
          include: {
            skill: {
              include: { category: true },
            },
          },
        },
        learningEnrollments: {
          include: { resource: true },
        },
        profile: true,
      },
    });

    if (!employee) throw new NotFoundError("Employee not found");

    let targetRoleSkills: any[] = [];

    if (employee.profile?.targetRoleId) {
      const careerRole = await db.careerRole.findUnique({
        where: { id: employee.profile.targetRoleId },
        include: {
          requiredSkills: {
            include: { skill: true },
          },
        },
      });

      if (careerRole) {
        targetRoleSkills = careerRole.requiredSkills.map((rs) => ({
          skill: rs.skill,
          requiredLevel: rs.requiredLevel,
        }));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...employee,
        targetRoleSkills,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
