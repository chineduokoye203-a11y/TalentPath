import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/authorize";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = (session.user as any).id;
    const user = await db.user.findUnique({ where: { id: userId }, select: { companyId: true } });
    const departments = await db.department.findMany({
      where: { companyId: user?.companyId ?? "" },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: departments });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch departments" } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["HR", "ADMINISTRATOR"]);
    const userId = (session.user as any).id;
    const user = await db.user.findUnique({ where: { id: userId }, select: { companyId: true } });
    if (!user?.companyId) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You must belong to a company to create departments" } }, { status: 403 });
    }
    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Department name is required" } }, { status: 400 });
    }
    const department = await db.department.create({ data: { companyId: user.companyId, name: name.trim() } });
    return NextResponse.json({ success: true, data: department }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message || "Failed to create department" } }, { status: error.statusCode || 500 });
  }
}
