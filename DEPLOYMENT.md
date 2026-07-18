# Deploying UniPlace to Railway (single app + MySQL)

The Spring Boot jar serves both the API and the built Angular app, so one Railway
service + one MySQL database is the whole deployment. Local dev is unchanged
(`ng serve` on :4200, backend on :8081).

## 1. Prepare the build (on your machine)
```powershell
.\deploy-prep.ps1        # builds Angular and copies it into campusportal/src/main/resources/static
git add -A
git commit -m "chore: embed frontend build for deployment"
git push
```

## 2. Railway setup (railway.app, login with GitHub)
1. **New Project → Deploy from GitHub repo** → pick `pragnapadamata/VULTURE`.
2. In the service **Settings → Root Directory** set: `campusportal`
   (Railway detects the Maven wrapper and builds the jar automatically).
3. **+ New → Database → MySQL** in the same project.
4. Open the app service → **Variables** → add these referencing the MySQL service:
   - `MYSQLHOST` → reference → MySQL → `MYSQLHOST`
   - `MYSQLPORT` → reference → MySQL → `MYSQLPORT`
   - `MYSQLDATABASE` → reference → MySQL → `MYSQLDATABASE`
   - `MYSQLUSER` → reference → MySQL → `MYSQLUSER`
   - `MYSQLPASSWORD` → reference → MySQL → `MYSQLPASSWORD`
5. **Settings → Networking → Generate Domain** — that URL is your live site.

First boot creates the tables and seeds demo data automatically (empty DB only).

## 3. Verify
- `https://<your-domain>/` → landing page
- `https://<your-domain>/api/analytics` → JSON
- Full flow: post job → invisible to student → admin approve → apply with resume →
  admin views resume. The deadline auto-closer runs on the server every minute.

## Troubleshooting
- **Build fails**: check Railway build logs; the Maven step needs Java 21 (auto-detected).
- **App crashes on boot**: almost always DB vars — confirm the five MYSQL* references.
- **White page**: `deploy-prep.ps1` wasn't run before pushing (no static/ in the jar).
- **Old data**: Railway MySQL persists; to reseed, delete + recreate the MySQL service.
