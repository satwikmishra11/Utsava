# Utsava (उत्सव) — GenAI Event Planning Assistant

[![CI](https://github.com/satwikmishra11/Utsava/actions/workflows/ci.yml/badge.svg)](https://github.com/satwikmishra11/Utsava/actions/workflows/ci.yml)
[![WCAG 2.2 Level AA](https://img.shields.io/badge/WCAG%202.2-Level%20AA%20Compliant-emerald.svg)](docs/ACCESSIBILITY.md)
[![Test Coverage](<https://img.shields.io/badge/Coverage-96.6%25%20(Gate%3A%2085%25%2F90%25)-blue.svg>)](docs/DECISIONS.md#adr-012)
[![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-96%20Mobile-gold.svg)](docs/PERFORMANCE.md)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Live%20on%20Vercel-black.svg?logo=vercel)](https://utsava.vercel.app)

> **Utsava** (_Sanskrit for "celebration" / "festival"_) is an intelligent, accessible, and culturally attuned event planning platform for life's most momentous gatherings — weddings, milestone birthdays, and community festivals.

🌐 **Live Demo:** [https://utsava.vercel.app](https://utsava.vercel.app)  
⚡ **Demo Mode Active:** Works instantly out-of-the-box with **no API key required** (uses deterministic `MockProvider` and 3 pre-seeded realistic celebrations).

---

## Preview

![Utsava Event Planning Dashboard](public/screenshots/utsava_dashboard_preview.jpg)

---

## 1. Problem Statement

Event planning is universally recognized as one of the most stressful life experiences. Planners face four chronic breakdowns:

1. **Cultural Disconnect & Rigid Templates**: Generic project tools (spreadsheets, Trello) are culturally agnostic. They cannot anticipate multi-day Indian wedding rituals (Haldi, Mehendi, Sangeet, Pheras), specific dietary requirements (Jain, Halal, Kosher, nut allergies), or community festival municipal permits.
2. **Budget Fragmentation & Silent Overspending**: Budgets are rarely balanced mathematically across categories. Planners make early venue commitments that cannibalize entertainment or photography without realization until invoices arrive.
3. **Timeline Conflicts & Unrealistic Scheduling**: Day-of logistics require reverse-scheduling from key milestone ceremonies while accounting for phase-by-phase dependencies and guest transitions.
4. **Unreliable "Black Box" AI**: Most generative AI tools spit out unstructured, hallucinated text that cannot be edited or integrated into a real budget or calendar.

### The Utsava Solution

Utsava combines **structured generative AI with human-in-the-loop control**, backed by strict domain models, mathematical rebalancing, automated back-scheduling, and complete WCAG 2.2 AA accessibility.

---

## 2. Features per Event Vertical

Utsava delivers deep, domain-specific capabilities tailored to each celebration type:

| Event Vertical                        | Domain-Specific Challenges Solved                                                                        | Key Features in Utsava                                                                                                                                                                                                                                                                                                                                     |
| :------------------------------------ | :------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 💍 **Indian Weddings**                | Multi-day logistics, complex family roles, dietary customs (Jain, Halal, Pure Veg), elder accessibility. | • Multi-day ritual run of show (Haldi, Mehendi, Baraat, Mandap, Sangeet, Bidaai).<br>• Percentage budget allocations across Palace banquets, catering, and cinematography.<br>• Cultural idea studio: Marigold/brass decor, artisanal thandai bars, and step-free floral mandap ramp designs.<br>• Vendor procurement across booked/shortlisted statuses.  |
| 🎂 **Milestone Birthdays**            | Age-appropriate entertainment pacing, kid allergen safety, sensory relief accommodations.                | • Run-of-show pacing (junior ranger check-in, animal shows, cake cutting).<br>• Allergen-safe catering tracking (100% peanut-free bakery, dairy-free alternatives).<br>• Inclusive accommodation: Sensory-friendly quiet tents and wheelchair lawn matting.<br>• Party favor and custom cake cost budgeting.                                               |
| 🎪 **Community Events & Fundraisers** | Municipal permits, donor visibility, stage accessibility, volunteer coordination, waste diversion.       | • Municipal park permit, noise variance, and safety inspection checklist.<br>• Stage accessibility: ADA ramp certification, live ASL interpretation, and audio induction loops.<br>• Sponsor & silent auction milestone tracking with fundraising thermometer.<br>• Zero-waste diversion: Tri-stream composting and local artisan food truck coordination. |

---

## 3. Architecture & Data Flow

Utsava is built upon a **Five-Tier Clean Architecture** with strict dependency isolation:

```mermaid
flowchart TD
    subgraph UI ["1. UI & Client Layer (Next.js 15 App Router & RSC)"]
        Page["Server Component (page.tsx)"]
        Dashboard["Client Boundary (EventPlannerDashboard)"]
        Wizard["Onboarding Wizard (5 Steps)"]
        Tabs["Dynamic Tab Panels (Budget, Timeline, Vendors, Ideas, Chat)"]
        TokenHUD["Dev Token Telemetry Panel"]
        LiveRegion["ARIA-Live Polite Announcer"]
    end

    subgraph API ["2. API Route Handlers (Next.js Thin Endpoints)"]
        EventsRoute["/api/events (GET, POST)"]
        EventIdRoute["/api/events/[id] (GET, PUT, DELETE)"]
        ChatRoute["/api/chat (Streaming SSE / Uint8Array)"]
        AuthRoute["/api/auth/session (HMAC-SHA256 Session Cookie)"]
    end

    subgraph Services ["3. Application Services & Infrastructure"]
        LLMFactory["LLM Provider Factory (ClaudeProvider | MockProvider)"]
        RateLimit["Sliding-Window Rate Limiter (User ID & IP)"]
        GenCache["Normalized Hash Generation Cache (TTL & Invalidation)"]
        Guardrails["Prompt Injection Stripper & Scope Guardrails"]
        Repo["DrizzleEventRepository (SQLite Batch Ingestion)"]
    end

    subgraph Domain ["4. Pure Domain Logic & Zod Validation (Zero Framework Coupling)"]
        BudgetEngine["Budget Allocator & Overspend Variance Engine"]
        TimelineEngine["Back-Scheduling & Dependency Cycle Detector"]
        VendorEngine["Vendor Checklist & Lead-Time Rules"]
        Schemas["Exported Zod Schemas & Inferred Types"]
        DemoEvents["3 Golden Realistic Event Datasets"]
    end

    subgraph DB ["5. Storage Layer"]
        SQLite[("SQLite Database (Foreign Key Indexes)")]:-
    end

    Page --> Dashboard
    Dashboard --> Wizard
    Dashboard --> Tabs
    Dashboard --> TokenHUD
    Dashboard --> LiveRegion
    Tabs --> API
    Wizard --> API

    API --> RateLimit
    API --> Guardrails
    API --> Schemas
    API --> LLMFactory
    API --> GenCache
    API --> Repo

    LLMFactory --> Domain
    Repo --> SQLite
```

---

## 4. Quickstart Setup in 5 Commands

Get Utsava running locally in less than 60 seconds:

```bash
# 1. Clone the repository
git clone https://github.com/satwikmishra11/Utsava.git

# 2. Enter directory
cd Utsava

# 3. Install dependencies
npm install

# 4. Seed database with 3 realistic celebrations
npm run seed

# 5. Start development server (Demo mode enabled by default)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Environment Variables

Utsava uses a fail-fast Zod-validated schema in [`src/lib/env.ts`](src/lib/env.ts):

| Variable            | Required |         Default         | Description                                                                   |
| :------------------ | :------: | :---------------------: | :---------------------------------------------------------------------------- |
| `NODE_ENV`          |    No    |      `development`      | Runtime environment (`development`, `test`, `production`).                    |
| `PORT`              |    No    |         `3000`          | Local HTTP server port.                                                       |
| `LLM_PROVIDER`      |    No    |         `mock`          | Active LLM adapter: `mock` (zero API key required) or `claude`.               |
| `ANTHROPIC_API_KEY` | Optional |       `undefined`       | Claude API key from Anthropic Console (only needed if `LLM_PROVIDER=claude`). |
| `SESSION_SECRET`    |    No    | Default 32-char dev key | HMAC-SHA256 cookie signing secret (min 32 characters).                        |

---

## 6. Demo Mode (Zero API Key Required)

Utsava includes a built-in **Demo Mode** enabled by default:

- **No external API key needed**: Runs entirely on the deterministic `MockProvider`.
- **Pre-Seeded Celebrations**: Instantly switch between:
  1. 💍 **Aarav & Meera's Grand Royal Wedding** ($65,000 | 350 guests)
  2. 🎂 **Anya's 7th Magical Rainforest Safari** ($3,500 | 45 guests)
  3. 🎪 **Oakridge Harmony Park Revitalization Gala** ($20,000 | 500 guests)
- **Full Interactivity**: You can regenerate AI budgets, back-schedule timelines, explore vendor checklists, and chat with the AI assistant with real-time tool proposals.

---

## 7. Testing & Quality Verification Commands

The test pyramid is deterministic, mocked, and executes in **under 35 seconds total**:

```bash
# Strict TypeScript compiler verification (noUncheckedIndexedAccess, no any)
npm run typecheck

# ESLint code style & jsx-a11y validation
npm run lint

# Vitest test suite with Coverage Gate (85% overall, 90% domain & services)
npm run test:coverage

# Playwright End-to-End & Axe-Core Accessibility tests
npm run test:e2e

# Production build validation
npm run build
```

---

## 8. Documentation Index

Detailed architectural and conformance documentation:

- 📋 [**How this maps to the Judging Criteria**](docs/JUDGING_CRITERIA.md): Comprehensive evidence guide with code links for all 6 evaluation criteria.
- 🏛️ [**Architecture Decisions Log (ADRs)**](docs/DECISIONS.md): ADR 001 through ADR 012 detailing design trade-offs.
- 🛡️ [**Security Architecture & Threat Model**](docs/SECURITY.md): STRIDE-lite analysis, prompt injection defense, CSRF, and IDOR prevention.
- ♿ [**Accessibility Conformance Report**](docs/ACCESSIBILITY.md): WCAG 2.2 AA matrix, axe-core automated audits, and screen reader verification.
- ⚡ [**Performance Optimization Report**](docs/PERFORMANCE.md): Mobile Lighthouse 96/100, 116 KB JS bundle, and N+1 query elimination benchmarks.

---

## 9. Deployment to Vercel

Utsava is configured for zero-config Vercel deployment:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsatwikmishra11%2FUtsava)

```bash
# Or deploy using Vercel CLI
npx vercel --prod
```

---

## 10. License

Released under the [MIT License](LICENSE). Built for life's most cherished gatherings.
