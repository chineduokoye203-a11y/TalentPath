import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const teams = await db.team.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ success: true, data: teams });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch teams" } }, { status: 500 });
  }
}
