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

# Run strict TypeScript compiler verification without emitting files
npm run typecheck

# Run ESLint checks (including jsx-a11y and architectural import boundaries)
npm run lint

# Run Prettier code formatting verification
npm run format:check
```

## Mocking Principles

1. **Deterministic LLM Testing**: The LLM is always mocked in unit and integration test runs using `MockProvider` or deterministic mock responses. Live Anthropic API keys are never required to execute the test suite.
2. **State Isolation**: Database tests utilize an in-memory SQLite database instance (`:memory:`) or isolated test tables initialized via migrations before test suites execute.
3. **No Coverage Weakening**: Coverage thresholds in `vitest.config.ts` must never be lowered. All new domain and service logic must include comprehensive test coverage.
