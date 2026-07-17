---
trigger: always_on
---

# Architecture Rules

## Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **ORM**: Prisma (PostgreSQL)
- **Auth**: NextAuth.js
- **Validation**: Zod
- **Forms**: React Hook Form + `@hookform/resolvers/zod`
- **Styling**: CSS Modules + custom design tokens (`tokens/tokens.css`)

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router pages & API routes
│   ├── (auth)/                   # Auth route group (login, register)
│   ├── (dashboard)/              # Dashboard route group (requires auth)
│   ├── api/                      # API route handlers
│   └── layout.tsx                # Root layout
├── features/                     # Feature-based modules
│   ├── skills/
│   │   ├── components/           # Feature-specific React components
│   │   ├── actions/              # Server Actions
│   │   ├── services/             # Business logic layer
│   │   ├── validations/          # Zod schemas
│   │   ├── hooks/                # React hooks
│   │   ├── types/                # TypeScript types/interfaces
│   │   └── constants/            # Feature constants
│   ├── identity/                 # Auth, users, roles, permissions
│   ├── organization/             # Teams, departments
│   ├── career/                   # Career paths, roles, promotion
│   ├── learning/                 # Learning plans, resources, providers
│   ├── mentorship/               # Mentorship programs
│   ├── opportunities/            # Internal opportunities
│   ├── succession/               # Succession planning
│   └── notifications/            # Notifications
├── components/                   # Shared UI components (feature-agnostic)
├── lib/                          # Shared utilities, config, db client
│   ├── db.ts                    # Prisma client singleton
│   ├── auth.ts                  # NextAuth config
│   ├── env.ts                   # Zod-validated environment variables
│   └── errors.ts                # Error class hierarchy
├── server/                       # Server-only utilities
├── prisma/
│   └── schema.prisma            # Single source of truth for data model
├── types/                        # Global TypeScript types
└── utils/                        # Pure utility functions (no side effects)
```

### Rules

- `features/` must never import across feature boundaries except through defined service interfaces.
- `components/` must never import from `features/`.
- `lib/` must never import from `features/`, `components/`, or `app/`.
- `utils/` must be pure — no side effects, no Prisma, no auth.

---

## App Router Conventions

### File-Based Routing

```
src/app/api/skills/route.ts        → GET/POST /api/skills
src/app/api/skills/[id]/route.ts   → GET/PATCH/DELETE /api/skills/:id
src/app/(dashboard)/skills/page.tsx → /skills (authenticated)
```

### Route Groups

- `(auth)` — Public routes (login, register, password reset). No middleware auth check.
- `(dashboard)` — Authenticated routes. Middleware enforces session check.

### Loading & Error Boundaries

Every route segment that fetches data must have:

```
page.tsx          → main page
loading.tsx       → loading skeleton (same layout)
error.tsx         → error boundary (client component, "use client")
```

Layouts should remain lightweight. Heavy data fetching belongs in page components.

### Server Components First

Default to Server Components. Only add `"use client"` when you need:

- `useState` / `useEffect`
- `useContext` / browser-only APIs
- Event handlers (onClick, onSubmit)
- Custom hooks that use client features

---

## Feature Module Convention

### File Naming

| Pattern                      | Example                |
| ---------------------------- | ---------------------- |
| `{ComponentName}.tsx`        | `SkillCard.tsx`        |
| `{ComponentName}.module.css` | `SkillCard.module.css` |
| `{domain}.service.ts`        | `skill.service.ts`     |
| `{domain}.schema.ts`         | `skill.schema.ts`      |
| `use{Feature}.ts`            | `useSkills.ts`         |
| `{domain}.types.ts`          | `skill.types.ts`       |
| `{domain}.constants.ts`      | `skill.constants.ts`   |

### Service Layer Rules

- Services are the **only** code that imports `prisma` or `db`.
- Services return plain objects (never Prisma types directly — map them).
- Services throw typed errors from `lib/errors.ts`, never raw Prisma errors.
- Services handle authorization checks for the current user.

### Server Actions

Use Server Actions for form submissions that:

- Mutate a single entity
- Require user session context
- Return form validation errors

Use API Routes for:

- Complex queries with pagination, filtering, sorting
- External API proxying
- Bulk operations
- Webhooks

---

## Auth Architecture

### NextAuth Configuration

File: `src/lib/auth.ts`

```
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials({ ... })],
  callbacks: {
    async jwt({ token, user }) { ... },
    async session({ session, token }) { ... },
  },
})
```

### Middleware

File: `src/middleware.ts`

- Checks session validity for `(dashboard)` routes.
- Redirects unauthenticated users to `/login`.
- Redirects authenticated users away from `(auth)` routes.

### Session Access

- **Server Components / Server Actions**: Use `auth()` from `src/lib/auth.ts`.
- **Client Components**: Use `useSession()` from `next-auth/react` with `SessionProvider` in root layout.
- **API Routes**: Use `auth()` or get session from request headers.

---

## RBAC Enforcement

### Role Hierarchy

```
Administrator > HR > Manager > Employee
```

### Enforcement Points

| Layer          | Mechanism                                                  |
| -------------- | ---------------------------------------------------------- |
| Middleware     | Reject unauthenticated requests at route-group level       |
| API Routes     | `requireRole(user, ["HR", "Administrator"])` guard         |
| Server Actions | `requireRole(session, ["Manager", "HR"])` at top of action |
| Components     | `<CanAccess allowedRoles={["HR"]}>...</CanAccess>` wrapper |

### Permission Check Pattern

```
// service layer
import { ForbiddenError } from "@/lib/errors"

function requireRole(user: User, allowed: Role[]): void {
  if (!allowed.includes(user.role)) throw new ForbiddenError()
}
```

### Component Gate

```
<CanAccess allowedRoles={["HR", "Administrator"]} fallback={<p>Contact HR.</p>}>
  <SkillForm />
</CanAccess>
```

`CanAccess` reads role from `useSession()`. Implement once in `src/components/CanAccess/CanAccess.tsx`.

---

## Prisma Architecture

### Client Singleton

File: `src/lib/db.ts`

```
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

### Query Location

- All Prisma queries live in **service files** (`features/{domain}/services/`).
- Never call `db.*` from API routes, components, or actions directly.
- Services compose multiple Prisma calls into single business operations.

### Migration Workflow

```
npx prisma migrate dev --name <kebab-case-description>
npx prisma migrate deploy           # production
npx prisma generate                 # after schema changes
```

See `db-migration-runner` skill for full migration patterns.

---

## Data Flow Architecture

```
[PostgreSQL]
     ↓  (Prisma queries)
[Service Layer]  →  throws typed errors
     ↓
[API Route / Server Action]  →  Zod validation, auth guard, audit log
     ↓
[Client (fetch / useAction)]  →  loading, error, success states
     ↓
[Component]  →  renders data, handles empty/error/loading
```

### Two-Way Mutation Flow

```
[Form] → [Server Action] → [Service] → [DB]
    ↓                          ↓
[revalidatePath()]        [Audit Log]
```

---

## Error Handling Architecture

### Error Classes

File: `src/lib/errors.ts`

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
  }
}
export class NotFoundError extends AppError {
  constructor(msg = "Resource not found") {
    super(msg, 404, "NOT_FOUND");
  }
}
export class ValidationError extends AppError {
  constructor(msg = "Validation failed") {
    super(msg, 400, "VALIDATION_ERROR");
  }
}
export class ForbiddenError extends AppError {
  constructor(msg = "Access denied") {
    super(msg, 403, "FORBIDDEN");
  }
}
export class UnauthorizedError extends AppError {
  constructor(msg = "Authentication required") {
    super(msg, 401, "UNAUTHORIZED");
  }
}
```

### API Error Response Shape

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Skill not found"
  }
}
```

### Error Boundary

Every `error.tsx` at route segment level uses a shared `<ErrorFallback>` component. Never show raw stack traces in production.

---

## Validation Architecture

### Zod Schemas

- Every API input (query params, body, form data) must have a Zod schema.
- Schemas live in `features/{domain}/validations/{domain}.schema.ts`.
- Forms use `zodResolver(schema)` from `@hookform/resolvers/zod`.
- Udemy/3rd-party API responses validated at the provider boundary.

### `validate()` Helper

```typescript
import { z } from "zod";
import { ValidationError } from "@/lib/errors";

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new ValidationError(result.error.message);
  return result.data;
}
```

---

## Environment Variables

File: `src/lib/env.ts`

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

All environment access goes through `env.*`, never `process.env.*` directly. The app must crash on startup if required variables are missing.

---

## Audit-First Design

### Audit Log Schema

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // "CREATE", "UPDATE", "DELETE"
  entity      String   // "Skill", "LearningPlan", "PromotionAssessment"
  entityId    String
  previous    Json?    // snapshot of previous values
  new         Json?    // snapshot of new values
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}
```

### Audit All Mutations

Every service mutation must write an audit log after the DB write. Use a helper:

```typescript
async function audit({
  action,
  entity,
  entityId,
  previous,
  new: newValues,
  userId,
}: AuditInput): Promise<void> {
  await db.auditLog.create({
    data: { action, entity, entityId, previous, new: newValues, userId },
  });
}
```

Entities requiring audit: Skill, LearningPlan, LearningEnrollment, PromotionAssessment, CareerRole, Permission, Role.

---

## Soft Deletes

Use a `deletedAt DateTime?` field instead of hard deletes for:

- Skills
- CareerPath / CareerRole
- LearningResource
- InternalOpportunity
- User

Services filter by `{ deletedAt: null }` in all read queries. Admin/audit queries may include soft-deleted records explicitly.

---

## Pagination Strategy

### Offset Pagination (default)

```
GET /api/skills?page=1&pageSize=20

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### Cursor Pagination (for high-volume endpoints)

```
GET /api/audit-logs?cursor=abc123&limit=50

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

Default `pageSize` is 20, max 100. Validate with Zod.

---

## Provider / Interface Pattern

Every external integration must be behind an interface defined in `features/{domain}/types/`.

```typescript
// features/learning/types/learning.types.ts
export interface LearningProvider {
  searchCourses(params: ProviderSearchParams): Promise<Course[]>;
  getCourse(id: string): Promise<Course>;
  syncAll(): Promise<SyncResult>;
}
```

Concrete implementations in `features/{domain}/providers/{provider-name}/`:

```
features/learning/providers/
├── udemy/
│   ├── client.ts
│   ├── mapper.ts
│   ├── types.ts
│   └── udemy.provider.ts
├── internal/
│   └── internal.provider.ts
└── index.ts       // provider registry
```

No feature code outside `providers/` imports a provider directly. All consumption goes through `features/{domain}/services/` which uses the interface.

---

## Cross-Feature Communication

- Features communicate through **service interfaces**, never through direct imports of components or actions.
- Shared types live in `src/types/`.
- Shared UI components live in `src/components/`.
- A feature may import from `lib/`, `utils/`, `components/`, `types/`, and `prisma/`.
- A feature must NOT import from another feature's `components/`, `actions/`, `hooks/`, or `constants/`.
- Cross-feature imports of `services/` are allowed only when the target feature explicitly exports a public service interface.

---

## Testing Architecture

### Directory

```
src/features/{domain}/__tests__/
├── components/
├── services/
├── actions/
└── providers/
```

### Framework

- Unit / Integration: Vitest
- Component: Vitest + `@testing-library/react`
- E2E: Playwright

### Testing Rules

- Every service method must have a unit test.
- Every API route must have an integration test.
- Every component must have a smoke test (renders without crash).
- Provider implementations must have a contract test against the interface.

---

## Domain Boundaries (Complete)

### Identity

- User, Role, Permission

### Organization

- Team, Department

### Skills

- Skill, SkillCategory, EmployeeSkill, SkillGap

### Career

- CareerPath, CareerRole, PromotionAssessment

### Learning

- LearningPlan, LearningEnrollment, LearningResource

### Mentorship

- MentorshipProgram, MentorshipEnrollment

### Opportunities

- InternalOpportunity, OpportunityApplication

### Succession

- SuccessionCandidate

### Platform

- Notification, AuditLog

---

## Scalability Rules

- Aggregate analytics in background jobs, never on page render.
- Use database-level aggregations (SQL `COUNT`, `AVG`, `GROUP BY`) over in-memory processing.
- Cache dashboard summaries in a `DashboardCache` table updated hourly.
- Design for thousands of employees, multiple departments, multiple business units.
- Do NOT design for multi-tenancy in MVP.
