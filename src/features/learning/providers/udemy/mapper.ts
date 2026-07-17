import type { Course, LearningPath } from "../../types/learning.types";
import type { UdemyCourse, UdemyLearningPath } from "./types";

export function mapUdemyCourseToCourse(udemy: UdemyCourse): Course {
  return {
    id: String(udemy.id),
    title: udemy.title,
    description: udemy.headline,
    url: udemy.url,
    imageUrl: udemy.image_480x270,
    instructor: udemy.visible_instructors[0]?.display_name ?? "Unknown",
    duration: udemy.estimated_content_length,
    category: udemy.primary_category?.title ?? "Uncategorized",
    skills: [],
    level: udemy.instructional_level,
    provider: "Udemy Business",
  };
}

export function mapUdemyLearningPathToLearningPath(udemy: UdemyLearningPath): LearningPath {
  return {
    id: String(udemy.id),
    title: udemy.title,
    description: udemy.description,
    courseCount: udemy.num_courses,
  };
}

export function mapUdemyCoursesToCourses(udemyCourses: UdemyCourse[]): Course[] {
  return udemyCourses.map(mapUdemyCourseToCourse);
}
