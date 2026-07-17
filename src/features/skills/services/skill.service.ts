import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit";
import type { CreateSkillInput, AssessSkillInput } from "../validations/skill.schema";

export const skillService = {
  async getCategories() {
    return await db.skillCategory.findMany({ orderBy: { name: "asc" } });
  },

  async listSkills(skip = 0, take = 50) {
    const [data, total] = await Promise.all([
      db.skill.findMany({
        where: { deletedAt: null },
        include: { category: true },
        orderBy: { name: "asc" },
        skip,
        take,
      }),
      db.skill.count({ where: { deletedAt: null } }),
    ]);
    return { data, total };
  },

  async createSkill(data: CreateSkillInput, userId: string) {
    const skill = await db.skill.create({
      data: {
        name: data.name,
        description: data.description || "",
        categoryId: data.categoryId,
      },
    });

    await writeAuditLog({
      action: "CREATE",
      entity: "Skill",
      entityId: skill.id,
      userId,
      new: { name: skill.name, categoryId: skill.categoryId },
    });

    return skill;
  },

  async getEmployeeSkills(employeeId: string) {
    return await db.employeeSkill.findMany({
      where: { userId: employeeId },
      include: { skill: { include: { category: true } } },
      orderBy: { updatedAt: "desc" },
    });
  },

  async assessSkill(userId: string, data: AssessSkillInput) {
    const assessment = await db.employeeSkill.upsert({
      where: {
        userId_skillId: { userId, skillId: data.skillId },
      },
      update: {
        level: data.level,
        evidence: data.evidence ?? null,
      },
      create: {
        userId,
        skillId: data.skillId,
        level: data.level,
        evidence: data.evidence ?? null,
      },
    });

    await writeAuditLog({
      action: "UPDATE",
      entity: "EmployeeSkill",
      entityId: `${assessment.userId}-${assessment.skillId}`,
      userId,
      new: { level: data.level, skillId: data.skillId },
    });

    return assessment;
  },

  async removeSkill(userId: string, skillId: string) {
    const existing = await db.employeeSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });
    if (!existing) throw new NotFoundError("EmployeeSkill not found");

    await db.employeeSkill.delete({
      where: { userId_skillId: { userId, skillId } },
    });

    await writeAuditLog({
      action: "DELETE",
      entity: "EmployeeSkill",
      entityId: `${userId}-${skillId}`,
      userId,
      previous: { level: existing.level, evidence: existing.evidence },
    });
  },

  async updateSkill(userId: string, skillId: string, data: { level: number; evidence?: string | null }) {
    const existing = await db.employeeSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });
    if (!existing) throw new NotFoundError("EmployeeSkill not found");

    const updated = await db.employeeSkill.update({
      where: { userId_skillId: { userId, skillId } },
      data: {
        level: data.level,
        ...(data.evidence !== undefined ? { evidence: data.evidence } : {}),
      },
    });

    await writeAuditLog({
      action: "UPDATE",
      entity: "EmployeeSkill",
      entityId: `${userId}-${skillId}`,
      userId,
      previous: { level: existing.level, evidence: existing.evidence },
      new: { level: data.level, evidence: data.evidence ?? existing.evidence },
    });

    return updated;
  },
};
