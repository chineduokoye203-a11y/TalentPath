import { NextResponse } from "next/server";
import { invitationService } from "@/features/identity/services/invitation.service";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const invitation = await invitationService.validateInvitation(token);
    return NextResponse.json({
      success: true,
      data: {
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: error.code || "NOT_FOUND", message: error.message } }, { status: error.statusCode || 404 });
  }
}
