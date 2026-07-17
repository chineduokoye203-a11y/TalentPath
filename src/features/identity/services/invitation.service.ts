import { db } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail, renderInvitationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import type { CreateInvitationInput } from "../validations/invitation.schema";
import type { Invitation } from "@prisma/client";

const INVITATION_EXPIRY_DAYS = 7;

export const invitationService = {
  async createInvitation(data: CreateInvitationInput, createdBy: string): Promise<Invitation> {
    const existing = await db.invitation.findFirst({
      where: { email: data.email, status: "PENDING" },
    });
    if (existing) throw new ValidationError("An active invitation already exists for this email");

    const userExists = await db.user.findUnique({ where: { email: data.email } });
    if (userExists) throw new ValidationError("A user with this email already exists");

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const invitation = await db.invitation.create({
      data: {
        token,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        departmentId: data.departmentId || null,
        teamId: data.teamId || null,
        jobTitle: data.jobTitle || null,
        managerId: data.managerId || null,
        expiresAt,
        status: "PENDING",
        createdBy,
      },
    });

    await writeAuditLog({
      action: "CREATE",
      entity: "Invitation",
      entityId: invitation.id,
      userId: createdBy,
      new: { email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt.toISOString() },
    });

    const inviter = await db.user.findUnique({ where: { id: createdBy }, include: { company: true } });
    const companyName = inviter?.company?.name || "Your Company";

    await sendEmail(
      invitation.email,
      "You're invited to TalentPath",
      renderInvitationEmail(invitation.firstName, invitation.token, invitation.role, companyName),
    );

    return invitation;
  },

  async getInvitationByToken(token: string): Promise<Invitation> {
    const invitation = await db.invitation.findUnique({ where: { token } });
    if (!invitation) throw new NotFoundError("Invitation not found");
    return invitation;
  },

  async validateInvitation(token: string): Promise<Invitation> {
    const invitation = await this.getInvitationByToken(token);

    if (invitation.status !== "PENDING") {
      throw new ValidationError(`This invitation has been ${invitation.status.toLowerCase()}`);
    }
    if (invitation.expiresAt < new Date()) {
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      throw new ValidationError("This invitation has expired");
    }

    return invitation;
  },

  async markAccepted(id: string): Promise<void> {
    await db.invitation.update({
      where: { id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
  },

  async listInvitations(skip = 0, take = 20, userId?: string) {
    const where: any = {};

    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId }, select: { companyId: true } });
      if (user?.companyId) {
        const companyUserIds = await db.user.findMany({ where: { companyId: user.companyId }, select: { id: true } });
        where.createdBy = { in: companyUserIds.map((u) => u.id) };
      }
    }

    const [data, total] = await Promise.all([
      db.invitation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      db.invitation.count({ where }),
    ]);
    return { data, total };
  },

  async revokeInvitation(id: string, userId: string): Promise<void> {
    const invitation = await db.invitation.findUnique({ where: { id } });
    if (!invitation) throw new NotFoundError("Invitation not found");
    if (invitation.status !== "PENDING") {
      throw new ValidationError("Only pending invitations can be revoked");
    }

    await db.invitation.update({
      where: { id },
      data: { status: "REVOKED" },
    });

    await writeAuditLog({
      action: "UPDATE",
      entity: "Invitation",
      entityId: id,
      userId,
      previous: { status: "PENDING" },
      new: { status: "REVOKED" },
    });
  },
};
