"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { Badge } from "@/components/Badge/Badge";
import { Modal } from "@/components/Modal/Modal";
import { Search, Plus, Check, BookOpen, Users, ArrowLeft, X, FileText } from "lucide-react";
import styles from "./assign-learning.module.css";

interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: number;
  category: string;
  level: string;
  description: string;
  imageUrl: string | null;
  provider: string;
  url: string;
}

interface LearningPlan {
  id: string;
  title: string;
  description: string;
  courseCount: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function AssignLearningPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDescription, setNewPlanDescription] = useState("");
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      if (searchQuery.trim()) {
        const res = await fetch(`/api/integrations/udemy?action=search-courses&query=${encodeURIComponent(searchQuery)}&pageSize=20`);
        const json = await res.json();
        if (json.success && json.data) {
          setCourses(json.data.map((c: any) => ({
            id: c.id,
            title: c.title,
            instructor: c.instructor || "Unknown",
            duration: c.duration || 0,
            category: c.category || "",
            level: c.level || "",
            description: c.description || "",
            imageUrl: c.imageUrl || null,
            provider: c.provider || "Udemy",
            url: c.url || "",
          })));
        }
      } else {
        const res = await fetch("/api/manager/team-courses");
        const json = await res.json();
        if (json.success) {
          setCourses(json.data);
        }
      }
    } catch {
    } finally {
      setLoadingCourses(false);
    }
  }, [searchQuery]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/manager/learning-plans");
      const json = await res.json();
      if (json.success) {
        setPlans(json.data);
      }
    } catch {
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/manager/team");
      const json = await res.json();
      if (json.success) {
        setTeamMembers(json.data);
      }
    } catch {
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
    fetchPlans();
  }, [fetchTeamMembers, fetchPlans]);

  useEffect(() => {
    setLoadingCourses(true);
    fetchCourses();
  }, [fetchCourses]);

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const togglePlan = (id: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const selectAllCourses = () => {
    if (selectedCourseIds.length === courses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(courses.map((c) => c.id));
    }
  };

  const selectAllPlans = () => {
    if (selectedPlanIds.length === plans.length) {
      setSelectedPlanIds([]);
    } else {
      setSelectedPlanIds(plans.map((p) => p.id));
    }
  };

  const selectAllMembers = () => {
    if (selectedMemberIds.length === teamMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(teamMembers.map((m) => m.id));
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;
    setCreatingPlan(true);
    try {
      const res = await fetch("/api/manager/learning-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPlanName.trim(),
          description: newPlanDescription.trim(),
          courseIds: selectedCourseIds,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPlans((prev) => [...prev, json.data]);
        setShowCreateModal(false);
        setNewPlanName("");
        setNewPlanDescription("");
        setSelectedCourseIds([]);
        setMessage({ type: "success", text: "Learning plan created successfully." });
      } else {
        setMessage({ type: "error", text: json.error || "Failed to create plan." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create learning plan." });
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleAssign = async () => {
    if (selectedMemberIds.length === 0) {
      setMessage({ type: "error", text: "Select at least one team member." });
      return;
    }
    if (selectedCourseIds.length === 0 && selectedPlanIds.length === 0) {
      setMessage({ type: "error", text: "Select at least one course or plan." });
      return;
    }

    setAssigning(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = { userIds: selectedMemberIds };
      if (selectedPlanIds.length > 0) {
        payload.learningPlanIds = selectedPlanIds;
      } else if (selectedCourseIds.length === 1) {
        payload.learningResourceId = selectedCourseIds[0];
      } else if (selectedCourseIds.length > 1) {
        payload.learningResourceIds = selectedCourseIds;
      }

      const res = await fetch("/api/manager/assign-learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Learning assigned successfully!" });
        setSelectedMemberIds([]);
        setSelectedCourseIds([]);
        setSelectedPlanIds([]);
      } else {
        setMessage({ type: "error", text: json.error || "Failed to assign learning." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to assign learning." });
    } finally {
      setAssigning(false);
    }
  };

  const selectedCourseObjects = courses.filter((c) => selectedCourseIds.includes(c.id));
  const selectedPlanObjects = plans.filter((p) => selectedPlanIds.includes(p.id));
  const totalSelected = selectedCourseIds.length + selectedPlanIds.length;

  return (
    <div>
      <PageHeader
        title="Assign Learning"
        description="Browse courses, create learning plans, and assign them to your team members."
        topLeft={
          <Link
            href="/team"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              color: "var(--color-on-surface-variant)",
              textDecoration: "none",
              fontSize: "var(--font-size-body-sm)",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} />
            Back to Team
          </Link>
        }
      />

      {message && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1.5rem",
            fontSize: "var(--font-size-body-sm)",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: message.type === "success" ? "var(--color-success-container)" : "var(--color-error-container)",
            color: message.type === "success" ? "var(--color-on-success-container)" : "var(--color-on-error-container)",
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              padding: 4,
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Left Column: Course Browser */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-on-surface-variant)",
              }}
            />
            <input
              type="text"
              placeholder="Search courses by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Course List */}
          <Card
            title="Courses"
            actions={
              <Button variant="ghost" size="sm" onClick={selectAllCourses}>
                {selectedCourseIds.length === courses.length && courses.length > 0 ? "Deselect All" : "Select All"}
              </Button>
            }
          >
            {loadingCourses ? (
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>Loading courses...</p>
            ) : courses.length === 0 ? (
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>No courses found.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                {courses.map((course) => {
                  const isSelected = selectedCourseIds.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      style={{
                        border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                        borderRadius: "var(--radius-md)",
                        padding: "1rem",
                        cursor: "pointer",
                        background: isSelected ? "var(--color-on-primary)" : "var(--color-surface)",
                        transition: "all 150ms ease",
                        position: "relative",
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 22,
                            height: 22,
                            borderRadius: "var(--radius-full)",
                            background: "var(--color-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check size={14} style={{ color: "white" }} />
                        </div>
                      )}

                      <h4
                        style={{
                          margin: "0 0 0.375rem 0",
                          fontSize: "var(--font-size-body)",
                          fontWeight: "var(--font-weight-bold)",
                          lineHeight: 1.3,
                          paddingRight: isSelected ? 28 : 0,
                        }}
                      >
                        {course.title}
                      </h4>

                      {course.instructor && (
                        <p
                          style={{
                            margin: "0 0 0.25rem 0",
                            fontSize: "var(--font-size-body-sm)",
                            color: "var(--color-on-surface-variant)",
                          }}
                        >
                          {course.instructor}
                        </p>
                      )}

                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        {course.category && (
                          <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>{course.category}</span>
                        )}
                        {course.category && course.level && (
                          <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>|</span>
                        )}
                        {course.level && (
                          <span style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>{course.level}</span>
                        )}
                        {course.duration > 0 && (
                          <span
                            style={{
                              fontSize: "var(--font-size-body-sm)",
                              color: "var(--color-on-surface-variant)",
                            }}
                          >
                            {formatDuration(course.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Learning Plans */}
          <Card
            title="My Learning Plans"
            actions={
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {plans.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={selectAllPlans}>
                    {selectedPlanIds.length === plans.length ? "Deselect All" : "Select All"}
                  </Button>
                )}
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "hsl(9, 81%, 46%)",
                    fontSize: "var(--font-size-body-sm)",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Plus size={14} />
                  New Plan
                </button>
              </div>
            }
          >
            {loadingPlans ? (
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>Loading plans...</p>
            ) : plans.length === 0 ? (
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                No learning plans yet. Create one to bundle courses together.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {plans.map((plan) => {
                  const isSelected = selectedPlanIds.includes(plan.id);
                  return (
                    <div
                      key={plan.id}
                      onClick={() => togglePlan(plan.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        background: isSelected ? "var(--color-on-primary)" : "var(--color-surface)",
                        transition: "all 150ms ease",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "var(--radius-sm)",
                          background: "var(--color-primary-container)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FileText size={18} style={{ color: "var(--color-primary)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "var(--font-size-body)",
                            fontWeight: "var(--font-weight-bold)",
                            color: "var(--color-on-surface)",
                          }}
                        >
                          {plan.title}
                        </p>
                        {plan.description && (
                          <p
                            style={{
                              margin: "0.125rem 0 0 0",
                              fontSize: "var(--font-size-body-sm)",
                              color: "var(--color-on-surface-variant)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {plan.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="neutral">{plan.courseCount} courses</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Assignment Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "1.5rem" }}>
          {/* Selected Items Summary */}
          <Card title="Selected Items">
            {totalSelected === 0 ? (
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "var(--font-size-body-sm)" }}>
                No courses or plans selected. Click items in the left column to select them.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {selectedCourseObjects.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      background: "var(--color-primary-container)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "var(--font-size-body-sm)",
                    }}
                  >
                    <BookOpen size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {course.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCourse(course.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-on-surface-variant)",
                        padding: 2,
                        display: "flex",
                        flexShrink: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {selectedPlanObjects.map((plan) => (
                  <div
                    key={plan.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      background: "var(--color-primary-container)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "var(--font-size-body-sm)",
                    }}
                  >
                    <FileText size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {plan.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlan(plan.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-on-surface-variant)",
                        padding: 2,
                        display: "flex",
                        flexShrink: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Team Member Selection */}
          <Card
            title="Assign To"
            actions={
              teamMembers.length > 0 ? (
                <Button variant="ghost" size="sm" onClick={selectAllMembers}>
                  {selectedMemberIds.length === teamMembers.length ? "Deselect All" : "Select All"}
                </Button>
              ) : undefined
            }
          >
            {loadingMembers ? (
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>Loading team members...</p>
            ) : teamMembers.length === 0 ? (
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>No team members found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {teamMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.625rem 0.75rem",
                        border: `1px solid ${isSelected ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        background: isSelected ? "var(--color-on-primary)" : "var(--color-surface)",
                        transition: "all 150ms ease",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "var(--radius-full)",
                          background: "var(--color-primary-container)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: "var(--font-size-body-sm)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "var(--font-size-body-sm)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--color-on-surface)",
                          }}
                        >
                          {member.name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "var(--font-size-body-sm)",
                            color: "var(--color-on-surface-variant)",
                          }}
                        >
                          {member.email}
                        </p>
                      </div>
                      {isSelected && (
                        <Check size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Assign Button */}
          <Button
            variant="primary"
            size="lg"
            isLoading={assigning}
            disabled={totalSelected === 0 || selectedMemberIds.length === 0}
            onClick={handleAssign}
          >
            <Users size={16} style={{ marginRight: 8 }} />
            Assign Learning
          </Button>
        </div>
      </div>

      {/* Create Plan Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewPlanName("");
          setNewPlanDescription("");
        }}
        title="Create Learning Plan"
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label
              htmlFor="plan-name"
              style={{
                display: "block",
                fontSize: "var(--font-size-body-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-on-surface)",
                marginBottom: "0.375rem",
              }}
            >
              Plan Name
            </label>
            <input
              id="plan-name"
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="e.g. Frontend Fundamentals"
              className="fieldInput"
            />
          </div>

          <div>
            <label
              htmlFor="plan-description"
              style={{
                display: "block",
                fontSize: "var(--font-size-body-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-on-surface)",
                marginBottom: "0.375rem",
              }}
            >
              Description
            </label>
            <textarea
              id="plan-description"
              value={newPlanDescription}
              onChange={(e) => setNewPlanDescription(e.target.value)}
              placeholder="Describe the goal of this learning plan..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--font-size-body)",
                fontFamily: "inherit",
                background: "var(--color-surface)",
                color: "var(--color-on-surface)",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <p
              style={{
                fontSize: "var(--font-size-body-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-on-surface)",
                marginBottom: "0.5rem",
              }}
            >
              Selected Courses ({selectedCourseIds.length})
            </p>
            {selectedCourseObjects.length === 0 ? (
              <p
                style={{
                  fontSize: "var(--font-size-body-sm)",
                  color: "var(--color-on-surface-variant)",
                  margin: 0,
                  padding: "0.75rem",
                  border: "1px dashed var(--color-outline-variant)",
                  borderRadius: "var(--radius-sm)",
                  textAlign: "center",
                }}
              >
                No courses selected. Select courses from the browser above first.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {selectedCourseObjects.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      background: "var(--color-surface-variant)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "var(--font-size-body-sm)",
                    }}
                  >
                    <BookOpen size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {course.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setNewPlanName("");
                setNewPlanDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={creatingPlan}
              disabled={!newPlanName.trim()}
              onClick={handleCreatePlan}
            >
              Create Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
