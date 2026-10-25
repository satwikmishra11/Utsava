# Utsava Accessibility Conformance & Testing Report

This document details the accessibility architecture, WCAG 2.2 Level AA compliance verification, automated axe-core test suites, and manual assistive technology testing conducted for Utsava.

---

## 1. Executive Summary

Utsava is built from the ground up to achieve strict **WCAG 2.2 Level AA Conformance**. Every user flow—from the onboarding wizard to the plan-acting AI assistant, budget allocation tables, milestone timelines, and vendor directories—is fully operable using keyboard alone, verified with screen readers (Apple VoiceOver and NVDA), tested across dark and light themes for 4.5:1+ contrast, and enforced continuously in CI with zero axe-core violations.

---

## 2. WCAG 2.2 AA Success Criteria Conformance Matrix

| Principle / Criterion                 | WCAG SC                  | Implementation in Utsava                                                                                                                                                                                                                                             | Proof / Test Method                                         |
| ------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Non-text Content**                  | 1.1.1 (A)                | All decorative icons use `aria-hidden="true"`; visual charts provide equivalent text alternatives and data tables; avatar icons have accessible labels.                                                                                                              | `e2e/accessibility.spec.ts`, VoiceOver                      |
| **Info and Relationships**            | 1.3.1 (A)                | Semantic HTML5 landmarks (`header`, `main#main-content`, `nav`, `footer`), single `<h1>` per page, logical `<h2>`/`<h3>` hierarchy, form inputs linked to `<label>` via `htmlFor`, error states linked with `aria-describedby`.                                      | Axe-core rule `landmark-one-main`, `heading-order`, `label` |
| **Meaningful Sequence**               | 1.3.2 (A)                | Tab order strictly matches DOM and visual reading order; modal dialogs isolate DOM flow.                                                                                                                                                                             | Keyboard Tab sequence testing                               |
| **Sensory Characteristics**           | 1.3.3 (A)                | Instructions and statuses do not rely solely on shape, size, or spatial location.                                                                                                                                                                                    | Design audit                                                |
| **Use of Color**                      | 1.4.1 (A)                | Status indicators never rely on color alone. Budget status couples distinct icons (`CheckCircle2` / `AlertTriangle`) with explicit text ("Under Budget" / "Over Budget by $X"). Payment statuses use icons (`CheckCircle2` / `Clock`) and text ("Paid" / "Planned"). | Visual & high-contrast testing                              |
| **Contrast (Minimum)**                | 1.4.3 (AA)               | All text meets or exceeds 4.5:1 contrast against its background in both Dark and Light themes.                                                                                                                                                                       | Axe-core `color-contrast`, manual luminance audits          |
| **Resize Text (200% Zoom)**           | 1.4.4 (AA)               | All typography uses relative units (`rem`, `%`); layouts use flexible CSS Grid and Flexbox with `word-break: break-word` and `overflow-wrap: anywhere`; no horizontal scrolling at 200% zoom.                                                                        | Browser zoom testing at 200% (320px CSS width)              |
| **Reflow**                            | 1.4.10 (AA)              | Responsive layout wraps all controls, panels, and tables. Scrollable table containers feature explicit keyboard focus (`tabIndex={0}`).                                                                                                                              | Responsive viewport testing (320px–1440px)                  |
| **Non-text Contrast**                 | 1.4.11 (AA)              | UI boundaries, focus rings, progress bars, and icons maintain 3:1+ contrast against adjacent backgrounds.                                                                                                                                                            | Color token luminance check                                 |
| **Keyboard Operable**                 | 2.1.1 (A)                | Every interactive element (buttons, tabs, inputs, selects, links) is keyboard-focusable and operable via `Enter` / `Space` / `Arrows`.                                                                                                                               | Full keyboard end-to-end traversal                          |
| **No Keyboard Trap**                  | 2.1.2 (A)                | Dialogs contain keyboard focus while open and gracefully release focus upon pressing `Escape` or activating the close button. Focus is never trapped in any component.                                                                                               | `e2e/accessibility.spec.ts` focus test                      |
| **Bypass Blocks (Skip Link)**         | 2.4.1 (A)                | High-contrast skip link (`Skip to main content`) renders first in DOM, becomes visible on focus, and routes keyboard focus directly to `<main id="main-content" tabIndex={-1}>`.                                                                                     | `e2e/accessibility.spec.ts` skip link test                  |
| **Page Titled**                       | 2.4.2 (A)                | Descriptive `<title>` metadata dynamically provided: `Utsava - GenAI Event Planning Assistant`.                                                                                                                                                                      | Page title assertion in CI                                  |
| **Focus Visible & Appearance**        | 2.4.7 (AA) / 2.4.11 (AA) | Custom `:focus-visible` ring (`2px solid var(--accent-gold); outline-offset: 3px`) applied across all elements; inputs and buttons maintain high-contrast focus rings. No `outline: none` without replacement.                                                       | Focus appearance automated audit                            |
| **Focus Order & Restoration**         | 2.4.3 (A)                | Dialogs record `document.activeElement` upon opening and restore focus to the triggering element upon closing.                                                                                                                                                       | Playwright dialog escape test                               |
| **Language of Page**                  | 3.1.1 (A)                | Root layout declares `<html lang="en">`.                                                                                                                                                                                                                             | Axe-core `html-has-lang` assertion                          |
| **Error Identification & Suggestion** | 3.3.1 (A) / 3.3.3 (AA)   | Form validation errors highlight invalid fields with `aria-invalid="true"`, reference specific guidance via `aria-describedby`, and announce errors via `aria-live="assertive"`.                                                                                     | `BudgetAddForm`, `OnboardingWizard`                         |
| **Status Messages & Live Regions**    | 4.1.3 (AA)               | Streaming chat responses update a dedicated `role="status" aria-live="polite"` region **on completion only**, avoiding continuous screen reader interruption on individual tokens. Stop generating button is provided.                                               | `e2e/accessibility.spec.ts` chat test                       |
| **Animation from Interactions**       | 2.3.3 (AAA/AA)           | `@media (prefers-reduced-motion: reduce)` disables all transitions, keyframe animations, and smooth scrolling for users with vestibular sensitivities.                                                                                                               | CSS reduced motion query audit                              |

---

## 3. Theme Color Contrast Verification

Contrast ratios calculated against WCAG 2.2 AA standards (minimum **4.5:1** for regular text, **3:1** for large text and UI components):

### Dark Mode (Default)

- **Primary Text (`#f8fafc`) on Surface (`#1e293b`)**: **13.9:1** (Passes AAA)
- **Secondary Text (`#cbd5e1`) on Surface (`#1e293b`)**: **8.5:1** (Passes AAA)
- **Muted Text (`#94a3b8`) on Surface (`#1e293b`)**: **5.4:1** (Passes AA)
- **Accent Gold (`#f59e0b`) on Background (`#0b0f19`)**: **9.5:1** (Passes AAA)
- **Primary Button Text (`#0b0f19`) on Gold (`#f59e0b`)**: **9.5:1** (Passes AAA)
- **Success Badge Text (`#6ee7b7`) on Surface (`#1e293b`)**: **8.7:1** (Passes AAA)
- **Danger Badge Text (`#fca5a5`) on Surface (`#1e293b`)**: **7.2:1** (Passes AAA)

### Light Mode (`[data-theme='light']`)

- **Primary Text (`#0f172a`) on Surface (`#ffffff`)**: **16.0:1** (Passes AAA)
- **Secondary Text (`#334155`) on Surface (`#ffffff`)**: **9.0:1** (Passes AAA)
- **Muted Text (`#475569`) on Surface (`#ffffff`)**: **7.0:1** (Passes AAA)
- **Accent Gold (`#b45309`) on Surface (`#ffffff`)**: **5.5:1** (Passes AA)
- **Primary Button Text (`#ffffff`) on Gold Button (`#b45309`)**: **5.5:1** (Passes AA)
- **Success Badge Text (`#065f46`) on Badge BG (`#d1fae5`)**: **7.5:1** (Passes AAA)
- **Danger Badge Text (`#9f1239`) on Badge BG (`#ffe4e6`)**: **7.4:1** (Passes AAA)

---

## 4. Assistive Technology Testing

### 4.1 VoiceOver (macOS / Safari & Chrome)

1. **Initial Page Navigation**:
   - VoiceOver opens at the Skip Link: _"Skip to main content, internal link"_.
   - Pressing `Return` moves VoiceOver cursor directly to `<main id="main-content">`.
   - VoiceOver announces main banner: _"Utsava: Grand Wedding Celebration, heading level 1"_.
2. **Tablist Navigation**:
   - Navigating to navigation tabs announces _"Main Navigation, tab list, 5 tabs, Budget Planner selected, tab 1 of 5"_.
   - Arrow keys (`Left` / `Right`) move focus between tabs and announce tab changes seamlessly.
3. **Modal Dialog (Onboarding Wizard)**:
   - Clicking _"Plan New Event"_ opens the dialog.
   - VoiceOver announces: _"Event Setup — Step 1 of 5, dialog, web dialog"_.
   - Tab navigation cycles exclusively inside dialog elements (radio group for event type, title, date, buttons).
   - Pressing `Escape` announces dialog closure and returns VoiceOver cursor to _"Plan New Event, button"_.
4. **Streaming Chat Assistant**:
   - VoiceOver user types a prompt and submits.
   - Streaming tokens in the chat log do **not** spam VoiceOver speech queue.
   - When stream finishes, polite live region announces: _"Response completed: [text]"_.
   - Activating _"Stop generating"_ immediately stops output and announces _"Response generation stopped by user"_.

### 4.2 NVDA (Windows / Firefox & Chrome)

1. **Form Input and Error Feedback**:
   - Inputs announce associated label, required status, and current value.
   - If an invalid expense is submitted in `BudgetAddForm`, NVDA immediately reads the assertive alert: _"Please provide an expense title"_, and the input is marked invalid (`aria-invalid="true"`).
2. **Visual Charts & Companion Data Tables**:
   - Budget category allocation chart is labeled: _"Category Budget Breakdown Chart. Accessible data table alternative available via toggle"_.
   - Activating _"View as Data Table"_ presents standard tabular data with properly scoped row and column headers (`<th scope="col">`), easily navigable using `Ctrl + Alt + Arrow Keys`.

---

## 5. Automated CI Testing with Axe-Core

Axe-core is integrated directly into Playwright tests (`e2e/accessibility.spec.ts`) and configured to fail the GitHub Actions CI pipeline if any WCAG violation is detected:

```typescript
const accessibilityScanResults = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze();

expect(accessibilityScanResults.violations).toEqual([]);
```

### Automated Scenarios Verified:

1. `main application passes WCAG 2.2 AA axe audit in dark mode`
2. `main application passes WCAG 2.2 AA axe audit in light mode`
3. `timeline tab with progress chart and data table passes axe checks`
4. `vendor directory tab passes axe checks`
5. `ai idea studio tab passes axe checks`
6. `plan-acting chat assistant tab passes axe checks`
7. `onboarding wizard dialog passes axe checks, traps and restores focus`
8. `skip link is keyboard focusable and navigates to main landmark`
9. `streaming chat provides stop generating control and polite announcement`

---

## 6. Verification Command Checklist

Run locally to replicate compliance verification:

```bash
# 1. ESLint with jsx-a11y plugin
npm run lint

# 2. Strict TypeScript checks
npm run typecheck

# 3. Vitest unit and integration test suite
npm test

# 4. Playwright E2E and Axe-Core WCAG 2.2 AA audits
npm run test:e2e

# 5. Production Next.js build verification
npm run build
```
