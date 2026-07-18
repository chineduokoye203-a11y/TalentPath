"use client";

import React, { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { Select } from "@/components/Select/Select";
import { Input } from "@/components/Input/Input";
import { Textarea } from "@/components/Textarea/Textarea";
import { Badge } from "@/components/Badge/Badge";
import { Modal } from "@/components/Modal/Modal";
import { Upload, FileText, Trash2, Pencil, Plus } from "lucide-react";

interface SkillCategory {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  name: string;
  description?: string | null;
  category: SkillCategory;
}

interface EmployeeSkill {
  userId: string;
  skillId: string;
  level: number;
  evidence: string | null;
  skill: Skill;
}

const addSkillSchema = z.object({
  skillName: z.string().min(2, "Skill name is required"),
  description: z.string().optional(),
  level: z.string().min(1, "Select your proficiency level"),
});

type AddSkillInput = z.infer<typeof addSkillSchema>;

const levelOptions = [
  { value: "1", label: "1 - Novice" },
  { value: "2", label: "2 - Advanced Beginner" },
  { value: "3", label: "3 - Competent" },
  { value: "4", label: "4 - Proficient" },
  { value: "5", label: "5 - Expert" },
];

export default function SkillsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--color-on-surface-variant)" }}>Loading...</div>}>
      <SkillsPageContent />
    </Suspense>
  );
}

function SkillsPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showAdd = searchParams.has("add");

  useEffect(() => {
    if (!session) router.push("/auth?mode=login");
  }, [session, router]);

  const [mySkills, setMySkills] = useState<EmployeeSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingSkill, setEditingSkill] = useState<EmployeeSkill | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<EmployeeSkill | null>(null);
  const [editLevel, setEditLevel] = useState("1");
  const [editDescription, setEditDescription] = useState("");
  const [editEvidenceFile, setEditEvidenceFile] = useState<File | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const clearEditFile = () => {
    setEditEvidenceFile(null);
    setEditFileName("");
    setEditPreviewUrl(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const openEdit = (es: EmployeeSkill) => {
    setEditingSkill(es);
    setEditLevel(String(es.level));
    setEditDescription(es.skill.description || "");
    clearEditFile();
  };

  const handleDelete = async (es: EmployeeSkill) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/skills/${es.skillId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDeletingSkill(null);
        setRefreshKey((k) => k + 1);
      }
    } catch {} finally {
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSkill) return;
    setSaving(true);
    try {
      let evidence = editingSkill.evidence;

      if (editEvidenceFile) {
        const uploadForm = new FormData();
        uploadForm.append("skillName", editingSkill.skill.name);
        uploadForm.append("level", editLevel);
        uploadForm.append("evidence", editEvidenceFile);
        const uploadRes = await fetch("/api/skills/assess", {
          method: "POST",
          body: uploadForm,
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          setEditingSkill(null);
          setRefreshKey((k) => k + 1);
          return;
        }
      }

      const res = await fetch(`/api/skills/${editingSkill.skillId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: Number(editLevel),
          evidence,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingSkill(null);
        setRefreshKey((k) => k + 1);
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch("/api/skills");
      const json = await res.json();
      if (json.success) {
        setAllSkills(json.data.skills);
        setCategories(json.data.categories);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const fetchMySkills = useCallback(async () => {
    try {
      const res = await fetch(`/api/skills?userId=${(session?.user as any)?.id}`);
      const json = await res.json();
      if (json.success) setMySkills(json.data);
    } catch {}
  }, [session]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);
  useEffect(() => { if (session) fetchMySkills(); }, [session, fetchMySkills, refreshKey]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddSkillInput>({
    resolver: zodResolver(addSkillSchema),
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearFile = () => {
    setEvidenceFile(null);
    setFileName("");
    setFileError(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: AddSkillInput) => {
    setServerError(null);
    try {
      const formData = new FormData();
      formData.append("skillName", data.skillName);
      if (data.description) formData.append("description", data.description);
      formData.append("level", data.level);
      if (evidenceFile) formData.append("evidence", evidenceFile);

      const res = await fetch("/api/skills/assess", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setRefreshKey((k) => k + 1);
        router.push("/skills");
        reset();
        setEvidenceFile(null);
        setFileName("");
        setFileError(null);
      } else {
        setServerError(json.error?.message || "Failed to assess skill");
      }
    } catch {
      setServerError("An error occurred");
    }
  };

  if (!session) return null;

  if (showAdd) {
    return (
      <div>
        <PageHeader
          title="Add Skill"
          description="Add a new skill to your profile and rate your proficiency."
        />

        <Card>
          {serverError && <div style={{ color: "var(--color-error)", marginBottom: "var(--spacing-sm)" }}>{serverError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <Input label="Skill" placeholder="e.g. Public Speaking" error={errors.skillName?.message} {...register("skillName")} />
            <Textarea label="Information / Sub-skills (optional)" placeholder="Enter information or sub-skills about the skill" {...register("description")} rows={3} style={{ paddingTop: "8px" }} />
            <Select
              label="Skill Level"
              placeholder="Select skill level"
              error={errors.level?.message}
              options={levelOptions}
              {...register("level")}
            />
          <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface)", fontWeight: "var(--font-weight-medium)", display: "block", marginBottom: "var(--spacing-xs)" }}>
                Evidence (optional)
              </label>
              <label
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)', width: '100%', minHeight: '140px', background: 'var(--color-surface-container-low)', border: '1px dashed var(--color-outline)', borderRadius: 'var(--radius-sm)', padding: 'var(--spacing-md)', boxSizing: 'border-box' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    setFileError(null);
                    const file = e.target.files?.[0];
                    if (file) {
                      const allowed = ["image/png", "image/jpeg", "application/pdf"];
                      if (!allowed.includes(file.type)) {
                        setFileError("File must be PDF, PNG or JPEG");
                        e.target.value = "";
                        return;
                      }
                      if (file.size > 3 * 1024 * 1024) {
                        setFileError("File must be less than 3MB");
                        e.target.value = "";
                        return;
                      }
                      setEvidenceFile(file);
                      setFileName(file.name);
                      if (file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                />
                <Upload size={28} style={{ color: "var(--color-on-surface-variant)" }} />
                <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
                  Upload the evidence (e.g certificate) of your skill here
                </span>
                <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
                  File must be PDF, PNG or JPEG — Maximum 3MB
                </span>
              </label>
              {fileError && <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-error)", marginTop: "var(--spacing-xs)", display: "block" }}>{fileError}</span>}
              {evidenceFile && !fileError && (
                <div style={{ marginTop: "var(--spacing-sm)" }}>
                  {evidenceFile.type === "application/pdf" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-sm) var(--spacing-md)", background: "var(--color-surface-container-low)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-outline)" }}>
                      <FileText size={24} style={{ color: "var(--color-on-surface-variant)", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface)", display: "block" }}>{fileName}</span>
                        <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-on-surface-variant)", display: "block" }}>No Preview Available — {(evidenceFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      <button type="button" onClick={clearFile} style={{ cursor: "pointer", background: "none", border: "none", padding: "var(--spacing-xs)", color: "var(--color-error)", display: "flex" }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-outline)", display: "block" }} />}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--spacing-xs)" }}>
                        <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", display: "block" }}>{fileName}</span>
                        <button type="button" onClick={clearFile} style={{ cursor: "pointer", background: "none", border: "none", padding: "var(--spacing-xs)", color: "var(--color-error)", display: "flex" }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-end", marginTop: "var(--spacing-md)" }}>
              <Button variant="secondary" type="button" onClick={() => { setRefreshKey((k) => k + 1); router.push("/skills"); }}>Cancel</Button>
              <Button type="submit" isLoading={isSubmitting}>Save Skill</Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Skills"
        description="Track and assess your professional capabilities."
        action={
          <Button onClick={() => router.push("/skills?add=1")}>
            <Plus size={16} style={{ marginRight: "6px" }} />
            Add Skill
          </Button>
        }
      />

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          <Card><p>Loading...</p></Card>
        </div>
      ) : mySkills.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {mySkills.map((es) => (
            <Card
              key={`${es.userId}-${es.skillId}`}
              title={es.skill.name}
              actions={
                <div style={{ display: "flex", gap: "2px" }}>
                  <button type="button" onClick={() => openEdit(es)} title="Edit" style={{ cursor: "pointer", background: "none", border: "none", padding: "4px", color: "var(--color-on-surface-variant)", display: "flex", borderRadius: "var(--radius-sm)" }}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => setDeletingSkill(es)} title="Delete" style={{ cursor: "pointer", background: "none", border: "none", padding: "4px", color: "var(--color-error)", display: "flex", borderRadius: "var(--radius-sm)" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-body-sm)",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  {es.skill.category.name}
                </span>
                <Badge variant="success">Level {es.level} / 5</Badge>
              </div>
              {es.evidence && (
                <div style={{ marginTop: "1rem" }}>
                  {es.evidence.startsWith("/uploads/") ? (
                    <a href={es.evidence} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-primary)" }}>
                      View Evidence File
                    </a>
                  ) : (
                    <p style={{ fontSize: "var(--font-size-body-sm)", fontStyle: "italic" }}>"{es.evidence}"</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div style={{ textAlign: "center", padding: "24px var(--spacing-xl)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <p style={{ margin: 0 }}>You have not assessed any skill yet. Add a skill to assess it.</p>
            <Button onClick={() => router.push("/skills?add=1")}>
              <Plus size={16} style={{ marginRight: "6px" }} />
              Add Skill
            </Button>
          </div>
        </Card>
      )}

      <Modal isOpen={!!editingSkill} onClose={() => setEditingSkill(null)} title="Edit Skill" size="xl" inline>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <Input label="Skill" value={editingSkill?.skill.name || ""} disabled />
          <Textarea label="Information / Sub-skills (optional)" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} style={{ paddingTop: "8px" }} />
          <Select
            label="Skill Level"
            value={editLevel}
            onChange={(e) => setEditLevel(e.target.value)}
            options={levelOptions}
          />
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface)", fontWeight: "var(--font-weight-medium)", display: "block", marginBottom: "var(--spacing-xs)" }}>
              Evidence (optional)
            </label>
            <label
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)', width: '100%', minHeight: '100px', background: 'var(--color-surface-container-low)', border: '1px dashed var(--color-outline)', borderRadius: 'var(--radius-sm)', padding: 'var(--spacing-md)', boxSizing: 'border-box' }}
              onClick={() => editFileInputRef.current?.click()}
            >
              <input
                ref={editFileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const allowed = ["image/png", "image/jpeg", "application/pdf"];
                    if (!allowed.includes(file.type)) return;
                    if (file.size > 3 * 1024 * 1024) return;
                    setEditEvidenceFile(file);
                    setEditFileName(file.name);
                    if (file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onload = (e) => setEditPreviewUrl(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }
                }}
              />
              <Upload size={24} style={{ color: "var(--color-on-surface-variant)" }} />
              <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                {editEvidenceFile ? editFileName : "Upload new evidence (optional)"}
              </span>
            </label>
            {editPreviewUrl && (
              <img src={editPreviewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "var(--radius-sm)", marginTop: "var(--spacing-xs)" }} />
            )}
            {editEvidenceFile && (
              <button type="button" onClick={clearEditFile} style={{ cursor: "pointer", background: "none", border: "none", padding: "var(--spacing-xs)", color: "var(--color-error)", fontSize: "var(--font-size-body-sm)", marginTop: "var(--spacing-xs)" }}>
                Remove file
              </button>
            )}
          </div>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-start" }}>
            <Button variant="secondary" size="sm" onClick={() => setEditingSkill(null)} style={{ padding: "8px 16px" }}>Cancel</Button>
            <Button size="sm" isLoading={saving} onClick={handleSaveEdit} style={{ padding: "8px 16px" }}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deletingSkill} onClose={() => setDeletingSkill(null)} title="Delete Skill" size="md" inline>
        <p style={{ margin: "0 0 var(--spacing-lg) 0", fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
          Are you sure you want to delete <strong>{deletingSkill?.skill.name}</strong>?<br />This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "center" }}>
          <Button variant="secondary" size="sm" onClick={() => setDeletingSkill(null)} style={{ padding: "8px 16px" }}>Cancel</Button>
          <Button variant="danger" size="sm" isLoading={deleting} onClick={() => deletingSkill && handleDelete(deletingSkill)} style={{ padding: "8px 16px" }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
