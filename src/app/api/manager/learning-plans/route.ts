import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";

export async function GET() {
  try {
    await requireAuth();

    const plans = await db.learningPlan.findMany({
      include: {
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            resource: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const { title, description, courseIds } = body as {
      title: string;
      description?: string;
      courseIds: string[];
    };

    if (!title || !courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "title and courseIds are required" },
        },
        { status: 400 },
      );
    }

    const plan = await db.learningPlan.create({
      data: {
        title,
        description: description ?? null,
        courseIds: JSON.stringify(courseIds),
        createdBy: userId,
      },
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
