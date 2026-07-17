import { AppError } from "./errors";

const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Basic in-memory rate limiter for MVP.
 * Limits `max` requests per `windowMs` for a given `identifier`.
 */
export function checkRateLimitMemory(identifier: string, max = 10, windowMs = 60000): void {
  const now = Date.now();
  const record = attempts.get(identifier);

  if (!record || now > record.resetAt) {
    attempts.set(identifier, { count: 1, resetAt: now + windowMs });
    return;
  }

  record.count++;
  if (record.count > max) {
    throw new AppError("Too many requests. Try again later.", 429, "RATE_LIMITED");
  }
}
