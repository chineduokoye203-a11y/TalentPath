import { db } from "@/lib/db";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit";
import type { CreateOpportunityInput, UpdateOpportunityInput } from "../validations/opportunity.schema";

async function getCompanyId(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { companyId: true } });
  if (!user?.companyId) throw new ForbiddenError("User does not belong to a company");
  return user.companyId;
}

export const opportunityService = {
  async getAll(userId: string) {
    const companyId = await getCompanyId(userId);
    return await db.internalOpportunity.findMany({
      where: { deletedAt: null, companyId },
      include: { department: true, team: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getOpenOpportunities(userId: string) {
    const companyId = await getCompanyId(userId);
    return await db.internalOpportunity.findMany({
      where: { deletedAt: null, status: "OPEN", companyId },
      include: { department: true, team: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    const opp = await db.internalOpportunity.findUnique({
      where: { id },
      include: { department: true, team: true },
    });
    if (!opp || opp.deletedAt) throw new NotFoundError("Opportunity not found");
    return opp;
  },

  async create(data: CreateOpportunityInput, userId: string) {
    const companyId = await getCompanyId(userId);
    const opp = await db.internalOpportunity.create({
      data: {
        companyId,
        title: data.title,
        description: data.description,
        departmentId: data.departmentId ?? null,
        teamId: data.teamId ?? null,
        requiredSkills: data.requiredSkills ?? "",
        status: data.status ?? "OPEN",
        postedById: userId,
      },
    });

    await writeAuditLog({
      action: "CREATE",
      entity: "InternalOpportunity",
      entityId: opp.id,
      userId,
      new: { title: data.title, description: data.description, departmentId: data.departmentId, status: data.status },
    });

    return opp;
  },

  async update(id: string, data: UpdateOpportunityInput, userId: string) {
    const companyId = await getCompanyId(userId);
    const existing = await db.internalOpportunity.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError("Opportunity not found");
    if (existing.companyId !== companyId) throw new ForbiddenError("You can only update opportunities from your company");

    const updated = await db.internalOpportunity.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
        ...(data.teamId !== undefined ? { teamId: data.teamId } : {}),
        ...(data.requiredSkills !== undefined ? { requiredSkills: data.requiredSkills } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });

    await writeAuditLog({
      action: "UPDATE",
      entity: "InternalOpportunity",
      entityId: id,
      userId,
      previous: { title: existing.title, status: existing.status },
      new: { title: updated.title, status: updated.status },
    });

    return updated;
  },

  async delete(id: string, userId: string) {
    const companyId = await getCompanyId(userId);
    const existing = await db.internalOpportunity.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError("Opportunity not found");
    if (existing.companyId !== companyId) throw new ForbiddenError("You can only delete opportunities from your company");

    await db.internalOpportunity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await writeAuditLog({
      action: "DELETE",
      entity: "InternalOpportunity",
      entityId: id,
      userId,
      previous: { title: existing.title },
    });
  },
};
