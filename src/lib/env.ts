import { z } from "zod";

/**
 * Build-time schema: all fields optional so `next build` / static generation
 * doesn't crash when env vars haven't been injected yet.
 *
 * Runtime schema: DATABASE_URL and AUTH_SECRET are required. Validated lazily
 * on first access, so the build phase is never blocked.
 */

const buildTimeSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_URL: z.string().url().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  ENABLE_AI_FEATURES: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  ENABLE_EMAIL_NOTIFICATIONS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  ENABLE_AUDIT_LOGGING: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  UDEMY_ACCOUNT_NAME: z.string().optional(),
  UDEMY_CLIENT_ID: z.string().optional(),
  UDEMY_CLIENT_SECRET: z.string().optional(),
  UDEMY_API_BASE_URL: z.string().url().optional(),
});

const runtimeSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  ENABLE_AI_FEATURES: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  ENABLE_EMAIL_NOTIFICATIONS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  ENABLE_AUDIT_LOGGING: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  UDEMY_ACCOUNT_NAME: z.string().optional(),
  UDEMY_CLIENT_ID: z.string().optional(),
  UDEMY_CLIENT_SECRET: z.string().optional(),
  UDEMY_API_BASE_URL: z.string().url().optional(),
});

type Env = z.infer<typeof runtimeSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (!_env) {
    // During `next build` (static generation / page data collection),
    // DATABASE_URL and AUTH_SECRET may not be injected yet.
    // Use the relaxed schema so the build doesn't crash.
    const hasRequiredVars =
      typeof process.env.DATABASE_URL === "string" &&
      typeof process.env.AUTH_SECRET === "string";

    if (hasRequiredVars) {
      _env = runtimeSchema.parse(process.env);
    } else {
      _env = buildTimeSchema.parse(process.env) as Env;
    }
  }
  return _env;
}

export const env = new Proxy({} as Env, {
  get(_target, prop) {
    return (getEnv() as Record<string | symbol, unknown>)[prop];
  },
});
