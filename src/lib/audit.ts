import { db } from "./db";
import { logger } from "./logger";
import { env } from "./env";

interface AuditInput {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  previous?: unknown;
  new?: unknown;
}

export async function writeAuditLog(input: AuditInput): Promise<void> {
  if (!env.ENABLE_AUDIT_LOGGING) return;

  try {
    await db.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        previous: input.previous ? JSON.stringify(input.previous) : undefined,
        new: input.new ? JSON.stringify(input.new) : undefined,
      },
    });
  } catch (error) {
    logger("error", "Failed to write audit log", { error, input });
  }
}
