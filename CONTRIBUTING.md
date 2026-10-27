# Contributing to Utsava

Thank you for contributing to Utsava! This document outlines our engineering standards, architectural rules, and contribution workflow.

## Core Engineering Principles

1. **Strict TypeScript & Layered Architecture**:
   - Zero `any`. All types must be strictly defined and validated at runtime via Zod schemas.
   - Respect architectural boundaries: `domain` cannot import from `services`, `components`, or `app`; `services` cannot import from `components`.
2. **Small Pure Functions**:
   - Keep every function under 40 lines.
   - Separate pure domain calculations (budget allocation, timeline scheduling, overspend detection) from stateful service orchestration.
3. **Security by Default**:
   - All user inputs must pass strict Zod validation before processing.
   - All mutating API routes must enforce double-submit CSRF and HMAC-signed session verification.
   - Never expose API keys or secrets to the client.
   - Sanitize prompt inputs to protect against prompt injection and delimiter hijacking.
4. **Accessibility First (WCAG 2.2 AA)**:
   - Ensure all interactive elements are keyboard-operable with visible focus rings.
   - Maintain color contrast ratios exceeding 4.5:1 for body copy and 3:1 for UI elements.
   - Use semantic HTML tags before ARIA attributes; verify automated accessibility via `axe-core`.
5. **No Blind Dependencies**:
   - Do not add new dependencies to `package.json` without team discussion.

## Local Development Workflow

```bash
# Install dependencies
npm install

# Start local Next.js development server
npm run dev

# Run all quality checks before committing
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e
```

## Pull Request Checklist

Before submitting a pull request, ensure:

- [ ] `npm run format:check` reports no formatting discrepancies.
- [ ] `npm run lint` passes with zero warnings or errors.
- [ ] `npm run typecheck` completes cleanly without errors.
- [ ] `npm run test:coverage` passes and meets or exceeds coverage gates (85% global, 90% domain/services).
- [ ] `npm run test:e2e` passes all end-to-end integration flows.
- [ ] New features include corresponding unit and accessibility tests.
- [ ] Architectural changes are documented in `docs/DECISIONS.md`.
