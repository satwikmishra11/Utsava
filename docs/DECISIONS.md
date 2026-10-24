# Architecture Decisions Log (ADR) - Utsava

This document records architectural and design decisions made for Utsava in accordance with our six core judging criteria:
1. **Code quality**: strict TypeScript, small pure functions (<40 lines), layered architecture (`domain / services / api / ui`), no `any`, no dead code.
2. **Security**: validate all input with Zod, never expose API keys client-side, rate-limit AI routes, defend against prompt injection, sanitize output.
3. **Efficiency**: stream AI responses, cache repeated generations, avoid unnecessary re-renders, keep bundle small.
4. **Testing**: unit + integration + e2e; the LLM is always mocked in tests.
5. **Accessibility**: WCAG 2.2 AA, keyboard-first, semantic HTML, ARIA only when needed, axe checks in CI.
6. **Problem alignment**: every feature must serve event budgets, timelines, vendors, or personalized ideas.

---

## ADR 001: Core Architecture, Layered Structure & Foundation Dependencies
- **Date:** 2026-10-24
- **Status:** Accepted (Approved by User)
- **Summary:** Established Next.js App Router, Zod validation, `@google/genai`, Lucide icons, Vitest, Testing Library, Axe-core, and Playwright.

---

## ADR 002: Four-Layer Architecture Enforcement & Functional Purity
- **Date:** 2026-10-24
- **Status:** Accepted

### Context
To prevent spaghetti state and coupling between framework code, business rules, and UI, the application enforces four strictly segregated layers:
1. `src/domain/`: Pure domain types, invariants, immutable calculation functions (budget summaries, timeline conflict detections, vendor status transformations, security sanitization). Zero side-effects, 100% unit-tested.
2. `src/services/`: Business services including AI SDK adapters, sliding-window rate limiters, and TTL-based generation caches.
3. `src/app/api/`: Next.js Route Handlers validating payloads via Zod, enforcing rate limits, checking prompt safety, and streaming chunks.
4. `src/ui/`: React UI components styled with vanilla design tokens, semantic HTML, ARIA landmarks, and keyboard accessibility.

### Consequences
- Every function is verified to be under 40 lines.
- No `any` type escapes.
- No dead code; strict compiler warnings (`noUnusedLocals`, `noUnusedParameters`).

---

## ADR 003: AI Response Streaming & Server-Side Security Isolation
- **Date:** 2026-10-24
- **Status:** Accepted

### Context
Generative AI features must never expose `GEMINI_API_KEY` to browser clients. To ensure rapid time-to-first-token (TTFT) and prevent UI stalls, AI responses are streamed using standard `ReadableStream<Uint8Array>`.

### Design
- Route handlers (`/api/chat`, `/api/ideas`, `/api/timeline`) enforce a sliding-window rate limit of 10 requests/minute per client IP using `RateLimiter`.
- Repeated idea generations are hashed and cached with a 10-minute TTL in `GenerationCache` to save bandwidth and compute.
- Test environments run against deterministic mock generators with 0 network calls.

---

## ADR 004: Multi-Layer Prompt Injection Defense & Output Sanitization
- **Date:** 2026-10-24
- **Status:** Accepted

### Context
AI event planning assistants receive untrusted user text that could attempt prompt injection (e.g., jailbreaks, system instruction overrides, delimiter escapes).

### Design
- In `src/domain/security.ts`:
  - `detectPromptInjection`: Regex inspection blocking known jailbreak patterns (`ignore previous instructions`, `developer mode`, `bypass safety filters`, etc.).
  - `sanitizePromptInput`: Strips malicious control characters and escapes tags.
  - `buildSecurePromptEnvelope`: Wraps system instructions, JSON event context, and user input into isolated structural blocks.
  - Returns graceful refusal streams if injection is detected.

---

## ADR 005: WCAG 2.2 AA Keyboard-First Navigation & Axe-Core Auditing
- **Date:** 2026-10-24
- **Status:** Accepted

### Context
Utsava must be accessible to all event hosts, committee members, and planners regardless of motor or visual ability.

### Design
- Semantic HTML tags (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<table>`, `<caption>`).
- Visible focus rings (`:focus-visible`) with gold outlines.
- Keyboard navigation across tabs via ArrowLeft / ArrowRight.
- High-contrast color tokens exceeding 4.5:1 ratio for body copy.
- Skip-to-main-content anchor link.
- Axe-core tests run in the Vitest suite asserting zero violations (`results.violations === []`).
