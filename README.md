# UniPlace — University Placement Portal

A web application that manages the campus placement process end to end. Companies
post jobs, the university placement cell reviews and approves them, and students
see and apply only to approved jobs. Every posting is verified before a student
can see it, and the dashboards show live numbers from the database.

**Live app:** https://campus-portal-seven.vercel.app
**Backend API:** https://vulture-production.up.railway.app

---

## Team

- Padamata Pragna Sri Lalitha
- Sri Harshith Gola
- Vishwateja Gangishetty

---

## Demo Video

▶️ **Watch the demo:** _<add your video link here>_

The video walks through the full flow: a company posts a job → it waits in the
university's approval queue → an admin approves it → a student finds it under
"Find Jobs" and applies with a resume → the admin views the resume and the
analytics update.

---

## How the app is used

The app has three roles. On the login screen you pick a role and enter that
role's console.

> **Note on login:** The login screen is a **demo role selector**. There is no
> real username/password sign-in — you choose Student, Company, or Admin and
> click through. This was intentional for the hackathon (no authentication was
> required). All the placement logic behind it is fully working.

### Company
- **Post a Job** — fill in company name, role, salary, description, eligibility,
  and deadline. The job is saved with status **PENDING** and is **not** shown to
  students yet.
- **Job Postings** — see all jobs you posted with their current status.

### Admin (University Placement Cell)
- **Approval Queue** — review each pending job and **Approve** or **Reject** it,
  with an optional comment. Only after approval does the job become visible to
  students.
- **Applicants** — for each approved job, see who applied and open their resume.
- **Reports & Analytics** — placement rate, applications per company, and
  applications over time, all calculated from real data.

### Student
- **Find Jobs** — see only jobs the admin has approved.
- **Apply** — fill in name, email, roll number, and upload a resume (PDF/DOC).
  The resume is stored and linked to the application. Applying twice to the same
  job is blocked.

---

## Main features that work with the backend

These are real, working features backed by the database and API:

| Feature | What it does |
|---|---|
| **Approval workflow** | Company posts a job (PENDING) → admin approves/rejects → students see only APPROVED jobs. A job is filtered by the database, not just hidden in the UI. |
| **Resume upload & view** | Students upload a PDF/DOC on apply; the file is stored and the admin can open/download it. |
| **Duplicate-apply protection** | A student cannot apply to the same job twice (server returns a clear "already applied" response). |
| **Placement analytics** | Placement rate = unique students who applied ÷ jobs that reached APPROVED, plus applications per company and applications per day. |
| **Notifications** | A notification is created when a job is approved, rejected, or when a student applies. Shown in the notification bell. |
| **Status history** | Every status change on a job (Created → Pending → Approved, etc.) is recorded with a timestamp and any admin comment, and shown as a timeline. |
| **Deadline auto-close** | A scheduled task runs every minute and automatically moves an approved job to CLOSED once its deadline passes. |
| **Seed data** | On first startup the backend loads demo companies, jobs in every state, and applications so the dashboards are not empty. |

---

## Tech Stack

**Frontend**
- Angular 22 (standalone components, signals)
- TypeScript
- HTML / CSS
- Deployed on Vercel

**Backend**
- Java 21
- Spring Boot (Spring Web, Spring Data JPA)
- MySQL database
- Maven
- Deployed on Railway

**Other**
- REST API between frontend and backend
- Scheduled task for deadline auto-close
- File upload/download for resumes

---

## Project structure

```
VULTURE/
├── campus-portal/     Angular frontend
├── campusportal/      Spring Boot backend
└── README.md          this file
```

---

## Running it locally

You need: Node.js, Java 21, Maven, and MySQL.

**1. Database**
Create a MySQL database named `campusportal`. The backend reads the connection
details from `campusportal/src/main/resources/application.properties` (default
user `root`, update the password to match yours).

**2. Backend** (runs on port 8081)
```bash
cd campusportal
./mvnw spring-boot:run
```
On first run it creates the tables and loads demo data automatically.

**3. Frontend** (runs on port 4200)
```bash
cd campus-portal
npm install
npm start
```
Open http://localhost:4200. When running locally the frontend automatically talks
to the local backend on port 8081.

---

## API endpoints (backend)

Base URL: `/api`

| Method | Path | Purpose |
|---|---|---|
| POST | `/postings` | Create a job (starts PENDING) |
| GET | `/postings/approved` | Jobs visible to students |
| GET | `/postings/pending` | Jobs waiting for admin review |
| GET | `/postings` | All jobs |
| PUT | `/postings/{id}/status?value=APPROVED` | Approve/Reject/Close a job (optional `comment`) |
| GET | `/postings/{id}/history` | Status timeline for a job |
| POST | `/applications/apply` | Apply with resume (multipart) |
| GET | `/applications` | All applications |
| GET | `/applications/posting/{id}` | Applicants for one job |
| GET | `/applications/{id}/resume` | View/download a resume |
| GET | `/analytics` | Placement rate and chart data |
| GET | `/notifications` | List notifications |
| PUT | `/notifications/{id}/read` | Mark one as read |

---

## Notes

- Login is a demo role selector (no authentication), by design for this hackathon.
- Some student/company/admin side pages (e.g. Messages, Saved Jobs) are shown as
  designed placeholders; the core placement workflow above is fully functional.
