import { z } from "zod";

export const createOpportunitySchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
  requiredSkills: z.string().optional(),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
});

export const updateOpportunitySchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  departmentId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  requiredSkills: z.string().optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
