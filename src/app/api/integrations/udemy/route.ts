import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleError } from "@/lib/error-handler";
import { learningService } from "@/features/learning/services/learning.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;
    const action = searchParams.get("action");

    switch (action) {
      case "search-courses": {
        const result = await learningService.searchCourses({
          query: searchParams.get("query") ?? undefined,
          page: Number(searchParams.get("page") ?? "1"),
          pageSize: Number(searchParams.get("pageSize") ?? "20"),
        });
        return NextResponse.json({ success: true, ...result }, { status: 200 });
      }

      case "get-course": {
        const courseId = searchParams.get("courseId");
        if (!courseId) {
          return NextResponse.json(
            { success: false, message: "courseId is required" },
            { status: 400 },
          );
        }
        const course = await learningService.getCourse(courseId);
        return NextResponse.json({ success: true, data: course }, { status: 200 });
      }

      case "get-learning-paths": {
        const paths = await learningService.getLearningPaths();
        return NextResponse.json({ success: true, data: paths }, { status: 200 });
      }

      default:
        return NextResponse.json(
          { success: false, message: "Unknown action" },
          { status: 400 },
        );
    }
  } catch (error) {
    return handleError(error);
  }
}
