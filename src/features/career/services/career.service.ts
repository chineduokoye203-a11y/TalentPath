import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit";
import type {
  PromotionAssessmentInput,
  CreateCareerPathInput,
  UpdateCareerPathInput,
  CreateCareerRoleInput,
  UpdateCareerRoleInput,
} from "../validations/career.schema";

async function resolveSkillId(skillName: string): Promise<string> {
  const existing = await db.skill.findFirst({ where: { name: skillName, deletedAt: null } });
  if (existing) return existing.id;

  let defaultCategory = await db.skillCategory.findFirst();
  if (!defaultCategory) {
    defaultCategory = await db.skillCategory.create({ data: { name: "General" } });
  }

  const created = await db.skill.create({
    data: { name: skillName, description: "", categoryId: defaultCategory.id },
  });
  return created.id;
}

export const careerService = {
  async getCareerPaths() {
    return await db.careerPath.findMany({
      where: { deletedAt: null },
      include: {
        department: true,
        roles: {
          where: { deletedAt: null },
          orderBy: { level: "asc" },
          include: { requiredSkills: { include: { skill: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  async getCareerPath(id: string) {
    const path = await db.careerPath.findUnique({
      where: { id },
      include: {
        department: true,
        roles: {
          where: { deletedAt: null },
          orderBy: { level: "asc" },
          include: { requiredSkills: { include: { skill: true } } },
        },
      },
    });
    if (!path || path.deletedAt) throw new NotFoundError("Career path not found");
    return path;
  },

  async createCareerPath(data: CreateCareerPathInput, userId: string) {
    const path = await db.careerPath.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        departmentId: data.departmentId ?? null,
      },
    });

    await writeAuditLog({
      action: "CREATE",
      entity: "CareerPath",
      entityId: path.id,
      userId,
      new: { name: data.name, description: data.description, departmentId: data.departmentId },
    });

    return path;
  },

  async updateCareerPath(id: string, data: UpdateCareerPathInput, userId: string) {
    const existing = await db.careerPath.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError("Career path not found");

    const updated = await db.careerPath.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
      },
    });

    await writeAuditLog({
      action: "UPDATE",
      entity: "CareerPath",
      entityId: id,
      userId,
      previous: { name: existing.name, description: existing.description, departmentId: existing.departmentId },
      new: { name: updated.name, description: updated.description, departmentId: updated.departmentId },
    });

    return updated;
  },

  async deleteCareerPath(id: string, userId: string) {
    const existing = await db.careerPath.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError("Career path not found");

    await db.careerPath.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await writeAuditLog({
      action: "DELETE",
      entity: "CareerPath",
      entityId: id,
      userId,
      previous: { name: existing.name },
    });
  },

  async getRole(roleId: string) {
    const role = await db.careerRole.findUnique({
      where: { id: roleId },
      include: { careerPath: true },
    });
    if (!role) throw new NotFoundError("Role not found");
    return role;
  },

  async createCareerRole(careerPathId: string, data: CreateCareerRoleInput, userId: string) {
    const path = await db.careerPath.findUnique({ where: { id: careerPathId } });
    if (!path || path.deletedAt) throw new NotFoundError("Career path not found");

    const role = await db.careerRole.create({
      data: {
        careerPathId,
        title: data.title,
        level: data.level,
        experienceYears: data.experienceYears ?? null,
        leadershipRequired: data.leadershipRequired ?? false,
      },
    });

    if (data.requiredSkills && data.requiredSkills.length > 0) {
      for (const skill of data.requiredSkills) {
        const resolvedId = await resolveSkillId(skill.skillName);
        await db.careerRoleSkill.create({
          data: {
            careerRoleId: role.id,
            skillId: resolvedId,
            requiredLevel: skill.requiredLevel,
          },
        });
      }
    }

    await writeAuditLog({
      action: "CREATE",
      entity: "CareerRole",
      entityId: role.id,
      userId,
      new: { title: data.title, level: data.level, careerPathId },
    });

    return role;
  },

  async updateCareerRole(id: string, data: UpdateCareerRoleInput, userId: string) {
    const existing = await db.careerRole.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError("Career role not found");

    const updated = await db.careerRole.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.level !== undefined ? { level: data.level } : {}),
        ...(data.experienceYears !== undefined ? { experienceYears: data.experienceYears } : {}),
        ...(data.leadershipRequired !== undefined ? { leadershipRequired: data.leadershipRequired } : {}),
      },
    });

    if (data.requiredSkills) {
      await db.careerRoleSkill.deleteMany({ where: { careerRoleId: id } });
      for (const skill of data.requiredSkills) {
        const resolvedId = await resolveSkillId(skill.skillName);
        await db.careerRoleSkill.create({
          data: {
            careerRoleId: id,
            skillId: resolvedId,
            requiredLevel: skill.requiredLevel,
          },
        });
      }
    }

    await writeAuditLog({
      action: "UPDATE",
      entity: "CareerRole",
      entityId: id,
      userId,
      previous: { title: existing.title, level: existing.level },
      new: { title: updated.title, level: updated.level },
    });

    return updated;
  },

  async deleteCareerRole(id: string, userId: string) {
    const existing = await db.careerRole.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError("Career role not found");

    await db.careerRole.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await writeAuditLog({
      action: "DELETE",
      entity: "CareerRole",
      entityId: id,
      userId,
      previous: { title: existing.title, level: existing.level },
    });
  },

  async createPromotionAssessment(data: PromotionAssessmentInput, assessedById: string) {
    const assessment = await db.promotionAssessment.create({
      data: {
        userId: data.employeeId,
        targetRoleId: data.roleId,
        assessedById,
        status: data.status.toUpperCase().replace(/-/g, "_"),
        notes: data.notes ?? null,
        skillScore: 0,
        learningScore: 0,
        managerScore: 0,
        leadershipScore: 0,
        overallScore: 0,
      },
    });

    await writeAuditLog({
      action: "CREATE",
      entity: "PromotionAssessment",
      entityId: assessment.id,
      userId: assessedById,
      new: { status: data.status, roleId: data.roleId, employeeId: data.employeeId },
    });

    return assessment;
  },
};
