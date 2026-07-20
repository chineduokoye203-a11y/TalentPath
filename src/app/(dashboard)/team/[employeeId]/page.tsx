"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/Card/Card";
import { Badge } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { Avatar } from "@/components/Avatar/Avatar";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { Textarea } from "@/components/Textarea/Textarea";
import { Modal } from "@/components/Modal/Modal";
import { Input } from "@/components/Input/Input";
import { Select } from "@/components/Select/Select";
import {
  ArrowLeft,
  BookOpen,
  Target,
  AlertTriangle,
  Award,
  Calendar,
  Send,
  GraduationCap,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

interface SkillCategory {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

interface EmployeeSkill {
  skillId: string;
  level: number;
  skill: Skill;
}

interface LearningEnrollment {
  id: string;
  progress: number;
  status: string;
  enrolledAt: string;
  learningResource: {
    id: string;
    title: string;
    provider: string;
  };
}

interface CoachingNote {
  id: string;
  content: string;
  createdAt: string;
}

interface RequiredSkill {
  skillId: string;
  skillName: string;
  skillCategory: string;
  requiredLevel: number;
  currentLevel: number | null;
}

interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  department: { id: string; name: string } | null;
  team: { id: string; name: string } | null;
  skills: EmployeeSkill[];
  learningEnrollments: LearningEnrollment[];
  requiredSkills: RequiredSkill[];
  promotionScore: number | null;
}

const levelLabels: Record<number, string> = {
  1: "Novice",
  2: "Beginner",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

function getLevelDots(level: number, max = 5) {
  return Array.from({ length: max }, (_, i) => i < level);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusBadgeVariant(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "IN_PROGRESS") return "primary" as const;
  return "neutral" as const;
}

function statusLabel(status: string) {
  if (status === "COMPLETED") return "Completed";
  if (status === "IN_PROGRESS") return "In Progress";
  return "Not Started";
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const employeeId = params.employeeId as string;

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [coachingNotes, setCoachingNotes] = useState<CoachingNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState("3");
  const [savingSkill, setSavingSkill] = useState(false);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  const fetchEmployee = useCallback(async () => {
    try {
      const res = await fetch(`/api/manager/team/${employeeId}`);
      const json = await res.json();
      if (json.success) {
        setEmployee(json.data);
      } else {
        setError(json.error?.message || "Failed to load employee");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const fetchCoachingNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/manager/coaching-notes?employeeId=${employeeId}`);
      const json = await res.json();
      if (json.success) {
        setCoachingNotes(json.data);
      }
    } catch {}
  }, [employeeId]);

  useEffect(() => {
    fetchEmployee();
    fetchCoachingNotes();
  }, [fetchEmployee, fetchCoachingNotes]);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/manager/coaching-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, content: newNote.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setNewNote("");
        fetchCoachingNotes();
      }
    } catch {} finally {
      setSavingNote(false);
    }
  };

  const handleValidateSkill = async () => {
    if (!selectedSkill) return;
    setSavingSkill(true);
    try {
      const res = await fetch(`/api/manager/team/${employeeId}/skills`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: selectedSkill, level: Number(selectedLevel) }),
      });
      const json = await res.json();
      if (json.success) {
        setShowSkillModal(false);
        setSelectedSkill("");
        setSelectedLevel("3");
        fetchEmployee();
      }
    } catch {} finally {
      setSavingSkill(false);
    }
  };

  const handleSetGoal = async () => {
    if (!goalTitle.trim()) return;
    setSavingGoal(true);
    try {
      const res = await fetch("/api/manager/coaching-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          content: `[Development Goal] ${goalTitle.trim()}${goalDescription.trim() ? ` — ${goalDescription.trim()}` : ""}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowGoalModal(false);
        setGoalTitle("");
        setGoalDescription("");
        fetchCoachingNotes();
      }
    } catch {} finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-md)",
            marginBottom: "var(--spacing-lg)",
          }}
        >
          <Link
            href="/team"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              color: "var(--color-on-surface-variant)",
              textDecoration: "none",
              fontSize: "var(--font-size-body-sm)",
            }}
          >
            <ArrowLeft size={16} /> Back to Team
          </Link>
        </div>
        <Card>
          <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
            Loading employee profile...
          </p>
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-md)",
            marginBottom: "var(--spacing-lg)",
          }}
        >
          <Link
            href="/team"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              color: "var(--color-on-surface-variant)",
              textDecoration: "none",
              fontSize: "var(--font-size-body-sm)",
            }}
          >
            <ArrowLeft size={16} /> Back to Team
          </Link>
        </div>
        <Card>
          <p style={{ color: "var(--color-error)", margin: 0 }}>
            {error || "Employee not found."}
          </p>
        </Card>
      </div>
    );
  }

  const totalSkills = (employee.skills || []).length;
  const requiredSkills = employee.requiredSkills || [];
  const missingSkills = requiredSkills.filter((rs) => rs.currentLevel === null || rs.currentLevel < rs.requiredLevel);
  const completedRequired = requiredSkills.filter((rs) => rs.currentLevel !== null && rs.currentLevel >= rs.requiredLevel);
  const readiness =
    requiredSkills.length > 0
      ? Math.round((completedRequired.length / requiredSkills.length) * 100)
      : totalSkills > 0
        ? Math.min(100, Math.round(employee.promotionScore ?? totalSkills * 20))
        : 0;
  const learningProgress =
    employee.learningEnrollments.length > 0
      ? Math.round(
          employee.learningEnrollments.reduce((sum, e) => sum + e.progress, 0) /
            employee.learningEnrollments.length,
        )
      : 0;

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <Link
          href="/team"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            color: "var(--color-on-surface-variant)",
            textDecoration: "none",
            fontSize: "var(--font-size-body-sm)",
            marginBottom: "var(--spacing-md)",
          }}
        >
          <ArrowLeft size={16} /> Back to Team
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-md)",
            flexWrap: "wrap",
          }}
        >
          <Avatar name={employee.name} url={employee.avatarUrl} size="lg" />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "var(--font-size-h2)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-on-surface)",
              }}
            >
              {employee.name}
            </h1>
            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "var(--font-size-body)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              {employee.role}
              {employee.department && <> · {employee.department.name}</>}
              {employee.team && <> · {employee.team.name}</>}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BookOpen size={20} style={{ color: "white" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-body-sm)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                Learning Progress
              </p>
              <p
                style={{
                  margin: "0.125rem 0 0.375rem",
                  fontSize: "var(--font-size-h4)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-on-surface)",
                }}
              >
                {learningProgress}%
              </p>
              <ProgressBar value={learningProgress} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Target size={20} style={{ color: "white" }} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-body-sm)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                Skills
              </p>
              <p
                style={{
                  margin: "0.125rem 0 0",
                  fontSize: "var(--font-size-h4)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-on-surface)",
                }}
              >
                {totalSkills} assessed
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "var(--color-warning)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} style={{ color: "white" }} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-body-sm)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                Skill Gaps
              </p>
              <p
                style={{
                  margin: "0.125rem 0 0",
                  fontSize: "var(--font-size-h4)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-on-surface)",
                }}
              >
                {missingSkills.length} missing
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Award size={20} style={{ color: "white" }} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-body-sm)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                Promotion Readiness
              </p>
              <p
                style={{
                  margin: "0.125rem 0 0",
                  fontSize: "var(--font-size-h4)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-on-surface)",
                }}
              >
                {readiness}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Skills Profile Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-md)",
        }}
      >
        <Card title="Skills Profile">
          {totalSkills > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "var(--spacing-sm)",
              }}
            >
              {(employee.skills || []).map((es) => {
                const dots = getLevelDots(es.level);
                return (
                  <div
                    key={es.skillId}
                    style={{
                      padding: "var(--spacing-sm)",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--color-surface-container-low, var(--color-surface))",
                      border: "1px solid var(--color-outline-variant)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "var(--font-size-body-sm)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--color-on-surface)",
                          }}
                        >
                          {es.skill.name}
                        </p>
                        <p
                          style={{
                            margin: "0.125rem 0 0",
                            fontSize: "var(--font-size-caption)",
                            color: "var(--color-on-surface-variant)",
                          }}
                        >
                          {es.skill.category.name}
                        </p>
                      </div>
                      <Badge variant="success" style={{ fontSize: "var(--font-size-caption)", padding: "2px 6px" }}>
                        {levelLabels[es.level] || `Level ${es.level}`}
                      </Badge>
                    </div>
                    <div style={{ display: "flex", gap: "3px", marginTop: "0.375rem" }}>
                      {dots.map((filled, i) => (
                        <div
                          key={i}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "var(--radius-full)",
                            background: filled ? "var(--color-primary)" : "var(--color-outline-variant)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--color-on-surface-variant)", margin: 0, textAlign: "center", padding: "var(--spacing-md) 0" }}>
              No skills assessed yet
            </p>
          )}
        </Card>

        {/* Skill Gap Analysis Section */}
        <Card title="Skill Gap Analysis">
          {requiredSkills.length > 0 ? (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "var(--spacing-sm)",
                  marginBottom: "var(--spacing-md)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "var(--font-size-h3)", fontWeight: "var(--font-weight-bold)", color: "var(--color-on-surface)" }}>
                    {requiredSkills.length}
                  </p>
                  <p style={{ margin: 0, fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                    Required Skills
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "var(--font-size-h3)", fontWeight: "var(--font-weight-bold)", color: "var(--color-success)" }}>
                    {completedRequired.length}
                  </p>
                  <p style={{ margin: 0, fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                    Completed
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "var(--font-size-h3)", fontWeight: "var(--font-weight-bold)", color: missingSkills.length > 0 ? "var(--color-warning)" : "var(--color-on-surface)" }}>
                    {missingSkills.length}
                  </p>
                  <p style={{ margin: 0, fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                    Missing
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "var(--spacing-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                  <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                    Overall Readiness
                  </span>
                  <span style={{ fontSize: "var(--font-size-body-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-on-surface)" }}>
                    {readiness}%
                  </span>
                </div>
                <ProgressBar value={readiness} />
              </div>

              {missingSkills.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "var(--font-size-body-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-on-surface)" }}>
                    Missing Skills
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    {missingSkills.map((rs) => (
                      <div
                        key={rs.skillId}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.5rem var(--spacing-sm)",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--color-surface-container-low, var(--color-surface))",
                          border: "1px solid var(--color-outline-variant)",
                        }}
                      >
                        <div>
                          <p style={{ margin: 0, fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface)" }}>
                            {rs.skillName}
                          </p>
                          <p style={{ margin: "0.125rem 0 0", fontSize: "var(--font-size-caption)", color: "var(--color-on-surface-variant)" }}>
                            {rs.skillCategory} · Required: Level {rs.requiredLevel}
                          </p>
                        </div>
                        <Badge variant="warning">
                          {rs.currentLevel !== null ? `Level ${rs.currentLevel}` : "Not assessed"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: "var(--color-on-surface-variant)", margin: 0, textAlign: "center", padding: "var(--spacing-md) 0" }}>
              No career role requirements available for comparison
            </p>
          )}
        </Card>
      </div>

      {/* Learning Progress Section */}
      <div style={{ marginBottom: "var(--spacing-md)" }}>
        <Card
          title="Learning Progress"
          actions={
            <Link href="/team/assign-learning" style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="sm">
                <GraduationCap size={14} style={{ marginRight: "4px" }} />
                Assign Learning
              </Button>
            </Link>
          }
        >
          {employee.learningEnrollments.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "var(--font-size-body-sm)",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid var(--color-outline-variant)",
                    }}
                  >
                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--color-on-surface-variant)", fontWeight: "var(--font-weight-bold)" }}>
                      Course Title
                    </th>
                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--color-on-surface-variant)", fontWeight: "var(--font-weight-bold)" }}>
                      Provider
                    </th>
                    <th style={{ textAlign: "center", padding: "0.75rem 0.5rem", color: "var(--color-on-surface-variant)", fontWeight: "var(--font-weight-bold)" }}>
                      Progress
                    </th>
                    <th style={{ textAlign: "right", padding: "0.75rem 0.5rem", color: "var(--color-on-surface-variant)", fontWeight: "var(--font-weight-bold)" }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employee.learningEnrollments.map((enrollment) => (
                    <tr
                      key={enrollment.id}
                      style={{ borderBottom: "1px solid var(--color-outline-variant)" }}
                    >
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-on-surface)", fontWeight: "var(--font-weight-medium)" }}>
                        {enrollment.learningResource?.title ?? "Unknown"}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-on-surface-variant)" }}>
                        {enrollment.learningResource?.provider ?? "—"}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ flex: 1 }}>
                            <ProgressBar value={enrollment.progress} />
                          </div>
                          <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", minWidth: "2rem", textAlign: "right" }}>
                            {enrollment.progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                        <Badge variant={statusBadgeVariant(enrollment.status)}>
                          {statusLabel(enrollment.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "var(--color-on-surface-variant)", margin: 0, textAlign: "center", padding: "var(--spacing-md) 0" }}>
              No learning enrollments yet
            </p>
          )}
        </Card>
      </div>

      {/* Coaching Notes & Manager Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-md)",
        }}
      >
        {/* Coaching Notes Section */}
        <Card title="Coaching Notes">
          <div style={{ marginBottom: "var(--spacing-md)" }}>
            <Textarea
              label="Add a note"
              placeholder="Write a coaching note for this employee..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              style={{ paddingTop: "8px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--spacing-sm)" }}>
              <Button
                size="sm"
                onClick={handleSaveNote}
                isLoading={savingNote}
                disabled={!newNote.trim()}
              >
                <Send size={14} style={{ marginRight: "4px" }} />
                Save Note
              </Button>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--color-outline-variant)",
              paddingTop: "var(--spacing-sm)",
            }}
          >
            {coachingNotes.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                {coachingNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: "var(--spacing-sm)",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--color-surface-container-low, var(--color-surface))",
                      border: "1px solid var(--color-outline-variant)",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface)", whiteSpace: "pre-wrap" }}>
                      {note.content}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.375rem" }}>
                      <Calendar size={12} style={{ color: "var(--color-on-surface-variant)" }} />
                      <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-on-surface-variant)" }}>
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0, textAlign: "center", padding: "var(--spacing-sm) 0" }}>
                No coaching notes yet
              </p>
            )}
          </div>
        </Card>

        {/* Manager Actions Section */}
        <Card title="Manager Actions">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <Link href="/team/assign-learning" style={{ textDecoration: "none" }}>
              <Button variant="primary" style={{ width: "100%", justifyContent: "center" }}>
                <GraduationCap size={16} style={{ marginRight: "8px" }} />
                Assign Learning
                <ChevronRight size={16} style={{ marginLeft: "4px" }} />
              </Button>
            </Link>

            <Button
              variant="secondary"
              onClick={() => setShowSkillModal(true)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <TrendingUp size={16} style={{ marginRight: "8px" }} />
              Validate Skills
              <ChevronRight size={16} style={{ marginLeft: "4px" }} />
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowGoalModal(true)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Target size={16} style={{ marginRight: "8px" }} />
              Set Development Goal
              <ChevronRight size={16} style={{ marginLeft: "4px" }} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Validate Skills Modal */}
      <Modal isOpen={showSkillModal} onClose={() => setShowSkillModal(false)} title="Validate Skills" size="md" inline>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <p style={{ margin: 0, fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
            Adjust the proficiency level for one of {employee.name}&apos;s skills.
          </p>
          <Select
            label="Skill"
            placeholder="Select a skill"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            options={(employee.skills || []).map((es) => ({
              value: es.skillId,
              label: es.skill.name,
            }))}
          />
          <Select
            label="New Level"
            placeholder="Select level"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            options={[
              { value: "1", label: "1 - Novice" },
              { value: "2", label: "2 - Beginner" },
              { value: "3", label: "3 - Intermediate" },
              { value: "4", label: "4 - Advanced" },
              { value: "5", label: "5 - Expert" },
            ]}
          />
          <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowSkillModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={savingSkill}
              onClick={handleValidateSkill}
              disabled={!selectedSkill}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Set Development Goal Modal */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Set Development Goal" size="md" inline>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <Input
            label="Goal Title"
            placeholder="e.g. Improve public speaking skills"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
          />
          <Textarea
            label="Description (optional)"
            placeholder="Describe the development goal and expected outcomes..."
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
            rows={3}
            style={{ paddingTop: "8px" }}
          />
          <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowGoalModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={savingGoal}
              onClick={handleSetGoal}
              disabled={!goalTitle.trim()}
            >
              Save Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
