# Utsava Architecture Guide

Utsava is built upon a five-tier layered architecture designed for strict dependency isolation, deterministic fallback capability, and verifiable code quality.

## Architectural Layers

The codebase enforces strict boundary rules: the domain layer is completely decoupled from UI and network concerns, while services encapsulate external integrations and stateful coordination.

```
src/
├── domain/       # Pure models, types, Zod schemas, calculations, security guards
├── services/     # Business logic, swappable LLM providers, rate limiting, caching
├── app/api/      # Thin Next.js Route Handlers (validate, call service, return)
├── components/   # React 19 UI components, accessible hooks, layout primitives
└── lib/          # Environment configuration, constants, and shared utilities
```

### Module Responsibility Table

| Directory / Module             | Primary Responsibility                                                                    | Key Design Constraint                                                                   |
| :----------------------------- | :---------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| `src/domain/schemas.ts`        | Single source of truth for runtime validation and static TypeScript types (`z.infer`)     | Zero external dependencies beyond Zod; all domain types derive here                     |
| `src/domain/budget/`           | Pure budget calculations, overspend detection, risk assessment, and contextual heuristics | 100% deterministic, zero network calls, pure functions under 40 lines                   |
| `src/domain/timeline/`         | Task scheduling, dependency cycle detection, milestone sorting, and lead-time compression | Pure mathematical and temporal operations                                               |
| `src/domain/security.ts`       | Prompt injection detection, HTML entity sanitization, and secure instruction envelopes    | Defends against delimiter hijacking and system prompt override attacks                  |
| `src/domain/demo/`             | Golden seed datasets for Indian Wedding, Birthday, and Community Gala celebrations        | Offline demonstration without API dependencies                                          |
| `src/services/llm/`            | Swappable LLM provider abstractions (`ClaudeProvider`, `MockProvider`)                    | Common interface for streaming and structured prompt completion                         |
| `src/services/ai/`             | Structured prompt builders, generation caching, token telemetry, and self-healing retries | Automatically falls back to deterministic domain engines on validation failure          |
| `src/services/rateLimiter.ts`  | Sliding-window in-memory rate limiting by client IP and session user ID                   | Prevents resource exhaustion on AI generation routes                                    |
| `src/services/cacheService.ts` | Deterministic key-value generation cache with TTL and normalization                       | Prevents duplicate LLM token burn on identical planning requests                        |
| `src/services/auth/`           | Double-submit CSRF verification and HMAC-SHA256 signed session cookie management          | Zero client-side privilege escalation                                                   |
| `src/services/repositories/`   | SQLite persistence abstraction powered by Drizzle ORM                                     | Layered database operations with strict DTO-to-domain mappers                           |
| `src/app/api/`                 | Thin Next.js Route Handlers                                                               | Receives request, enforces CSRF/auth, validates with Zod, invokes service, returns JSON |
| `src/components/`              | Accessible React 19 client components and feature hooks                                   | WAI-ARIA compliant, WCAG 2.2 AA accessible, keyboard-operable                           |
| `src/lib/`                     | Zod-validated environment variables, application constants, and export helpers            | Fails fast at startup if configuration is invalid                                       |

## Request Flow Lifecycle

Every generative planning request proceeds through a predictable, fail-safe lifecycle:

```
User Action (Wizard / Chat / Regenerate)
  │
  ▼
[1] Security & Auth: CSRF Token & HMAC Session Cookie Validation
  │
  ▼
[2] Abuse Prevention: Sliding-Window Rate Limiter (IP + User ID)
  │
  ▼
[3] Input Validation: Zod Schema Parsing & Prompt Injection Sanitization
  │
  ▼
[4] Cache Lookup: Deterministic SHA-256 Context Hash Hit?
      ├── YES ──> Return Cached Generation (<1ms response, 0 tokens)
      └── NO
            │
            ▼
[5] Provider Selection: LLM_PROVIDER ('claude' vs 'mock')
      ├── 'mock' ──> Execute Pure Domain Engine (budgetAdvisor / planTimeline)
      └── 'claude'
            │
            ▼
[6] Primary Generation: Claude 3.5 Sonnet Structured Request
      │
      ├── Success (Zod Valid) ──> Cache Result & Return Response
      └── Parse Error / Timeout
            │
            ▼
[7] Self-Healing Retry: Corrective Prompt with Specific Zod Errors
      │
      ├── Success (Zod Valid) ──> Cache Result & Return Response
      └── Failure
            │
            ▼
[8] Deterministic Fallback: Pure Domain Engine executes fallback
      │
      └── Result Normalized, Cached, and Returned Safely to User
```

## Architectural Boundaries

Enforced via ESLint `no-restricted-imports` and automated architecture tests:

1. **Domain Isolation**: Code in `src/domain/` MUST NOT import from `src/services/`, `src/components/`, or `src/app/`.
2. **Service Decoupling**: Code in `src/services/` MUST NOT import from `src/components/`.
3. **No Direct Component Shims**: Feature folders contain components directly; root-level shim re-exports are prohibited.
4. **Single Source of Truth for Types**: Zod schemas in `src/domain/schemas.ts` are the canonical source. All domain models derive via `z.infer`.

## Key Architectural Decisions

1. **Pure Domain Fallback Engine**: If upstream LLM calls fail, time out, or encounter validation discrepancies, Utsava falls back to deterministic domain algorithms (`adviseBudgetSplit`, `planTimeline`, `getVendorChecklistTemplates`) that produce valid, explainable plans with zero user disruption.
2. **Deriving Types from Runtime Schemas**: To eliminate drift between compile-time contracts and runtime data, TypeScript types are generated directly via `z.infer` on Zod schemas.
3. **Factory Functions for Dependency Decoupling**: Modules with shared state (rate limiters, caches, LLM providers) expose factory functions (`createRateLimiter`, `createGenerationCache`, `createLLMProvider`) taking dependencies as arguments, alongside default application singletons.
4. **Zero Client-Side Privilege Leakage**: Double-submit CSRF and HMAC-SHA256 session signatures are enforced server-side. No client is granted authority over entity primary keys or system prompts.
