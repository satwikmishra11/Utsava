# Architecture Decisions Log (ADR) - Utsava

This document records the architectural and design decisions made for Utsava in accordance with our six core judging criteria:

1. **Code quality**: Strict TypeScript (`noUncheckedIndexedAccess`), small pure functions (<40 lines), layered architecture (`domain / services / api / components / lib`), no `any`, no dead code.
2. **Security**: Validate all inputs with Zod, never expose API keys client-side, rate-limit AI routes, defend against prompt injection, sanitize output.
3. **Efficiency**: Stream AI responses, cache repeated generations, avoid unnecessary re-renders, keep bundle small.
4. **Testing**: Unit + integration + e2e; LLM is always mocked in tests.
5. **Accessibility**: WCAG 2.2 AA, keyboard-first, semantic HTML, ARIA only when needed, axe checks in CI.
6. **Problem alignment**: Every feature serves event budgets, timelines, vendors, or personalized ideas.

---

## ADR 001: Next.js App Router, Strict TypeScript, and Foundational Dependencies

- **Date:** 2026-10-24
- **Status:** Accepted (Approved by User)

### Context & Problem Statement

Utsava requires a full-stack TypeScript environment capable of streaming generative AI responses securely, maintaining event planning state (budgets, timelines, vendor checklists, ideas), validating all inputs with Zod, and enforcing strict type safety (`noUncheckedIndexedAccess`, `strictNullChecks`).

### Decision

- Adopt Next.js 15 App Router with TypeScript.
- Core styling: Tailwind CSS v3 paired with semantic tokens.
- Linting & formatting: ESLint with `next/core-web-vitals`, `plugin:jsx-a11y/recommended`, Prettier, and Husky + lint-staged git hooks.
- Test frameworks: Vitest + React Testing Library + Axe-core for unit/integration tests; Playwright for E2E tests.

### Consequences

- API route handlers keep LLM secrets strictly server-side.
- Zero client-side API key leakage.
- Strict compiler flags prevent undefined property accesses and implicit type casts.

---

## ADR 002: Five-Layer Architecture & Functional Purity

- **Date:** 2026-10-24
- **Status:** Accepted

### Context

To avoid coupling business rules, external SDKs, and UI rendering, code must be divided into five clear folders with strict dependency directions.

### Decision

The codebase is structured into:

1. `src/domain/`: Pure domain models, Zod validation schemas, immutable calculation functions (budget variance, timeline conflict detection, vendor deliverables, prompt sanitization). No framework dependencies, 100% unit-tested.
2. `src/services/`: Business services including swappable LLM adapters, sliding-window rate limiters, and TTL-based generation caches.
3. `src/app/api/`: Thin Next.js Route Handlers responsible solely for HTTP request decoding, Zod validation, rate-limiting, and response streaming.
4. `src/components/`: Reusable React UI components and custom hooks adhering to WCAG 2.2 AA keyboard navigation.
5. `src/lib/`: Zod-validated environment config (`env.ts`) that fails fast on startup.

### Consequences

- Every function is strictly under 40 lines.
- Unused variables and dead code are banned by compiler flags.
- Testability is maximized since domain logic is pure and decoupled from React and Next.js.

---

## ADR 003: Swappable LLM Provider Pattern (ClaudeProvider & MockProvider)

- **Date:** 2026-10-24
- **Status:** Accepted

### Context

Event planning generative tasks require robust LLM integration (streaming chat responses, structured recommendations). However, tests must never call external LLM APIs, and the application must support swappable providers without rewriting business logic.

### Decision

- Define a generic `LLMProvider` interface in `src/services/llm/types.ts`:
  - `generateText(prompt, options): Promise<string>`
  - `streamText(prompt, options): Promise<ReadableStream<string>>`
  - `generateStructured<T>(prompt, schema, options): Promise<T>`
- Provide `ClaudeProvider` powered by `@anthropic-ai/sdk`.
- Provide `MockProvider` for deterministic, zero-network unit/integration testing.
- Expose `getLLMProvider()` factory selecting the active provider based on `env.LLM_PROVIDER` and available credentials.

### Consequences

- Provider implementations can be swapped without touching UI or domain code.
- 100% deterministic test execution with zero external network flakiness.

---

## ADR 006: Zod Domain Schemas, Pure Logic, and Drizzle Repository Pattern

- **Date:** 2026-10-24
- **Status:** Accepted

### Context

Utsava requires strong schema validation with exported inferred types for Event, BudgetItem, TimelineTask, Vendor, and IdeaSet entities, along with Drizzle ORM SQLite tables and pure algorithmic functions for budget rebalancing, timeline back-scheduling with cycle detection, and vendor checklist templates.

### Decision

- **Zod Schemas**: Authored in `src/domain/schemas.ts` with runtime validation and exported TypeScript types for all entities.
- **Drizzle SQLite Schema**: Tables defined in `src/domain/db/schema.ts` (`events`, `budget_items`, `timeline_tasks`, `vendors`, `idea_sets`) supporting JSON columns for complex preferences and metadata.
- **Pure Functions**:
  - `allocateBudget`, `rebalanceBudget`, and `detectOverspend` in `src/domain/budgetLogic.ts`.
  - `backScheduleTimeline`, `detectCycles`, and `subtractDays` in `src/domain/timelineLogic.ts`.
  - `getVendorChecklistTemplates`, `filterTemplatesByCategory`, and `filterTemplatesByPriority` in `src/domain/vendorTemplates.ts`.
- **Repository Pattern**: `EventRepository` interface in `src/services/repositories/eventRepository.ts` implemented by `DrizzleEventRepository` in `src/services/repositories/drizzleEventRepository.ts` using `better-sqlite3`.

### Consequences

- Over 99% statement and line coverage on `src/domain`.
- Route handlers remain strictly thin adapters without embedded business logic.
- Functions strictly under 40 lines with complete pure modular separation.
- Database queries and persistence are decoupled behind the `EventRepository` interface.

---

## ADR 007: Structured Validated AI Outputs, Multi-Capability Prompt Versioning, and Fallback Strategy

- **Date:** 2026-10-24
- **Status:** Accepted

### Context

Event planning features (budget allocations, back-scheduled timelines, vendor checklists, personalized creative themes, and chat planning assistant) must leverage GenAI while strictly adhering to system safety, privacy, and reliability constraints. Raw LLM text must never reach the user interface unvalidated, and provider failures or schema parse errors must never crash the user experience.

### Decision

1. **Versioned Parameterized Prompt Templates**:
   - Structured templates in `src/services/ai/prompts/` (one file per capability: `budgetPrompt.ts`, `timelinePrompt.ts`, `vendorPrompt.ts`, `ideasPrompt.ts`, `chatPrompt.ts`).
   - Every template is parameterized by `PersonalizationContext` (eventType, culture, budget band, guest count, dietary, accessibilityNeeds, location, eventDate).
   - Raw user input is never string-concatenated into system instructions; inputs are sanitized and safely enclosed in structured markdown/JSON boundaries.

2. **Structured Execution with Single Retry & Deterministic Fallback**:
   - `executeStructuredWithRetry` validates every LLM response against a Zod schema.
   - On parse failure, retries once with the exact validation error formatted for the model.
   - On second failure or provider exception, transparently falls back to deterministic Phase 2 domain logic (`allocateBudget`, `backScheduleTimeline`, `getVendorChecklistTemplates`, `buildMockIdeas`).

3. **Tool Calling & Plan Modification**:
   - The chat assistant supports three validated tool calls: `add_task`, `update_budget_item`, and `shortlist_vendor`.
   - Tool calls are validated via `ToolCallSchema` and applied to `EventPlan` immutably using pure editor functions in `planEditor.ts`.
   - Chat replies are streamed to the client via `ReadableStream<Uint8Array>`.

4. **Guardrails & Normalized Input Caching**:
   - `checkScopeGuardrails` enforces event planning scope and polite refusals for unrelated queries (coding, politics, medical, trading) while defending against prompt injections.
   - `createNormalizedHashKey` normalizes string casing, trims whitespace, and sorts nested keys and arrays, caching identical requests in `generationCache`.

### Consequences

- Zero unvalidated LLM output reaches the UI.
- All capabilities function deterministically in test environments with `MockProvider`.
- Full graceful degradation under network or model outages via Phase 2 fallbacks.
- Strict function length (<40 lines) and strict TypeScript without `any`.
