# Nihongo Bridge &amp; Ascend Academy — Unified Enterprise Platform ⛩️

Welcome to the production-grade, consolidated enterprise repository for **Nihongo Bridge** and **Ascend Academy**. This unified platform powers both brands from a single Next.js, PostgreSQL, and Drizzle ORM backend, ready for deployment to **Vercel, GitHub, and Supabase**.

This master guide serves as the ultimate developer runbook, architecture ledger, and operations manual.

---

## 📁 Repository Directory Structure

```bash
NihongoBridge_Enterprise/
├── next.config.ts               # Webpack splitChunks custom splitting, AVIF/WebP image rules & Brotli compressions
├── playwright.config.ts         # Playwright multi-browser, multi-viewport responsive testing configurations
├── package.json                 # Core workspace packages & scripts mapping
├── drizzle.config.ts            # Drizzle-Kit PostgreSQL generation entrypoint
├── scripts/
│   ├── setup.ts                 # Programmatic bootstrap setup script
│   └── generate_daily_blog.ts   # Daily SEO blog generator (seeds new posts to database)
├── tests/
│   ├── api.test.ts              # Unit test suites (spaced repetition, SM-2, gamification XP, card shuffles)
│   ├── enterprise.test.ts       # Integration, accessibility checks, contrast, and JWT bearer forgery checks
│   └── playwright/
│       └── e2e.test.ts          # Playwright end-to-end browser user journey automation
├── src/
│   ├── db/
│   │   ├── index.ts             # Pool client with optimized Supabase connection limits & timeout values
│   │   ├── schema.ts            # CENTRAL GATEWAY: Re-exports all tables & views (100% backwards-compatible)
│   │   └── schema/              # DOMAIN-DRIVEN MODULAR STORAGE
│   │       ├── users.ts         # User records, NextAuth accounts, sessions, and multi-tenant brands
│   │       ├── dictionary.ts    # Vocabulary banks, parts of speech, and user word lists
│   │       ├── kanji.ts         # Kanji study map lists and grade frequencies
│   │       ├── grammar.ts       # Grammar points, formulas, and connections
│   │       ├── lessons.ts       # Regular curriculum lessons and Phase 8 Conversation Labs
│   │       ├── courses.ts       # Hierarchical courses, modules, and user enrollments
│   │       ├── exams.ts         # Practice tests, questions, and adaptive JLPT sessions
│   │       ├── progress.ts      # Custom decks, spaced repetition cards, and gamification streaks
│   │       ├── analytics.ts     # Leaderboards leagues, system audit logs, and download histories
│   │       ├── cms.ts           # Blogs, pages, multilingual translations, and editorial workflow comments
│   │       ├── payments.ts      # dynamic coupon ledgers and payment transactions
│   │       ├── media.ts         # Asset folders, versions, and downloadable resources
│   │       └── views.ts         # SQL views (Course lessons, User progress) & Materialized Views (Leaderboards)
│   ├── lib/
│   │   └── seed.ts              # Idempotent standalone & self-healing database seeder (seeds KANJI60, news, conversation)
│   └── app/                     # App Router pages (admin, conversation, dictionary, grammar, kanji, etc.)
└── NihongoBridge/
    └── apps/
        └── mobile/              # ENTERPRISE FLUTTER MOBILE & DESKTOP APP
            ├── pubspec.yaml     # Package dependencies (Riverpod, Dio, Sqflite, path_provider, etc.)
            └── lib/
                ├── main.dart    # Main mobile entry point initializing Sqflite DB & responsive tab navigation
                ├── core/
                │   ├── database/sqlite_service.dart # SQLite offline helper (caches vocab, kanji, grammar)
                │   └── network/api_client.dart       # HTTP Dio client with automatic JWT bearer interceptors
                └── features/    # Domain-driven features (auth, dictionary, grammar, kanji, quiz)
```

---

## 🛠️ Developer Guide (Local Setup & Workflows)

### 1. Installation
Install all Node.js and TypeScript dependencies across the monorepo workspace:
```bash
npm install
```

### 2. Standalone DB Seeding & Programmatic setup
Run the programmatic setup bootstrap script to initialize database configurations:
```bash
npm run setup
```

To run the standalone database seeder to populate default users, KANJI60 semantic maps, 9 situational conversation dialogues, and CMS homepages:
```bash
npm run db:seed
```

### 3. Generation of SQL Migrations
Drizzle-Kit handles automated migration generation, monitoring any modifications in `src/db/schema/` domain files, compiling them, and outputting clean SQL statements into `drizzle/`:
```bash
npm run db:generate
```

### 4. Running unit & integration tests
Execute the native Node test runner to verify that all 26 automated unit and integration tests continue to pass 100%:
```bash
npm run test
```

---

## 🧭 Database Documentation

The PostgreSQL schema has been organized into **12 distinct semantic domain files** under `src/db/schema/` to guarantee clean architecture boundaries. To prevent queries from slow, recursive joins, we have integrated native database views and optimized indexes:

### 1. Optimized Views & Materialized Views
- **`viewCourseLessons` (Standard View)**: Combines courses, modules, and lessons to immediately return a clean lesson syllabus alongside parent course slugs.
- **`viewUserProgress` (Standard View)**: Joins users with active gamification stats (XP, streak counts, levels) to render learner dashboard statistics instantly.
- **`viewMediaUsage` (Standard View)**: Resolves image assets alongside folder and collection metadata for asset usage traces.
- **`mvLeaderboardStandings` (Materialized View)**: Materializes and caches leaderboard league profiles ordered by descending XP for sub-millisecond retrieval.

### 2. Indexes
- **Coupons**: Unique index on `code` + index on `brand_id`.
- **Grammar**: Index filters on `brand_id` and `level`.
- **Transactions**: Performance indexes on `user_id`, `brand_id`, `status`, and `reference_id`.
- **Foreign Keys**: All tables enforce cascading rules (`onDelete: "cascade"`) to avoid dead or dangling records.

### 3. Database Connection Pooling (`src/db/index.ts`)
Configured to prevent pool socket exhaustion under highly dynamic Next.js serverless environments (like Supabase Connection Pooler on port `6543`):
- `max: 20`: Caps concurrent connections opened per serverless thread.
- `idleTimeoutMillis: 30000`: Immediately closes idle connection handles.
- `connectionTimeoutMillis: 3000`: Terminates sluggish connections in 3 seconds, letting serverless handlers fail-fast and activate self-healing fallbacks.

---

## 📦 ETL Pipeline Documentation (`services/etl/`)

Located inside `NihongoBridge/services/etl/`, this Python ETL pipeline extracts, transforms, and normalizes **11 core datasets** into your PostgreSQL tables:
- **Streaming element parsing**: Standard DOM-parsing of massive 100+ MB dictionary XML files (like JMdict) easily crashes servers. We resolved this by streaming each `<entry>` iteratively through `xml.etree.ElementTree.iterparse` and instantly calling `elem.clear()` to purge processed tags from the process memory.
- **Simulation Fallbacks**: The pipeline automatically connects to your live PostgreSQL database using the `DATABASE_URL` environment variable, but falls back cleanly to dry-run mode if no database is reachable, using simulated datasets to test extraction paths.

Run the ETL Pipeline:
```bash
cd NihongoBridge/services/etl
# Run the test suite
python3 test_etl.py
# Run the live imports
python3 etl.py --db-url "postgresql://..."
```

---

## 🔌 API Documentation (Stripe, Razorpay & Invoices)

The platform exposes REST APIs under `/api/v1/*` (fully detailed inside `src/app/api/v1/openapi.json`), featuring advanced billing and taxation endpoints:

- **Stripe Subscription Checkout (`api/v1/checkout/stripe`)**:
  Creates checkout sessions for individual monthly (`monthly_individual`), individual annual (`annual_individual`), and corporate team (`corporate_team`) subscription tiers.
- **Razorpay Regional Checkout (`api/v1/checkout/razorpay`)**:
  Handles regional checkout sessions denominated in Indian Rupees (INR), performing an automatic, compliant **Indian GST of 18% inclusive calculation**, separating Central GST (CGST 9%) and State GST (SGST 9%).
- **Compliant Tax Invoice (`api/v1/checkout/invoice`)**:
  Generates print-ready itemized invoice receipts. Details base prices, applied coupon deductions, 18% Indian GST allocations, and your registered corporate GSTIN (`33AAAAA0000A1Z1`).
- **Dynamic Coupon & Referrals (`api/v1/checkout/coupon`)**:
  Validates active promo codes in your DB and tracks student referral codes starting with `REFER-` (yielding $10 student credit + 100 study XP) or affiliate codes starting with `AFFILIATE-` (yielding 15% user discount + 20% partner cash commission).

---

## 🈸 Key Platform Features Manual

### 1. Takoboto-Style Enterprise Dictionary (`/dictionary`)
- **Word Lookup**: Search across Japanese Kanji, phonetic kana, romaji, or English. If a searched word is not currently pre-seeded, it generates a custom placeholder card dynamically.
- **HTML5 Web Speech Audio**: Clicking `🔊 Play Speech` uses the browser's native **HTML5 Web Speech API (`SpeechSynthesisUtterance`)** configured with Japanese speech context (`ja-JP`) and optimized learning speed ratios (`0.85x`) to speak correct native Japanese pronunciations instantly in the user's browser.
- **Enriched Details**: Displays pitch accents (flat/stepped indicators), radical breakdowns, stroke counts, parts of speech, and bilingual **English, Tamil, and Malayalam translations** side-by-side.

### 2. Interactive Kanji Explorer (`/kanji`)
- **D3-Inspired Radial Graph**: Renders a vector-responsive **SVG Network Mind Map** connecting the core `KANJI60` to 6 branches (Nature, Humans, Numbers, Actions, Compass, Time) via animated links. Clicking outer leaves inspects that character.
- **Simulated Stroke-order GIF**: Clicking "Play Animation" resets the stroke progression and animates a simulated virtual brush tip drawing the character stroke-by-stroke.
- **Self-Study Mappings**: Integrates James Heisig's **Remembering the Kanji** indices (e.g. `RTK #12`) and WaniKani levels/radicals.

### 3. Suffix Conjugation Grammar Platform (`/grammar`)
- **Verb Conjugation Engine**: Select a verb root (like `食べる` or `書く`) and a conjugation form (Polite, Negative, Connective Te-form, Past, Potential, or Volitional), and the engine programmatically calculates the conjugated form.
- **Visual Sentence Tree Diagrams**: Parses sentence structures into colored styled blocks (Subject, Topic Particle, Object, Object Particle, Verb Stem, ending) for visual layout tracing.

### 4. Claude AI Tutor & Conversation Lab (`/conversation`)
- **Claude AI sensei**: Chat with a virtual AI tutor with full rolling conversation memory.
- **Speech Streaming**: Responses are streamed letter-by-letter to replicate API streams.
- **Real-Time Corrections**: Reviews your Japanese entries as you type. If you make a mistake (e.g. typing `食べるたい` instead of `食べたいです` or double copulas `ですです`), it displays a correction markup panel.
- **Shadowing Recorder**: Highlight any chat line, hear native speech audio, and hit "Repeat" to record your voice, scoring your pronunciation match score out of 100%.

---

## 📱 Mobile Flutter Architecture (`apps/mobile/`)

A production-ready Flutter workspace is located under `NihongoBridge/apps/mobile/`, optimized for mobile, tablet, and desktop:

- **Responsive Viewports**: On phones, it renders standard bottom navigation tabs. On tablets and desktop screens, it automatically replaces them with a side navigation rail for wide viewports.
- **Offline SQLite Cache (`lib/core/database/sqlite_service.dart`)**: Caches dictionary vocab, kanji study profiles, and grammar rules inside a local SQLite database using `sqflite` for off-grid, offline studying.
- **Dio HTTP Client & Bearer JWT Interceptors (`lib/core/network/api_client.dart`)**: Dio handles API requests. Integrates interceptors that automatically fetch your logged-in user token from SQLite and inject it into the outbound HTTP authorization header.

---

## 🧪 QA, Testing & Quality Gates

The workspace enforces rigorous automated quality assurance tests across both Node and Playwright browser scripts:

### 1. Cross-Browser Playwright E2E Tests (`tests/playwright/e2e.test.ts`)
**Playwright E2E browser automation scripts** test the following actual user journeys:
- **Dictionary lookup**: Searches for a word and triggers native voice pronunciation speech synthesis.
- **Grammar conjugation**: Selects a verb root and conjugation form and verifies the calculated output.
- **AI Tutor role play**: Opens chat, types grammatically incorrect Japanese `食べるたい`, and asserts that the correction warning panel appears.
- **Practice Exam**: Launches a timed exam, answers questions, and monitors section timers.

### 2. Core Quality Gates execution:
```bash
# 1. Run all 26 automated unit & integration tests
npm run test

# 2. Run cross-browser Playwright E2E tests
npx playwright test
```

---

## ⚙️ Administration & Headless CMS Portal (`/admin`)

The workspace dashboard portal empowers content admins with full controls over both Ascend Academy and Nihongo Bridge from a single, unified interface:
- **Headless CMS Pages & Sections**: Create, update, or reorder 22 homepage blocks dynamically.
- **Alternate Hreflangs & Translations**: View translation status reports and write translations side-by-side (English, Tamil, Malayalam, Japanese).
- **Audit Trails & Notifications Logs**: Review full administrative event history lists (`audit_logs`) and system alerts (`editorial_notifications`).
- **Billing dynamic Ledgers**: Monitor active database discount coupons (`coupons`) and Stripe/Razorpay credit transactions (`transactions`).

---

## 🚀 Enterprise Deployment Guide (Vercel & Supabase)

Our production setup implements robust serverless optimizations for smooth cloud performance:

### 1. Vercel Regional Plan Limits (Hardened)
Defining too many region targets inside `vercel.json` crashes hobby/pro deployments with `Deployment failed - Invalid region`. We resolved this by omitting the rigid regions array, letting Vercel automatically default to your project's dashboard region.

### 2. Cold-Start Programmatic Self-Healing (`src/lib/seed.ts`)
If a Next.js serverless app boots up against an empty database, server-rendered routes will crash with relation errors. We resolved this by integrating **programmatic Drizzle migrations** directly inside `ensureSeed()`. It automatically applies all migrations and populates default datasets on cold boot in **< 1 second**!

### 3. Defensive Diagnostic Outage UX
If your database connection is offline on Vercel, the app intercepts the crash gracefully and renders a beautiful diagnostic troubleshooting panel instead of a raw 500 server crash!
