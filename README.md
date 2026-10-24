# Utsava (उत्सव)

> GenAI-powered event planning assistant for life's most cherished gatherings — weddings, milestone birthdays, and community festivals.

Utsava orchestrates event planning across five core pillars:

1. **Budget Planner**: Cost allocation, category breakdown, committed vs. actual tracking, and automated risk warnings.
2. **Timeline Generator**: Chronological run-of-show, day-of schedule coordination, conflict detection, and AI auto-scheduling.
3. **Vendor Checklist**: Procurement tracking across statuses (researching, contacted, quoted, hired), contract notes, and deliverables.
4. **Personalized Idea Studio**: Cultural motif suggestions, decor concepts, and bespoke culinary ideas tailored to guest count and budget tier.
5. **Plan-Acting Chat Assistant**: Context-aware AI assistant that can propose concrete modifications to the plan with one-click user approval.

---

## Architecture & Layering

```
src/
├── domain/       # Pure models, types, Zod schemas, calculations, security guards
├── services/     # Swappable LLM providers (Claude, Mock), rate limiting, caching
├── app/api/      # Thin Next.js App Router Route Handlers
├── components/   # Accessible UI components styled with Tailwind CSS & Design Tokens
└── lib/          # Zod-validated environment config and shared utilities
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation & Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/satwikmishra11/Utsava.git
   cd Utsava
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Quality & Verification Commands

All changes must pass:

```bash
npm run lint       # ESLint with next/core-web-vitals and jsx-a11y
npm run typecheck  # Strict TypeScript compiler check (noUncheckedIndexedAccess, no any)
npm test           # Vitest unit, integration, and axe-core accessibility tests (LLM mocked)
npm run build      # Next.js production bundle build
```

---

## Architectural Decisions

All architectural trade-offs are logged in [docs/DECISIONS.md](docs/DECISIONS.md):

- **ADR 001**: Next.js App Router, Strict TypeScript, and Approved Dependencies
- **ADR 002**: Layered Clean Architecture (`domain / services / api / components / lib`)
- **ADR 003**: Swappable LLM Provider Pattern (`ClaudeProvider` & `MockProvider`)
