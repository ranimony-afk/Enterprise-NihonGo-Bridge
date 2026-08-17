# Nihongo Bridge — Production Deployment Manual 🚀

This document outlines the step-by-step production-readiness checklists and deployment procedures to launch the unified Next.js platform on Vercel and connect it with Supabase and Stripe/Razorpay.

---

## 🗺️ Production Infrastructure Checklist

- [ ] **Database (Supabase)**: Create a PostgreSQL instance, setup connection pool boundaries, and retrieve connection URL strings.
- [ ] **Vercel Hosting**: Setup Next.js App Router workspace project in the Vercel dashboard.
- [ ] **NextAuth Security**: Configure custom random hashes for token signatures and credentials persistence.
- [ ] **Payments gateway Webhooks**: Set Stripe and Razorpay webhook configurations on live profiles.
- [ ] **SSL & Domain**: Set custom absolute domain configurations (e.g. `https://nihongobridge.com`) on DNS cloud zones.

---

## 1. Supabase Database Configuration & Pooling

We optimize database connections for low-latency Edge runtimes and serverless lambda environments.

### Connection Pooling (Port 6543)
Supabase provides transaction connection pooling on port `6543`. Modify your environment connection string to utilize the pooler to prevent client socket exhaustion:

```bash
# Recommended Transaction Connection string
DATABASE_URL="postgresql://postgres.[username]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

*Note: Adding `?pgbouncer=true` is highly recommended when connecting with Drizzle through a pgbouncer transaction pooler.*

---

## 2. Environment Variables & Secrets Ledger

Configure the following environment secrets in your Vercel Dashboard Settings (`Settings -> Environment Variables`) or local `.env.production` files:

| Secret Key | Example Value / Category | Key Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/app_db` | Main PostgreSQL Connection Pool String |
| `NEXTAUTH_URL` | `https://nihongobridge.com` | NextAuth canonical domain URL |
| `NEXTAUTH_SECRET` | `4f3f619b48c788df0a2cb70c1b75c889` | Encryption signature key for session cookies |
| `STRIPE_SECRET_KEY` | `sk_live_51M...` | Private API credential key for Stripe |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Private validation key for Stripe webhooks |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | Razorpay checkout API public key |
| `RAZORPAY_KEY_SECRET` | `rzp_secret_...` | Razorpay checkout API private key |
| `JWT_MOBILE_SECRET` | `enterprise_mobile_jwt_secret_token` | Mobile Bearer JWT token verification key |

---

## 3. Vercel Regional Plan Limits (Hardened)

Next.js is configured with a hardened `vercel.json` file. 

Hobby and Pro subscription plan limits restrict multiple custom regional targets, which will crash your build step if misconfigured. We resolved this by omitting rigid regions Arrays, allowing Vercel to default automatically to the regional datacenter closest to your primary database location.

---

## 4. Programmatic Self-Healing & Cold Starts

To eliminate serverless cold-start relation crashes on empty database launches, the platform implements a **Programmatic Self-Healing Auto-Migration** wrapper inside `src/lib/seed.ts` via `ensureSeed()`.

Upon initial page visits to `/nihongo`, the Next.js serverless lambda automatically:
1. Opens a pooled database client.
2. Checks for schema compliance.
3. Automatically runs Drizzle programmatic migrations from the `drizzle/` directory.
4. Idempotently provisions the default users, KANJI60 maps, conversation logs, and sitemaps.
5. Completes boot cycles in **< 1 second**.

---

## 5. Docker Deployment (Alternative Hosting)

If deploying to custom Kubernetes clusters, Amazon ECS, or GCP Cloud Run, use our hardened Alpine Docker config:

### Build Container:
```bash
docker build -t nihongobridge-enterprise -f infrastructure/docker/Dockerfile .
```

### Run Container:
```bash
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  nihongobridge-enterprise
```

---

## 🔍 Validation & Health Checks

Once deployed, query your endpoints to verify correct operation:
- **Core Health Probe**: `https://[your-domain]/api/health`
- **RSS Feed Validator**: `https://[your-domain]/api/v1/news/rss`
- **Swagger UI Console**: `https://[your-domain]/api/v1/swagger`
- **OpenAPI Schema SPEC**: `https://[your-domain]/api/v1/openapi.json`
