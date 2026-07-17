export interface Course {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  instructor: string;
  duration: number;
  category: string;
  skills: string[];
  level: string;
  provider: string;
}

export interface ProviderSearchParams {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface ProviderPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  courseCount: number;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  enrolledAt: string;
  completed: boolean;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  progressPercent: number;
  lastAccessedAt: string;
}

export interface CourseCompletion {
  userId: string;
  courseId: string;
  completedAt: string;
  score?: number;
}

export interface LearningProvider {
  readonly name: string;

  searchCourses(params: ProviderSearchParams): Promise<{
    data: Course[];
    pagination: ProviderPagination;
  }>;

  getCourse(courseId: string): Promise<Course>;

  getLearningPaths(): Promise<LearningPath[]>;

  getLearningPathCourses(pathId: string): Promise<Course[]>;

  getEnrollments(userId: string): Promise<Enrollment[]>;

  getProgress(userId: string, courseId: string): Promise<CourseProgress>;

  getCompletions(userId: string): Promise<CourseCompletion[]>;
}
