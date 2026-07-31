import { NextResponse } from "next/server";
import { notificationService } from "@/features/notifications/services/notification.service";
import { requireAuth } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const notifications = await notificationService.getMyNotifications(session.user.id);
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth();
    if (!session.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const body = await request.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      const notifications = await notificationService.getMyNotifications(session.user.id);
      for (const n of notifications) {
        if (!n.read) {
          await notificationService.markAsRead(n.id);
        }
      }
      return NextResponse.json({ success: true });
    }

    if (id) {
      await notificationService.markAsRead(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "id or markAllRead is required" } },
      { status: 400 },
    );
  } catch (error) {
    return handleError(error);
  }
}
