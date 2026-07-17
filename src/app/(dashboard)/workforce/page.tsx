import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/Card/Card";
import { Users, Target, TrendingUp, Building2 } from "lucide-react";

export default async function WorkforcePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth?mode=login");

  const role = (session.user as any).role as string;
  if (!["HR", "LEADERSHIP", "ADMINISTRATOR"].includes(role)) {
    redirect("/dashboard");
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!currentUser) redirect("/auth?mode=login");

  const totalEmployees = await db.user.count({
    where: { companyId: currentUser.companyId, deletedAt: null },
  });

  const departments = await db.department.findMany({
    orderBy: { name: "asc" },
  });

  const deptUserCounts = await db.user.groupBy({
    by: ["departmentId"],
    where: { companyId: currentUser.companyId, deletedAt: null, departmentId: { not: null } },
    _count: { id: true },
  });

  const deptCountMap = new Map(deptUserCounts.map((d) => [d.departmentId, d._count.id]));

  const totalSkillsAssessed = await db.employeeSkill.count({
    where: { user: { companyId: currentUser.companyId, deletedAt: null } },
  });

  const totalSkillGaps = await db.skillGap.count({
    where: { user: { companyId: currentUser.companyId, deletedAt: null } },
  });

  const recentAssessments = await db.promotionAssessment.findMany({
    where: { user: { companyId: currentUser.companyId } },
    include: { user: true, targetRole: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "var(--color-primary)",
    },
    {
      title: "Departments",
      value: departments.length,
      icon: Building2,
      color: "var(--color-chart-1, #4f46e5)",
    },
    {
      title: "Skills Assessed",
      value: totalSkillsAssessed,
      icon: Target,
      color: "var(--color-chart-2, #059669)",
    },
    {
      title: "Skill Gaps",
      value: totalSkillGaps,
      icon: TrendingUp,
      color: "hsl(251, 59%, 38%)",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Workforce Analytics"
        description="Overview of skills, gaps, and development across your organization."
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
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-caption)",
                    color: "var(--color-on-surface-variant)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {stat.title}
                </p>
                <p
                  style={{
                    fontSize: "var(--font-size-h2)",
                    fontWeight: "var(--font-weight-bold)",
                    margin: 0,
                  }}
                >
                  {stat.value}
                </p>
              </div>
              <div
                style={{
                  padding: "0.5rem",
                  borderRadius: "var(--radius-sm)",
                  background: stat.color,
                  color: "#fff",
                  display: "flex",
                }}
              >
                <stat.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2
        style={{
          fontSize: "var(--font-size-h3)",
          marginBottom: "1rem",
        }}
      >
        Departments
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {departments.length > 0 ? (
          departments.map((dept) => (
            <Card key={dept.id} title={dept.name}>
              <p
                style={{
                  fontSize: "var(--font-size-body-sm)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                {deptCountMap.get(dept.id) ?? 0} employee{(deptCountMap.get(dept.id) ?? 0) !== 1 ? "s" : ""}
              </p>
            </Card>
          ))
        ) : (
          <Card>
            <p>No departments configured yet.</p>
          </Card>
        )}
      </div>

      <h2
        style={{
          fontSize: "var(--font-size-h3)",
          marginBottom: "1rem",
        }}
      >
        Recent Promotion Assessments
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        {recentAssessments.length > 0 ? (
          recentAssessments.map((assessment) => (
            <Card key={assessment.id} title={assessment.user.name}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  fontSize: "var(--font-size-body-sm)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                <span>Target: {assessment.targetRole.title}</span>
                <span>Status: {assessment.status}</span>
                <span>
                  Score: {assessment.overallScore.toFixed(1)}
                </span>
              </div>
            </Card>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1" }}>
            <Card>
              <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
                <p style={{ margin: 0, whiteSpace: "nowrap" }}>No assessment has been recorded yet.</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
