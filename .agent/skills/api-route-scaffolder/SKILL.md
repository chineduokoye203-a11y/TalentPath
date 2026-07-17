# API Route Scaffolder Skill

## Purpose

Generate secure, consistent, and audited API routes for TalentPath.

Use this skill whenever creating:

- CRUD Endpoints
- Dashboard APIs
- Analytics APIs
- Learning APIs
- Skills APIs
- Career APIs

---

# Architecture

Framework:

- Next.js Route Handlers

Pattern:

```text
src/app/api/{resource}/route.ts
src/app/api/{resource}/[id]/route.ts
```

Examples:

```text
src/app/api/skills/route.ts
src/app/api/skills/[id]/route.ts
```

---

# File Scaffolding

Every resource generates up to 6 files:

```text
src/
├── app/api/
│   └── {resource}/
│       ├── route.ts                          # GET (list), POST (create)
│       └── [id]/
│           └── route.ts                      # GET (by id), PATCH, DELETE
└── features/
    └── {domain}/
        ├── services/
        │   └── {resource}.service.ts         # business logic
        ├── validations/
        │   └── {resource}.schema.ts          # Zod schemas
        └── types/
            └── {resource}.types.ts           # request/response types
```

---

# Standard Response Format

## Success

```json
{
  "success": true,
  "data": {}
}
```

HTTP status:

- `200` — Read / Update success
- `201` — Create success

## Error

```json
{
  "success": false,
  "message": "Error message"
}
```

HTTP status:

- `400` — Validation error
- `401` — Unauthenticated
- `403` — Unauthorized
- `404` — Not found
- `409` — Conflict (duplicate)
- `500` — Internal server error

## Paginated List

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

# Build Process

## Step 1 — Identify resource

Choose the entity.

Examples:

- Skill
- EmployeeSkill
- LearningPlan
- CareerPath

---

## Step 2 — Determine operations

Select HTTP methods needed:

| Method | Action    | File                       |
| ------ | --------- | -------------------------- |
| GET    | List all  | `{resource}/route.ts`      |
| POST   | Create    | `{resource}/route.ts`      |
| GET    | Get by ID | `{resource}/[id]/route.ts` |
| PATCH  | Update    | `{resource}/[id]/route.ts` |
| DELETE | Delete    | `{resource}/[id]/route.ts` |

---

## Step 3 — Define Zod schemas

File: `src/features/{domain}/validations/{resource}.schema.ts`

```ts
import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(1).max(100),
  categoryId: z.string().uuid(),
  description: z.string().max(500).optional(),
});

export const updateSkillSchema = createSkillSchema.partial();

export const skillQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
export type SkillQuery = z.infer<typeof skillQuerySchema>;
```

---

## Step 4 — Implement service layer

File: `src/features/{domain}/services/{resource}.service.ts`

```ts
import { prisma } from "@/lib/prisma";
import type { CreateSkillInput, UpdateSkillInput, SkillQuery } from "../validations/skill.schema";

export const skillService = {
  async list(query: SkillQuery) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.skill.findMany({
        skip,
        take: limit,
        where: {
          name: query.search ? { contains: query.search, mode: "insensitive" } : undefined,
          categoryId: query.categoryId,
        },
        orderBy: { name: "asc" },
      }),
      prisma.skill.count({
        where: {
          name: query.search ? { contains: query.search, mode: "insensitive" } : undefined,
          categoryId: query.categoryId,
        },
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundError("Skill not found");
    return skill;
  },

  async create(input: CreateSkillInput, userId: string) {
    return prisma.skill.create({
      data: { ...input, createdBy: userId },
    });
  },

  async update(id: string, input: UpdateSkillInput, userId: string) {
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Skill not found");

    return prisma.skill.update({
      where: { id },
      data: { ...input, updatedBy: userId },
    });
  },

  async remove(id: string) {
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Skill not found");

    return prisma.skill.delete({ where: { id } });
  },
};
```

---

## Step 5 — Create route handlers

### Collection routes

File: `src/app/api/{resource}/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { authorize } from "@/lib/authorize";
import { validate } from "@/lib/validate";
import { handleError } from "@/lib/error-handler";
import { audit } from "@/lib/audit";
import { skillService } from "@/features/skills/services/skill.service";
import { createSkillSchema, skillQuerySchema } from "@/features/skills/validations/skill.schema";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    authorize(user, ["Employee", "Manager", "HR", "Leadership", "Administrator"]);

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = validate(skillQuerySchema, params);
    const result = await skillService.list(query);

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    authorize(user, ["HR", "Administrator"]);

    const body = await request.json();
    const input = validate(createSkillSchema, body);
    const skill = await skillService.create(input, user.id);

    await audit({
      user: user.id,
      action: "CREATE",
      entity: "Skill",
      entityId: skill.id,
      newValue: input,
    });

    return NextResponse.json({ success: true, data: skill }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
```

### Single resource routes

File: `src/app/api/{resource}/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { authorize } from "@/lib/authorize";
import { validate } from "@/lib/validate";
import { handleError } from "@/lib/error-handler";
import { audit } from "@/lib/audit";
import { skillService } from "@/features/skills/services/skill.service";
import { updateSkillSchema } from "@/features/skills/validations/skill.schema";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(_request);
    authorize(user, ["Employee", "Manager", "HR", "Leadership", "Administrator"]);

    const { id } = await params;
    const skill = await skillService.getById(id);

    return NextResponse.json({ success: true, data: skill }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticate(request);
    authorize(user, ["HR", "Administrator"]);

    const { id } = await params;
    const body = await request.json();
    const input = validate(updateSkillSchema, body);
    const previous = await skillService.getById(id);
    const skill = await skillService.update(id, input, user.id);

    await audit({
      user: user.id,
      action: "UPDATE",
      entity: "Skill",
      entityId: id,
      oldValue: previous,
      newValue: input,
    });

    return NextResponse.json({ success: true, data: skill }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticate(_request);
    authorize(user, ["Administrator"]);

    const { id } = await params;
    const previous = await skillService.getById(id);
    await skillService.remove(id);

    await audit({
      user: user.id,
      action: "DELETE",
      entity: "Skill",
      entityId: id,
      oldValue: previous,
    });

    return NextResponse.json({ success: true, data: null }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
```

---

## Step 6 — Wire up reusable utilities

### Authenticate

File: `src/lib/auth.ts`

```ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function authenticate(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AuthenticationError("Authentication required");
  }
  return session.user;
}
```

### Authorize

File: `src/lib/authorize.ts`

```ts
export function authorize(user: User, allowedRoles: string[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError("Insufficient permissions");
  }
}
```

### Validate

File: `src/lib/validate.ts`

```ts
import { ZodSchema } from "zod";

export function validate<T>(schema: ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.flatten().fieldErrors);
  }
  return result.data;
}
```

### Error handler

File: `src/lib/error-handler.ts`

```ts
import { NextResponse } from "next/server";

export function handleError(error: unknown) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: error.fieldErrors },
      { status: 400 },
    );
  }

  if (error instanceof AuthenticationError) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json({ success: false, message: error.message }, { status: 403 });
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json({ success: false, message: error.message }, { status: 404 });
  }

  console.error("Unhandled error:", error);

  return NextResponse.json(
    { success: false, message: "Unable to process your request." },
    { status: 500 },
  );
}
```

### Audit

File: `src/lib/audit.ts`

```ts
import { prisma } from "@/lib/prisma";

interface AuditInput {
  user: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export async function audit(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      userId: input.user,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
    },
  });
}
```

---

# Security Rules

Every route must:

✓ Authenticate user session

✓ Authorize against allowed roles

✓ Validate all input via Zod

✓ Sanitize data (via Prisma parameterized queries)

✓ Handle errors gracefully (never expose internals)

✓ Log security-relevant actions

---

# Audit Logging

Create audit records for all write operations:

- Create
- Update
- Delete

Record:

```text
User ID
Action (CREATE | UPDATE | DELETE)
Entity name
Entity ID
Previous value (for update/delete)
New value (for create/update)
Timestamp (auto via Prisma)
```

---

# Example Resources

## Skills

```text
GET    /api/skills              → skillService.list()
POST   /api/skills              → skillService.create()
GET    /api/skills/:id          → skillService.getById()
PATCH  /api/skills/:id          → skillService.update()
DELETE /api/skills/:id          → skillService.remove()
```

## Learning Plans

```text
GET    /api/learning-plans       → learningPlanService.list()
POST   /api/learning-plans       → learningPlanService.create()
GET    /api/learning-plans/:id   → learningPlanService.getById()
PATCH  /api/learning-plans/:id   → learningPlanService.update()
```

## Career Paths

```text
GET    /api/career-paths         → careerPathService.list()
GET    /api/career-paths/:id     → careerPathService.getById()
```

---

# Role Mapping Reference

| Role          | Read Own | Read Team | Read All  | Write   |
| ------------- | -------- | --------- | --------- | ------- |
| Employee      | ✓        |           |           |         |
| Manager       | ✓        | ✓         |           | limited |
| HR            | ✓        | ✓         | ✓         | ✓       |
| Leadership    | ✓        |           | aggregate |         |
| Administrator | ✓        | ✓         | ✓         | ✓       |

---

# Naming Conventions

## Files

```text
kebab-case for directories and filenames
route.ts for route handlers
{resource}.service.ts for services
{resource}.schema.ts for Zod schemas
{resource}.types.ts for TypeScript types
```

## Exports

```text
export const {resource}Service = { ... }
Named exports for GET, POST, PATCH, DELETE in route.ts
```

---

# Error Classes

File: `src/lib/errors.ts`

```ts
export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends Error {
  fieldErrors: Record<string, string[]>;
  constructor(fieldErrors: Record<string, string[]>) {
    super("Validation failed");
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}
```

---

# Additional Considerations

## Rate Limiting

Apply rate limits to sensitive endpoints:

- Login / Password reset
- Public-facing endpoints

## CORS

If routes are consumed by external services, handle OPTIONS preflight with appropriate headers.

## Soft Deletes

For entities that should not be permanently deleted (e.g., Employee records), use a `deletedAt` timestamp instead of Prisma `delete()`. Add `where: { deletedAt: null }` to all queries.

---

# Success Criteria

Route:

✓ Secure (authenticated + authorized)

✓ Validated (Zod on all inputs)

✓ Audited (create/update/delete)

✓ Consistent (same structure, same error format)

✓ RESTful (correct methods and status codes)

✓ Paginated (list endpoints)

✓ Error-safe (no stack traces, no internals exposed)

✓ Production-ready
