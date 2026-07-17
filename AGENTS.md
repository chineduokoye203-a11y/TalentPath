# AGENTS.md

## Project Name

TalentPath

---

# Mission

TalentPath is a workforce development and talent intelligence platform that helps organizations:

- Identify employee skill gaps
- Improve workforce capabilities
- Increase employee retention
- Improve internal mobility
- Build leadership succession pipelines
- Develop future-ready teams

The platform serves:

1. Employees
2. Line Managers
3. HR Teams
4. Executive Leadership

Every feature, workflow, schema, API, and UI component must support at least one of these goals.

If a feature does not contribute directly to workforce development, career growth, skills intelligence, internal mobility, or succession planning, it should not be included in the MVP.

---

# Product Vision

Create a centralized workforce development platform that helps organizations continuously develop, retain, and promote talent from within.

The platform should become the single source of truth for:

- Skills
- Learning
- Career paths
- Promotion readiness
- Internal opportunities
- Succession planning

---

# Core Product Principles

## Principle 1: Skills First

Skills are the foundation of the platform.

Every major workflow should connect back to:

- Skill assessment
- Skill growth
- Skill gap identification
- Skill readiness

---

## Principle 2: Career Growth

Employees should always be able to answer:

- Where am I now?
- What role can I move into next?
- What skills am I missing?
- What should I learn next?

---

## Principle 3: Workforce Intelligence

Managers and HR should always be able to answer:

- What skills exist today?
- What skills are missing?
- Who is ready for promotion?
- Where are succession risks?

---

## Principle 4: Internal Mobility

The system should prioritize internal growth before external hiring.

---

## Principle 5: Leadership Readiness

Leadership development and succession planning are first-class features.

---

# Technical Architecture

## Required Stack

### Frontend

- **Framework**: Next.js (App Router)
- **Styling**: CSS Modules + custom design tokens (`tokens/tokens.css`)
- **Forms**: React Hook Form + `@hookform/resolvers/zod`
- **Icons**: `lucide-react`

### Backend

- **Runtime**: Next.js Route Handlers / API Routes + Server Actions
- **Validation**: Zod (every API input, form, and external API response)
- **Auth**: NextAuth.js

### Data

- **ORM**: Prisma
- **Database**: PostgreSQL

### Testing

- **Unit / Integration**: Vitest + `@testing-library/react`
- **E2E**: Playwright

### Tooling

- **Formatting**: Prettier (run before every commit)

### Architecture Style

- Modular Architecture
- API First
- Server Actions where appropriate
- Role Based Access Control (RBAC)
- Audit First Design

### Implementation Rules

Detailed, enforceable rules for architecture, code style, design system, and security live in:

→ `.agent/rules/architecture.md`
→ `.agent/rules/code-style.md`
→ `.agent/rules/design-system.md`
→ `.agent/rules/security.md`

Reusable, step-by-step scaffolding skills for common tasks live in:

→ `.agent/skills/api-route-scaffolder/SKILL.md`
→ `.agent/skills/component-builder/SKILL.md`
→ `.agent/skills/db-migration-runner/SKILL.md`
→ `.agent/skills/udemy-business-integration/SKILL.md`

Consult these files whenever the task matches their domain.

---

### Project Structure

```
.agent/
├── rules/          → Architecture, code style, design system, security
└── skills/         → API, component, DB, Udemy scaffolding
tokens/             → CSS design tokens (colors, typography, spacing)
src/
├── app/            → Next.js App Router pages + API routes
├── features/       → Feature-based modules (skills, career, learning, ...)
├── components/     → Shared UI components (Button, Table, Modal, ...)
├── lib/            → Config, db client, auth, env, errors
├── prisma/         → Schema + migrations
├── types/          → Global TypeScript types
└── utils/          → Pure utility functions
```

---

# Environment Variables

## Environment Variable Rules

The application must never hardcode:

- Database credentials
- Authentication secrets
- API keys
- SMTP credentials
- Third-party service credentials
- Storage credentials

All configuration must be loaded from environment variables.

---

## Required Environment Variables

### Application

```env
NODE_ENV=
APP_NAME=TalentPath
APP_URL=
```

Examples:

```env
NODE_ENV=development
APP_NAME=TalentPath
APP_URL=http://localhost:3000
```

---

### Database

```env
DATABASE_URL=
```

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/talentpath
```

Used for:

- Prisma
- PostgreSQL Connections
- Database Migrations

---

### Authentication

```env
AUTH_SECRET=
AUTH_URL=
```

Example:

```env
AUTH_SECRET=replace-with-secure-secret
AUTH_URL=http://localhost:3000
```

Used for:

- Session Management
- Authentication Tokens
- Secure User Login

---

### Email / Notifications

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Used for:

- Password Reset Emails
- Learning Notifications
- Promotion Notifications
- Opportunity Alerts

---

### File Storage

```env
STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

Used for:

- Profile Images
- Learning Resources
- Employee Documents
- Mentorship Assets

---

### Logging

```env
LOG_LEVEL=
```

Examples:

```env
LOG_LEVEL=debug
LOG_LEVEL=info
LOG_LEVEL=warn
LOG_LEVEL=error
```

---

### Feature Flags

```env
ENABLE_AI_FEATURES=
ENABLE_EMAIL_NOTIFICATIONS=
ENABLE_AUDIT_LOGGING=
```

Examples:

```env
ENABLE_AI_FEATURES=false
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_AUDIT_LOGGING=true
```

---

## Development Environment

Required:

```env
NODE_ENV=development
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
```

---

## Production Environment

Required:

```env
NODE_ENV=production
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
```

---

## Configuration-First Development

Before introducing any new external service, integration, provider, storage system, notification service, analytics platform, AI service, or authentication provider:

1. Create the required environment variables.
2. Document them in this section.
3. Ensure the application can start gracefully when the integration is disabled.
4. Make integrations optional unless explicitly marked as MVP requirements.
5. Avoid hard dependencies on external providers.

---

# User Roles

## Employee

Can:

- Manage profile
- Manage skills
- Complete learning plans
- View career paths
- Request mentorship
- View internal opportunities
- Track promotion readiness

Cannot:

- View team analytics
- View organization analytics

---

## Manager

Can:

- View team dashboard
- Assign learning plans
- Review readiness assessments
- Monitor team skill gaps
- Identify leadership candidates

Cannot:

- View company-wide HR analytics

---

## HR

Can:

- Manage skills taxonomy
- Manage career frameworks
- View workforce analytics
- Manage succession planning

---

## Executive Leadership

Can:

- View executive dashboards
- View workforce reports
- View succession readiness reports

---

## Administrator

Can:

- Manage users
- Manage permissions
- Manage departments
- Configure notifications
- Configure platform settings

---

# MVP Scope

## Included

- Authentication
- Role Management
- Employee Profiles
- Skills Management
- Skills Assessment
- Skill Gap Analysis
- Career Paths
- Learning Plans
- Learning Tracking
- Team Dashboard
- Workforce Analytics
- Internal Opportunities
- Promotion Readiness
- Succession Planning
- Notifications
- Audit Logs

---

# Core Business Rules

## Skill Gap Logic

IF

Employee Skill Level < Required Role Skill Level

THEN

- Create Skill Gap
- Calculate Gap Size
- Recommend Learning Activities

---

## Promotion Readiness Logic

Promotion readiness is based on:

- Skill completion
- Learning completion
- Manager evaluation
- Leadership competency evaluation

Possible statuses:

- Ready
- Near Ready
- Development Needed

---

## Career Progression Logic

Every role must contain:

- Required Skills
- Required Skill Levels
- Experience Requirements
- Leadership Requirements

Career progression should always be visible to employees.

---

# Core Entities

The following entities are required.

## Identity

- User
- Role
- Permission

## Organization

- Department
- Team

## Skills

- SkillCategory
- Skill
- EmployeeSkill
- SkillGap

## Career

- CareerPath
- CareerRole
- PromotionAssessment

## Learning

- LearningResource
- LearningPlan
- LearningEnrollment

## Mentorship

- MentorshipProgram
- MentorshipEnrollment

## Opportunities

- InternalOpportunity
- OpportunityApplication

## Succession

- SuccessionCandidate

## Platform

- Notification
- AuditLog

---

# Data Design Rules

Every table should include:

- id
- createdAt
- updatedAt

Where applicable include:

- createdBy
- updatedBy

Use soft deletes where appropriate.

Avoid duplicate storage of derived values.

Store calculated values only when required for reporting performance.

---

# Audit Requirements

Track:

- Skill changes
- Learning assignments
- Promotion assessments
- Career framework changes
- Permission changes

Audit records should contain:

- User
- Action
- Entity
- Timestamp
- Previous Value
- New Value

---

# UI Principles

All screens must be:

- Mobile responsive
- Accessible
- Simple
- Data focused
- Fast to navigate

Avoid:

- Complex dashboards
- Excessive charts
- Feature clutter

Focus on actionability.

---

# Analytics Requirements

Employee Dashboard:

- Skills Progress
- Learning Progress
- Promotion Readiness

Manager Dashboard:

- Team Skills Matrix
- Team Skill Gaps
- Team Learning Progress

HR Dashboard:

- Workforce Capability Map
- Skill Shortage Trends
- Retention Metrics
- Internal Mobility Metrics
- Succession Metrics

---

# Notification Rules

Employees:

- Learning Assigned
- Learning Reminder
- Learning Completed
- Promotion Readiness Updated
- Opportunity Available

Managers:

- Team Learning Progress
- Team Skill Gap Alerts
- Succession Readiness Alerts

HR:

- Workforce Shortage Alerts
- Succession Alerts

---

# Final Instruction

When making implementation decisions:

Prioritize:

1. Employee growth
2. Skill development
3. Internal mobility
4. Leadership readiness
5. Workforce intelligence

Reject any feature that adds complexity without supporting one of these goals.

## Learning Provider Strategy

TalentPath must never be tightly coupled to a single learning provider.

All external learning systems must implement the LearningProvider interface.

The learning module should support:

- Udemy Business
- Internal Learning Content

in MVP.

Future providers should be pluggable without changes to core business logic.

TalentPath remains the system of record for:

- Skills
- Career Paths
- Learning Plans
- Promotion Readiness
- Workforce Analytics

External providers remain the source of truth for learning content and learning activity.
