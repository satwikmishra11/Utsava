# Utsava Testing Guide

Utsava maintains a multi-layered testing strategy ensuring correctness, security, accessibility, and architectural compliance across the entire event planning assistant.

## Testing Layers Overview

| Layer                   | Framework & Tools           | Scope                                                                                                        | Location                                                                          |
| :---------------------- | :-------------------------- | :----------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **Unit Tests**          | Vitest                      | Pure domain calculations, heuristics, Zod schemas, security sanitizers, rate limiters, and prompt builders   | `src/domain/**/__tests__/`, `src/services/**/__tests__/`, `src/lib/**/__tests__/` |
| **Accessibility Tests** | Vitest, JSDOM, `axe-core`   | Automated WCAG 2.2 Level AA compliance verification on rendered React components                             | `src/components/__tests__/accessibility.test.tsx`, `wizardAccessibility.test.tsx` |
| **Integration Tests**   | Vitest, Next.js route mocks | Thin API route handlers, CSRF authentication, rate limiting, and IDOR protection                             | `src/app/api/__tests__/`                                                          |
| **Contract Tests**      | Vitest, Zod                 | LLM output validation and schema compatibility verification                                                  | `src/services/ai/__tests__/contracts/`                                            |
| **Architecture Tests**  | Vitest, Node fs/path        | Structural rules: no non-barrel re-exports, file length ceilings, zero console outside scripts, doc presence | `src/__tests__/architecture.test.ts`                                              |
| **Live AI Smoke Tests** | `tsx scripts/live-smoke.ts` | Verification of genuine live LLM generation across all 5 AI endpoints against deployed or local target       | `scripts/live-smoke.ts`, `scripts/smokeAssertions.ts`                             |
| **End-to-End Tests**    | Playwright                  | Full user journeys in real headless Chromium: wizard completion, tab navigation, budget edits, export flows  | `e2e/`                                                                            |

## Test Execution Commands

```bash
# Run all Vitest unit, integration, and accessibility tests
npm test

# Run tests with code coverage verification (85% global, 90% domain/services)
npm run test:coverage

# Run tests in interactive watch mode for active development
npm run test:watch

# Run Playwright end-to-end tests
npm run test:e2e

# Run live AI smoke verification against a deployed or local instance (requires live API key)
BASE_URL=https://utsava-wheat.vercel.app npm run smoke:live

# Run strict TypeScript compiler verification without emitting files
npm run typecheck

# Run ESLint checks (including jsx-a11y and architectural import boundaries)
npm run lint

# Run Prettier code formatting verification
npm run format:check
```

## Live AI Smoke Verification (`smoke:live`)

To confirm that a deployed or local production instance communicates with real live AI providers (Google Gemini or Anthropic Claude) and never falls back to mock or deterministic stubs, Utsava provides a dedicated live smoke verification script:

```bash
# Target deployed instance
BASE_URL=https://utsava-wheat.vercel.app npm run smoke:live

# Target local dev instance
BASE_URL=http://localhost:3000 npm run smoke:live
```

### Verification Flow & Invariants

1. **AI Status Verification**: Queries `GET /api/ai/status` and ensures `live === true`. Halts immediately if the target instance is in offline demo mode.
2. **Session & CSRF Authentication**: Establishes an authenticated session via `POST /api/auth/session` and sends double-submit CSRF headers (`X-Requested-With`, `X-CSRF-Token`, matching `Origin` and `Referer`).
3. **Contrasting Context Testing**: Probes `/api/ideas`, `/api/timeline`, `/api/vendors`, `/api/budget`, and `/api/chat` with two radically distinct event profiles (300-guest Vedic Wedding in Delhi vs. 25-guest Wild Safari Kids Birthday in Pune).
4. **Pacing & 429 Resilience**: Paces requests 2.5s apart and automatically retries with backoff if free-tier Gemini rate limits (HTTP 429) are encountered.
5. **Quality Invariants**:
   - `meta.source` MUST be `'llm'` or `'retry'` (never `'fallback'`).
   - Ideas, timelines, vendors, and budgets for the two events MUST produce distinct titles, allocations, and vendor recommendations (not merely length differences).
   - Chat assistant output MUST NOT match the legacy canned string `"I can assist you with that! I will adjust the catering budget accordingly."`.
6. **Zero Secrets in Logs**: Prints a clean terminal summary table without emitting credentials or raw response bodies. Exits non-zero on any failure.

## Mocking Principles

1. **Deterministic LLM Testing via Dependency Injection**: All capabilities and service functions accept an optional `options?: { provider?: LLMProvider }`. Unit and integration test suites supply `MockProvider` or deterministic mock stubs directly via dependency injection, ensuring zero network calls to external APIs (Google Gemini or Anthropic Claude) and guaranteeing reproducible execution times under 1 millisecond.
2. **Quarantined MockProvider in Test Environments**: When testing provider resolution or API route handlers, test suites explicitly configure `ALLOW_DEMO_MODE=true` alongside `LLM_PROVIDER=mock`. This ensures that `createLLMProvider` operates legally within test bounds without requiring live credentials, while confirming that unpermitted MockProvider requests fail loud in production.
3. **State Isolation**: Database tests utilize an in-memory SQLite database instance (`:memory:`) or isolated test tables initialized via migrations before test suites execute.
4. **No Coverage Weakening**: Coverage thresholds in `vitest.config.ts` must never be lowered (minimum 85% global, 90% domain and services). All new domain and service logic must include comprehensive test coverage.
