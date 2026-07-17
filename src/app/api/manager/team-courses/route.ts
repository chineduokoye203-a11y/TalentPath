import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/authorize";
import { handleError } from "@/lib/error-handler";

export async function GET() {
  try {
    await requireAuth();

    const courses = await db.learningResource.findMany({
      where: { active: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    return handleError(error);
  }
}
