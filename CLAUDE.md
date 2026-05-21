# HealthShield-Frontend

## Build & Deployment - CRITICAL

### NO LOCAL BUILDS

- All builds happen in **Google Cloud Console**
- Build process: `git push` → Cloud Build → Cloud Run
- Secrets: Google Secret Manager (NOT local .env files)

### Backend API

- All API calls go to: `https://systemsf1rst-backend-887571186773.us-central1.run.app`
- Backend repo: `SystemsF1RST-Backend` (NOT BodyF1rst-Backend-CLEAN)
- Authentication: Laravel Passport (Bearer tokens)
- Organization ID: Set via `NEXT_PUBLIC_HEALTHSHIELD_ORG_ID` env var

### Deployment Method

- **GCP project**: `systemsf1rst-prod` (NOT `healthshield-frontend` — that project does not exist)
- **Cloud Run service**: `healthshield-frontend` in region `us-central1`
- **Prod URL**: `https://healthshield-frontend-go6eof7d6a-uc.a.run.app`
- **Cloud Build trigger**: `healthshield-frontend-deploy` (regional: `us-central1`) watches `^main$` and runs `cloudbuild.yaml`
- **List builds**: `gcloud builds list --project=systemsf1rst-prod --region=us-central1` (the default `--region=global` will NOT see these builds — they're regional)
- Triggered by: Git push to `main` branch (automatic, ~5-7 min build)

## Purpose

AI-powered health insurance call center platform. Features AI calling (ElevenLabs + Twilio), AI text messaging, AI email campaigns, insurance CRM with lead management, and policy/enrollment tracking.

## Tech Stack

- **Framework:** Next.js 16 / React 19 / TypeScript 5.9
- **State:** Zustand 5.0
- **Styling:** Tailwind CSS 4 / shadcn/ui
- **Fonts:** Space Grotesk (headlines), Inter (body)
- **Design:** Silverpoint-inspired dark/glassmorphic aesthetic (marketing pages)
- **Monitoring:** Sentry
- **Testing:** Playwright E2E
- **Deploy:** Cloud Run (standalone SSR)

## Key API Endpoints

- Insurance Programs: `/api/insurance/healthshield/programs`
- Enrollments: `/api/insurance/healthshield/programs/{id}/enroll`
- Proposals: `/api/insurance/healthshield/proposals`
- Wellness: `/api/insurance/healthshield/wellness-metrics`
- Stats: `/api/insurance/healthshield/stats`
- AI Caller: `/api/sales/ai-caller/call`
- SMS: `/api/sms/send`
- Email: `/api/sales/communication/email`
- Public Quote: `/api/insurance/public/quote-request`

## Repo Boundaries

- **HealthShield frontend** = this repo (HealthShield-Frontend)
- **Backend APIs** = SystemsF1RST-Backend
- **NEVER mix with** BodyF1rst-Backend-CLEAN
