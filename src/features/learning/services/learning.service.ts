import { db } from "@/lib/db";
import { udemyProvider } from "../providers/udemy/udemy.provider";
import type { Course, ProviderSearchParams, ProviderPagination } from "../types/learning.types";

const providers: Record<string, typeof udemyProvider> = {
  udemy: udemyProvider,
};

export const learningService = {
  async searchCourses(params: ProviderSearchParams & { provider?: string }) {
    const provider = params.provider ? providers[params.provider] : Object.values(providers)[0];
    if (!provider) throw new Error("No learning provider available");
    return provider.searchCourses(params);
  },

  async getCourse(courseId: string, providerName = "udemy") {
    const provider = providers[providerName];
    if (!provider) throw new Error(`Provider ${providerName} not found`);
    return provider.getCourse(courseId);
  },

  async getLearningPaths(providerName = "udemy") {
    const provider = providers[providerName];
    if (!provider) throw new Error(`Provider ${providerName} not found`);
    return provider.getLearningPaths();
  },

  async getEmployeeEnrollments(userId: string) {
    return await db.learningEnrollment.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async searchExternalCourses(query: string) {
    const result = await udemyProvider.searchCourses({ query });
    return result.data;
  },

  async getRecommendedCourses(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        departmentId: true,
        department: { select: { name: true } },
        employeeSkills: { select: { skill: { select: { name: true } } } },
        profile: { select: { targetRoleId: true } },
      },
    });

    if (!user) return [];

    const userSkillNames = new Set(user.employeeSkills.map((es) => es.skill.name));
    const seen = new Set<string>();
    const searchQueries: string[] = [];

    if (userSkillNames.size > 0 && user.profile?.targetRoleId) {
      const targetRole = await db.careerRole.findUnique({
        where: { id: user.profile.targetRoleId },
        select: {
          level: true,
          careerPathId: true,
          requiredSkills: {
            include: { skill: { select: { name: true } } },
          },
        },
      });

      if (targetRole) {
        const nextRole = await db.careerRole.findFirst({
          where: { careerPathId: targetRole.careerPathId, level: targetRole.level + 1, deletedAt: null },
          select: {
            requiredSkills: {
              include: { skill: { select: { name: true } } },
            },
          },
        });

        if (nextRole) {
          for (const rs of nextRole.requiredSkills) {
            if (!userSkillNames.has(rs.skill.name)) {
              searchQueries.push(rs.skill.name);
            }
          }
        }
      }
    }

    if (searchQueries.length === 0) {
      if (user.department?.name) {
        searchQueries.push(user.department.name);
      }
      searchQueries.push("Leadership");
    }

    const results = await Promise.all(
      searchQueries.map((q) => this.searchCourses({ query: q, pageSize: 3 })),
    );

    const courses: Course[] = [];
    for (const result of results) {
      for (const course of result.data) {
        if (!seen.has(course.id)) {
          seen.add(course.id);
          courses.push(course);
        }
      }
    }
    return courses;
  },

  async getPopularCourses(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!user?.companyId) return [];

    const popular = await db.learningEnrollment.groupBy({
      by: ["learningResourceId"],
      where: {
        learningResourceId: { not: null },
        user: { companyId: user.companyId, id: { not: userId } },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    });

    const resourceIds = popular
      .map((p) => p.learningResourceId)
      .filter(Boolean) as string[];

    if (resourceIds.length === 0) return [];

    const resources = await db.learningResource.findMany({
      where: { id: { in: resourceIds }, active: true },
    });

    return resources.map((r) => ({
      id: r.providerId,
      title: r.title,
      description: r.description ?? "",
      url: r.url,
      imageUrl: r.imageUrl ?? "",
      instructor: r.instructor ?? "",
      duration: r.duration ?? 0,
      category: r.category ?? "",
      skills: [],
      level: r.level ?? "",
      provider: r.provider,
    }));
  },

  async enrollInCourse(userId: string, course: Course) {
    const resource = await db.learningResource.upsert({
      where: { providerId: course.id },
      create: {
        providerId: course.id,
        provider: course.provider,
        title: course.title,
        description: course.description,
        url: course.url,
        imageUrl: course.imageUrl || null,
        instructor: course.instructor || null,
        duration: course.duration || null,
        category: course.category || null,
        level: course.level || null,
      },
      update: {},
    });

    const existing = await db.learningEnrollment.findFirst({
      where: { userId, learningResourceId: resource.id },
    });

    if (existing) return existing;

    return await db.learningEnrollment.create({
      data: {
        userId,
        learningResourceId: resource.id,
        status: "IN_PROGRESS",
      },
    });
  },

  async cancelEnrollment(userId: string, enrollmentId: string) {
    const enrollment = await db.learningEnrollment.findFirst({
      where: { id: enrollmentId, userId },
    });

    if (!enrollment) throw new Error("Enrollment not found");

    await db.learningEnrollment.delete({ where: { id: enrollmentId } });
  },
};
