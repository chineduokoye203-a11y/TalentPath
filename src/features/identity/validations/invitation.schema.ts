import { z } from "zod";

export const createInvitationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  role: z.enum(["EMPLOYEE", "MANAGER", "HR", "LEADERSHIP", "ADMINISTRATOR"]),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
  jobTitle: z.string().optional(),
  managerId: z.string().optional(),
});

export const activateAccountSchema = z
  .object({
    token: z.string().min(1, "Invitation token is required"),
    firstName: z.string().min(1, "This field cannot be empty"),
    lastName: z.string().min(1, "This field cannot be empty"),
    email: z.string().email("Invalid email").optional(),
    password: z.string().min(1, "This field cannot be empty").min(8, "Must be at least 8 characters").regex(/[A-Z]/, "Must contain one uppercase letter").regex(/[0-9]/, "Must contain a number").regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "This field cannot be empty"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingProfileSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  departmentId: z.string().min(1, "Department is required"),
  teamId: z.string().optional(),
  yearsOfExperience: z.number().min(0, "Years of experience must be 0 or more"),
  careerGoal: z.string().min(1, "Career goal is required"),
  bio: z.string().optional(),
  linkedInUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  targetRoleId: z.string().optional(),
  managerLevel: z.string().optional(),
  hrFunction: z.string().optional(),
  businessUnit: z.string().optional(),
  leadershipLevel: z.string().optional(),
  administrationScope: z.string().optional(),
});

export const onboardingSkillsSchema = z.object({
  skills: z
    .array(
      z.object({
        skillId: z.string().min(1, "Skill is required"),
        level: z.number().int().min(1).max(5),
      }),
    )
    .min(1, "At least one skill is required"),
});

export const onboardingCareerSchema = z.object({
  targetRole: z.string().min(1, "Target role is required"),
  careerGoal: z.string().min(1, "Career goal is required"),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type ActivateAccountInput = z.infer<typeof activateAccountSchema>;
export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
export type OnboardingSkillsInput = z.infer<typeof onboardingSkillsSchema>;
export type OnboardingCareerInput = z.infer<typeof onboardingCareerSchema>;
