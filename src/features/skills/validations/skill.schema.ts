import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
});

export const assessSkillSchema = z.object({
  skillId: z.string().min(1),
  level: z.number().min(1).max(5),
  evidence: z.string().optional(),
});

export const addSkillSchema = z.object({
  skillName: z.string().min(2, "Skill name is required"),
  description: z.string().optional(),
  level: z.number().min(1).max(5),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type AssessSkillInput = z.infer<typeof assessSkillSchema>;
export type AddSkillInput = z.infer<typeof addSkillSchema>;
