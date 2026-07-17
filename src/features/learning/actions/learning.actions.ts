"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { UnauthorizedError } from "@/lib/errors";
import { learningService } from "../services/learning.service";
import type { Course } from "../types/learning.types";

export async function enrollInCourseAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const course: Course = {
    id: formData.get("courseId") as string,
    title: formData.get("courseTitle") as string,
    description: (formData.get("courseDescription") as string) ?? "",
    url: (formData.get("courseUrl") as string) ?? "",
    imageUrl: (formData.get("courseImageUrl") as string) ?? "",
    instructor: (formData.get("courseInstructor") as string) ?? "",
    duration: Number(formData.get("courseDuration") ?? 0),
    category: (formData.get("courseCategory") as string) ?? "",
    skills: [],
    level: (formData.get("courseLevel") as string) ?? "",
    provider: (formData.get("courseProvider") as string) ?? "Udemy Business",
  };

  await learningService.enrollInCourse(session.user.id, course);

  revalidatePath("/learning");
}

export async function cancelEnrollmentAction(enrollmentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  await learningService.cancelEnrollment(session.user.id, enrollmentId);

  revalidatePath("/learning");
}
