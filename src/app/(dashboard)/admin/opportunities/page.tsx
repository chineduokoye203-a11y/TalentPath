"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Select } from "@/components/Select/Select";
import { Modal } from "@/components/Modal/Modal";
import { Card } from "@/components/Card/Card";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Badge } from "@/components/Badge/Badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  departmentId: string | null;
  department: Department | null;
  teamId: string | null;
  requiredSkills: string;
  status: string;
  createdAt: string;
}

export default function OpportunitiesAdminPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const router = useRouter();

  useEffect(() => {
    if (session && !["HR", "ADMINISTRATOR"].includes(role)) {
      router.push("/dashboard");
    }
  }, [session, role, router]);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deletingTarget, setDeletingTarget] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch("/api/admin/opportunities");
      const json = await res.json();
      if (json.success) setOpportunities(json.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOpportunities(); }, []);

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((j) => { if (j.success) setDepartments(j.data); })
      .catch(() => {});
  }, []);

  const departmentOptions = departments.map((d) => ({ label: d.name, value: d.id }));

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setDepartmentId("");
    setRequiredSkills("");
    setStatus("OPEN");
    setError(null);
    setShowModal(true);
  };

  const openEdit = (opp: Opportunity) => {
    setEditing(opp);
    setTitle(opp.title);
    setDescription(opp.description);
    setDepartmentId(opp.departmentId || "");
    setRequiredSkills(opp.requiredSkills || "");
    setStatus(opp.status);
    setError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) { setError("Title is required"); return; }
    if (!description.trim()) { setError("Description is required"); return; }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        departmentId: departmentId || undefined,
        requiredSkills: requiredSkills.trim() || undefined,
        status,
      };
      if (editing) {
        const res = await fetch(`/api/admin/opportunities/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) { setError(json.error?.message || "Failed to update"); return; }
      } else {
        const res = await fetch("/api/admin/opportunities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) { setError(json.error?.message || "Failed to create"); return; }
      }
      setShowModal(false);
      fetchOpportunities();
    } catch { setError("An error occurred"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/opportunities/${deletingTarget.id}`, { method: "DELETE" });
      setDeletingTarget(null);
      fetchOpportunities();
    } catch {} finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="Manage internal job opportunities and postings."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} style={{ marginRight: "6px" }} />Add Job Opportunity
          </Button>
        }
      />

      {loading ? (
        <Card><p>Loading...</p></Card>
      ) : opportunities.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p>No opportunities yet. Create your first opportunity to get started.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "var(--spacing-md)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-on-primary)",
              }}
            >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "var(--font-size-h3)" }}>{opp.title}</h3>
                    <Badge variant={opp.status === "OPEN" ? "success" : "neutral"}>{opp.status}</Badge>
                  </div>
                  <p style={{ margin: "0 0 8px 0", fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                    {opp.description}
                  </p>
                  {opp.department && (
                    <p style={{ margin: 0, fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                      <strong style={{ fontWeight: "var(--font-weight-semibold)" }}>Department:</strong> {opp.department.name}
                    </p>
                  )}
                  {opp.requiredSkills && (
                    <p style={{ margin: "8px 0 0 0", fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                      <strong style={{ fontWeight: "var(--font-weight-semibold)" }}>Skills:</strong> {opp.requiredSkills}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-xs)", flexShrink: 0 }}>
                  <button type="button" onClick={() => openEdit(opp)} title="Edit" style={{ cursor: "pointer", background: "none", border: "none", padding: "4px", color: "var(--color-on-surface-variant)", display: "flex" }}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={() => setDeletingTarget(opp)} title="Delete" style={{ cursor: "pointer", background: "none", border: "none", padding: "4px", color: "var(--color-error)", display: "flex" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Job Opportunity" : "Add Job Opportunity"}
        size="md"
      >
        {error && (
          <div style={{ color: "var(--color-error)", marginBottom: "var(--spacing-sm)", fontSize: "var(--font-size-body-sm)" }}>{error}</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <Input label="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "var(--font-size-body-sm)", fontWeight: 500 }}>Job Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const el = e.currentTarget;
                  const start = el.selectionStart;
                  const val = el.value;
                  const lineStart = val.lastIndexOf("\n", start - 1) + 1;
                  const currentLine = val.slice(lineStart, start);
                  const match = currentLine.match(/^(\d+)[.)]\s*/);
                  if (match) {
                    e.preventDefault();
                    const num = parseInt(match[1], 10) + 1;
                    const suffix = currentLine[match[1].length] === "." ? ". " : ") ";
                    const insert = `\n${num}${suffix}`;
                    const newVal = val.slice(0, start) + insert + val.slice(start);
                    setDescription(newVal);
                    requestAnimationFrame(() => {
                      el.selectionStart = el.selectionEnd = start + insert.length;
                    });
                  }
                }
              }}
              rows={4}
              className="job-description-textarea"
              style={{
                padding: "var(--spacing-sm)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-body)",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <style>{`.job-description-textarea:focus { outline: none; border-color: var(--color-primary) !important; border-width: 2px !important; }`}</style>
          </div>
          <Select
            label="Department (optional)"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={[{ label: "None", value: "" }, ...departmentOptions]}
            placeholder="Select department"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "var(--font-size-body-sm)", fontWeight: 500 }}>Required Skills (optional, comma-separated)</label>
            <input
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. JavaScript, Leadership, Python"
              className="fieldInput"
            />
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: "Open", value: "OPEN" },
              { label: "Closed", value: "CLOSED" },
            ]}
          />
          <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-start" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)} style={{ fontSize: "var(--font-size-body)" }}>Cancel</Button>
            <Button size="sm" isLoading={saving} onClick={handleSave} style={{ fontSize: "var(--font-size-body)" }}>{editing ? "Save" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deletingTarget}
        onClose={() => setDeletingTarget(null)}
        title="Delete Opportunity"
        size="xs"
        inline
      >
        <p style={{ margin: "0 0 var(--spacing-md) 0", fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
          Are you sure you want to delete <strong>{deletingTarget?.title}</strong>?<br />This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "center" }}>
          <Button variant="secondary" size="sm" onClick={() => setDeletingTarget(null)} style={{ padding: "8px 16px" }}>Cancel</Button>
          <Button variant="danger" size="sm" isLoading={deleting} onClick={handleDelete} style={{ padding: "8px 16px" }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
