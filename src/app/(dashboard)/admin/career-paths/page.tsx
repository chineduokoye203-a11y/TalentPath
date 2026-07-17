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
import { Plus, Pencil, Trash2, X } from "lucide-react";
import styles from "./career-paths.module.css";

interface Department {
  id: string;
  name: string;
}

interface CareerRole {
  id: string;
  title: string;
  level: number;
  experienceYears: number | null;
  leadershipRequired: boolean;
  requiredSkills?: { skillId: string; skillName: string; requiredLevel: number }[];
}

interface CareerPath {
  id: string;
  name: string;
  description: string | null;
  departmentId: string | null;
  department: Department | null;
  roles: CareerRole[];
}

export default function CareerPathsAdminPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const router = useRouter();

  useEffect(() => {
    if (session && !["HR", "ADMINISTRATOR"].includes(role)) {
      router.push("/dashboard");
    }
  }, [session, role, router]);

  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPathModal, setShowPathModal] = useState(false);
  const [editingPath, setEditingPath] = useState<CareerPath | null>(null);
  const [pathName, setPathName] = useState("");
  const [pathDescription, setPathDescription] = useState("");
  const [pathDepartmentId, setPathDepartmentId] = useState("");
  const [pathError, setPathError] = useState<string | null>(null);
  const [pathSaving, setPathSaving] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [rolePathId, setRolePathId] = useState("");
  const [editingRole, setEditingRole] = useState<CareerRole | null>(null);
  const [roleTitle, setRoleTitle] = useState("");
  const [roleLevel, setRoleLevel] = useState("1");
  const [roleExperience, setRoleExperience] = useState("0");
  const [roleLeadership, setRoleLeadership] = useState("false");
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleSkills, setRoleSkills] = useState<{ skillId: string; skillName: string; requiredLevel: number }[]>([]);
  const [skillNameInput, setSkillNameInput] = useState("");
  const [skillLevelInput, setSkillLevelInput] = useState("3");

  const [deletingTarget, setDeletingTarget] = useState<{ type: "path" | "role"; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPaths = async () => {
    try {
      const res = await fetch("/api/admin/career-paths");
      const json = await res.json();
      if (json.success) setPaths(json.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPaths(); }, []);
  useEffect(() => {
    fetch("/api/departments").then((r) => r.json()).then((j) => { if (j.success) setDepartments(j.data); }).catch(() => {});
  }, []);

  const departmentOptions = departments.map((d) => ({ label: d.name, value: d.id }));

  const openCreatePath = () => {
    setEditingPath(null);
    setPathName("");
    setPathDescription("");
    setPathDepartmentId("");
    setPathError(null);
    setShowPathModal(true);
  };

  const openEditPath = (p: CareerPath) => {
    setEditingPath(p);
    setPathName(p.name);
    setPathDescription(p.description || "");
    setPathDepartmentId(p.departmentId || "");
    setPathError(null);
    setShowPathModal(true);
  };

  const handleSavePath = async () => {
    setPathError(null);
    if (!pathName.trim()) { setPathError("Name is required"); return; }
    if (!pathDepartmentId) { setPathError("Department is required"); return; }
    setPathSaving(true);
    try {
      const body = { name: pathName.trim(), description: pathDescription.trim() || undefined, departmentId: pathDepartmentId || undefined };
      if (editingPath) {
        const res = await fetch(`/api/admin/career-paths/${editingPath.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) { setPathError(json.error?.message || "Failed to update"); return; }
      } else {
        const res = await fetch("/api/admin/career-paths", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) { setPathError(json.error?.message || "Failed to create"); return; }
      }
      setShowPathModal(false);
      fetchPaths();
    } catch { setPathError("An error occurred"); } finally { setPathSaving(false); }
  };

  const openCreateRole = (pathId: string) => {
    setEditingRole(null);
    setRolePathId(pathId);
    setRoleTitle("");
    setRoleLevel("1");
    setRoleExperience("0");
    setRoleLeadership("false");
    setRoleError(null);
    setRoleSkills([]);
    setSkillNameInput("");
    setSkillLevelInput("3");
    setShowRoleModal(true);
  };

  const openEditRole = (role: CareerRole, pathId: string) => {
    setEditingRole(role);
    setRolePathId(pathId);
    setRoleTitle(role.title);
    setRoleLevel(String(role.level));
    setRoleExperience(String(role.experienceYears ?? 0));
    setRoleLeadership(String(role.leadershipRequired));
    setRoleError(null);
    setRoleSkills(role.requiredSkills ?? []);
    setSkillNameInput("");
    setSkillLevelInput("3");
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    setRoleError(null);
    if (!roleTitle.trim()) { setRoleError("Title is required"); return; }
    setRoleSaving(true);
    try {
      const body = {
        title: roleTitle.trim(),
        level: Number(roleLevel),
        experienceYears: Number(roleExperience),
        leadershipRequired: roleLeadership === "true",
        requiredSkills: roleSkills,
      };
      if (editingRole) {
        const res = await fetch(`/api/admin/career-paths/${rolePathId}/roles/${editingRole.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) { setRoleError(json.error?.message || "Failed to update"); return; }
      } else {
        const res = await fetch(`/api/admin/career-paths/${rolePathId}/roles`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) { setRoleError(json.error?.message || "Failed to create"); return; }
      }
      setShowRoleModal(false);
      fetchPaths();
    } catch { setRoleError("An error occurred"); } finally { setRoleSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      if (deletingTarget.type === "path") {
        await fetch(`/api/admin/career-paths/${deletingTarget.id}`, { method: "DELETE" });
      } else {
        const path = paths.find((p) => p.roles.some((r) => r.id === deletingTarget.id));
        if (path) {
          await fetch(`/api/admin/career-paths/${path.id}/roles/${deletingTarget.id}`, { method: "DELETE" });
        }
      }
      setDeletingTarget(null);
      fetchPaths();
    } catch {} finally { setDeleting(false); }
  };

  const roleOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ];

  const skillLevelOptions = [
    { value: "1", label: "1 - Novice" },
    { value: "2", label: "2 - Advanced Beginner" },
    { value: "3", label: "3 - Competent" },
    { value: "4", label: "4 - Proficient" },
    { value: "5", label: "5 - Expert" },
  ];

  const addSkill = () => {
    const name = skillNameInput.trim();
    if (!name) return;
    const exists = roleSkills.some((s) => s.skillName.toLowerCase() === name.toLowerCase());
    if (exists) return;
    setRoleSkills([...roleSkills, { skillId: `temp_${Date.now()}`, skillName: name, requiredLevel: Number(skillLevelInput) }]);
    setSkillNameInput("");
  };

  const removeSkill = (index: number) => {
    setRoleSkills(roleSkills.filter((_, i) => i !== index));
  };

  return (
    <div>
      <PageHeader
        title="Career Paths"
        description="Manage career frameworks and role progressions."
        action={<Button onClick={openCreatePath}><Plus size={16} style={{ marginRight: "6px" }} />Add Career Path</Button>}
      />

      {loading ? (
        <Card><p>Loading...</p></Card>
      ) : paths.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p>No career paths yet. Create your first career path to get started.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
          {paths.map((path) => (
            <div key={path.id} style={{ padding: "var(--spacing-md)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", background: "var(--color-on-primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-sm)" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "var(--font-size-h3)" }}>{path.name}</h3>
                    {path.description && <p style={{ margin: "4px 0 0 0", fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>{path.description}</p>}
                  </div>
                  <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                    <Button variant="secondary" size="sm" onClick={() => openEditPath(path)}><Pencil size={14} style={{ marginRight: "4px" }} />Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => setDeletingTarget({ type: "path", id: path.id, name: path.name })}><Trash2 size={14} style={{ marginRight: "4px" }} />Delete</Button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "var(--spacing-md)" }}>
                  {path.roles.map((role) => (
                    <div key={role.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--spacing-sm) var(--spacing-md)", background: "var(--color-surface-container-low)", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
                        <Badge variant="success">Level {role.level}</Badge>
                        <span style={{ fontWeight: "var(--font-weight-medium)" }}>{role.title}</span>
                        {role.leadershipRequired && <Badge variant="primary">Leadership</Badge>}
                        {role.experienceYears != null && role.experienceYears > 0 && (
                          <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-on-surface-variant)" }}>{role.experienceYears}+ yrs</span>
                        )}
                      </div>
                      {role.requiredSkills && role.requiredSkills.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                          {role.requiredSkills.map((rs) => (
                            <span key={rs.skillId} style={{ fontSize: "var(--font-size-caption)", padding: "2px 6px", background: "var(--color-surface-container)", borderRadius: "var(--radius-sm)", color: "var(--color-on-surface-variant)" }}>
                              {rs.skillName} (Lv.{rs.requiredLevel})
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                        <button type="button" onClick={() => openEditRole(role, path.id)} title="Edit role" style={{ cursor: "pointer", background: "none", border: "none", padding: "4px", color: "var(--color-on-surface-variant)", display: "flex" }}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" onClick={() => setDeletingTarget({ type: "role", id: role.id, name: role.title })} title="Delete role" style={{ cursor: "pointer", background: "none", border: "none", padding: "4px", color: "var(--color-error)", display: "flex" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => openCreateRole(path.id)} style={{ marginTop: "var(--spacing-md)", cursor: "pointer", background: "none", border: "none", padding: 0, display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--color-primary)", fontSize: "var(--font-size-body)", fontWeight: 500 }}>
                  <Plus size={14} style={{ color: "var(--color-primary)" }} />Add Role
                </button>
              </div>
            ))}
          </div>
        )}

      <Modal isOpen={showPathModal} onClose={() => setShowPathModal(false)} title={editingPath ? "Edit Career Path" : "Add Career Path"} size="md">
        {pathError && <div style={{ color: "var(--color-error)", marginBottom: "var(--spacing-sm)", fontSize: "var(--font-size-body-sm)" }}>{pathError}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <Input label="Name" value={pathName} onChange={(e) => setPathName(e.target.value)} />
          <Input label="Description (optional)" value={pathDescription} onChange={(e) => setPathDescription(e.target.value)} />
          <Select label="Department" value={pathDepartmentId} onChange={(e) => setPathDepartmentId(e.target.value)} options={departmentOptions} placeholder="Select a department" />
          <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-start" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowPathModal(false)} style={{ padding: "8px 16px" }}>Cancel</Button>
            <Button size="sm" isLoading={pathSaving} onClick={handleSavePath} style={{ padding: "8px 16px" }}>{editingPath ? "Save" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={editingRole ? "Edit Role" : "Add Role"} size="md">
        {roleError && <div style={{ color: "var(--color-error)", marginBottom: "var(--spacing-sm)", fontSize: "var(--font-size-body-sm)" }}>{roleError}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <Input label="Title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
          <Select label="Level" value={roleLevel} onChange={(e) => setRoleLevel(e.target.value)} options={roleOptions} />
          <Input label="Experience Years (optional)" type="number" value={roleExperience} onChange={(e) => setRoleExperience(e.target.value)} />
          <Select label="Leadership Required" value={roleLeadership} onChange={(e) => setRoleLeadership(e.target.value)} options={[{ label: "No", value: "false" }, { label: "Yes", value: "true" }]} />

          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-body-sm)", fontWeight: 500, marginBottom: "4px", color: "var(--color-on-surface)" }}>
              Required Skills in this Level
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: roleSkills.length > 0 ? "0.75rem" : 0 }}>
              <input
                type="text"
                value={skillNameInput}
                onChange={(e) => setSkillNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                placeholder="e.g., JavaScript, Project Management"
                className={styles.skillInput}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  value={skillLevelInput}
                  onChange={(e) => setSkillLevelInput(e.target.value)}
                  className={styles.skillSelect}
                >
                  {skillLevelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                type="button"
                onClick={addSkill}
                disabled={!skillNameInput.trim()}
                style={{
                  cursor: skillNameInput.trim() ? "pointer" : "not-allowed",
                  padding: "8px 12px",
                  background: skillNameInput.trim() ? "var(--color-primary)" : "var(--color-outline-variant)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 500,
                  fontSize: "var(--font-size-body-sm)",
                  opacity: skillNameInput.trim() ? 1 : 0.5,
                }}
              >
                Add
              </button>
              </div>
            </div>
            {roleSkills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {roleSkills.map((skill, index) => (
                  <div
                    key={skill.skillId}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      background: "var(--color-primary-container)",
                      color: "var(--color-on-primary-container)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "var(--font-size-body-sm)",
                    }}
                  >
                    <span>{skill.skillName}</span>
                    <span style={{ fontSize: "var(--font-size-caption)", opacity: 0.7 }}>Lv.{skill.requiredLevel}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      style={{
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        display: "flex",
                        color: "inherit",
                        opacity: 0.7,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-start" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowRoleModal(false)} style={{ padding: "8px 16px" }}>Cancel</Button>
            <Button size="sm" isLoading={roleSaving} onClick={handleSaveRole} style={{ padding: "8px 16px" }}>{editingRole ? "Save" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deletingTarget} onClose={() => setDeletingTarget(null)} title={`Delete ${deletingTarget?.type === "path" ? "Career Path" : "Role"}`} size="md" inline>
        <p style={{ margin: "0 0 var(--spacing-md) 0", fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
          Are you sure you want to delete <strong>{deletingTarget?.name}</strong>?<br />This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "center" }}>
          <Button variant="secondary" size="sm" onClick={() => setDeletingTarget(null)} style={{ padding: "8px 16px" }}>Cancel</Button>
          <Button variant="danger" size="sm" isLoading={deleting} onClick={handleDelete} style={{ padding: "8px 16px" }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
