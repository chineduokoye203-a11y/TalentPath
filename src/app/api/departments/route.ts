import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const departments = await db.department.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ success: true, data: departments });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch departments" } }, { status: 500 });
  }
}
