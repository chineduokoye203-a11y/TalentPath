import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit";
import type { User } from "@prisma/client";

interface CreateUserFromInviteInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  companyId: string | null;
  departmentId?: string | null;
  teamId?: string | null;
  jobTitle?: string | null;
}

interface UpdateProfileInput {
  jobTitle: string;
  departmentId: string;
  teamId?: string | null;
  yearsOfExperience: number;
  careerGoal: string;
  bio?: string | null;
  linkedInUrl?: string | null;
  targetRoleId?: string | null;
  managerLevel?: string | null;
  hrFunction?: string | null;
  businessUnit?: string | null;
  leadershipLevel?: string | null;
  administrationScope?: string | null;
}

export const userService = {
  async createUserFromInvitation(data: CreateUserFromInviteInput): Promise<User> {
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ValidationError("Email already in use");

    const passwordHash = await bcrypt.hash(data.password, 10);
    const name = `${data.firstName} ${data.lastName}`;

    const user = await db.user.create({
      data: {
        name,
        email: data.email,
        passwordHash,
        role: data.role,
        companyId: data.companyId,
        departmentId: data.departmentId || null,
        teamId: data.teamId || null,
      },
    });

    if (data.jobTitle) {
      await db.profile.create({
        data: {
          userId: user.id,
          jobTitle: data.jobTitle,
          yearsOfExperience: 0,
          careerGoal: "",
        },
      });
    }

    await writeAuditLog({
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      userId: user.id,
      new: { email: user.email, name, role: user.role },
    });

    return user;
  },

  async signUp(companyName: string, email: string, password: string): Promise<User> {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) throw new ValidationError("Email already in use");

    let company = await db.company.findUnique({ where: { name: companyName } });
    if (!company) {
      company = await db.company.create({ data: { name: companyName } });
    }

    const hrExists = await db.user.findFirst({
      where: { companyId: company.id, role: "HR", deletedAt: null },
    });
    if (hrExists) {
      throw new ValidationError("This company already has an HR administrator. Registration is by invitation only.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultName = email.split("@")[0];

    const user = await db.user.create({
      data: {
        name: defaultName,
        email,
        passwordHash,
        role: "HR",
        companyId: company.id,
      },
    });

    await writeAuditLog({
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      userId: user.id,
      new: { email: user.email, role: user.role, companyId: company.id },
    });

    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: {
        departmentId: data.departmentId,
        teamId: data.teamId || null,
      },
    });

    await db.profile.upsert({
      where: { userId },
      create: {
        userId,
        jobTitle: data.jobTitle,
        yearsOfExperience: data.yearsOfExperience,
        careerGoal: data.careerGoal,
        bio: data.bio || null,
        linkedInUrl: data.linkedInUrl || null,
        targetRoleId: data.targetRoleId || null,
        managerLevel: data.managerLevel || null,
        hrFunction: data.hrFunction || null,
        businessUnit: data.businessUnit || null,
        leadershipLevel: data.leadershipLevel || null,
        administrationScope: data.administrationScope || null,
      },
      update: {
        jobTitle: data.jobTitle,
        yearsOfExperience: data.yearsOfExperience,
        careerGoal: data.careerGoal,
        bio: data.bio || null,
        linkedInUrl: data.linkedInUrl || null,
        targetRoleId: data.targetRoleId || null,
        managerLevel: data.managerLevel || null,
        hrFunction: data.hrFunction || null,
        businessUnit: data.businessUnit || null,
        leadershipLevel: data.leadershipLevel || null,
        administrationScope: data.administrationScope || null,
      },
    });

    await writeAuditLog({
      action: "UPDATE",
      entity: "User",
      entityId: userId,
      userId,
      new: { jobTitle: data.jobTitle, departmentId: data.departmentId },
    });
  },

  async updateCareerGoals(userId: string, data: { targetRole: string; careerGoal: string }): Promise<void> {
    await db.profile.update({
      where: { userId },
      data: {
        targetRoleId: data.targetRole || null,
        careerGoal: data.careerGoal,
      },
    });

    await writeAuditLog({
      action: "UPDATE",
      entity: "Profile",
      entityId: userId,
      userId,
      new: { targetRoleId: data.targetRole, careerGoal: data.careerGoal },
    });
  },

  async addUserSkills(userId: string, skills: { skillId: string; level: number }[]): Promise<void> {
    for (const skill of skills) {
      let actualSkillId = skill.skillId;

      const existingSkill = await db.skill.findFirst({ where: { name: skill.skillId } });
      if (existingSkill) {
        actualSkillId = existingSkill.id;
      } else {
        let category = await db.skillCategory.findFirst({ where: { name: "General" } });
        if (!category) {
          category = await db.skillCategory.create({ data: { name: "General" } });
        }
        const newSkill = await db.skill.create({
          data: { name: skill.skillId, categoryId: category.id },
        });
        actualSkillId = newSkill.id;
      }

      await db.employeeSkill.upsert({
        where: { userId_skillId: { userId, skillId: actualSkillId } },
        create: {
          userId,
          skillId: actualSkillId,
          level: skill.level,
        },
        update: {
          level: skill.level,
        },
      });
    }

    await writeAuditLog({
      action: "CREATE",
      entity: "EmployeeSkill",
      entityId: `${userId}-${skills.map((s) => s.skillId).join(",")}`,
      userId,
      new: { skills },
    });
  },

  async getUserByEmail(email: string): Promise<User> {
    const user = await db.user.findUnique({
      where: { email, deletedAt: null },
    });
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async listUsers(skip = 0, take = 20) {
    const [data, total] = await Promise.all([
      db.user.findMany({
        where: { deletedAt: null },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          teamId: true,
          createdAt: true,
        },
      }),
      db.user.count({ where: { deletedAt: null } }),
    ]);

    return { data, total };
  },
};
