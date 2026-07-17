import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invitationService } from "@/features/identity/services/invitation.service";
import { userService } from "@/features/identity/services/user.service";
import { activateAccountSchema } from "@/features/identity/validations/invitation.schema";
import { writeAuditLog } from "@/lib/audit";
import { signIn } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = activateAccountSchema.parse(body);

    const invitation = await invitationService.validateInvitation(data.token);

    const inviter = await db.user.findUnique({ where: { id: invitation.createdBy } });
    if (!inviter || !inviter.companyId) {
      return NextResponse.json({ success: false, error: { code: "INVITATION_ERROR", message: "Invalid invitation: inviter has no company" } }, { status: 400 });
    }

    const user = await userService.createUserFromInvitation({
      email: invitation.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      role: invitation.role,
      companyId: inviter.companyId,
      departmentId: invitation.departmentId,
      teamId: invitation.teamId,
    });

    await invitationService.markAccepted(invitation.id);

    await writeAuditLog({
      action: "UPDATE",
      entity: "Invitation",
      entityId: invitation.id,
      userId: user.id,
      previous: { status: "PENDING" },
      new: { status: "ACCEPTED" },
    });

    await signIn("credentials", {
      email: invitation.email,
      password: data.password,
      redirect: false,
    });

    return NextResponse.json({ success: true, data: { userId: user.id, onboardingRequired: true } }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues.map((e: any) => e.message).join("; ") } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: error.code || "INTERNAL_ERROR", message: error.message } }, { status: error.statusCode || 500 });
  }
}
