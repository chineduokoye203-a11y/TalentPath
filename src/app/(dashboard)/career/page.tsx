"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/Card/Card";
import { Modal } from "@/components/Modal/Modal";
import { Button } from "@/components/Button/Button";
import { Badge } from "@/components/Badge/Badge";
import { Check } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string | null;
  category: { name: string } | null;
}

interface RequiredSkill {
  skillId: string;
  requiredLevel: number;
  skill: Skill;
}

interface CareerRole {
  id: string;
  title: string;
  level: number;
  experienceYears: number | null;
  leadershipRequired: boolean;
  requiredSkills: RequiredSkill[];
}

interface CareerPath {
  id: string;
  name: string;
  description: string | null;
  department: { id: string; name: string } | null;
  roles: CareerRole[];
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

export default function CareerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth?mode=login");
  }, [status, router]);

  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(null);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);

  useEffect(() => {
    fetch("/api/admin/career-paths")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCareerPaths(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openRoleModal = (role: CareerRole, path: CareerPath) => {
    setSelectedRole(role);
    setSelectedPath(path);
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Career Explorer" description="Explore different career paths and understand the skills required to progress." />
        <p style={{ color: "var(--color-on-surface-variant)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Career Explorer"
        description="Explore different career paths and understand the skills required to progress."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {careerPaths.map((path) => (
          <div key={path.id}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "var(--font-weight-semibold)", marginBottom: "0.25rem" }}>
              {path.name}
            </h2>
            {path.description && (
              <p style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", marginBottom: "1rem" }}>
                {path.description}
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {path.roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => openRoleModal(role, path)}
                  style={{ cursor: "pointer" }}
                >
                  <Card title={role.title}>
                    <Badge variant="neutral">Level {role.level}</Badge>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedRole}
        onClose={() => { setSelectedRole(null); setSelectedPath(null); }}
        title={selectedRole?.title ?? ""}
        size="md"
      >
        {selectedRole && selectedPath && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <Badge variant="neutral">Level {selectedRole.level}</Badge>
              {selectedRole.leadershipRequired && <Badge variant="success">Leadership Required</Badge>}
            </div>

            <p style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", margin: 0 }}>
              <strong>Career Path:</strong> {selectedPath.name}
            </p>

            {selectedRole.experienceYears != null && selectedRole.experienceYears > 0 && (
              <p style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", margin: 0 }}>
                <strong>Experience Required:</strong> {selectedRole.experienceYears}+ years
              </p>
            )}

            {selectedRole.requiredSkills.length > 0 && (
              <div>
                <h4 style={{ fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-semibold)", marginBottom: "0.75rem" }}>
                  Required Skills
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {selectedRole.requiredSkills.map((rs) => {
                    const dots = getLevelDots(rs.requiredLevel);
                    return (
                      <div
                        key={rs.skillId}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          border: "1px solid var(--color-outline-variant)",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "0.25rem" }}>
                            {rs.skill.name}
                          </div>
                          {rs.skill.description && (
                            <div style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                              {rs.skill.description}
                            </div>
                          )}
                          {rs.skill.category && (
                            <div style={{ fontSize: "var(--font-size-caption)", color: "var(--color-on-surface-variant)", marginTop: "0.25rem" }}>
                              Category: {rs.skill.category.name}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                          {dots.map((filled, i) => (
                            <div
                              key={i}
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: filled ? "var(--color-primary)" : "var(--color-surface-variant)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedRole.requiredSkills.length === 0 && (
              <p style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)" }}>
                No specific skills defined for this role yet.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
