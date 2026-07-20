"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createInvitationSchema, type CreateInvitationInput } from "@/features/identity/validations/invitation.schema";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Select } from "@/components/Select/Select";
import { Modal } from "@/components/Modal/Modal";
import { Card } from "@/components/Card/Card";
import { Table } from "@/components/Table/Table";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/Badge/Badge";

interface Invitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface Department { id: string; name: string; }

const roleOptions = [{ value: "EMPLOYEE", label: "Employee" }, { value: "MANAGER", label: "Line Manager" }];
const statusBadgeVariant: Record<string, "primary" | "neutral" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  EXPIRED: "neutral",
  REVOKED: "danger",
};

export default function InvitationsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const router = useRouter();

  useEffect(() => {
    if (session && !["HR", "ADMINISTRATOR"].includes(role)) {
      router.push("/dashboard");
    }
  }, [session, role, router]);

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch("/api/invitations");
      const json = await res.json();
      if (json.success) setInvitations(json.data.filter((inv: Invitation) => inv.status !== "REVOKED"));
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);
  useEffect(() => {
    fetch("/api/departments").then((r) => r.json()).then((j) => { if (j.success) setDepartments(j.data); }).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
  });

  const onSubmit = async (data: CreateInvitationInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        reset();
        fetchInvitations();
      } else {
        setServerError(json.error?.message || "Failed to create invitation");
      }
    } catch (err: any) {
      setServerError(err?.message || "An error occurred");
    }
  };

  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!revokingId) return;
    setRevoking(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: revokingId }),
      });
      const json = await res.json();
      if (json.success) fetchInvitations();
    } catch {} finally {
      setRevoking(false);
      setRevokingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="User Invitations"
        description="Invite new users to the platform. Users will receive an email with an activation link."
        action={<Button onClick={() => setShowCreateModal(true)}><UserPlus size={16} style={{ marginRight: "var(--spacing-xs)" }} /> Invite New User</Button>}
      />

      <Card>
        {loading ? (
          <p>Loading invitations...</p>
        ) : invitations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p>No invitations yet. Create your first invitation to get started.</p>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                  {invitations.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.firstName} {inv.lastName}</td>
                  <td>{inv.email}</td>
                  <td>{inv.role === "MANAGER" ? "Line Manager" : inv.role.charAt(0) + inv.role.slice(1).toLowerCase()}</td>
                  <td><Badge variant={inv.status === "PENDING" ? "neutral" : statusBadgeVariant[inv.status] || "neutral"} style={inv.status === "PENDING" ? { background: "var(--color-surface-dim)" } : undefined}>{inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}</Badge></td>
                  <td>{new Date(inv.expiresAt).toLocaleDateString()}</td>
                  <td>{inv.status === "PENDING" && (
                    <Button size="sm" variant="danger" onClick={() => setRevokingId(inv.id)}>Revoke</Button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Invitation" size="lg">
        {serverError && <div style={{ color: "var(--color-error)", marginBottom: "var(--spacing-sm)" }}>{serverError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
            <Input label="First Name" error={errors.firstName?.message} {...register("firstName")} />
            <Input label="Last Name" error={errors.lastName?.message} {...register("lastName")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
            <Input label="Work Email" type="email" error={errors.email?.message} {...register("email")} />
            <Select label="Role" error={errors.role?.message} options={roleOptions} {...register("role")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
            <Select label="Department" options={departments.map((d) => ({ label: d.name, value: d.id }))} {...register("departmentId")} />
            <Input label="Job Title" {...register("jobTitle")} />
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-end", marginTop: "var(--spacing-md)" }}>
            <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Send Invitation</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!revokingId} onClose={() => setRevokingId(null)} title="Revoke Invitation" size="md" inline>
        <p style={{ margin: "0 0 var(--spacing-md) 0", fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
          Are you sure you want to revoke this invitation?<br />This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "center" }}>
          <Button variant="secondary" size="sm" onClick={() => setRevokingId(null)} style={{ padding: "8px 16px" }}>Cancel</Button>
          <Button variant="danger" size="sm" isLoading={revoking} onClick={handleRevoke} style={{ padding: "8px 16px" }}>Revoke</Button>
        </div>
      </Modal>
    </div>
  );
}
