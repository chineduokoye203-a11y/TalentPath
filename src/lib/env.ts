import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().default(""),
  AUTH_SECRET: z.string().default(""),
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

let _env: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}

export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_target, prop) {
    return (getEnv() as any)[prop];
  },
});
