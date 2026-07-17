import { z } from "zod";

export const promotionAssessmentSchema = z.object({
  employeeId: z.string().min(1),
  roleId: z.string().min(1),
  status: z.enum(["ready", "near_ready", "development_needed"]),
  notes: z.string().optional(),
});

export const createCareerPathSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
});

export const updateCareerPathSchema = createCareerPathSchema.partial();

export const createCareerRoleSchema = z.object({
  title: z.string().min(2, "Title is required"),
  level: z.number().int().min(1),
  experienceYears: z.number().int().min(0).optional(),
  leadershipRequired: z.boolean().optional(),
  requiredSkills: z.array(z.object({
    skillId: z.string().min(1),
    skillName: z.string().min(1),
    requiredLevel: z.number().int().min(1).max(5),
  })).optional(),
});

export const updateCareerRoleSchema = createCareerRoleSchema.partial();

export type PromotionAssessmentInput = z.infer<typeof promotionAssessmentSchema>;
export type CreateCareerPathInput = z.infer<typeof createCareerPathSchema>;
export type UpdateCareerPathInput = z.infer<typeof updateCareerPathSchema>;
export type CreateCareerRoleInput = z.infer<typeof createCareerRoleSchema>;
export type UpdateCareerRoleInput = z.infer<typeof updateCareerRoleSchema>;
