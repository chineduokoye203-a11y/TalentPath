import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { careerService } from "@/features/career/services/career.service";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/Card/Card";

export default async function CareerPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth?mode=login");

  const careerPaths = await careerService.getCareerPaths();

  return (
    <div>
      <PageHeader
        title="Career Explorer"
        description="Explore different career paths and understand the skills required to progress."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {careerPaths.map((path) => (
          <div key={path.id}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "var(--font-weight-semibold)", marginBottom: "1rem" }}>{path.name}</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {path.roles.map((role) => (
                <Card key={role.id} title={role.title}>
                  <p
                    style={{
                      fontSize: "var(--font-size-body-sm)",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    Level: {role.level}
                  </p>

                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
