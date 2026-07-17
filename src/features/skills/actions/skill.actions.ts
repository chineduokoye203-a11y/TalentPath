"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { skillService } from "../services/skill.service";
import { assessSkillSchema } from "../validations/skill.schema";

export async function assessSkillAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const data = assessSkillSchema.parse({
    skillId: formData.get("skillId"),
    level: Number(formData.get("level")),
    evidence: formData.get("evidence"),
  });

  const assessment = await skillService.assessSkill(session.user.id, data);

  revalidatePath("/skills");
  return { success: true, data: assessment };
}
