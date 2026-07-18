# UniPlace — Demo Voice-Over Script (~4 minutes)

*Actions you perform are in [brackets]. Speak everything else. Trim marked sections for a 90-second version.*

---

## 1. Problem Statement (0:00 – 0:25)

"Campus placements today run on chaos — WhatsApp groups, Excel sheets, and email threads. Companies send job postings to placement cells, coordinators forward them manually, students miss deadlines, and nobody can answer a simple question: *what's our placement rate right now?* Worst of all, there's no quality gate — unverified postings reach students directly.

We built **UniPlace** — a university placement portal where every job posting passes through placement-cell approval before a single student ever sees it, and where every number on screen is live."

## 2. What We Built + Tech Stack (0:25 – 0:45)

"UniPlace is a full-stack product: an **Angular 22** frontend using standalone components and signals, a **Spring Boot** backend with **MySQL**, and a REST API between them. The backend handles the approval workflow, resume file storage, notifications, a full audit trail of every status change, and a scheduler that auto-closes expired postings every minute. Everything you'll see on the dashboards is coming from the live API — not mockups."

## 3. Landing Page (0:45 – 1:05)

[Open the site — scroll slowly as you talk]

"This is our landing page — 'Connecting Talent With Opportunity.' The stat band, our trusted recruiters, the three platform pillars — company posting, the approval workflow, and analytics — and this five-step flow is literally our architecture: company creates, admin reviews, students see only approved jobs, students apply, placement succeeds."

[Click a navbar link to show smooth scroll, then click **Get Started**]

## 4. Login / Role Selection (1:05 – 1:20)

"This is our role selection screen, styled as a login. Per the hackathon rules there's no real authentication — it's a **clickable flow**: you pick who you are — Student, Company, or Admin — and enter that console. Same product, three completely different experiences."

[Click **Company** tile → Login]

## 5. Company Console (1:20 – 1:50)

"A company lands on its hiring dashboard — active jobs, total applications, recent postings, and an applications overview, all from the live database."

[Sidebar → **Job Postings** → **+ Post a Job**]

"Posting a job is a three-step wizard — basics, details, and a preview of exactly what students will see. Watch the status when I publish—"

[Complete the wizard → Publish]

"—it enters as **Pending**. Not live. It has to earn approval first. That's the core of UniPlace."

## 6. Approval Gate Proof (1:50 – 2:10)

[Sidebar → Switch Role → **Student** → Login → **Find Jobs**]

"Here's the proof: I'm now a student, browsing every open job — and the posting I just created is **not here**. The database filters it out; this isn't hidden in the UI. Students can only ever see admin-approved roles."

## 7. Admin Console (2:10 – 2:50)

[Switch Role → **Admin**]

"The placement cell's command center — students applied, registered companies, drives, and the **placement rate**, all computed live by the backend."

[Sidebar → **Approval Queue** → Review the new posting]

"Here's our posting waiting in the queue. I review the full details, add a comment — 'Verified with company SPOC' — and approve."

[Approve → point at the toast and the bell badge updating]

"The notification bell updates instantly, and that comment is now part of a permanent audit trail."

## 8. Student Applies + Resume (2:50 – 3:20)

[Switch Role → **Student** → the job is now visible → open it → **Apply Now**]

"Back as the student — the job is live now, with a real countdown to deadline. Applying is a four-step flow: my details, then my actual resume — drag and drop, PDF validated —, additional info, review, and submit."

[Submit → confetti]

"The resume is stored in the database, linked to my application. And if I try to apply twice—" [click Apply again] "—it gracefully tells me I already have."

## 9. Closing the Loop (3:20 – 3:55)

[Switch Role → **Admin** → Approval Queue page → Applicants section → expand the posting → **View Resume**]

"The admin sees every applicant per posting and opens the actual resume — the file round-trips through the backend."

[Click **Timeline** on the posting]

"And here's the audit trail: Created → Pending → Approved, with my comment and timestamps. Every posting has this history."

[Sidebar → **Reports & Analytics**]

"Finally, analytics — applications over time, postings by status, top recruiting companies, and the placement rate with its exact formula: unique students who applied, divided by postings that reached approval. One more thing: see this closed posting? Its deadline passed, and our scheduled task auto-closed it — no human clicked anything. The timeline proves it."

## 10. Wrap (3:55 – 4:10)

"So that's UniPlace: a strict approval gate, real resume handling, notifications, a full audit trail, automated deadline management, and live analytics — three roles, one clean workflow, fully functional end to end. Thank you!"

---

### 90-second cut
Keep sections 1 (shorten to one line), 5 (wizard only), 6, 7 (approve only), 8 (apply + resume), and one line each from 9's resume-view + auto-close. Skip landing scroll, tabs, and analytics deep-dive.

### Pre-demo checklist
- Fresh DB (`DROP DATABASE campusportal; CREATE DATABASE campusportal;`) → restart backend so seed data + auto-close demo are ready
- Backend running before frontend, one warm-up click through all three roles
- A small PDF resume file ready on the desktop for drag-and-drop
