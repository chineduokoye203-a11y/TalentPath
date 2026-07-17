import { createUdemyClient } from "./client";
import { validateUdemyCourse, validateUdemyLearningPath, validateUdemyListResponse } from "./validators";
import { mapUdemyCourseToCourse, mapUdemyCoursesToCourses, mapUdemyLearningPathToLearningPath } from "./mapper";
import type {
  LearningProvider,
  ProviderSearchParams,
  ProviderPagination,
  Course,
  LearningPath,
  Enrollment,
  CourseProgress,
  CourseCompletion,
} from "../../types/learning.types";

export class UdemyProvider implements LearningProvider {
  readonly name = "udemy";
  private client = createUdemyClient();

  async searchCourses(params: ProviderSearchParams) {
    const raw = await this.client.searchCourses({
      search: params.query,
      page: String(params.page ?? 1),
      page_size: String(params.pageSize ?? 20),
      category: params.category,
    });

    const validated = validateUdemyListResponse(validateUdemyCourse, raw);
    const data = mapUdemyCoursesToCourses(validated.results);

    const pagination: ProviderPagination = {
      page: validated.page,
      pageSize: validated.page_size,
      total: validated.count,
      totalPages: Math.ceil(validated.count / validated.page_size),
    };

    return { data, pagination };
  }

  async getCourse(courseId: string): Promise<Course> {
    const raw = await this.client.getCourse(Number(courseId));
    const validated = validateUdemyCourse(raw);
    return mapUdemyCourseToCourse(validated);
  }

  async getLearningPaths(): Promise<LearningPath[]> {
    const raw = await this.client.getLearningPaths();
    return raw.results.map(mapUdemyLearningPathToLearningPath);
  }

  async getLearningPathCourses(pathId: string): Promise<Course[]> {
    const raw = await this.client.getLearningPathCourses(Number(pathId));
    return mapUdemyCoursesToCourses(raw.results);
  }

  async getEnrollments(_userId: string): Promise<Enrollment[]> {
    return [];
  }

  async getProgress(_userId: string, _courseId: string): Promise<CourseProgress> {
    return { userId: _userId, courseId: _courseId, progressPercent: 0, lastAccessedAt: "" };
  }

  async getCompletions(_userId: string): Promise<CourseCompletion[]> {
    return [];
  }
}

export const udemyProvider = new UdemyProvider();
