# BuildOrDie

Build it. Launch it. 4 days. Or get kicked.

A public accountability launchpad where builders commit to an idea, get 96 hours to ship it, and get organically featured or kicked based on community votes.

---

## 1. Local Setup

### Prerequisites
* Node.js (v18+)
* PostgreSQL Database

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd buildordie
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Database Setup
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your connection details (such as `DATABASE_URL` and `DIRECT_URL`).
3. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Seed the database with sample users, projects, and votes:
   ```bash
   npx prisma db seed
   ```

### Start Development Servers
1. Start the Next.js local server:
   ```bash
   npm run dev
   ```
2. Start the Inngest local development server (to capture background lifecycle jobs):
   ```bash
   npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
   ```

---

## 2. System Architecture Overview

* **Frontend & Pages**: Next.js 14 App Router (React Server Components, dynamic routes).
* **Database**: PostgreSQL mapped via Prisma ORM.
* **Authentication**: Managed via Clerk (GitHub & Google OAuth).
* **Payments**: Managed via Dodo Payments for lifetime passes and ad slot boosting.
* **Background Jobs**: Inngest is utilized to coordinate countdown timer milestones, warnings, and kicked status flows.
* **Emails**: Sent using Resend with custom React Email templates styled in the dark theme.

---

## 3. Webhook Integration

### Clerk Webhook
To sync users upon registration, configure a Clerk user creation webhook pointing to `/api/webhooks/clerk` with these parameters:
1. Event types: `user.created`, `user.deleted`
2. Save the webhook signing secret in `.env` as `CLERK_WEBHOOK_SECRET`.

### Dodo Payments Webhook
To activate features (Founder Pass, Investor Access, Starter Boost, Full Spotlight) upon transaction:
1. Configure a Dodo webhook pointing to `/api/webhooks/dodo`.
2. Event types: `payment.succeeded`
3. Save the webhook signing secret in `.env` as `DODO_WEBHOOK_SECRET`.

---

## 4. Production Deployment Guidelines (Vercel)

### 1. Database Migration during Build
Set the Vercel Build Command to automatically apply migrations in production:
```bash
npx prisma migrate deploy && next build
```

### 2. Environment Variables Configuration
In your Vercel project settings, define the following variables:
* `NEXT_PUBLIC_APP_URL` — your production domain (e.g. `https://my-app.vercel.app`)
* `DATABASE_URL` & `DIRECT_URL` — Supabase or other Postgres credentials
* Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`)
* Dodo Payments credentials and product IDs
* `RESEND_API_KEY` & `EMAIL_FROM`
* Inngest keys (`INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`)
* PostHog keys (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`)

### 3. Inngest Cloud Sync
1. Navigate to your Inngest Cloud Dashboard.
2. Connect your Vercel deployment URL.
3. Sync endpoints targeting `https://<your-domain>/api/inngest` to process warning and kick countdown cycles.
