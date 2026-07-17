import { z } from "zod";
import type { UdemyCourse, UdemyListResponse, UdemyLearningPath } from "./types";

export const udemyCourseSchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string(),
  headline: z.string(),
  image_480x270: z.string(),
  visible_instructors: z.array(z.object({ display_name: z.string() })),
  content_info: z.string(),
  instructional_level: z.string(),
  primary_category: z.object({ title: z.string() }).nullable().optional(),
  estimated_content_length: z.number(),
});

export const udemyLearningPathSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  num_courses: z.number(),
});

export function validateUdemyCourse(raw: unknown): UdemyCourse {
  return udemyCourseSchema.parse(raw);
}

export function validateUdemyLearningPath(raw: unknown): UdemyLearningPath {
  return udemyLearningPathSchema.parse(raw);
}

export function validateUdemyListResponse<T>(
  itemValidator: (raw: unknown) => T,
  raw: unknown,
): UdemyListResponse<T> {
  const listSchema = z.object({
    results: z.array(z.any()),
    count: z.number(),
    page: z.number(),
    page_size: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
  });

  const parsed = listSchema.parse(raw);

  return {
    results: parsed.results.map((item) => itemValidator(item)),
    count: parsed.count,
    page: parsed.page,
    page_size: parsed.page_size,
    next: parsed.next,
    previous: parsed.previous,
  };
}
