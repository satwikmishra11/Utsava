# Utsava Developer Guide (AGENTS.md)

Utsava is a GenAI-powered event planning assistant for weddings, birthdays, and community events. Core capabilities: budget planner, timeline generator, vendor checklist, personalized idea studio, and a plan-acting chat assistant.

## Judging Criteria & Principles

1. **Code quality**: Strict TypeScript, small pure functions (<40 lines), layered architecture (`domain / services / api / components / lib`), no `any`, no dead code.
2. **Security**: Validate all inputs with Zod, never expose API keys client-side, rate-limit AI routes, defend against prompt injection, sanitize output.
3. **Efficiency**: Stream AI responses, cache repeated generations, avoid unnecessary re-renders, keep bundle small.
4. **Testing**: Unit + integration + e2e; LLM is always mocked in tests.
5. **Accessibility**: WCAG 2.2 AA, keyboard-first, semantic HTML, ARIA only when needed, axe checks in CI.
6. **Problem alignment**: Every feature serves event budgets, timelines, vendors, or personalized ideas.

## Project Structure

```
src/
├── domain/       # Pure models, types, Zod schemas, calculations, security guards
├── services/     # Business logic, swappable LLM providers (Claude, Mock), rate limiting, caching
├── app/api/      # Thin Next.js Route Handlers
├── components/   # React components, accessible hooks, layout primitives
└── lib/          # Zod-validated env handling and utility libraries
```

## Commands

```bash
npm run dev        # Launch development server
npm run lint       # Run ESLint with jsx-a11y plugin
npm run typecheck  # Run strict TypeScript compiler verification
npm test           # Run Vitest unit, integration, and axe accessibility tests
npm run test:e2e   # Run Playwright end-to-end tests
npm run build      # Build optimized Next.js production bundle
npm run format     # Format code with Prettier
```

## Rules

- Ask before adding any new dependency.
- Write tests with each new feature.
- Keep every function under 40 lines.
- Document architectural decisions in `docs/DECISIONS.md`.
