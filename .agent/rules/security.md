---
trigger: always_on
---

# Security Rules

## Principles

1. **Least Privilege** — Grant minimum access required for each role.
2. **Defense in Depth** — Multiple layers of protection (auth → RBAC → validation → audit).
3. **Secure by Default** — Deny access unless explicitly granted.
4. **Never Trust Input** — Validate every boundary crossing.
5. **Audit Everything** — All mutations are logged.

OWASP Top 10 is the baseline threat model. Every feature must be reviewed against it.

---

## Authentication

TalentPath uses **NextAuth.js** with the `Credentials` provider (MVP). Expand to OAuth/SSO post-MVP.

### NextAuth Config

File: `src/lib/auth.ts`

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentialsSchema.parse(credentials);
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 }, // 24h
});
```

### Session Access

| Layer                            | Method                                   |
| -------------------------------- | ---------------------------------------- |
| Server Component / Server Action | `const session = await auth()`           |
| API Route                        | `const session = await auth()`           |
| Client Component                 | `const { data: session } = useSession()` |

Wrap the app root layout in `<SessionProvider>` for client access.

### Middleware

File: `src/middleware.ts`

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuth = !!req.auth;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!isAuth && !isAuthRoute) return NextResponse.redirect(new URL("/login", req.url));
  if (isAuth && isAuthRoute) return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
});

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
```

### Session Cookie

```typescript
// next-auth defaults:
// httpOnly: true, secure: true (prod), sameSite: "lax"
```

Never override these defaults. Never expose the session token to client-side JavaScript.

---

## Authorization (RBAC)

### Roles

```
Administrator > HR > Manager > Employee
```

### Enforcement Patterns

**Service Layer — `requireRole()`**

```typescript
import { auth } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

async function requireRole(allowed: string[]): Promise<Session> {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  if (!allowed.includes(session.user.role)) throw new ForbiddenError();
  return session;
}
```

**API Route**

```typescript
export async function POST(req: Request) {
  const session = await requireRole(["HR", "Administrator"]);
  // ...
}
```

**Server Action**

```typescript
"use server";
export async function createSkill(data: FormData) {
  const session = await requireRole(["HR", "Administrator"]);
  // ...
}
```

**Component Gate**

```tsx
<CanAccess allowedRoles={["HR", "Administrator"]} fallback={<p>Contact HR.</p>}>
  <SkillForm />
</CanAccess>
```

`CanAccess` reads `session.user.role` from `useSession()`.

### Permission Boundaries

| Role          | Can                                                                            | Cannot                                         |
| ------------- | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| Employee      | View/edit own profile, manage own skills, view career paths, view own learning | View other employees, view workforce analytics |
| Manager       | View direct reports, assign learning plans, view team metrics                  | View org-wide analytics                        |
| HR            | Manage frameworks, view workforce analytics, manage succession                 | Edit employee skills directly                  |
| Leadership    | View executive dashboards, view strategic workforce data                       | Edit any employee data                         |
| Administrator | Manage users, manage permissions, configure platform                           | (subject to audit)                             |

---

## Input Validation

### Zod Schema Validation

Every boundary crossing (API body, query params, form data, route params) must be validated with a Zod schema.

```typescript
import { z } from "zod";
import { ValidationError } from "@/lib/errors";

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new ValidationError(result.error.message);
  return result.data;
}
```

Never trust client-side validation. Server validates everything.

### SQL Injection Protection

- Use **Prisma query builders** exclusively.
- Never use `$queryRawUnsafe` or string concatenation for queries.
- Never interpolate user input into raw SQL.

```typescript
// good
await db.user.findUnique({ where: { email } });

// bad — Prisma allows this, never use
await db.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);
```

### XSS Prevention

- **Never use `dangerouslySetInnerHTML`**. If unavoidable, sanitize with DOMPurify server-side.
- React's JSX auto-escapes output. Do not bypass it with `__html`.
- Validate URLs in `href`/`src` attributes against `javascript:` protocol injection.

```typescript
// bad
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// good (static content only)
<div>{userGeneratedText}</div>
```

---

## API Security

### Security Headers

Set in `next.config.js`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
```

Every endpoint that returns JSON must set `content-type: application/json`.

### CORS

If the API is consumed from external origins (mobile app, partner portal), configure CORS explicitly:

```typescript
// in route handler
const origin = req.headers.get("origin");
const allowed = [env.APP_URL];
if (origin && !allowed.includes(origin)) {
  return NextResponse.json({ error: "Not allowed" }, { status: 403 });
}
```

For MVP, same-origin only. CORS is not needed.

### CSRF

Next.js Server Actions have built-in CSRF protection (same-origin check + cryptographic token). For API Routes:

- Validate `Origin` / `Referer` header matches `APP_URL`.
- Use `sameSite: "lax"` or `"strict"` on session cookies.
- Never support cross-origin writes in MVP.

### Rate Limiting

Apply rate limits to login, password reset, and public endpoints to prevent brute force and enumeration.

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per 60s
  analytics: true,
});

export async function checkRateLimit(identifier: string): Promise<void> {
  const { success, remaining, reset } = await ratelimit.limit(identifier);
  if (!success) throw new AppError("Too many requests. Try again later.", 429, "RATE_LIMITED");
}
```

For MVP without Redis, implement a simple in-memory sliding window (single-instance only):

```typescript
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimitMemory(identifier: string, max = 10, windowMs = 60000): void {
  const now = Date.now();
  const record = attempts.get(identifier);
  if (!record || now > record.resetAt) {
    attempts.set(identifier, { count: 1, resetAt: now + windowMs });
    return;
  }
  record.count++;
  if (record.count > max) throw new AppError("Too many requests", 429, "RATE_LIMITED");
}
```

Apply to:

- `POST /api/auth/login`
- `POST /api/auth/reset-password`
- `GET /api/opportunities` (public listing)

---

## Sensitive Data

### Classification

| Category        | Examples                               | Restriction                        |
| --------------- | -------------------------------------- | ---------------------------------- |
| PII             | Name, email, phone, address            | Visible to employee + manager + HR |
| Skills Data     | Skill levels, assessments, gaps        | Visible to employee + manager      |
| Promotion Data  | Readiness assessments, leadership eval | Manager + HR only                  |
| Succession Data | Candidate pools, risk ratings          | HR + Leadership only               |
| Audit Data      | Audit logs                             | Administrator only                 |

### Never Expose

- **Stack traces** in production error responses.
- **Database errors** (Prisma error messages, SQL).
- **Internal schema** (field names, model structures).
- **Credentials, tokens, secrets** in any response.
- **Server-only code** to client bundles. Use the `server-only` package:

```typescript
import "server-only";
// This file will throw if imported from client code
```

### Data Protection

- **In transit**: All traffic over HTTPS. HSTS header enforces it.
- **At rest**: Database encryption at rest (RDS/Cloud SQL encryption). Application-level encryption for highly sensitive fields (optional, post-MVP).
- **Passwords**: bcrypt with cost factor ≥ 12. Never plaintext.
- **API keys / tokens**: Store hashed. Only display once at creation.

### Data Retention & Deletion

- User data: retain while account active. On deletion request, soft-delete user and anonymize PII within 30 days.
- Audit logs: retain minimum 12 months (compliance).
- Learning records: retain 3 years post-completion.
- Succession data: retain 2 years after last update.

Implement a scheduled job for automated purges:

```typescript
// cron: monthly
async function purgeExpiredData(): Promise<void> {
  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 12 months
  await db.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
}
```

---

## Audit Logging

### Implementation

Architecture: every service mutation writes to the `AuditLog` model after the DB write.

```typescript
// src/features/audit/services/audit.service.ts
import { db } from "@/lib/db";

interface AuditInput {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  previous?: unknown;
  new?: unknown;
}

export async function writeAuditLog(input: AuditInput): Promise<void> {
  await db.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      previous: input.previous ?? undefined,
      new: input.new ?? undefined,
    },
  });
}
```

### Required Audits

| Event                         | Action                   | Entity              |
| ----------------------------- | ------------------------ | ------------------- |
| Skill created/updated/deleted | CREATE / UPDATE / DELETE | Skill               |
| Learning plan assigned        | CREATE                   | LearningEnrollment  |
| Learning plan completed       | UPDATE                   | LearningEnrollment  |
| Promotion assessment created  | CREATE                   | PromotionAssessment |
| Career framework changed      | UPDATE                   | CareerRole          |
| User role changed             | UPDATE                   | User / Role         |
| Permission changed            | CREATE / UPDATE / DELETE | Permission          |

### What Not to Log

- Passwords or password hashes
- Authentication tokens or session IDs
- API keys or secrets
- Personal sensitive information beyond entity IDs

---

## Logging & Monitoring (Application)

Use structured JSON logging:

```typescript
// src/lib/logger.ts
const levels = { debug: 0, info: 1, warn: 2, error: 3 } as const;

export function logger(
  level: keyof typeof levels,
  message: string,
  meta?: Record<string, unknown>,
) {
  if (levels[level] < levels[(process.env.LOG_LEVEL as keyof typeof levels) ?? "info"]) return;
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta }));
}
```

Log security events at `warn` or `error` level:

```typescript
logger("warn", "Permission violation", { userId, action, entity, ip });
logger("error", "Authentication failure", { email, ip, reason: "invalid_password" });
```

Never log: passwords, tokens, secrets, full request bodies containing sensitive data.

---

## File Upload Security

```
Allowed:
  - Images: jpg, png, webp, svg (< 5 MB)
  - Documents: pdf, docx (< 10 MB)

Rejected:
  - Executables (.exe, .bat, .sh, .dmg, .msi)
  - Archives (.zip, .rar, .7z) unless explicitly needed
  - HTML / JS / XML (XSS risk)
```

Validation pattern:

```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export function validateFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) throw new ValidationError("File type not allowed");
  if (file.size > MAX_SIZE) throw new ValidationError("File exceeds maximum size");
}
```

Store files in cloud storage (S3/R2), never on the application filesystem. Return signed, time-limited URLs for access.

---

## Environment Variables & Secrets

### Access Pattern

```typescript
// src/lib/env.ts — single source of truth
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  SMTP_HOST: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

All access goes through `env.*`, never `process.env.*`. The app crashes on startup if required variables are missing.

### Rules

- Never hardcode secrets in source code.
- Never commit `.env` files to version control.
- Never log or expose secrets to the frontend.
- Use separate secrets per environment (dev / staging / prod).
- Rotate secrets periodically (AUTH_SECRET quarterly, API keys on compromise).
- Restrict production secret access to deployment pipeline only.

### What Goes in Env

```
DATABASE_URL, AUTH_SECRET, SMTP_HOST, SMTP_USER, SMTP_PASSWORD,
STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_BUCKET, STORAGE_REGION,
ENABLE_AI_FEATURES, ENABLE_EMAIL_NOTIFICATIONS, ENABLE_AUDIT_LOGGING
```

---

## Webhook Security

If integrating with external services via webhooks:

- Validate a signature header (HMAC-SHA256) using a shared secret stored in env.
- Reject requests without a valid signature or outside a 5-minute timestamp window.
- Return 200 immediately, process asynchronously (queue or background job).
- Log all webhook events with payload hash, source IP, and outcome.

---

## Dependency Security

```
Verify before adding:
  ✅ Active maintenance (last release < 12 months)
  ✅ Community adoption (GitHub stars / npm downloads)
  ✅ Security history (no recurring CVEs)
  ✅ License compatibility (MIT, Apache 2.0, ISC)

Avoid:
  ❌ Abandoned libraries (no updates in 18+ months)
  ❌ Duplicate functionality (already in Next.js / Node.js / library X)
  ❌ Simple utilities (write inline — one fewer supply-chain risk)

Maintain:
  ✅ `npx npm audit` after every install
  ✅ `npx next build` warns on known vulnerabilities
  ✅ Remove unused deps weekly
  ✅ Patch high-severity CVEs within 7 days
```

---

## Incident Response

### Detection

Monitor in application logs:

- Repeated 401 / 403 responses from a single IP or user → possible brute force or abuse.
- `AUDIT_LOG` creation rate spikes → possible log tampering.
- `requireRole()` failures for elevated roles → possible privilege escalation attempt.
- Requests with invalid signatures or suspicious payloads → possible CSRF / injection.

### Containment

- Revoke all sessions for the affected user (clear NextAuth session).
- Rotate the affected credentials (AUTH_SECRET, API keys).
- Block the offending IP via middleware.

### Investigation

- Export audit log entries for the affected user + timeframe.
- Review access logs (IP, user-agent, timestamps).
- Determine scope: which entities were accessed, modified, or exported.

### Post-Incident

- Document timeline, root cause, impact, and resolution.
- Apply permanent fix (patch, rule change, config update).
- Verify fix with a targeted test (integration test covering the attack vector).

### Severity Levels

| Level    | Definition                                               | Response Time |
| -------- | -------------------------------------------------------- | ------------- |
| Critical | Data breach, credential compromise, privilege escalation | Immediate     |
| High     | Unauthorized access attempt, sensitive data exposure     | 1 hour        |
| Medium   | Repeated auth failures, suspicious behavior              | 24 hours      |
| Low      | Minor policy violations                                  | Next sprint   |

---

## Security Checklist

Before shipping any feature:

- [ ] Authentication enforced for all protected routes
- [ ] Authorization checked at API / Server Action / Component gate
- [ ] All inputs validated with Zod schemas
- [ ] Audit log written for every mutation
- [ ] No stack traces or DB errors exposed in responses
- [ ] No `dangerouslySetInnerHTML` used
- [ ] No secrets hardcoded or exposed to client
- [ ] Server-only imports guarded with `server-only`
- [ ] Rate limiting applied to login / password reset
- [ ] File uploads validated (type + size) if applicable
- [ ] CSP headers allow required resources only
- [ ] OWASP Top 10 reviewed against the feature
