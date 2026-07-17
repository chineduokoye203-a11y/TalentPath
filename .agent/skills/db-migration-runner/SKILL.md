# Database Migration Runner Skill

## Purpose

Create and manage safe database migrations for TalentPath.

Use whenever:

- Adding tables
- Modifying schemas
- Creating relationships
- Adding indexes
- Updating constraints
- Adding seed data

---

# Database Context

Database:

- PostgreSQL

ORM:

- Prisma

Schema file:

```text
prisma/schema.prisma
```

Migration directory (auto-generated, commit to source control):

```text
prisma/migrations/
```

---

# Core Entities

All entities from AGENTS.md mapped to Prisma models:

```prisma
// Identity
model User { ... }
model Role { ... }
model Permission { ... }

// Organization
model Department { ... }
model Team { ... }

// Skills
model SkillCategory { ... }
model Skill { ... }
model EmployeeSkill { ... }
model SkillGap { ... }

// Career
model CareerPath { ... }
model CareerRole { ... }
model PromotionAssessment { ... }

// Learning
model LearningPlan { ... }
model LearningEnrollment { ... }
model LearningResource { ... }

// Opportunities
model InternalOpportunity { ... }
model OpportunityApplication { ... }

// Succession
model SuccessionCandidate { ... }

// Platform
model Notification { ... }
model AuditLog { ... }
```

---

# Required Field Pattern

Every model must include these fields:

```prisma
model Skill {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Where applicable (audit-enabled entities):

```prisma
model Skill {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?
  updatedBy String?
  creator   User?    @relation(fields: [createdBy], references: [id])
  updater   User?    @relation(fields: [updatedBy], references: [id])
}
```

---

# Full Model Examples

## Basic model with fields, defaults, and unique constraint

```prisma
model Skill {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  categoryId  String
  category    SkillCategory @relation(fields: [categoryId], references: [id])
  level       Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  creator     User?    @relation(fields: [createdBy], references: [id])

  @@index([categoryId])
  @@index([name])
}
```

## Model with enum

```prisma
enum PromotionStatus {
  Ready
  NEAR_READY
  DEVELOPMENT_NEEDED
}

model PromotionAssessment {
  id         String           @id @default(cuid())
  userId     String
  user       User             @relation(fields: [userId], references: [id])
  status     PromotionStatus
  score      Int              @default(0)
  notes      String?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  @@index([userId])
  @@index([status])
}
```

## Many-to-many with composite unique

```prisma
model EmployeeSkill {
  userId    String
  user      User   @relation(fields: [userId], references: [id])
  skillId   String
  skill     Skill  @relation(fields: [skillId], references: [id])
  level     Int    @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@id([userId, skillId])
  @@index([skillId])
}
```

---

# Naming Rules

Models: Singular PascalCase

```prisma
model SkillCategory  // ✓
model SkillCategorys // ✗
```

Fields: camelCase

```prisma
categoryId // ✓
category_id // ✗
```

Enums: PascalCase

```prisma
enum PromotionStatus {
  Ready
  NEAR_READY
  DEVELOPMENT_NEEDED
}
```

---

# Relationship Rules

## One-to-many

```prisma
model SkillCategory {
  id     String  @id @default(cuid())
  name   String  @unique
  skills Skill[]
}

model Skill {
  id         String        @id @default(cuid())
  categoryId String
  category   SkillCategory @relation(fields: [categoryId], references: [id])
}
```

## Many-to-many (explicit junction table)

```prisma
model User {
  id             String           @id @default(cuid())
  employeeSkills EmployeeSkill[]
}

model Skill {
  id             String           @id @default(cuid())
  employeeSkills EmployeeSkill[]
}

model EmployeeSkill {
  userId  String
  user    User   @relation(fields: [userId], references: [id])
  skillId String
  skill   Skill  @relation(fields: [skillId], references: [id])

  @@id([userId, skillId])
}
```

## One-to-one

```prisma
model User {
  id             String           @id @default(cuid())
  successionCandidate SuccessionCandidate?
}

model SuccessionCandidate {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

---

# Index Rules

Add indexes for:

- Foreign keys (Prisma auto-suggests these, add explicitly)
- Frequently queried fields
- Lookup fields (email, name, status)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())

  @@index([roleId])
  @@index([name])
}
```

## Composite indexes

```prisma
@@index([departmentId, roleId])
@@index([status, createdAt])
```

---

# Migration Process

## Step 1 — Analyze the change

Identify what needs to change:

- New entity → create new model
- New field → add to existing model
- New relationship → add relation field + foreign key
- Schema change → modify field type, rename, etc.

## Step 2 — Identify impact

Check:

- Existing relationships that may break
- Existing data that may need migration
- Existing queries that may need updating
- Downstream consumers (API routes, services)

## Step 3 — Update Prisma schema

Edit `prisma/schema.prisma` with the required changes.

For new models, follow the patterns above (fields, relations, indexes, enums).

For existing models:

```prisma
// Before
model Skill {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
}

// After — added categoryId relation and level
model Skill {
  id          String        @id @default(cuid())
  name        String        @unique
  description String?
  categoryId  String
  category    SkillCategory @relation(fields: [categoryId], references: [id])
  level       Int           @default(1)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([categoryId])
}
```

## Step 4 — Generate migration

```bash
npx prisma migrate dev --name add-skill-category-relation
```

Naming convention:

```text
add-{entity}-{field}
add-{entity}
add-{relation}-to-{entity}
rename-{field}-on-{entity}
remove-{entity}
```

Examples:

```text
npx prisma migrate dev --name add-skill-category
npx prisma migrate dev --name add-category-relation-to-skill
npx prisma migrate dev --name add-level-field-to-skill
npx prisma migrate dev --name create-promotion-assessment
npx prisma migrate dev --name add-unique-constraint-to-email
```

## Step 5 — Review migration

Check the generated SQL in `prisma/migrations/<timestamp>_<name>/migration.sql`:

```sql
-- Example generated migration
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");
CREATE INDEX "Skill_categoryId_idx" ON "Skill"("categoryId");

ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

Verify:

✓ Constraints correct

✓ Foreign keys point to right tables

✓ Indexes created for performance

✓ Nullability matches schema

✓ Default values correct

✓ No unintended destructive changes

## Step 6 — Apply migration

### Development

```bash
# Generate + apply migration (auto)
npx prisma migrate dev --name descriptive-name

# If migration already exists, apply pending
npx prisma migrate dev

# Regenerate Prisma client after migration
npx prisma generate
```

### Production

```bash
# Apply pending migrations (no new migration created)
npx prisma migrate deploy

# Regenerate client on production build
npx prisma generate
```

## Step 7 — Verify schema

Confirm in Prisma Studio or by querying:

```bash
# Open Prisma Studio to inspect data
npx prisma studio

# Or verify via CLI
npx prisma db execute --stdin <<< "SELECT * FROM \"Skill\" LIMIT 1;"
```

Check:

- Tables created correctly
- Relationships working
- Indexes applied
- Existing data preserved
- New data can be inserted

---

# Data Migrations

When a schema change requires transforming existing data:

```prisma
// Example: adding a non-nullable field with a default based on existing data
model User {
  id        String   @id @default(cuid())
  fullName  String   // new field, previously firstName + lastName
}
```

Create the migration, then use `apply` to backfill:

```bash
npx prisma migrate dev --name add-full-name-to-user
```

Open the generated migration SQL and add a data migration step:

```sql
-- Add the column as nullable first (Prisma handles this)
-- Then backfill existing rows
UPDATE "User" SET "fullName" = COALESCE("firstName" || ' ' || "lastName", 'Unknown');
```

For complex data transformations, create a standalone script:

File: `prisma/scripts/backfill-full-name.ts`

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { fullName: null },
  });

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      },
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

# Seeding

File: `prisma/seed.ts`

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.skillCategory.create({
    data: { name: "Technical" },
  });

  await prisma.skill.createMany({
    data: [
      { name: "TypeScript", categoryId: category.id },
      { name: "React", categoryId: category.id },
      { name: "Node.js", categoryId: category.id },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Configure in `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run:

```bash
npx prisma db seed
```

---

# Rollback Strategy

## Development

```bash
# Roll back to a specific migration
npx prisma migrate dev --name <migration-name> --create-only
# Then manually reset if needed
npx prisma migrate reset
```

`migrate reset` will:

1. Drop all tables
2. Re-apply all migrations
3. Run seed script

## Production

Never reset production. To roll back:

1. Create a new migration that reverses the change
2. Deploy as a standard migration

```prisma
// Reverse migration example: remove a column that was added
model Skill {
  // Remove the line that was added
  // level Int @default(1)
}
```

```bash
npx prisma migrate dev --name revert-add-level-field-to-skill
npx prisma migrate deploy  # on production
```

---

# Schema Drift

If the database schema drifts from the Prisma schema:

```bash
# Check drift
npx prisma migrate diff

# Reset to match schema (dev only)
npx prisma migrate reset
```

For production drift, create a new migration that resolves the difference rather than modifying existing migration files.

---

# Quick Command Reference

| Action                          | Command                                |
| ------------------------------- | -------------------------------------- |
| Create + apply migration (dev)  | `npx prisma migrate dev --name <name>` |
| Apply pending migrations (prod) | `npx prisma migrate deploy`            |
| Regenerate Prisma client        | `npx prisma generate`                  |
| Reset database (dev)            | `npx prisma migrate reset`             |
| Open Prisma Studio              | `npx prisma studio`                    |
| Run seed                        | `npx prisma db seed`                   |
| Push schema directly (dev)      | `npx prisma db push`                   |
| View migration status           | `npx prisma migrate status`            |

---

# Migration Rules

Every migration must:

- Be reversible (have a rollback path)
- Preserve data integrity
- Be reviewed before execution (check generated SQL)
- Be committed to source control (include `prisma/migrations/`)
- Include indexes for all foreign keys

---

# Dangerous Operations

Require explicit approval before executing:

- `DROP TABLE` — permanent data loss
- `DROP COLUMN` — data loss unless backed up
- `ALTER COLUMN ... DROP NOT NULL` — may break application
- Data deletion / truncation
- Relationship removal
- Renaming columns (Prisma doesn't detect renames automatically)

For renames, use a two-step process:

```prisma
// Step 1: Add new field, keep old, migrate data
model User {
  oldField String @map("old_field_name")
  newField String @map("new_field_name")
}

// After data migration:
// Step 2: Remove old field
model User {
  // oldField removed
  newField String @map("new_field_name")
}
```

---

# Audit Requirements

Schema changes must be documented.

Record for every migration:

```text
Migration Name
Date
Purpose
Affected Tables
Reviewed By
```

---

# Success Criteria

Migration:

✓ Safe (no unintended data loss)

✓ Reversible (rollback path exists)

✓ Indexed (foreign keys + query fields indexed)

✓ Validated (generated SQL reviewed)

✓ Committed (migration files in version control)

✓ Seeded (seed data updated if needed)

✓ Production Ready (dev → deploy → generate)
