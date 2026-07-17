import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { db } from "@/lib/db";
import { Table } from "@/components/Table/Table";
import { Badge } from "@/components/Badge/Badge";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth?mode=login");
  if ((session?.user as any)?.role !== "ADMINISTRATOR") redirect("/dashboard");

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { department: true },
  });

  return (
    <div>
      <PageHeader title="User Administration" description="Manage all users and platform access." />

      <Card title="All Users">
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <Badge variant="neutral">{u.role}</Badge>
                </td>
                <td>{u.department?.name || "-"}</td>
                <td>
                  <Badge variant={u.deletedAt ? "danger" : "success"}>
                    {u.deletedAt ? "Inactive" : "Active"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

// Quick inline Card wrapper for table
function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: "8px",
        border: "1px solid var(--color-outline-variant)",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid var(--color-outline-variant)",
          fontWeight: "bold",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "0" }}>{children}</div>
    </div>
  );
}
