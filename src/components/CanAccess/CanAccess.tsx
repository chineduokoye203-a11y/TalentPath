"use client";
import React from "react";
import { useSession } from "next-auth/react";

export function CanAccess({
  allowedRoles,
  children,
  fallback = null,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
