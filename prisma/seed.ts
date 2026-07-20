import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data so seed is idempotent
  await db.notification.deleteMany();
  await db.auditLog.deleteMany();
  await db.careerRoleSkill.deleteMany();
  await db.careerRole.deleteMany();
  await db.careerPath.deleteMany();
  await db.skillGap.deleteMany();
  await db.employeeSkill.deleteMany();
  await db.skill.deleteMany();
  await db.skillCategory.deleteMany();
  await db.permission.deleteMany();
  await db.user.deleteMany();
  await db.role.deleteMany();
  await db.team.deleteMany();
  await db.company.deleteMany();
  await db.department.deleteMany();

  const seedCompany = await db.company.create({ data: { name: "TalentPath Inc" } });

  const engineering = await db.department.create({
    data: { companyId: seedCompany.id, name: "Engineering", description: "Product engineering team" },
  });

  const design = await db.department.create({
    data: { companyId: seedCompany.id, name: "Design", description: "Product design team" },
  });

  const hr = await db.department.create({
    data: { companyId: seedCompany.id, name: "Human Resources", description: "HR department" },
  });

  await db.team.create({
    data: { name: "Frontend", departmentId: engineering.id },
  });

  await db.team.create({
    data: { name: "Backend", departmentId: engineering.id },
  });

  const adminRole = await db.role.create({
    data: { name: "Administrator", description: "Platform administrator" },
  });

  await db.role.create({
    data: { name: "HR", description: "Human resources" },
  });

  const managerRole = await db.role.create({
    data: { name: "Manager", description: "Line manager" },
  });

  await db.role.create({
    data: { name: "Employee", description: "Individual contributor" },
  });

  const adminUser = await db.user.create({
    data: {
      email: "admin@talentpath.com",
      name: "Admin User",
      passwordHash: "$2b$12$placeholder_hash_change_me",
      role: "ADMINISTRATOR",
      companyId: seedCompany.id,
      departmentId: engineering.id,
    },
  });

  await db.permission.create({
    data: {
      roleId: adminRole.id,
      resource: "*",
      action: "MANAGE",
    },
  });

  const backendSkillCat = await db.skillCategory.create({
    data: { name: "Backend Development", description: "Server-side development skills" },
  });

  const frontendSkillCat = await db.skillCategory.create({
    data: { name: "Frontend Development", description: "Client-side development skills" },
  });

  const leadershipCat = await db.skillCategory.create({
    data: { name: "Leadership", description: "Leadership and management skills" },
  });

  const nodeSkill = await db.skill.create({
    data: {
      name: "Node.js",
      description: "Server-side JavaScript runtime",
      categoryId: backendSkillCat.id,
      createdBy: adminUser.id,
    },
  });

  const reactSkill = await db.skill.create({
    data: {
      name: "React",
      description: "Frontend library for building UIs",
      categoryId: frontendSkillCat.id,
      createdBy: adminUser.id,
    },
  });

  const tsSkill = await db.skill.create({
    data: {
      name: "TypeScript",
      description: "Typed superset of JavaScript",
      categoryId: backendSkillCat.id,
      createdBy: adminUser.id,
    },
  });

  const teamLeadership = await db.skill.create({
    data: {
      name: "Team Leadership",
      description: "Leading and mentoring engineering teams",
      categoryId: leadershipCat.id,
      createdBy: adminUser.id,
    },
  });

  const careerPath = await db.careerPath.create({
    data: {
      name: "Engineering Career Path",
      description: "Career progression for engineering roles",
      departmentId: engineering.id,
    },
  });

  const juniorRole = await db.careerRole.create({
    data: {
      careerPathId: careerPath.id,
      title: "Junior Engineer",
      level: 1,
      experienceYears: 0,
    },
  });

  const seniorRole = await db.careerRole.create({
    data: {
      careerPathId: careerPath.id,
      title: "Senior Engineer",
      level: 2,
      experienceYears: 3,
    },
  });

  const leadRole = await db.careerRole.create({
    data: {
      careerPathId: careerPath.id,
      title: "Lead Engineer",
      level: 3,
      experienceYears: 5,
      leadershipRequired: true,
    },
  });

  await db.careerRoleSkill.create({
    data: { careerRoleId: juniorRole.id, skillId: tsSkill.id, requiredLevel: 2 },
  });

  await db.careerRoleSkill.create({
    data: { careerRoleId: seniorRole.id, skillId: tsSkill.id, requiredLevel: 4 },
  });

  await db.careerRoleSkill.create({
    data: { careerRoleId: seniorRole.id, skillId: nodeSkill.id, requiredLevel: 3 },
  });

  await db.careerRoleSkill.create({
    data: { careerRoleId: leadRole.id, skillId: nodeSkill.id, requiredLevel: 4 },
  });

  await db.careerRoleSkill.create({
    data: { careerRoleId: leadRole.id, skillId: teamLeadership.id, requiredLevel: 3 },
  });

  await db.notification.create({
    data: {
      userId: adminUser.id,
      title: "Welcome to TalentPath",
      message: "Your account has been created. Start by adding your skills.",
      type: "INFO",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
