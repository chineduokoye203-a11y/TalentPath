# TalentPath Component Builder Skill

## Purpose

Build reusable, accessible, responsive, and role-aware UI components for TalentPath.

This skill should be used whenever creating:

- Dashboard Components
- Skills Components
- Learning Components
- Career Development Components
- Promotion Readiness Components
- Succession Planning Components
- Workforce Analytics Components
- Administrative Components

---

# Product Context

TalentPath is a workforce development platform focused on:

- Skills Development
- Career Growth
- Learning & Development
- Internal Mobility
- Promotion Readiness
- Leadership Succession

Every component must support at least one of these business goals.

---

# Design System

TalentPath uses a custom design token system. **No Tailwind CSS or third-party CSS frameworks.**

Source: `tokens/tokens.css`

## Color Tokens

Material Design 3 semantic color roles — light and dark themes:

```css
/* Light (default) */
--color-primary
--color-on-primary
--color-primary-container
--color-on-primary-container
--color-secondary
--color-on-secondary
--color-secondary-container
--color-on-secondary-container
--color-tertiary
--color-on-tertiary
--color-error
--color-on-error
--color-background
--color-on-background
--color-surface
--color-on-surface
--color-surface-variant
--color-on-surface-variant
--color-outline
--color-outline-variant
--color-inverse-surface
--color-inverse-on-surface
--color-inverse-primary
```

Dark theme is activated by `[data-theme="dark"]` on a parent element.

Use semantic tokens, not raw hex values.

```css
/* Good */
background-color: var(--color-surface);
color: var(--color-on-surface);

/* Bad */
background-color: #fff;
color: #000;
```

## Typography Tokens

Two naming systems exist — use the `--font-` prefix tokens:

```css
--font-display-large-*    /* 62px Satoshi 500 */
--font-display-medium-*   /* 56px Satoshi 500 */
--font-display-small-*    /* 44px Satoshi 500 */
--font-headline-large-*   /* 38px Satoshi 500 */
--font-headline-medium-*  /* 32px Satoshi 500 */
--font-headline-small-*   /* 28px Satoshi 500 */
--font-title-large-*      /* 26px Satoshi 500 */
--font-title-medium-*     /* 20px Satoshi 500 */
--font-title-small-*      /* 18px Satoshi 500 */
--font-body-large-*       /* 16px Satoshi 400 */
--font-body-medium-*      /* 14px Satoshi 400 */
--font-body-small-*       /* 14px Satoshi 400 */
--font-label-large-*      /* 13px Satoshi 500 */
--font-label-medium-*     /* 13px Satoshi 500 */
--font-label-small-*      /* 10px Satoshi 500 */
```

Also available via `--font-h1-*`, `--font-h2-*`, `--font-h3-*`, `--font-h4-*` (Poppins for bold/medium, Satoshi for regular/light).

## Using Tokens in CSS Modules

```css
/* SkillCard.module.css */
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-outline-variant);
  border-radius: 12px;
  padding: 24px;
}

.title {
  font-family: var(--font-title-medium-font-family);
  font-size: var(--font-title-medium-font-size);
  font-weight: var(--font-title-medium-font-weight);
  line-height: var(--font-title-medium-line-height);
  letter-spacing: var(--font-title-medium-letter-spacing);
  color: var(--color-on-surface);
}

.meta {
  font-family: var(--font-body-medium-font-family);
  font-size: var(--font-body-medium-font-size);
  font-weight: var(--font-body-medium-font-weight);
  line-height: var(--font-body-medium-line-height);
  color: var(--color-on-surface-variant);
}
```

---

# File Scaffolding

Every component generates up to 6 files:

```text
src/
└── features/
    └── {domain}/
        └── components/
            └── {ComponentName}/
                ├── {ComponentName}.tsx           # component logic
                ├── {ComponentName}.module.css     # styles (CSS Modules)
                ├── {ComponentName}.types.ts       # props + types
                ├── {ComponentName}.test.tsx        # unit tests
                └── index.ts                       # re-export
```

For reusable/shared components:

```text
src/
└── components/
    └── ui/
        └── Card/
            ├── Card.tsx
            ├── Card.module.css
            ├── Card.types.ts
            ├── Card.test.tsx
            └── index.ts
```

---

# Component Template

## Basic structure

File: `{ComponentName}.types.ts`

```ts
import type { ReactNode } from "react";

export interface SkillCardProps {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  category: string;
  className?: string;
  onAssess?: () => void;
}
```

File: `{ComponentName}.tsx`

```ts
import type { SkillCardProps } from "./SkillCard.types";
import styles from "./SkillCard.module.css";

export function SkillCard({
  name,
  currentLevel,
  requiredLevel,
  category,
  className,
  onAssess,
}: SkillCardProps) {
  const gap = requiredLevel - currentLevel;
  const hasGap = gap > 0;

  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
        <span className={styles.category}>{category}</span>
      </div>

      <div className={styles.levels}>
        <LevelBar label="Current" level={currentLevel} color="var(--color-primary)" />
        <LevelBar label="Required" level={requiredLevel} color="var(--color-on-surface-variant)" />
      </div>

      {hasGap && (
        <div className={styles.gap}>
          Gap: {gap} level{gap > 1 ? "s" : ""}
        </div>
      )}

      {onAssess && (
        <button className={styles.assessButton} onClick={onAssess} type="button">
          Assess Skill
        </button>
      )}
    </div>
  );
}
```

File: `index.ts`

```ts
export { SkillCard } from "./SkillCard";
export type { SkillCardProps } from "./SkillCard.types";
```

---

# Component Props Conventions

Every component should accept these common props:

```ts
export interface BaseProps {
  /** Additional CSS class names */
  className?: string;
  /** Children (for wrapper components) */
  children?: ReactNode;
  /** Loading state (shows skeleton when true) */
  isLoading?: boolean;
  /** Data attribute for testing */
  dataTestId?: string;
}
```

Extend for domain components:

```ts
export interface SkillCardProps extends BaseProps {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  category: string;
  onAssess?: () => void;
}
```

---

# Component States

Every data-driven component must handle 4 states.

## Loading

```ts
if (isLoading) {
  return (
    <div role="status" aria-busy={true} className={styles.skeleton}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonBar} />
      <div className={styles.skeletonBar} />
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
}
```

```css
/* Skeleton styles */
.skeleton {
  padding: 24px;
}

.skeletonTitle {
  height: 24px;
  width: 60%;
  margin-bottom: 16px;
  background-color: var(--color-surface-variant);
  border-radius: 4px;
}

.skeletonBar {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
  background-color: var(--color-surface-variant);
  border-radius: 4px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: no-preference) {
  .skeletonTitle,
  .skeletonBar {
    animation: shimmer 1.5s ease-in-out infinite;
  }
}

@keyframes shimmer {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* Screen reader only utility */
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

## Empty

```ts
if (!items || items.length === 0) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No skills have been added yet.</p>
      <p className={styles.emptyAction}>Add your first skill to start tracking career progress.</p>
    </div>
  );
}
```

## Error

```ts
if (error) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.errorMessage}>
        We couldn't load your skills. Please try again.
      </p>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
}
```

## Success

Render the component with data.

---

# Data Fetching Pattern

## Server Component (preferred for initial data)

```ts
// SkillCard.server.tsx
import { skillService } from "@/features/skills/services/skill.service";
import { SkillCardClient } from "./SkillCard.client";
import styles from "./SkillCard.module.css";

export async function SkillCard({ id }: { id: string }) {
  const skill = await skillService.getById(id);

  return <SkillCardClient skill={skill} className={styles.card} />;
}
```

## Client Component with Hook (for interactive data)

```ts
// useSkills.ts
"use client";

import { useState, useEffect } from "react";
import type { Skill } from "@/features/skills/types/skill.types";

interface UseSkillsResult {
  skills: Skill[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSkills(filters?: Record<string, string>): UseSkillsResult {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSkills = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/skills?${params}`);
      const result = await response.json();

      if (!result.success) throw new Error(result.message);
      setSkills(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load skills"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [JSON.stringify(filters)]);

  return { skills, isLoading, error, refetch: fetchSkills };
}
```

## Client Component using hook

```ts
"use client";

import { useSkills } from "./useSkills";
import { SkillCard } from "./SkillCard";
import { SkillCardSkeleton } from "./SkillCardSkeleton";
import { SkillCardEmpty } from "./SkillCardEmpty";
import { SkillCardError } from "./SkillCardError";
import styles from "./SkillList.module.css";

export function SkillList() {
  const { skills, isLoading, error, refetch } = useSkills({ limit: "20" });

  if (isLoading) return <SkillCardSkeleton count={4} />;
  if (error) return <SkillCardError onRetry={refetch} />;
  if (skills.length === 0) return <SkillCardEmpty />;

  return (
    <div className={styles.grid}>
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
```

---

# Permission-Checking Pattern

## Role gate component

File: `src/components/auth/CanAccess.tsx`

```ts
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";

interface CanAccessProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanAccess({ allowedRoles, children, fallback = null }: CanAccessProps) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

## Usage in components

```tsx
<CanAccess allowedRoles={["HR", "Administrator"]} fallback={<p>Contact HR to manage skills.</p>}>
  <SkillAssessmentForm skillId={skill.id} />
</CanAccess>
```

## Permission hook

File: `src/hooks/usePermission.ts`

```ts
import { useSession } from "next-auth/react";

export function usePermission() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "Employee";

  return {
    role,
    isAtLeast: (...roles: string[]) => roles.includes(role),
    canAccess: (...allowedRoles: string[]) => allowedRoles.includes(role),
    isEmployee: role === "Employee",
    isManager: role === "Manager",
    isHR: role === "HR",
    isLeadership: role === "Leadership",
    isAdmin: role === "Administrator",
  };
}
```

---

# Form Pattern

Use **React Hook Form** + **Zod** for all forms.

File: `src/features/skills/components/SkillAssessmentForm/SkillAssessmentForm.tsx`

```ts
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillAssessmentSchema, type SkillAssessmentInput } from "../../validations/skill.schema";
import styles from "./SkillAssessmentForm.module.css";

interface SkillAssessmentFormProps {
  skillName: string;
  currentLevel: number;
  onSubmit: (data: SkillAssessmentInput) => Promise<void>;
  onCancel?: () => void;
}

export function SkillAssessmentForm({
  skillName,
  currentLevel,
  onSubmit,
  onCancel,
}: SkillAssessmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SkillAssessmentInput>({
    resolver: zodResolver(skillAssessmentSchema),
    defaultValues: { level: currentLevel },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <h3 className={styles.title}>Assess {skillName}</h3>

      <div className={styles.field}>
        <label htmlFor="level" className={styles.label}>
          Proficiency Level
        </label>
        <select id="level" className={styles.select} {...register("level", { valueAsNumber: true })}>
          <option value={1}>1 — Beginner</option>
          <option value={2}>2 — Basic</option>
          <option value={3}>3 — Intermediate</option>
          <option value={4}>4 — Advanced</option>
          <option value={5}>5 — Expert</option>
        </select>
        {errors.level && (
          <p className={styles.error} role="alert">{errors.level.message}</p>
        )}
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Assessment"}
        </button>
      </div>
    </form>
  );
}
```

---

# Table Pattern

Use HTML tables with CSS Modules. For advanced interactions (sort, filter, pagination), keep logic in a hook.

File: `src/features/skills/components/SkillMatrixTable/SkillMatrixTable.tsx`

```ts
"use client";

import { useState, useMemo } from "react";
import type { Skill } from "../../types/skill.types";
import styles from "./SkillMatrixTable.module.css";

interface SkillMatrixTableProps {
  skills: Skill[];
  pageSize?: number;
}

type SortField = "name" | "currentLevel" | "category";
type SortDir = "asc" | "desc";

export function SkillMatrixTable({ skills, pageSize = 10 }: SkillMatrixTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return skills;
    const q = search.toLowerCase();
    return skills.filter((s) => s.name.toLowerCase().includes(q));
  }, [skills, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <input
          type="search"
          placeholder="Search skills..."
          className={styles.search}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search skills"
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} scope="col" aria-sort={sortField === "name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                <button className={styles.sortButton} onClick={() => toggleSort("name")} type="button">
                  Name{sortIndicator("name")}
                </button>
              </th>
              <th className={styles.th} scope="col" aria-sort={sortField === "currentLevel" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                <button className={styles.sortButton} onClick={() => toggleSort("currentLevel")} type="button">
                  Level{sortIndicator("currentLevel")}
                </button>
              </th>
              <th className={styles.th} scope="col" aria-sort={sortField === "category" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                <button className={styles.sortButton} onClick={() => toggleSort("category")} type="button">
                  Category{sortIndicator("category")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td className={styles.emptyCell} colSpan={3}>
                  No skills found.
                </td>
              </tr>
            ) : (
              paged.map((skill) => (
                <tr key={skill.id} className={styles.row}>
                  <td className={styles.td}>{skill.name}</td>
                  <td className={styles.td}>{skill.currentLevel}</td>
                  <td className={styles.td}>{skill.category}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          <button className={styles.pageButton} disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button className={styles.pageButton} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
```

---

# Navigation Pattern

Use Next.js `<Link>` for client-side navigation. Use `useRouter` for programmatic navigation after actions.

```tsx
import Link from "next/link";

// In a component
<Link href={`/skills/${skill.id}`} className={styles.link}>
  {skill.name}
</Link>;
```

```tsx
"use client";

import { useRouter } from "next/navigation";

export function SkillCreateButton() {
  const router = useRouter();

  return (
    <button onClick={() => router.push("/skills/new")} type="button">
      New Skill
    </button>
  );
}
```

---

# State Management

## Local state

Use `useState` for component-local state.

## Shared state

Use React Context for role/theme/session data that many components need.

```ts
// src/providers/role-provider.tsx
"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

interface RoleContextValue {
  role: string;
  isAtLeast: (...roles: string[]) => boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "Employee";

  const value: RoleContextValue = {
    role,
    isAtLeast: (roles: string[]) => roles.includes(role),
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
```

Do not add external state management libraries (Zustand, Redux, etc.) unless explicitly approved.

---

# Styling Rules

## CSS Modules

All components use CSS Modules with design tokens from `tokens/tokens.css`.

```css
/* Good */
.myClass {
  color: var(--color-primary);
  font-family: var(--font-body-large-font-family);
  font-size: var(--font-body-large-font-size);
}

/* Bad — hardcoded values */
.myClass {
  color: #1a237e;
  font-size: 16px;
}
```

## Composition

```css
.base {
  padding: 16px;
  border-radius: 8px;
}

.primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.secondary {
  background-color: var(--color-surface-variant);
  color: var(--color-on-surface-variant);
}
```

```tsx
<div className={`${styles.base} ${variant === "primary" ? styles.primary : styles.secondary}`}>
```

## Layout

Use CSS Grid and Flexbox. Avoid float-based layouts.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.flexRow {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

---

# Accessibility Rules

Required:

✓ WCAG 2.1 AA

✓ Keyboard Navigation (all interactive elements reachable via Tab)

✓ Screen Reader Support (aria-labels, aria-live regions, roles)

✓ Focus States (visible focus ring on all interactive elements)

✓ Semantic HTML (use `<button>`, `<nav>`, `<table>`, `<h1>`–`<h6>`, etc.)

✓ Form labels (every `<input>`/`<select>` has a `<label>`)

✓ Color contrast (text on background meets 4.5:1 ratio)

```css
/* Focus ring example */
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

# Mobile Rules

TalentPath is mobile-first.

Components must:

✓ Work on phones (320px+)

✓ Work on tablets (768px+)

✓ Work on desktops (1024px+)

Avoid horizontal scrolling.

```css
.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .card {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}
```

---

# Error Handling

Never show:

```text
Unhandled Exception
Database Error
Stack Trace
```

Use:

```text
Something went wrong.
Please try again.
```

Always provide a `role="alert"` on error messages so screen readers announce them.

---

# Skill Visualization Rules

Skill levels:

```text
1 — Beginner
2 — Basic
3 — Intermediate
4 — Advanced
5 — Expert
```

Every skill component should clearly show:

- Current Level
- Required Level
- Gap
- Progress

---

# Promotion Readiness Rules

Allowed statuses:

```text
Ready
Near Ready
Development Needed
```

Always display:

- Status
- Score
- Missing Requirements

---

# Learning Components Rules

Udemy Business is the primary learning provider.

Learning components should:

- Prefer Udemy content
- Display course progress
- Display learning path progress
- Display completion status
- Hide Udemy API details behind a service layer (never expose provider internals in UI)

---

# Testing Pattern

Use **Jest** + **React Testing Library**.

File: `SkillCard.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { SkillCard } from "./SkillCard";

describe("SkillCard", () => {
  const defaultProps = {
    name: "TypeScript",
    currentLevel: 3,
    requiredLevel: 4,
    category: "Technical",
  };

  it("renders the skill name", () => {
    render(<SkillCard {...defaultProps} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("shows skill gap when current is below required", () => {
    render(<SkillCard {...defaultProps} />);
    expect(screen.getByText(/gap/i)).toBeInTheDocument();
  });

  it("does not show gap when current meets required", () => {
    render(<SkillCard {...defaultProps} currentLevel={4} />);
    expect(screen.queryByText(/gap/i)).not.toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    render(<SkillCard {...defaultProps} isLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("calls onAssess when button clicked", async () => {
    const onAssess = jest.fn();
    render(<SkillCard {...defaultProps} onAssess={onAssess} />);
    await screen.getByText("Assess Skill").click();
    expect(onAssess).toHaveBeenCalledTimes(1);
  });
});
```

---

# Component Documentation

Every component should be documented with a JSDoc block at the file level and prop-level JSDoc.

```ts
/** Displays a skill card with current level, required level, and gap. */
export interface SkillCardProps extends BaseProps {
  /** The skill display name */
  name: string;
  /** Current proficiency level (1–5) */
  currentLevel: number;
  /** Minimum level required for target role */
  requiredLevel: number;
  /** Skill category label */
  category: string;
  /** Fired when user clicks "Assess Skill" */
  onAssess?: () => void;
}
```

---

# User Roles Reference

| Role          | Can                                                                             |
| ------------- | ------------------------------------------------------------------------------- |
| Employee      | View personal skills, career path, learning, opportunities, promotion readiness |
| Manager       | View team skills, team progress, assign learning, review readiness              |
| HR            | Manage frameworks, workforce analytics, succession plans, skills taxonomy       |
| Leadership    | Workforce intelligence, succession metrics, strategic dashboards                |
| Administrator | Configure platform, manage users, manage permissions                            |

---

# Component Design Standards

Every component must:

✓ Be reusable

✓ Be composable

✓ Be accessible

✓ Be mobile responsive

✓ Support loading states

✓ Support error states

✓ Support empty states

✓ Use design tokens only (no hardcoded values)

✓ Accept `className` prop for external styling

---

# Component Checklist

Before completion:

✓ Purpose Defined

✓ Permissions Verified

✓ Loading State Added

✓ Empty State Added

✓ Error State Added

✓ Responsive (mobile + tablet + desktop)

✓ Accessible (WCAG 2.1 AA, keyboard, screen reader)

✓ Design Tokens Used (no hardcoded colors/fonts)

✓ Reusable (accepts className, composable)

✓ Tested (RTL + Jest)

✓ Documented (JSDoc props + purpose)

---

# Success Criteria

A TalentPath component is successful when it:

- Supports workforce development
- Supports career growth
- Supports learning
- Supports promotion readiness
- Supports leadership succession
- Respects permissions
- Works across all devices
- Uses design tokens from `tokens/tokens.css`
- Is reusable across the platform
