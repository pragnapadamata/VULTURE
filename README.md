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



## Demo Videos

- **Features walkthrough:** https://drive.google.com/file/d/1DlpxevBBP8iXtPbDIF638rE3bQv1s0EW/view?usp=sharing
- **Backend walkthrough:** https://drive.google.com/file/d/1VTSElv2NmuNGL0BNcFMi00lIQbJeCcVw/view?usp=sharing

---

## Features Walkthrough

1. **Landing page** — product intro, stats pulled from the live backend, and entry
   into the app.
2. **Login (demo role selector)** — pick Student, Company, or Admin. No real
   password sign-in; this is a demo flow by design.
3. **Company → Post a Job** — enter role, salary, description, eligibility, and
   deadline. The job is saved as **PENDING** and is not visible to students yet.
4. **Admin → Approval Queue** — the placement cell reviews the pending job and
   **Approves** (or Rejects) it, with an optional comment.
5. **Student → Find Jobs** — the approved job now appears. The student applies with
   name, email, roll number, and a resume (PDF/DOC). Applying twice is blocked.
6. **Admin → Applicants & Analytics** — the admin opens the applicant's resume, and
   the placement rate, charts, and notifications update from real data.

---

## Backend Walkthrough

The backend is a Spring Boot application organized in layers:

- **Model** (`model/`) — the database tables: `Posting`, `Application`,
  `Notification`, `StatusHistory`. `Posting` has a `status` field
  (PENDING → APPROVED / REJECTED / CLOSED) — this single field drives the whole
  approval workflow.
- **Repository** (`repo/`) — interfaces that talk to MySQL (e.g. `findByStatus`
  returns only approved jobs).
- **Controller** (`controller/`) — the REST API the frontend calls:
  - `PostingController` — create a job (forced to PENDING on the server), return
    only approved jobs to students, and approve/reject with history + notification.
  - `ApplicationController` — apply with a resume upload, block duplicate
    applications, and let the admin view/download a resume.
  - `AnalyticsController` — calculate the placement rate and chart data live.
  - `NotificationController` — list and mark notifications read.
- **Scheduler** (`scheduler/`) — a task that runs every minute and moves approved
  jobs past their deadline to CLOSED automatically.
- **Config** (`config/`) — CORS setup and a data seeder that loads demo data on
  first startup (and skips if data already exists).

**Key point:** the approval gate is enforced in the database query, not hidden in
the UI — a student can never receive an unapproved job.

You can see the live backend responding here:
- https://vulture-production.up.railway.app/api/analytics
- https://vulture-production.up.railway.app/api/postings/approved

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
