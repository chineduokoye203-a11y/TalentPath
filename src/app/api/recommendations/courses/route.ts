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
      const searchQueries = user.employeeSkills.map((es) => `Advanced ${es.skill.name}`);
      searchQueries.push(...user.employeeSkills.map((es) => es.skill.name));

      const uniqueQueries = [...new Set(searchQueries)];
      const results = await Promise.all(
        uniqueQueries.slice(0, 3).map((q) =>
          learningService.searchCourses({ query: q, pageSize: 1 }),
        ),
      );

      const seen = new Set<string>();
      for (const result of results) {
        for (const course of result.data) {
          if (!seen.has(course.id) && courses.length < 3) {
            seen.add(course.id);
            courses.push(course);
          }
        }
      }
    }

    if (courses.length === 0 && user.department?.name) {
      const results = await learningService.searchCourses({
        query: `${user.department.name} professional development`,
        pageSize: 3,
      });
      courses = results.data.slice(0, 3);
    }

    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    return handleError(error);
  }
}
