import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";
import { notificationService } from "@/features/notifications/services/notification.service";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    const { userIds, learningResourceId, learningPlanId } = body as {
      userIds: string[];
      learningResourceId?: string;
      learningPlanId?: string;
    };

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "userIds is required" },
        },
        { status: 400 },
      );
    }

    if (!learningResourceId && !learningPlanId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Either learningResourceId or learningPlanId is required",
          },
        },
        { status: 400 },
      );
    }

    let resourceIdsToEnroll: string[] = [];
    let assignmentName = "learning";

    if (learningResourceId) {
      resourceIdsToEnroll = [learningResourceId];
      const resource = await db.learningResource.findUnique({ where: { id: learningResourceId } });
      if (resource) assignmentName = resource.title;
    } else if (learningPlanId) {
      const plan = await db.learningPlan.findUnique({ where: { id: learningPlanId } });

      if (!plan) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Learning plan not found" } },
          { status: 404 },
        );
      }

      assignmentName = plan.title;
      resourceIdsToEnroll = JSON.parse(plan.courseIds) as string[];
    }

    let createdCount = 0;
    const notifiedUsers = new Set<string>();

    for (const userId of userIds) {
      for (const resourceId of resourceIdsToEnroll) {
        const existing = await db.learningEnrollment.findFirst({
          where: { userId, learningResourceId: resourceId },
        });

        if (existing) continue;

        await db.learningEnrollment.create({
          data: {
            userId,
            learningResourceId: resourceId,
            learningPlanId: learningPlanId ?? null,
            status: "NOT_STARTED",
          },
        });

        createdCount++;
      }

      if (!notifiedUsers.has(userId)) {
        notifiedUsers.add(userId);
        await notificationService.createNotification(
          userId,
          "New Learning Assigned",
          `You have been assigned "${assignmentName}". Check your learning dashboard to get started.`,
          "INFO",
        );
      }
    }

    return NextResponse.json({ success: true, data: { createdCount } });
  } catch (error) {
    return handleError(error);
  }
}
