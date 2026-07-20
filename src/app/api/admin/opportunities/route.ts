import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authorize";
import { opportunityService } from "@/features/opportunities/services/opportunity.service";
import { createOpportunitySchema } from "@/features/opportunities/validations/opportunity.schema";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = (session.user as { id: string }).id;
    const opportunities = await opportunityService.getAll(userId);
    return NextResponse.json({ success: true, data: opportunities });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "Unauthorized" } },
      { status: error.statusCode || 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = createOpportunitySchema.parse(body);
    const userId = (session.user as { id: string }).id;
    const opp = await opportunityService.create(data, userId);
    return NextResponse.json({ success: true, data: opp });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || "An error occurred" } },
      { status: error.name === "ZodError" ? 400 : error.statusCode || 500 },
    );
  }
}
