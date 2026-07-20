import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "node:path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL ?? "file:./dev.db";
  if (raw.startsWith("file:")) {
    const filePath = raw.slice("file:".length);
    return `file:${path.resolve(filePath).replace(/\\/g, "/")}`;
  }
  return raw;
}

function createPrisma() {
  const adapter = new PrismaLibSql({
    url: resolveDbUrl(),
  });
  return new PrismaClient({ adapter });
}

export function getDb() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrisma();
  }
  return globalForPrisma.prisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
