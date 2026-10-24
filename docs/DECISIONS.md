# Architecture Decisions Log (ADR) - Utsava

This document records the architectural and design decisions made for Utsava in accordance with our six core judging criteria:
1. Code quality (strict TS, pure functions <40 lines, layered architecture, no `any`, no dead code)
2. Security (Zod validation, server-only secrets, rate-limiting, prompt injection defenses, output sanitization)
3. Efficiency (AI streaming, caching, minimal re-renders, lightweight bundle)
4. Testing (unit + integration + e2e with mocked LLM)
5. Accessibility (WCAG 2.2 AA, keyboard-first, semantic HTML, axe-checked)
6. Problem alignment (weddings, birthdays, community events: budgets, timelines, vendors, ideas, plan-acting chat)

---

## ADR 001: Core Architecture, Layered Structure & Foundation Dependencies

- **Date:** 2026-10-24
- **Status:** Accepted (Approved by User)

### Context & Problem Statement
Utsava requires a full-stack TypeScript environment capable of streaming generative AI responses securely, maintaining event planning state (budgets, timelines, vendor checklists, ideas), validating all inputs with Zod, and enforcing a strict 4-layer architecture. We must explicitly obtain approval for dependencies before installation.

### Proposed Architecture Layers
1. **Domain Layer (`src/domain/`)**:
   - Pure domain models, TypeScript types, invariants, and validation schemas (`zod`).
   - Pure calculation and transformation functions (budget allocation calculators, timeline schedule generators, vendor categorization, prompt construction).
   - Zero side-effects, no dependency on framework or network. Maximum testability.
2. **Services Layer (`src/services/`)**:
   - Business services: AI service adapter (Gemini API with streaming), in-memory cache for repeated generations, rate-limiter (token bucket / sliding window), prompt sanitization and safety guardrails.
   - Mock implementations for testing.
3. **API / Route Layer (`src/app/api/`)**:
   - Next.js App Router Route Handlers.
   - Validates incoming JSON payloads using Zod schemas.
   - Enforces rate limits per client/session.
   - Streams responses back to UI using `ReadableStream`.
   - Never exposes API keys to client.
4. **UI Layer (`src/ui/` & `src/app/`)**:
   - Pure React components styled with modern CSS Modules / Design System tokens.
   - WCAG 2.2 AA compliant, keyboard accessible, ARIA landmarks, high contrast modes.
   - Feature views:
     - Budget Planner (cost estimation, category breakdown, variance tracking)
     - Timeline Generator (milestone schedules, day-of agenda, countdown)
     - Vendor Checklist (procurement workflow, RFP notes, status tracking)
     - Personalized Idea Generator (theme, decor, food, cultural traditions)
     - Chat Assistant (context-aware assistant that can inspect and modify event plan)

### Proposed Dependencies for User Approval
- **Runtime Dependencies**:
  - `next`: React application framework with App Router, server endpoints, and streaming support.
  - `react`, `react-dom`: UI library.
  - `zod`: Schema validation for API payloads, domain invariants, and LLM structured outputs.
  - `@google/genai`: Official Google GenAI SDK for Gemini streaming and structured calls.
  - `lucide-react`: Lightweight, accessible icon system with SVGs.
- **Development & Testing Dependencies**:
  - `typescript`, `@types/node`, `@types/react`, `@types/react-dom`: Strict type system configuration.
  - `vitest`: Fast, modern unit test runner.
  - `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`: Component and accessibility integration testing.
  - `axe-core`: Automated WCAG 2.2 AA accessibility audit.
  - `playwright`: End-to-end browser testing.

### Consequences
- Clean separation of concerns.
- Every function will strictly adhere to <40 lines.
- AI keys are safeguarded in server-side route handlers.
- Deterministic unit testing for domain and service layers with 100% mocked LLMs.
