import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";
import { NotFoundError } from "@/lib/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["HR", "ADMINISTRATOR", "MANAGER"]);

    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        teamId: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundError("User not found");

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMINISTRATOR"]);

    const { id } = await params;
    // Soft delete
    await db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
