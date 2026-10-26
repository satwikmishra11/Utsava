# Refactor guardrails

This is a behavior-preserving refactor of Utsava for code quality only.

Frozen contract. Do not change:

- Rendered text, element ids, roles, aria-* attributes, DOM order. Tests and
  e2e rely on ids such as tab-_, panel-_, btn-wizard-next, btn-open-wizard,
  btn-add-budget-item, btn-accept-_-ai, btn-dismiss-_-ai,
  btn-apply-action-*, chat-live-region.
- API routes, request/response shapes, status codes.
- Security code: csrf, session, rateLimiter, guardrails, middleware, CSP.
- CSS values (the app must look pixel-identical).
- Test assertions (you may only update import paths), vitest coverage
  thresholds, CI steps.
- Dependencies: do not add any; if one seems needed, stop and ask.
  Exception: Phase 1 may declare @eslint/eslintrc as a devDependency
  (already in package-lock.json) and remove unused packages.

Method: extract, don't rewrite. Move code verbatim into smaller functions
or files, then simplify. After every step run, and fix until green:
npm run format:check && npm run lint && npm run typecheck &&
npm run test:coverage && npm run build && npm run test:e2e
If a failure can't be fixed without breaking the frozen contract, revert
that step and report it.
