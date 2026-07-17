---
trigger: always_on
---

# Design System Rules

## Design Philosophy

TalentPath is an enterprise workforce development platform.

The interface should feel: Professional, Modern, Trustworthy, Clean, Data-focused.

Avoid: Consumer-app styling, excessive animations, visual clutter, playful interfaces.

---

## Design Tokens

All visual styling uses tokens from `tokens/tokens.css` via `var(--token-name)`. Never hardcode colors, spacing, typography, or shadows.

### Color System

The palette follows Material 3 semantic roles with light and dark theme support.

| Token                    | Usage                                           |
| ------------------------ | ----------------------------------------------- |
| `--primary`              | Primary actions, active navigation, key accents |
| `--on-primary`           | Text/icon on primary backgrounds                |
| `--primary-container`    | Light primary fill for badges, selected states  |
| `--on-primary-container` | Text on primary container                       |
| `--secondary`            | Secondary actions, less prominent accents       |
| `--tertiary`             | Alternative accent (learning, mentorship)       |
| `--error`                | Errors, destructive actions, critical gaps      |
| `--on-error`             | Text/icon on error backgrounds                  |
| `--error-container`      | Light error fill                                |
| `--surface`              | Card and page backgrounds                       |
| `--on-surface`           | Primary text                                    |
| `--surface-variant`      | Slightly elevated surface (sidebars, headers)   |
| `--on-surface-variant`   | Secondary text, captions                        |
| `--outline`              | Borders, dividers                               |
| `--outline-variant`      | Subtle borders (disabled, hover)                |

### Typography Scale

| Token                    | Size            | Weight | Usage                        |
| ------------------------ | --------------- | ------ | ---------------------------- |
| `--font-size-h1`         | 2rem / 32px     | 700    | Page titles                  |
| `--font-size-h2`         | 1.5rem / 24px   | 600    | Section headers              |
| `--font-size-h3`         | 1.25rem / 20px  | 600    | Card titles                  |
| `--font-size-body`       | 1rem / 16px     | 400    | Body text                    |
| `--font-size-body-sm`    | 0.875rem / 14px | 400    | Secondary text, descriptions |
| `--font-size-caption`    | 0.75rem / 12px  | 500    | Labels, badges, table cells  |
| `--font-size-mono`       | 0.875rem / 14px | 400    | Code, IDs                    |
| `--font-weight-regular`  | 400             |        | Body                         |
| `--font-weight-medium`   | 500             |        | Labels, buttons              |
| `--font-weight-semibold` | 600             |        | Subheadings                  |
| `--font-weight-bold`     | 700             |        | Headings                     |
| `--line-height-tight`    | 1.2             |        | Headings                     |
| `--line-height-normal`   | 1.5             |        | Body                         |

### Spacing Scale

| Token           | Value         | Usage                         |
| --------------- | ------------- | ----------------------------- |
| `--spacing-xs`  | 0.25rem / 4px | Tight gaps, icon margins      |
| `--spacing-sm`  | 0.5rem / 8px  | Element padding, tight groups |
| `--spacing-md`  | 1rem / 16px   | Card padding, form field gaps |
| `--spacing-lg`  | 1.5rem / 24px | Section spacing               |
| `--spacing-xl`  | 2rem / 32px   | Page section margins          |
| `--spacing-xxl` | 3rem / 48px   | Major layout divisions        |

### Border Radius

| Token           | Value  | Usage                          |
| --------------- | ------ | ------------------------------ |
| `--radius-sm`   | 4px    | Inputs, badges, small elements |
| `--radius-md`   | 8px    | Cards, modals, buttons         |
| `--radius-lg`   | 12px   | Drawers, large containers      |
| `--radius-full` | 9999px | Pills, avatars                 |

### Shadows

| Token         | Value                       | Usage                  |
| ------------- | --------------------------- | ---------------------- |
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05)  | Card subtle depth      |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.07)  | Elevated cards, modals |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | Drawers, dropdowns     |

---

## Responsive Breakpoints

| Name      | Min-Width | Target                           |
| --------- | --------- | -------------------------------- |
| `--bp-sm` | 640px     | Large phone landscape            |
| `--bp-md` | 768px     | Tablet portrait                  |
| `--bp-lg` | 1024px    | Tablet landscape / small desktop |
| `--bp-xl` | 1280px    | Desktop                          |

Design mobile-first. Base styles target <640px. Override at each breakpoint.

---

## Component Inventory

The following shared components live in `src/components/` and are available globally:

| Component       | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `Button`        | Primary, secondary, ghost, danger — sm/md/lg           |
| `Input`         | Text input with label, error, helper text              |
| `Select`        | Native select with label, error                        |
| `Textarea`      | Multi-line input with label, error                     |
| `Checkbox`      | Single checkbox with label                             |
| `Radio`         | Radio group with label                                 |
| `Badge`         | Status/category pill (color variants mapped to status) |
| `Card`          | Container with optional header, padding                |
| `Table`         | Sortable, searchable, paginated data table             |
| `Modal`         | Dialog overlay, configurable size                      |
| `Drawer`        | Slide-in panel, left or right                          |
| `Toast`         | Notification toast, auto-dismiss                       |
| `Skeleton`      | Loading placeholder: card / table-row / line / avatar  |
| `EmptyState`    | Illustration + title + description + action            |
| `ErrorFallback` | Error boundary fallback with retry                     |
| `CanAccess`     | RBAC gate wrapping children                            |
| `Pagination`    | Page navigation control                                |
| `SearchInput`   | Input with search icon, debounced onChange             |
| `ProgressBar`   | Linear progress with label                             |
| `Avatar`        | User avatar with initials fallback                     |
| `Breadcrumb`    | Page breadcrumb navigation                             |
| `Tabs`          | Horizontal tab navigation                              |
| `Tooltip`       | Hover/focus tooltip                                    |

Use these before building custom variants. Propose new shared components in `src/components/` only when needed in 3+ features.

---

## Component Style Guide

### Button

```
Primary   → background: var(--primary), color: var(--on-primary)
Secondary → background: var(--surface-variant), color: var(--on-surface)
Ghost     → background: transparent, color: var(--primary)
Danger    → background: var(--error), color: var(--on-error)

Sizes:
  sm → padding: var(--spacing-xs) var(--spacing-sm), font-size: var(--font-size-body-sm)
  md → padding: var(--spacing-sm) var(--spacing-md), font-size: var(--font-size-body)
  lg → padding: var(--spacing-md) var(--spacing-lg), font-size: var(--font-size-h3)

States:
  :hover   → opacity 0.9, cursor pointer
  :focus   → outline: 2px solid var(--primary), outline-offset: 2px
  :disabled → opacity 0.4, cursor not-allowed
  isLoading → show skeleton pulse, disable interaction
```

### Input / Select / Textarea

```
Container → display: flex, flex-direction: column, gap: var(--spacing-xs)
Label     → font-size: var(--font-size-body-sm), color: var(--on-surface)
Input     → background: var(--surface), border: 1px solid var(--outline),
            border-radius: var(--radius-sm), padding: var(--spacing-sm) var(--spacing-md),
            font-size: var(--font-size-body), color: var(--on-surface)

States:
  :focus     → border-color: var(--primary), outline: none, ring: 2px var(--primary-container)
  :disabled  → background: var(--surface-variant), color: var(--on-surface-variant)
  [aria-invalid=true] → border-color: var(--error), ring: 2px var(--error-container)

Error text → font-size: var(--font-size-caption), color: var(--error)
Hint text  → font-size: var(--font-size-caption), color: var(--on-surface-variant)
```

### Badge / Status Chip

```
Badge → display: inline-flex, align-items: center,
        padding: 2px var(--spacing-sm), border-radius: var(--radius-full),
        font-size: var(--font-size-caption), font-weight: var(--font-weight-medium)

Color variants mapped to status:

Ready (promotion)             → background: var(--primary-container), color: var(--on-primary-container)
Near Ready (promotion)        → background: var(--tertiary), color: var(--on-primary)
Development Needed            → background: var(--error-container), color: var(--error)
Not Started (learning)        → background: var(--surface-variant), color: var(--on-surface-variant)
In Progress (learning)        → background: var(--primary-container), color: var(--on-primary-container)
Completed (learning)          → background: var(--primary), color: var(--on-primary)
Open (opportunity)            → background: var(--primary-container), color: var(--on-primary-container)
Applied (opportunity)         → background: var(--tertiary), color: var(--on-primary)
Shortlisted (opportunity)     → background: var(--primary), color: var(--on-primary)
Closed (opportunity)          → background: var(--surface-variant), color: var(--on-surface-variant)
```

### Card

```
Card → background: var(--surface), border: 1px solid var(--outline-variant),
       border-radius: var(--radius-md), padding: var(--spacing-md),
       box-shadow: var(--shadow-sm)

Card with header:
  header → border-bottom: 1px solid var(--outline-variant),
            padding-bottom: var(--spacing-sm), margin-bottom: var(--spacing-sm)
  title  → font-size: var(--font-size-h3), font-weight: var(--font-weight-semibold)
```

### Table

```
Table → width: 100%, border-collapse: collapse
Th    → text-align: left, padding: var(--spacing-sm) var(--spacing-md),
        font-size: var(--font-size-caption), font-weight: var(--font-weight-semibold),
        color: var(--on-surface-variant), border-bottom: 2px solid var(--outline)
Td    → padding: var(--spacing-sm) var(--spacing-md),
        font-size: var(--font-size-body-sm), border-bottom: 1px solid var(--outline-variant)

States:
  tr:hover → background: var(--surface-variant) (desktop only)
  sortable th → cursor: pointer
  sortable th:hover → color: var(--primary)

Responsive:
  <640px → convert table rows to stacked card layout (label + value pairs)
  Add role="region", aria-label, and tabIndex on scrollable wrapper
```

### Skeleton

```
Skeleton → background: var(--surface-variant), border-radius: var(--radius-sm),
           animation: pulse 1.5s infinite

Variants:
  .skeletonLine   → height: 1rem, width: 100%
  .skeletonTitle  → height: 1.5rem, width: 60%
  .skeletonAvatar → height: 2.5rem, width: 2.5rem, border-radius: var(--radius-full)
  .skeletonCard   → height: 120px, border-radius: var(--radius-md)

@keyframes pulse:
  0%, 100% { opacity: 1 }
  50% { opacity: 0.4 }
```

### Modal

```
Modal → position: fixed, inset: 0, z-index: 50
Backdrop → background: rgba(0,0,0,0.5)
Dialog  → background: var(--surface), border-radius: var(--radius-md),
          box-shadow: var(--shadow-lg), max-width: 480px (default),
          max-height: 80vh, overflow-y: auto

Sizes:
  sm → max-width: 360px (confirmations)
  md → max-width: 480px (default, forms)
  lg → max-width: 640px (tables, complex forms)
  xl → max-width: 800px (full-width content)

Focus trap within dialog. Close on Escape. Close on backdrop click (unless destructive).
```

### Toast / Notification

```
Toast → position: fixed, bottom: var(--spacing-lg), right: var(--spacing-lg),
        z-index: 60, display: flex, align-items: center, gap: var(--spacing-sm),
        padding: var(--spacing-sm) var(--spacing-md), border-radius: var(--radius-md),
        box-shadow: var(--shadow-md), font-size: var(--font-size-body-sm)

Type variants:
  success → background: var(--primary-container), color: var(--on-primary-container), border-left: 4px solid var(--primary)
  error   → background: var(--error-container), color: var(--error), border-left: 4px solid var(--error)
  warning → background: var(--tertiary), color: var(--on-primary), border-left: 4px solid var(--tertiary)
  info    → background: var(--surface-variant), color: var(--on-surface), border-left: 4px solid var(--primary)

Auto-dismiss after 5s (success/info), 10s (error/warning). Close button always visible.
Stack vertically, newest at bottom.
```

### Empty State

```
EmptyState → display: flex, flex-direction: column, align-items: center,
             justify-content: center, padding: var(--spacing-xl), text-align: center

Icon/Illustration → color: var(--on-surface-variant), width: 64px, height: 64px
Title   → font-size: var(--font-size-h3), color: var(--on-surface), margin-bottom: var(--spacing-sm)
Description → font-size: var(--font-size-body), color: var(--on-surface-variant), max-width: 400px
Action  → Button (primary), margin-top: var(--spacing-lg)
```

### Navigation

```
Sidebar → width: 240px, background: var(--surface-variant), border-right: 1px solid var(--outline)
Item    → display: flex, align-items: center, gap: var(--spacing-sm),
          padding: var(--spacing-sm) var(--spacing-md), border-radius: var(--radius-sm),
          font-size: var(--font-size-body), color: var(--on-surface-variant)

States:
  :hover     → background: var(--primary-container)
  active     → background: var(--primary-container), color: var(--primary), font-weight: var(--font-weight-semibold)
  icon       → width: 20px, height: 20px

Mobile (<768px):
  → Bottom nav bar (5 items max) OR hamburger → drawer overlay
  Bottom nav → height: 64px, background: var(--surface), border-top: 1px solid var(--outline)

Breadcrumb → display: flex, align-items: center, gap: var(--spacing-xs),
            font-size: var(--font-size-body-sm), color: var(--on-surface-variant)
Separator → ">" or "/", color: var(--outline)
Current   → color: var(--on-surface), font-weight: var(--font-weight-medium)
```

---

## Page Structure

Every page follows this layout:

```
PageTitle       (--font-size-h1, --font-weight-bold)
PageDescription (--font-size-body, --on-surface-variant, max-width: 600px)
PrimaryAction   (Button, positioned top-right or below description)
─ ─ ─ ─ ─ ─ ─
MainContent     (Card, Table, Form, or grid of cards)
─ ─ ─ ─ ─ ─ ─
SecondaryActions (grouped, less prominent)
```

---

## Skill Visualization

### Skill Level Bar

```
Level 1 ░░░░░  Beginner
Level 2 █░░░░  Basic
Level 3 ██░░░  Intermediate
Level 4 ███░░  Advanced
Level 5 █████  Expert

Fill → background: var(--primary)
Empty → background: var(--surface-variant)
Gap indicator → red tint overlay on unfilled portion when current < target
```

Always show three values: **Current Level**, **Target Level**, **Gap** (as "−2" or "0").

---

## Data Visualization

| Type         | Use Case                                  |
| ------------ | ----------------------------------------- |
| ProgressBar  | Learning completion, skill level progress |
| Bar chart    | Skill gaps by category, team comparison   |
| Radar/spider | Multi-skill profile overview              |
| Donut        | Workforce capability distribution         |

All charts use `--primary`, `--secondary`, `--tertiary`, and `--error` for data series. Never use custom colors. Include labels and tooltips.

---

## Icons

- **Library**: `lucide-react`
- **Sizing**: Inline icons use `width: 16px; height: 16px` (body text), `20px` (buttons), `24px` (nav items), `32px+` (empty states, page headers).
- **Color**: Inherit `currentColor` from parent text. Use `color: var(--on-surface-variant)` for secondary icons.
- **Accessibility**: Decorative icons get `aria-hidden="true"`. Informational icons get `aria-label`.

---

## Animations & Transitions

```
Allowed:
  ─ opacity / visibility transitions (150ms ease)
  ─ transform: translate for drawers/modals (200ms ease)
  ─ color / background-color for hover states (100ms ease)
  ─ skeleton pulse animation

Avoid:
  ─ bounce, shake, spin, zoom, slide-up
  ─ duration > 300ms
  ─ animations on critical interaction elements (buttons, links)
  ─ parallax, scroll-triggered effects

Respect prefers-reduced-motion:
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
```

---

## Dark Theme

Tokens in `tokens/tokens.css` include dark theme values. Apply via:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* dark token overrides */
  }
}
```

Key dark theme rules:

- `--surface` → dark gray (`#1c1c1e`), never pure black
- `--on-surface` → high-opacity white
- `--surface-variant` → slightly lighter than `--surface`
- `--outline` → low-opacity white
- Cards keep `--shadow-md` but with higher-opacity black
- Icons and decorative elements maintain same relative contrast

---

## Layout Standards

### Application Shell

```
Desktop (>1024px):
┌─────────┬────────────────────────────────────┐
│ Sidebar │ Header (user menu, notifications)  │
│ 240px   ├────────────────────────────────────┤
│         │ Main Content Area                  │
│         │ (padding: var(--spacing-lg))        │
└─────────┴────────────────────────────────────┘

Mobile (<768px):
┌──────────────────────────────────────────┐
│ Header (hamburger + user menu)           │
├──────────────────────────────────────────┤
│ Main Content Area                        │
│ (padding: var(--spacing-md))             │
├──────────────────────────────────────────┤
│ Bottom Nav (5 items max)                 │
└──────────────────────────────────────────┘
```

### Dashboard Layout

Use a CSS Grid for dashboard widgets:

```css
.dashboard {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .dashboard {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

Priority widgets (skills progress, learning, gaps) occupy the first column positions.

---

## Accessibility (WCAG 2.1 AA)

- All interactive elements must be keyboard-reachable (`tabindex` only for scrollable regions).
- All images need `alt` text (or `alt=""` when decorative).
- Color is never the sole differentiator — use icon + text + color for status.
- Focus indicators: `outline: 2px solid var(--primary); outline-offset: 2px`.
- Form inputs require associated `<label>` (not placeholder as label).
- Live regions (`aria-live="polite"`) for toast notifications and auto-updating content.
- Skip-to-content link at top of every page.
- Touch targets minimum 44×44px on mobile.

---

## UX Rules

- 3-click max to reach any primary task.
- Every action has a loading, success, and error state.
- Empty states are never blank — always explain why and what to do next.
- Confirmation dialogs for destructive actions ("Are you sure?" + "Archive" / "Cancel").
- Undo available for non-destructive actions (e.g., archive, status change).
- Forms preserve input on validation error. Never clear the form.
