import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";
import { learningService } from "@/features/learning/services/learning.service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = (session.user as any).id as string;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        department: { select: { name: true } },
        employeeSkills: { include: { skill: { select: { name: true } } } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 },
      );
    }

    let courses: Awaited<ReturnType<typeof learningService.searchCourses>>["data"] = [];

    if (user.employeeSkills.length > 0) {
      const results = await Promise.all(
        user.employeeSkills.map((es) =>
          learningService.searchCourses({ query: es.skill.name, pageSize: 2 }),
        ),
      );

      const seen = new Set<string>();
      for (const result of results) {
        for (const course of result.data) {
          if (!seen.has(course.id)) {
            seen.add(course.id);
            courses.push(course);
          }
        }
      }
    } else {
      const departmentQuery = user.department
        ? `${user.department.name} courses`
        : "General courses";

      const [departmentResults, leadershipResults] = await Promise.all([
        learningService.searchCourses({ query: departmentQuery, pageSize: 3 }),
        learningService.searchCourses({ query: "Leadership", pageSize: 2 }),
      ]);

      courses = [...departmentResults.data, ...leadershipResults.data];
    }

    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    return handleError(error);
  }
}
