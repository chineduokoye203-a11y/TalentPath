"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/Card/Card";
import { Badge } from "@/components/Badge/Badge";
import { Users, BookOpen, AlertTriangle, Award, Search, ChevronRight, Plus } from "lucide-react";
import styles from "./team.module.css";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  department: { id: string; name: string } | null;
  team: { id: string; name: string } | null;
  skillCount: number;
  learningProgress: number;
  hasSkillGaps: boolean;
}

type StatusFilter = "ALL" | "ON_TRACK" | "NEEDS_ATTENTION" | "PROMOTION_READY";

function getStatus(member: TeamMember): "Promotion Ready" | "Needs Attention" | "On Track" {
  if (member.learningProgress >= 80 && member.skillCount >= 3) return "Promotion Ready";
  if (member.learningProgress < 50 || member.hasSkillGaps) return "Needs Attention";
  return "On Track";
}

function statusBadgeVariant(status: string) {
  if (status === "Promotion Ready") return "success" as const;
  if (status === "Needs Attention") return "warning" as const;
  return "primary" as const;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-md)",
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={24} style={{ color: "white" }} />
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-body-sm)",
              color: "var(--color-on-surface-variant)",
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-h3)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-on-surface)",
            }}
          >
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      style={{
        flex: 1,
        height: 22,
        borderRadius: "var(--radius-full)",
        background: "var(--color-on-primary)",
        border: "1px solid var(--color-outline-variant)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${value}%`,
          borderRadius: "var(--radius-full)",
          background:
            value >= 80
              ? "var(--color-success)"
              : value >= 50
                ? "var(--color-primary)"
                : "var(--color-warning)",
          transition: "width 300ms ease",
          display: "flex",
          alignItems: "center",
        }}
      >
        {value > 15 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: "var(--font-weight-semibold)",
              color: "#fff",
              lineHeight: 1,
              paddingLeft: 8,
            }}
          >
            {value}%
          </span>
        )}
      </div>
      {value <= 15 && (
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: 8,
            transform: "translateY(-50%)",
            fontSize: 11,
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-on-surface-variant)",
            lineHeight: 1,
          }}
        >
          {value}%
        </span>
      )}
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/manager/team");
      const json = await res.json();
      if (json.success) {
        setMembers(json.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const teamName = members.length > 0 && members[0].team ? members[0].team.name : "All team members";

  const filtered = members.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "ALL") {
      const status = getStatus(m);
      const map: Record<StatusFilter, string> = {
        ALL: "",
        ON_TRACK: "On Track",
        NEEDS_ATTENTION: "Needs Attention",
        PROMOTION_READY: "Promotion Ready",
      };
      if (status !== map[statusFilter]) return false;
    }
    return true;
  });

  const totalCount = members.length;
  const avgLearning =
    members.length > 0
      ? Math.round(members.reduce((sum, m) => sum + m.learningProgress, 0) / members.length)
      : 0;
  const needsAttention = members.filter(
    (m) => m.learningProgress < 50 || m.hasSkillGaps,
  ).length;
  const promotionReady = members.filter(
    (m) => m.learningProgress >= 80 && m.skillCount >= 3,
  ).length;

  return (
    <div>
      <PageHeader
        title="My Team"
        description={
          loading
            ? "Loading team data..."
            : `${teamName} — ${totalCount} member${totalCount !== 1 ? "s" : ""}`
        }
        action={
          <Link href="/team/assign-learning" style={{ textDecoration: "none" }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-xs)", padding: "var(--spacing-sm) var(--spacing-md)", background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 500, fontSize: "var(--font-size-body-sm)", cursor: "pointer" }}>
              <Plus size={16} /> Assign Learning
            </button>
          </Link>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <SummaryCard
          title="My Team"
          value={totalCount}
          icon={Users}
          color="var(--color-primary)"
        />
        <SummaryCard
          title="Learning Progress"
          value={`${avgLearning}%`}
          icon={BookOpen}
          color="#6366f1"
        />
        <SummaryCard
          title="Needs Attention"
          value={needsAttention}
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <SummaryCard
          title="Promotion Ready"
          value={promotionReady}
          icon={Award}
          color="#10b981"
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
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
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          style={{
            padding: "10px 36px 10px 16px",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--font-size-body)",
            fontFamily: "inherit",
            background: "var(--color-surface)",
            color: "var(--color-on-surface)",
            cursor: "pointer",
          }}
        >
          <option value="ALL">All Status</option>
          <option value="ON_TRACK">On Track</option>
          <option value="NEEDS_ATTENTION">Needs Attention</option>
          <option value="PROMOTION_READY">Promotion Ready</option>
        </select>
      </div>

      {loading ? (
        <Card>
          <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>Loading team members...</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
            {members.length === 0
              ? "No team members found."
              : "No team members match your search or filter."}
          </p>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 1.5fr 1.2fr 0.8fr 1.2fr 0.6fr",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                borderBottom: "2px solid var(--color-outline-variant)",
                fontSize: "var(--font-size-body-sm)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-on-surface-variant)",
                minWidth: 700,
              }}
            >
              <span>Employee</span>
              <span>Role</span>
              <span>Department</span>
              <span>Learning Progress</span>
              <span>Skills</span>
              <span>Status</span>
              <span></span>
            </div>

            {filtered.map((member) => {
              const status = getStatus(member);
              return (
                <div
                  key={member.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 1.5fr 1.2fr 0.8fr 1.2fr 0.6fr",
                    gap: "0.5rem",
                    padding: "0.875rem 1rem",
                    borderBottom: "1px solid var(--color-outline-variant)",
                    fontSize: "var(--font-size-body)",
                    alignItems: "center",
                    minWidth: 700,
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: "var(--font-weight-medium)",
                        color: "var(--color-on-surface)",
                        fontSize: "var(--font-size-body)",
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

                  <span
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontSize: "var(--font-size-body-sm)",
                    }}
                  >
                    {member.role === "MANAGER" ? "Line Manager" : member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                  </span>

                  <span
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontSize: "var(--font-size-body-sm)",
                    }}
                  >
                    {member.department?.name ?? "—"}
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar value={member.learningProgress} />
                      </div>
                    </div>
                  </div>

                  <Badge variant={member.skillCount > 0 ? "primary" : "neutral"}>
                    {member.skillCount}
                  </Badge>

                  <Badge variant={statusBadgeVariant(status)}>{status}</Badge>

                  <Link
                    href={`/team/${member.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: "var(--color-primary)",
                      fontWeight: 500,
                      fontSize: "var(--font-size-body-sm)",
                      textDecoration: "none",
                    }}
                  >
                    View <ChevronRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
