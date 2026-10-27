# Engineering Standards and Architecture Verification Guide

This guide details Utsava's technical standards across the six architectural pillars, citing implementation files, configuration guards, and runnable verification commands.

---

## Standards and Verification Matrix

| Pillar                   | Engineering Standard                                                            | Primary Verification Command                         | Source Reference                                                 |
| :----------------------- | :------------------------------------------------------------------------------ | :--------------------------------------------------- | :--------------------------------------------------------------- |
| **1. Code Quality**      | Strict TypeScript, pure functions (<40 lines), layered architecture, zero `any` | `npm run typecheck && npm run lint`                  | `tsconfig.json`, `eslint.config.mjs`, `src/domain/`              |
| **2. Security**          | Zod input validation, CSRF tokens, HMAC signed sessions, prompt sanitization    | `npm test src/app/api/__tests__/authAndIdor.test.ts` | `src/domain/security.ts`, `src/services/auth/`                   |
| **3. Efficiency**        | Streaming responses, TTL generation caching, lightweight bundle (<120 KB JS)    | `npm run build`                                      | `src/services/cacheService.ts`, `src/app/api/chat/`              |
| **4. Testing**           | Deterministic tests, mocked LLM, automated coverage gates                       | `npm run test:coverage`                              | `vitest.config.ts`, `e2e/`, `src/services/ai/__tests__/`         |
| **5. Accessibility**     | WCAG 2.2 AA compliant, keyboard-first, visible focus, axe-core clean in CI      | `npm run test:e2e`                                   | `docs/ACCESSIBILITY.md`, `e2e/accessibility.spec.ts`             |
| **6. Problem Alignment** | Dedicated event planning features for weddings, birthdays, and community galas  | `npm test src/domain/__tests__/`                     | `src/domain/demo/`, `src/domain/budget/`, `src/domain/timeline/` |

---

## 1. Code Quality

> **Standard:** Strict TypeScript compiler verification, small pure functions (<40 lines), layered architecture (`domain / services / api / components / lib`), zero `any`, no dead code.

### Verification Commands

```bash
# Verify zero compiler diagnostics, no implicit any, and strict null safety
npm run typecheck

# Verify function length ceilings (<40 lines), complexity limits, and import boundaries
npm run lint

# Verify structural architecture rules (no shim files, max line limits)
npm test src/__tests__/architecture.test.ts
```

### Architectural Implementation

- **Layered Clean Architecture**:
  - `src/domain/`: Pure domain models, Zod schemas, calculations, and security guards (`src/domain/budget/`, `src/domain/timeline/`, `src/domain/schemas.ts`). Completely decoupled from UI and network frameworks.
  - `src/services/`: Swappable LLM adapters (`src/services/llm/`), rate-limiting (`src/services/rateLimiter.ts`), generation caching (`src/services/cacheService.ts`), and persistence (`src/services/repositories/`).
  - `src/app/api/`: Thin Next.js Route Handlers delegating to services after Zod and CSRF validation.
  - `src/components/`: Modular React 19 UI components organized by feature (`budget/`, `timeline/`, `vendors/`, `ideas/`, `chat/`, `wizard/`).
  - `src/lib/`: Zod-validated environment configuration (`src/lib/env.ts`) and application constants (`src/lib/constants.ts`).
- **Strict Compiler Guards**:
  - Enforced in `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitAny": true`, `"noImplicitReturns": true`.
- **Function and File Size Ceilings**:
  - Enforced via ESLint `max-lines-per-function` (max 40) and `max-lines` (max 300).

---

## 2. Security

> **Standard:** Validate all input with Zod, never expose API keys client-side, rate-limit AI routes, defend against prompt injection, sanitize output.

### Verification Commands

```bash
# Run security suite: prompt injection, IDOR tenant isolation, CSRF validation, rate limiting
npm test src/domain/__tests__/security.test.ts src/app/api/__tests__/authAndIdor.test.ts src/services/auth/__tests__/csrf.test.ts
```

### Architectural Implementation

- **Complete Zod Validation**:
  - All request parameters, query strings, and request bodies are validated against Zod schemas in `src/domain/schemas.ts`. Malformed requests are rejected immediately with HTTP 400.
- **Server-Only Secrets**:
  - LLM credentials and session secrets are loaded in `src/lib/env.ts` without client-accessible prefixes.
- **Session Authentication & IDOR Authorization**:
  - Zero-dependency HMAC-SHA256 session signatures via Web Crypto API in `src/services/auth/session.ts`.
  - Every resource query checks tenant ownership (`event.userId === session.user.id`).
- **Prompt Injection Defense**:
  - Control sequences stripped and user inputs wrapped in structured instruction boundaries (`src/domain/security.ts`).
  - Tool proposals validate arguments with Zod; entity IDs are strictly generated server-side.
- **Sliding-Window Rate Limiting**:
  - Sliding-window limiter in `src/services/rateLimiter.ts` guards AI endpoints per IP and user identity.

---

## 3. Efficiency

> **Standard:** Stream AI responses, cache repeated generations, avoid unnecessary re-renders, keep bundle small.

### Verification Commands

```bash
# Verify production bundle size and code-splitting performance
npm run build

# Verify caching performance and TTL eviction logic
npm test src/services/__tests__/cacheService.test.ts src/services/ai/__tests__/cacheHelper.test.ts
```

### Architectural Implementation

- **Streaming AI Responses**:
  - Real-time chunked streaming via `ReadableStream<Uint8Array>` in `src/app/api/chat/route.ts`.
- **Deterministic Generation Cache**:
  - Repeated AI generation parameters are normalized and hashed into 64-bit keys in `src/services/ai/cacheHelper.ts`.
  - In-memory TTL cache in `src/services/cacheService.ts` resolves repeated requests with zero token burn.
- **Optimized Bundle Splitting**:
  - Secondary tabs (`TimelineGenerator`, `VendorChecklist`, `IdeaGenerator`, `ChatAssistant`) and `OnboardingWizard` are dynamically imported on demand via `next/dynamic`.
  - Development tools (`DevTokenPanel`) are strictly excluded from production runtime execution.
- **Database Query Batching**:
  - Multi-table event data is ingested via coordinated SQL `IN (...)` queries in `DrizzleEventRepository`, eliminating N+1 round-trips.

---

## 4. Testing

> **Standard:** Comprehensive unit, integration, accessibility, and end-to-end tests; LLM is always mocked; coverage gates enforced in CI.

### Verification Commands

```bash
# Execute full Vitest suite with coverage verification
npm run test:coverage

# Execute Playwright end-to-end and automated axe-core accessibility tests
npm run test:e2e
```

### Architectural Implementation

- **Test Pyramid Organization**:
  - **Unit Tests**: Pure domain calculations, timeline scheduler, Zod schemas, security sanitization, and cache hashing (`src/domain/**/__tests__/`, `src/services/**/__tests__/`).
  - **Integration Tests**: API route handlers executed with in-memory SQLite (`src/app/api/__tests__/`).
  - **Contract Tests**: Recorded golden fixtures parsed against Zod schemas (`src/services/ai/__tests__/contracts/`).
  - **Accessibility Tests**: Automated axe-core audits on rendered React components (`src/components/__tests__/`).
  - **E2E Tests**: Playwright browser journeys covering all three celebration verticals, keyboard navigation, and mobile viewports (`e2e/`).
- **Deterministic Mocks**:
  - All tests execute offline using `MockProvider` and fixed system clocks with zero external network dependencies.
- **Coverage Gates**:
  - Thresholds enforced in `vitest.config.ts`: 85% global, 90% for `src/domain/` and `src/services/`.

---

## 5. Accessibility

> **Standard:** WCAG 2.2 Level AA compliance, keyboard-first navigation, semantic HTML, ARIA only when needed.

### Verification Commands

```bash
# Run automated WCAG 2.2 Level AA axe-core audits across light and dark modes
npm test src/components/__tests__/accessibility.test.tsx
npx playwright test e2e/accessibility.spec.ts
```

### Architectural Implementation

- **Keyboard-Operable Interfaces**:
  - Visible focus outlines (`:focus-visible`) across interactive controls.
  - Accessible modal dialog with focus trapping, initial focus placement, and `Escape` key dismissal (`src/components/ui/Dialog.tsx`).
  - Skip link (`Skip to main content`) routing keyboard users directly to `#main-content`.
- **Accessible Forms & Live Announcements**:
  - Explicit `<label>` associations for form fields.
  - Real-time validation errors linked via `aria-describedby` and announced politely via ARIA live regions.
- **Contrast & Responsive Reflow**:
  - Theme tokens meet or exceed 4.5:1 contrast ratios.
  - Zero horizontal overflow down to 320px viewport widths. Detailed audit documented in `docs/ACCESSIBILITY.md`.

---

## 6. Problem Alignment

> **Standard:** Features directly serve event budgets, schedules, vendor procurement, and creative ideation across weddings, birthdays, and community events.

### Verification Commands

```bash
# Verify domain logic for all three celebration verticals
npm test src/domain/__tests__/budget.test.ts src/domain/__tests__/timeline.test.ts src/domain/__tests__/vendors.test.ts
```

### Architectural Implementation

- **Core Event Planning Capabilities**:
  1. **Budget Planner**: Percentage allocations per event type, overspend warnings, and category reallocation (`src/domain/budget/`).
  2. **Timeline Generator**: Automated back-scheduling, cycle-safe dependencies, and `.ics` calendar export (`src/domain/timeline/`).
  3. **Vendor Procurement**: Milestone lead times, deliverables tracking, and commitment tracking (`src/domain/vendorTemplates.ts`, `src/domain/vendors.ts`).
  4. **Creative Studio**: Vertical-specific motifs, dietary accommodations, and accessibility planning (`src/services/ai/prompts/ideasPrompt.ts`).
- **Pre-Seeded Celebration Datasets**:
  - Production-ready seed data for Indian Wedding, Children's Birthday, and Community Gala in `src/domain/demo/`.
- **Human-in-the-Loop Controls**:
  - AI recommendations stage suggestions in a pending state with explicit Accept and Dismiss actions.
