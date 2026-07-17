import { auth } from "./auth";
import { ForbiddenError, UnauthorizedError } from "./errors";

export async function requireRole(allowedRoles: string[]) {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError("You must be logged in to access this resource");
  }

  const userRole = (session.user as any).role as string;

  if (!allowedRoles.includes(userRole)) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }

  return session;
}

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError("You must be logged in to access this resource");
  }

  return session;
}
