"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Modal } from "@/components/Modal/Modal";
import { Users, Target, TrendingUp, Building2, Plus } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string | null;
}

export default function WorkforcePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth?mode=login");
  }, [status, router]);

  const role = (session?.user as any)?.role;
  const isHr = role === "HR" || role === "ADMINISTRATOR";

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptCountMap, setDeptCountMap] = useState<Record<string, number>>({});
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalSkillsAssessed, setTotalSkillsAssessed] = useState(0);
  const [totalSkillGaps, setTotalSkillGaps] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptError, setDeptError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [deptRes, statsRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/workforce/stats"),
      ]);
      const deptJson = await deptRes.json();
      const statsJson = await statsRes.json();
      if (deptJson.success) setDepartments(deptJson.data);
      if (statsJson.success) {
        setTotalEmployees(statsJson.data.totalEmployees);
        setDeptCountMap(statsJson.data.deptCountMap ?? {});
        setTotalSkillsAssessed(statsJson.data.totalSkillsAssessed);
        setTotalSkillGaps(statsJson.data.totalSkillGaps);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDepartment = async () => {
    setDeptError(null);
    if (!deptName.trim()) { setDeptError("Department name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deptName.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setDeptName("");
        fetchData();
      } else {
        setDeptError(json.error?.message || "Failed to create department");
      }
    } catch {
      setDeptError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Workforce Analytics" description="Overview of skills, gaps, and development across your organization." />
        <p style={{ color: "var(--color-on-surface-variant)" }}>Loading...</p>
      </div>
    );
  }

  const stats = [
    { title: "Total Employees", value: totalEmployees, icon: Users, color: "var(--color-primary)" },
    { title: "Departments", value: departments.length, icon: Building2, color: "var(--color-chart-1, #4f46e5)" },
    { title: "Skills Assessed", value: totalSkillsAssessed, icon: Target, color: "var(--color-chart-2, #059669)" },
    { title: "Skill Gaps", value: totalSkillGaps, icon: TrendingUp, color: "hsl(251, 59%, 38%)" },
  ];

  return (
    <div>
      <PageHeader
        title="Workforce Analytics"
        description="Overview of skills, gaps, and development across your organization."
        action={
          isHr && (
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} style={{ marginRight: "6px" }} />Add Department
            </Button>
          )
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
        {stats.map((stat) => (
          <Card key={stat.title}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "var(--font-size-caption)", color: "var(--color-on-surface-variant)", marginBottom: "0.25rem" }}>
                  {stat.title}
                </p>
                <p style={{ fontSize: "var(--font-size-h2)", fontWeight: "var(--font-weight-bold)", margin: 0 }}>
                  {stat.value}
                </p>
              </div>
              <div style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", background: stat.color, color: "#fff", display: "flex" }}>
                <stat.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 style={{ fontSize: "var(--font-size-h3)", marginBottom: "1rem" }}>Departments</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {departments.length > 0 ? (
          departments.map((dept) => (
            <Card key={dept.id} title={dept.name}>
              <p style={{ fontSize: "var(--font-size-body-sm)", color: "var(--color-on-surface-variant)", margin: 0 }}>
                {deptCountMap[dept.id] ?? 0} employee{(deptCountMap[dept.id] ?? 0) !== 1 ? "s" : ""}
              </p>
            </Card>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1" }}>
            <Card>
              <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
                <p style={{ margin: "0 0 var(--spacing-md) 0" }}>No departments configured yet.</p>
                <Button onClick={() => setShowModal(true)}>
                  <Plus size={16} style={{ marginRight: "6px" }} />Add Department
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setDeptName(""); setDeptError(null); }} title="Add Department" size="sm">
        {deptError && <div style={{ color: "var(--color-error)", marginBottom: "var(--spacing-sm)", fontSize: "var(--font-size-body-sm)" }}>{deptError}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <Input
            label="Department Name"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            placeholder="e.g. Engineering"
            autoFocus
          />
          <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-start" }}>
            <Button variant="secondary" size="sm" onClick={() => { setShowModal(false); setDeptName(""); setDeptError(null); }} style={{ padding: "8px 16px" }}>Cancel</Button>
            <Button size="sm" isLoading={saving} onClick={handleAddDepartment} style={{ padding: "8px 16px" }}>Add Department</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
