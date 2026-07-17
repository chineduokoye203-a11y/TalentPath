import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit";
import type { CreateOpportunityInput, UpdateOpportunityInput } from "../validations/opportunity.schema";

export const opportunityService = {
  async getAll() {
    return await db.internalOpportunity.findMany({
      where: { deletedAt: null },
      include: { department: true, team: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getOpenOpportunities() {
    return await db.internalOpportunity.findMany({
      where: { deletedAt: null, status: "OPEN" },
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
    const opp = await db.internalOpportunity.create({
      data: {
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
    const existing = await db.internalOpportunity.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError("Opportunity not found");

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
    const existing = await db.internalOpportunity.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError("Opportunity not found");

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
