# Unified Learning Platform — Architecture

## Overview
One Next.js (App Router) + PostgreSQL (Drizzle ORM) backend powers **two
brands** that share the same content, LMS, DAM, editorial workflow, and
multilingual infrastructure:

| Brand           | Slug      | Route prefix   | Focus              |
| --------------- | --------- | -------------- | ------------------ |
| Ascend Academy  | `ascend`  | `/ascend`      | Engineering & product growth |
| Nihongo Bridge  | `nihongo` | `/nihongo`     | Japanese language learning |

The **REST API under `/api/v1/*`** is the single contract consumed by:

- Web (this repository, both brands)
- Future Android and iOS apps
- Future Desktop client
- Future AI Tutor service
- Future Marketplace and Community services

## Layers

```
┌───────────────────────────────────────────────────────────┐
│ Presentation                                              │
│  /                — brand selector                        │
│  /[brand]         — brand home (CMS driven)               │
│  /[brand]/courses/[slug] — LMS course reader              │
└───────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────┐
│ REST API — /api/v1                                        │
│  brands · courses · pages · assets · translations · …     │
│  All routes return { ok, data | error }.                  │
└───────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────┐
│ Domain modules                                            │
│  CMS (pages + editorial workflow + editorial_events)      │
│  LMS (courses → modules → lessons)                        │
│  DAM (assets)                                             │
│  i18n (translations table — locale overlays)              │
└───────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────┐
│ Drizzle ORM  →  PostgreSQL (`app_db`)                     │
└───────────────────────────────────────────────────────────┘
```

## Schema highlights
All rows that belong to a specific brand carry a `brand_id`. All
user-facing text may be overridden per-locale via the `translations`
table using the `(entity_type, entity_id, locale, field)` unique index.
Editorial workflow status is `draft | in_review | published | archived`,
transitioned via `POST /api/v1/pages/[id]/transition` which writes an
audit row into `editorial_events`.

## Migrations
Schema changes are additive and applied with:

```
npx drizzle-kit push
```

Do not drop or rename columns without a two-phase migration
(add → dual-write → backfill → cut over → drop).

## Extensibility
- **AI Tutor**: consume `/api/v1/courses/[slug]?brand=…&locale=…` for
  structured lesson content.
- **Marketplace**: add `products` table referencing `courses.id`.
- **Community**: add `threads`/`posts` tables scoped by `brand_id`.
- **Mobile**: the same REST API works over HTTPS with no changes.

## Seed
`src/lib/seed.ts` is idempotent — it guarantees the two brands, a home
page per brand, and a starter course catalog exist on cold start.
