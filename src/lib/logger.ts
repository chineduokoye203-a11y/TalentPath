import { env } from "./env";

const levels = { debug: 0, info: 1, warn: 2, error: 3 } as const;

export function logger(
  level: keyof typeof levels,
  message: string,
  meta?: Record<string, unknown>,
) {
  if (levels[level] < levels[env.LOG_LEVEL as keyof typeof levels]) return;

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    }),
  );
}
