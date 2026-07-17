---
trigger: always_on
---

# Code Style Rules

## Formatting

Prettier enforces all formatting. Run before every commit:

```bash
npx prettier --write .
```

Configuration (`.prettierrc`):

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

Do not override Prettier with ESLint style rules. Use ESLint only for logic errors.

---

## TypeScript

### Strict Mode

`strict: true` in `tsconfig.json`. No exceptions per-file.

### `type` vs `interface`

| Use Case                                             | Construct                         |
| ---------------------------------------------------- | --------------------------------- |
| Object shapes passed across module boundaries        | `interface`                       |
| Union types, intersection types, computed properties | `type`                            |
| Props for components                                 | `interface` + `extends BaseProps` |
| API request/response shapes                          | `type` (inferred from Zod)        |
| Public API contracts (service interfaces)            | `interface`                       |

```typescript
// interface for props
export interface SkillCardProps extends BaseProps {
  skill: Skill;
  onArchive?(id: string): Promise<void>;
}

// type for unions
export type PromotionStatus = "ready" | "near_ready" | "development_needed";

// type inferred from Zod
export type CreateSkillInput = z.infer<typeof createSkillSchema>;
```

### `unknown` over `any`

Never use `any`. Use `unknown` and narrow with Zod, type guards, or assertions.

```typescript
// bad
function parse(data: any): Skill { ... }

// good
function parse(data: unknown): Skill {
  return skillSchema.parse(data);
}
```

### `as` vs `satisfies`

- Prefer `satisfies` when you want type-checking without widening.
- Avoid `as` casts. Only use when TypeScript cannot infer correctly (e.g., `as const` for literal types).

```typescript
// good: satisfies checks the value matches the type
const config = {
  pageSize: 20,
  maxRetries: 3,
} satisfies PaginationConfig;

// better than: const config = { ... } as PaginationConfig;
```

### Generics

Use single uppercase letters (`T`, `U`, `V`) for trivial generics. Use descriptive names for domain concepts.

```typescript
// trivial
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T { ... }

// domain
export interface ListResult<TEntity> {
  data: TEntity[];
  pagination: PaginationMeta;
}
```

### `as const`

Use for literal unions, constant objects, and discriminated unions.

```typescript
export const PROMOTION_STATUSES = ["ready", "near_ready", "development_needed"] as const;
export type PromotionStatus = (typeof PROMOTION_STATUSES)[number];
```

---

## Naming

### Convention Table

| Construct                | Convention                 | Examples                                |
| ------------------------ | -------------------------- | --------------------------------------- |
| React components         | PascalCase                 | `SkillCard`, `PromotionBadge`           |
| Component files          | kebab-case                 | `skill-card.tsx`, `promotion-badge.tsx` |
| CSS module files         | kebab-case + `.module.css` | `skill-card.module.css`                 |
| Service files            | `{domain}.service.ts`      | `skill.service.ts`                      |
| Validation files         | `{domain}.schema.ts`       | `skill.schema.ts`                       |
| Hook files               | `use{Feature}.ts`          | `useSkills.ts`                          |
| Type files               | `{domain}.types.ts`        | `skill.types.ts`                        |
| Constant files           | `{domain}.constants.ts`    | `skill.constants.ts`                    |
| Server Action files      | `{action-name}.ts`         | `createSkill.ts`, `archiveSkill.ts`     |
| Functions                | camelCase                  | `getEmployeeSkills()`, `calculateGap()` |
| Variables                | camelCase                  | `employeeId`, `skillGap`                |
| Constants (module-level) | UPPER_SNAKE_CASE           | `MAX_SKILL_LEVEL`, `PROMOTION_READY`    |
| Prisma models            | PascalCase                 | `Skill`, `EmployeeSkill`, `AuditLog`    |
| Env vars                 | UPPER_SNAKE_CASE           | `DATABASE_URL`, `AUTH_SECRET`           |
| Types / Interfaces       | PascalCase                 | `Skill`, `SkillCardProps`               |
| Enum members             | UPPER_SNAKE_CASE           | `READY`, `DEVELOPMENT_NEEDED`           |

### File Extension Rules

- `.ts` — pure logic, types, services, validations, constants, config
- `.tsx` — components, hooks (if they return JSX), server actions (if they are in `app/`)
- `.module.css` — component-scoped styles

---

## Imports & Exports

### Named Exports Only

Always use named exports. No `export default`.

```typescript
// good
export function SkillCard({ skill }: SkillCardProps) { ... }

// bad
export default function SkillCard({ skill }: SkillCardProps) { ... }
```

Exception: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` in `src/app/` — Next.js requires default exports for these.

### Import Order

Group imports in this order, separated by a blank line:

1. Node built-ins (`fs`, `path`)
2. External packages (`react`, `next`, `next-auth`, `@prisma/client`, `zod`)
3. `@/` internal aliases
4. Relative imports (`./`, `../`)

Within each group, sort alphabetically.

```typescript
import { useState } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";

import { db } from "@/lib/db";
import { ForbiddenError } from "@/lib/errors";

import type { Skill } from "./skill.types";
```

### Path Aliases

Use `@/` for all imports from `src/`. Never use relative imports that traverse up more than two directories.

```typescript
// good
import { db } from "@/lib/db";
import { SkillCard } from "@/features/skills/components/SkillCard";

// avoid
import { db } from "../../../lib/db";
```

### No Barrel Files

Do not create `index.ts` barrel files that re-export multiple modules. Import directly from the file that defines the symbol. Barrel files create circular-dependency risk and hurt tree-shaking.

```typescript
// bad: features/skills/index.ts
export { SkillCard } from "./components/SkillCard";
export { skillService } from "./services/skill.service";

// good: import directly
import { SkillCard } from "@/features/skills/components/SkillCard";
import { skillService } from "@/features/skills/services/skill.service";
```

### Type Imports

Use `import type` for type-only imports. Let the auto-formatter manage this.

---

## React Components

### Component Structure

```typescript
import { type ReactNode } from "react";
import styles from "./skill-card.module.css";

export interface SkillCardProps {
  skill: Skill;
  onArchive?: (id: string) => Promise<void>;
  className?: string;
  children?: ReactNode;
  isLoading?: boolean;
  dataTestId?: string;
}

export function SkillCard({
  skill,
  onArchive,
  className,
  children,
  isLoading,
  dataTestId,
}: SkillCardProps) {
  if (isLoading) return <SkillCardSkeleton />;

  return (
    <div className={cn(styles.card, className)} data-testid={dataTestId}>
      {children}
    </div>
  );
}
```

### BaseProps Convention

Every component should accept these optional props for consistency:

```typescript
export interface BaseProps {
  className?: string;
  children?: ReactNode;
  isLoading?: boolean;
  dataTestId?: string;
}
```

Extend `BaseProps` rather than redeclaring common props:

```typescript
export interface SkillCardProps extends BaseProps {
  skill: Skill;
  onArchive?(id: string): Promise<void>;
}
```

### `"use client"` Rules

Only add `"use client"` when the component uses:

- `useState`, `useReducer`
- `useEffect` or browser-only APIs
- `useSession()` or client-side auth hooks
- Event handlers (`onClick`, `onSubmit`, `onChange`)
- `useSearchParams()`, `useRouter()`

Everything else stays as a Server Component (no directive).

### Event Handler Props

Name callback props with `on` prefix followed by the action:

```typescript
(onClick, onSubmit, onChange, onArchive, onDelete, onRetry);
```

### Hooks

Custom hooks follow the `use{Noun}` or `use{Verb}Noun` pattern:

```typescript
useSkills(); // returns { skills, isLoading, error, refetch }
useCurrentUser(); // returns { user, isLoading, error }
useSkillGap(userId); // returns { gaps, totalGap, isLoading }
```

Hooks must return a consistent shape. Use loading/error/data pattern:

```typescript
export function useSkills(params?: SkillQuery) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ... fetch logic

  return { skills, isLoading, error, refetch };
}
```

### `useMemo` / `useCallback` / `memo`

- Do not wrap everything. Profile first.
- Use `useMemo` for expensive computations (derived data, filtered lists).
- Use `useCallback` only when the function is passed as a prop to a `memo`-ized child or appears in a `useEffect` dependency array.
- Use `React.memo` only for components that render frequently with the same props (table rows, list items).

---

## CSS Modules

### File Naming

Match the component file name:

```
SkillCard.tsx          →  SkillCard.module.css
SkillMatrixTable.tsx   →  SkillMatrixTable.module.css
```

### Class Naming

Use camelCase in `.module.css` files. CSS Modules transform them to scoped hash values, so kebab-case is unnecessary.

```css
/* good */
.card { ... }
.cardTitle { ... }
.gapBadge { ... }

/* avoid */
.card-title { ... }
.gap-badge { ... }
```

### Design Tokens

Reference tokens exclusively via `var(--token-name)`. Never hardcode colors, spacing, fonts, or shadows.

```css
.card {
  background: var(--surface);
  color: var(--on-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body);
}
```

### Responsive Patterns

Use mobile-first media queries:

```css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

### `composes`

Use `composes` sparingly for shared utility classes. Prefer composition via `className` prop.

---

## Server Actions

### File Location

Place each action in `features/{domain}/actions/{actionName}.ts`:

```
features/skills/actions/
├── createSkill.ts
├── updateSkill.ts
├── archiveSkill.ts
└── assessSkill.ts
```

### Structure

```typescript
"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ForbiddenError } from "@/lib/errors";
import { skillService } from "../services/skill.service";
import { createSkillSchema } from "../validations/skill.schema";

export async function createSkill(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new ForbiddenError();

  const input = createSkillSchema.parse(Object.fromEntries(formData));
  const skill = await skillService.create(input, session.user.id);

  revalidatePath("/skills");
  return { success: true, data: skill };
}
```

### Rules

- Always call `auth()` at the top.
- Validate input with Zod before calling the service.
- Call `revalidatePath()` or `revalidateTag()` after mutations.
- Return `{ success: true, data }` or throw an error.
- Never catch errors in actions — let the error boundary handle them.

---

## Next.js Conventions

### Metadata

Each page exports `generateMetadata` or `metadata`:

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills | TalentPath",
  description: "View and manage your skills",
};
```

### Navigation

- Server: use `redirect()` from `next/navigation`.
- Client: use `useRouter()` from `next/navigation`.
- After mutations: `revalidatePath()` or `revalidateTag()`.

### Search Params

Read `searchParams` in Server Components from the page props. Mutate via `<form>` with input fields (Server Actions) or `useRouter().push()` with query strings.

---

## Prisma Conventions

### Select / Include

Only select the fields you need. Never select entire models when you need two fields.

```typescript
// good
const skill = await db.skill.findUnique({
  where: { id },
  select: { id: true, name: true, level: true },
});

// avoid
const skill = await db.skill.findUnique({ where: { id } });
```

### Transactions

Prefix transaction variables with `tx`:

```typescript
await db.$transaction(async (tx) => {
  const skill = await tx.skill.create({ data: input });
  await tx.auditLog.create({
    data: { action: "CREATE", entity: "Skill", entityId: skill.id, userId },
  });
  return skill;
});
```

### Soft Delete Filters

Every read service that queries soft-deletable entities must include:

```typescript
where: { deletedAt: null, ...otherFilters }
```

Admin/audit services may provide an `includeDeleted?: boolean` parameter.

---

## Functions

### Named Functions

Prefer named function declarations over arrow functions for exports. Arrow functions are acceptable for inline callbacks and closures.

```typescript
// good
export function calculateSkillGap(current: number, required: number): number {
  return Math.max(0, required - current);
}

// acceptable for simple closures
const sorted = items.sort((a, b) => a.level - b.level);
```

### Async

All service methods, server actions, and route handlers are `async`. Name async functions with `Async` suffix only when there is a synchronous counterpart.

### Guard Clauses

Prefer early returns over nested `if`:

```typescript
// good
function getSkillOrThrow(id: string) {
  const skill = await db.skill.findUnique({ where: { id } });
  if (!skill) throw new NotFoundError("Skill not found");
  return skill;
}

// avoid
function getSkillOrThrow(id: string) {
  const skill = await db.skill.findUnique({ where: { id } });
  if (skill) {
    return skill;
  } else {
    throw new NotFoundError("Skill not found");
  }
}
```

---

## Error Handling

### Try/Catch in Route Handlers

Every API route handler wraps its body in try/catch and returns consistent error shapes:

```typescript
try {
  const result = await skillService.list(query);
  return NextResponse.json({ success: true, data: result }, { status: 200 });
} catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.statusCode },
    );
  }
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 },
  );
}
```

### Error Boundaries

Every route segment with data fetching must have an `error.tsx` that renders the shared `<ErrorFallback>` component. Never display raw error messages or stack traces to users.

---

## State Management

| Type                              | Tool                                                        |
| --------------------------------- | ----------------------------------------------------------- |
| Server state (data from DB)       | Server Components (default), `fetch` in client components   |
| URL state (search, filters, page) | `searchParams` (server) / `useSearchParams` (client)        |
| Form state                        | React Hook Form                                             |
| UI state (open/close, selected)   | `useState` local to component                               |
| Cross-component shared state      | Prop drilling (prefer), React Context (rare, use sparingly) |

Avoid global state libraries (Redux, Zustand, Jotai) in MVP.

---

## Testing Conventions

### File Naming

```
src/features/skills/__tests__/
├── components/SkillCard.test.tsx
├── services/skill.service.test.ts
├── actions/createSkill.test.ts
└── providers/udemy.provider.test.ts
```

### `describe` / `it` Phrasing

- `describe("ComponentName")` — top-level component name.
- `describe("methodName")` — service method or action name.
- `it("renders the skill name")` — describes behavior in English.
- `it("throws ForbiddenError when user is not HR")` — describes error case.

### Mocks

- Mock at the service boundary, not Prisma directly.
- Use `vi.mock()` from Vitest.
- Keep mocks in `__mocks__/` directory adjacent to the source file.

---

## Clean Code

- No magic numbers — extract to named constants.
- Maximum nesting: 3 levels. Extract nested logic into named functions.
- No commented-out code. Delete it.
- No `console.log` in committed code. Use the logging system.
- Functions should do one thing. If a function needs "and" in its name, split it.
