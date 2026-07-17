"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/Card/Card";
import { Badge } from "@/components/Badge/Badge";

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
  requiredSkills: string;
  status: string;
  createdAt: string;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => r.json())
      .then((j) => { if (j.success) setOpportunities(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Job Opportunities"
        description="Browse all available internal job opportunities across the organization."
      />

      {loading ? (
        <Card><p>Loading...</p></Card>
      ) : opportunities.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p>No open opportunities at the moment. Check back later!</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              style={{
                padding: "var(--spacing-md)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-on-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "var(--font-size-h3)" }}>{opp.title}</h3>
                <Badge variant="success">OPEN</Badge>
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
          ))}
        </div>
      )}
    </div>
  );
}
