import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorize";
import { opportunityService } from "@/features/opportunities/services/opportunity.service";

export async function GET() {
  try {
    await requireAuth();
    const opportunities = await opportunityService.getOpenOpportunities();
    return NextResponse.json({ success: true, data: opportunities });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Unauthorized" } },
      { status: error.statusCode || 401 },
    );
  }
}
