import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAuth } from "@/lib/authorize";

const teamAssignmentSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  teamId: z.string().optional(),
  departmentSize: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    if (!session.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 401 });
    }

    const body = await req.json();
    const data = teamAssignmentSchema.parse(body);

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
    }

    const department = await db.department.findUnique({ where: { id: data.departmentId } });
    if (!department) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Department not found" } }, { status: 404 });
    }

    if (data.teamId) {
      const team = await db.team.findUnique({ where: { id: data.teamId } });
      if (!team) {
        return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Team not found" } }, { status: 404 });
      }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        departmentId: data.departmentId,
        teamId: data.teamId || null,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: error.issues.map((e: any) => e.message).join("; ") } },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message } },
      { status: error.statusCode || 500 },
    );
  }
}
