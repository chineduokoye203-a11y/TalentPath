import { NextResponse } from "next/server";
import { invitationService } from "@/features/identity/services/invitation.service";
import { createInvitationSchema } from "@/features/identity/validations/invitation.schema";
import { requireRole } from "@/lib/authorize";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["HR", "ADMINISTRATOR"]);
    if (!session.user?.id) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 401 });
    const body = await req.json();
    const data = createInvitationSchema.parse(body);
    const invitation = await invitationService.createInvitation(data, session.user.id);
    return NextResponse.json({ success: true, data: { id: invitation.id, email: invitation.email, expiresAt: invitation.expiresAt } }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues.map((e: any) => e.message).join("; ") } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message } }, { status: error.statusCode || 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await requireRole(["HR", "ADMINISTRATOR"]);
    if (!session.user?.id) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 401 });
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(url.searchParams.get("pageSize") || "20"), 100);
    const skip = (page - 1) * pageSize;
    const result = await invitationService.listInvitations(skip, pageSize, session.user.id);
    return NextResponse.json({ success: true, data: result.data, pagination: { page, pageSize, total: result.total, totalPages: Math.ceil(result.total / pageSize) } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message } }, { status: error.statusCode || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["HR", "ADMINISTRATOR"]);
    if (!session.user?.id) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "User not found" } }, { status: 401 });
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invitation ID is required" } }, { status: 400 });
    await invitationService.revokeInvitation(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message } }, { status: error.statusCode || 500 });
  }
}
