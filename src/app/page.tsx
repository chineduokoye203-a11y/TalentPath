"use client";

import React from "react";
import Link from "next/link";
import { Path } from "@phosphor-icons/react";

export default function LandingPage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--spacing-lg)",
        background: "var(--color-on-primary)",
        padding: "var(--spacing-lg)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-sm)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            background: "var(--color-primary)",
            color: "white",
          }}
        >
          <Path size={24} weight="fill" />
        </div>
        <span style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary)" }}>
          TalentPath
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <h1 style={{ fontSize: "clamp(1.3rem, 4vw, 2.375rem)", fontWeight: "var(--font-weight-bold)", color: "var(--color-on-surface)", margin: 0, maxWidth: 600 }}>
          Build a Future-Ready<br />Workforce
        </h1>

        <p style={{ fontSize: "var(--font-size-body)", color: "var(--color-on-surface-variant)", margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
          Identify skill gaps, develop talent<br className="mobile-break" /> and future leaders
        </p>
      </div>

      <style>{`
        .cta-button {
          padding: var(--spacing-sm) var(--spacing-lg);
          font-size: var(--font-size-body);
          font-weight: var(--font-weight-medium);
          color: var(--color-on-primary);
          background: var(--color-primary);
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          text-decoration: none;
          transition: opacity 150ms ease;
        }
        .cta-button:hover {
          opacity: 0.9;
        }
        .mobile-break {
          display: none;
        }
        @media (max-width: 480px) {
          .mobile-break {
            display: inline;
          }
        }
      `}</style>

      <Link
        href="/auth?mode=register"
        className="cta-button"
      >
        Get Started
      </Link>
    </div>
  );
}
