# Contributing to Nihongo Bridge &amp; Ascend Academy 👥

Welcome to the contributor guide! We are thrilled that you want to help expand and refine the Nihongo Bridge and Ascend Academy codebases. 

To maintain production-grade standards, clean architectural patterns, and 100% backwards compatibility, please review our development runbook before submitting pull requests.

---

## 🧭 Branching and Commit Standards

### 1. Branch Naming Conventions
Always create descriptive semantic branches pointing directly to active issues or milestones:
- `feature/jkg-unidic-parser` (Japanese Knowledge Graph additions)
- `bugfix/stripe-webhook-gst` (Payment and billing corrections)
- `docs/api-schema-update` (Sitemap or documentation updates)
- `perf/split-chunks-framework` (Webpack or performance optimizations)

### 2. Commit Message Formats
We strictly enforce **Conventional Commits** formatting to automate release manifest notes and changelogs. Structure your commit messages as follows:

```
<type>(<scope>): <short description>
```

#### Allowed Types:
- **`feat`**: Adding a new feature or domain table (e.g. `feat(grammar): add grammarRules table and database-driven timeline UI`)
- **`fix`**: Standard code corrections (e.g. `fix(checkout): adjust cgst/sgst roundoff decimals for inr billing`)
- **`docs`**: Documentation adjustments (e.g. `docs(readme): add docker run instructions and API secrets ledger`)
- **`perf`**: Performance optimizations (e.g. `perf(webpack): add split-chunks caching groups for react-dom vendor bundles`)
- **`test`**: Testing additions (e.g. `test(playwright): add dictionary lookup E2E browser automation`)

---

## 🛠️ Local Development & Code Quality Gates

Before pushing code or opening PRs, contributors must satisfy three rigorous quality gates:

### 1. Static Type Checking
All code must be completely free of TypeScript or JSX compilation errors. Run the static compiler on clean paths:
```bash
npm run typecheck
```

### 2. Unit & Integration Testing
All 26 automated unit and E2E integration test suites must pass 100% with zero regressions:
```bash
npm run test
```

### 3. Playwright E2E Browser Testing
Cross-browser user journey automations must be executed locally on chromium, firefox, and webkit viewports:
```bash
npx playwright test
```

---

## 🏛️ Code Architecture Philosophy

Contributors must adhere to clean architecture design practices:
- **Modular Domains**: Never bloat `schema.ts`. Always split new database tables into domain-driven subfiles under `src/db/schema/` and re-export them in `src/db/schema.ts` to preserve global backwards compatibility.
- **Client-Server Separation**: Standard App Router routes must be server components by default. Delegate interactive button clicks, voice capture browsers, and visual sliders to separated `"use client"` components.
- **Resource Streaming**: When parsing massive dictionary databases, always process files iteratively using generators or streaming XML loops (`iterparse`) to avoid hogging process RAM or triggering Out-Of-Memory (OOM) crashes.
