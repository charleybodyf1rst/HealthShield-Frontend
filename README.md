# HealthShield-Rentals-Platform

# Build & Deployment

## 🚫 NO LOCAL BUILDS

**DO NOT BUILD LOCALLY - All builds happen in Google Cloud Console**

- Build process: `git push` → Cloud Build → Cloud Run (standalone SSR)
- Backend API: `https://systemsf1rst-backend-887571186773.us-central1.run.app`
- Secrets: Google Secret Manager (not local .env)

For development:
- Use dev server (`npm run dev`)
- Point to production API: `https://systemsf1rst-backend-887571186773.us-central1.run.app`

---

