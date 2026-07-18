import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService, AppRecord, Posting, StatusChange } from './api.service';
import { ToastService } from './toast.service';
import { NavService } from './nav.service';
import { CountUp } from './count-up';
import { ChartDonut, DonutSlice } from './chart-donut';

const ROLE_ICONS = ['💻', '🎨', '📊', '📣', '🧑‍💼', '⚙️'];
const APP_STATUSES = ['Shortlisted', 'Interview', 'Applied', 'Rejected'];

@Component({
  selector: 'app-company-view',
  imports: [ReactiveFormsModule, DatePipe, CountUp, ChartDonut],
  template: `
    @if (nav.page() === 'post') {
      <!-- ============ POST A JOB (wizard) ============ -->
      <div class="console-head">
        <div class="console-title">
          <h1>Post a Job</h1>
          <p>Every posting starts <span class="badge pending">Pending</span> and goes live only after admin approval.</p>
        </div>
        <button class="btn ghost sm" (click)="nav.goPage('jobs')">← Job Postings</button>
      </div>

      <section class="panel glass">
        <div class="steps">
          @for (label of stepLabels; track label; let i = $index) {
            <div class="step" [class.active]="step() === i + 1" [class.done]="step() > i + 1">
              <span class="step-dot">{{ step() > i + 1 ? '✓' : i + 1 }}</span>
              <span class="step-label">{{ label }}</span>
            </div>
            @if (i < stepLabels.length - 1) { <div class="step-line" [class.done]="step() > i + 1"></div> }
          }
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          @if (step() === 1) {
            <div class="grid-form step-body">
              <div class="field" [class.invalid]="bad('companyName')">
                <label>Company Name</label>
                <input formControlName="companyName" placeholder="e.g. Acme Corp" />
                <span class="err">{{ bad('companyName') ? 'Company name is required' : '' }}</span>
              </div>
              <div class="field" [class.invalid]="bad('roleTitle')">
                <label>Role Title</label>
                <input formControlName="roleTitle" placeholder="e.g. Software Development Engineer" />
                <span class="err">{{ bad('roleTitle') ? 'Role title is required' : '' }}</span>
              </div>
              <div class="field full">
                <label>Salary / CTC <span class="opt">(optional)</span></label>
                <input formControlName="salary" placeholder="e.g. ₹ 12 - 18 LPA" />
                <span class="err"></span>
              </div>
            </div>
          } @else if (step() === 2) {
            <div class="grid-form step-body">
              <div class="field full" [class.invalid]="bad('description')">
                <label>Description</label>
                <textarea formControlName="description" rows="3" placeholder="What will this person build, learn, own?"></textarea>
                <span class="err">{{ bad('description') ? 'Description is required' : '' }}</span>
              </div>
              <div class="field" [class.invalid]="bad('eligibility')">
                <label>Eligibility</label>
                <input formControlName="eligibility" placeholder="e.g. B.Tech CS/IT, CGPA ≥ 7.0" />
                <span class="err">{{ bad('eligibility') ? 'Eligibility is required' : '' }}</span>
              </div>
              <div class="field" [class.invalid]="bad('deadline')">
                <label>Application Deadline</label>
                <input formControlName="deadline" type="date" />
                <span class="err">{{ bad('deadline') ? 'Deadline is required' : '' }}</span>
              </div>
            </div>
          } @else {
            <div class="preview-block glass step-body">
              <span class="company-tag">{{ form.value.companyName }}</span>
              <h3 style="margin:3px 0 8px">{{ form.value.roleTitle }}</h3>
              @if (form.value.salary) { <p class="meta"><strong>Salary</strong> · {{ form.value.salary }}</p> }
              <p class="desc">{{ form.value.description }}</p>
              <p class="meta"><strong>Eligibility</strong> · {{ form.value.eligibility }}</p>
              <p class="meta"><strong>Deadline</strong> · {{ form.value.deadline }}</p>
              <p class="hint" style="margin:10px 0 0">This is what students will see once approved.</p>
            </div>
          }

          <div class="actions" style="margin-top:18px">
            @if (step() > 1) { <button type="button" class="btn ghost" (click)="back()">← Back</button> }
            @if (step() < 3) {
              <button type="button" class="btn primary" (click)="next()">Continue →</button>
            } @else {
              <button type="submit" class="btn primary" [disabled]="form.invalid || submitting()">
                {{ submitting() ? 'Publishing…' : 'Publish for Review' }}
              </button>
            }
            @if (message()) { <span class="msg" [class.error]="isError()">{{ message() }}</span> }
          </div>
        </form>
      </section>
    } @else if (nav.page() === 'jobs') {
      <!-- ============ JOB POSTINGS ============ -->
      <div class="console-head">
        <div class="console-title">
          <h1>Job Postings</h1>
          <p>All your roles, from draft to approval to applicants.</p>
        </div>
        <button class="btn primary" (click)="nav.goPage('post')">+ Post a Job</button>
      </div>
      <section class="panel glass">
        @if (loading()) {
          <div class="skeleton skel-row"></div><div class="skeleton skel-row"></div>
        } @else if (myPostings().length === 0) {
          <p class="empty">No postings yet — publish your first one.</p>
        } @else {
          <table class="table">
            <thead><tr><th>Job Title</th><th>Applicants</th><th>Status</th><th>Deadline</th></tr></thead>
            <tbody>
              @for (p of myPostings(); track p.id; let i = $index) {
                <tr (click)="openTimeline(p)" style="cursor:pointer" title="View approval timeline">
                  <td>
                    <div style="display:flex; gap:11px; align-items:center">
                      <span class="role-ico">{{ roleIcon(i) }}</span>
                      <div><div style="font-weight:600">{{ p.roleTitle }}</div>
                      <div class="jr-sub">Full-time · {{ p.companyName }}</div></div>
                    </div>
                  </td>
                  <td>{{ appCountFor(p) }}</td>
                  <td><span [class]="'badge ' + (p.status || '').toLowerCase()">{{ chipLabel(p.status) }}</span></td>
                  <td class="jr-sub">{{ p.deadline }}</td>
                </tr>
              }
            </tbody>
          </table>
          <p class="hint" style="margin:10px 0 0">Click a job to see its approval timeline.</p>
        }
      </section>
    } @else if (nav.page() === 'apps') {
      <!-- ============ APPLICATIONS ============ -->
      <div class="console-head">
        <div class="console-title">
          <h1>Applications</h1>
          <p>Everyone who applied to your postings.</p>
        </div>
      </div>
      <section class="panel glass">
        @if (myApps().length === 0) {
          <p class="empty">No applications yet — they appear as soon as students apply to an approved role.</p>
        } @else {
          <table class="table">
            <thead><tr><th>Candidate</th><th>Role</th><th>Applied</th><th>Status</th></tr></thead>
            <tbody>
              @for (a of myApps(); track a.id; let i = $index) {
                <tr>
                  <td>
                    <div style="display:flex; gap:10px; align-items:center">
                      <span class="init-av" [style.background]="avColor(i)">{{ initials(a.studentName) }}</span>
                      <div><div style="font-weight:600">{{ a.studentName }}</div>
                      <div class="jr-sub">{{ a.studentEmail }}</div></div>
                    </div>
                  </td>
                  <td>{{ a.posting.roleTitle }}</td>
                  <td class="jr-sub">{{ a.appliedAt | date:'MMM d, y' }}</td>
                  <td><span class="badge" [class]="'badge ' + appChip(i).toLowerCase()">{{ appChip(i) }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>
    } @else if (isStubPage()) {
      <div class="console-head">
        <div class="console-title">
          <h1>{{ stubTitle() }}</h1>
          <p>View and manage your company {{ nav.page() === 'settings' ? 'configurations' : nav.page() === 'profile' ? 'profile details' : nav.page() }}.</p>
        </div>
      </div>

      @if (nav.page() === 'shortlisted') {
        <section class="panel glass">
          <h2>Shortlisted Candidates</h2>
          <p class="hint">Candidates selected for interviews after initial profile screening.</p>
          <table class="table" style="margin-top:12px">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>CGPA</th>
                <th>Skills</th>
                <th>Shortlisted Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Abhishek Sharma</strong></td>
                <td>Frontend Developer</td>
                <td>8.9</td>
                <td>Angular, CSS, HTML5</td>
                <td style="color:var(--muted)">15 May, 2025</td>
                <td><span class="badge approved">Shortlisted</span></td>
              </tr>
              <tr>
                <td><strong>Neha Gupta</strong></td>
                <td>Consultant Analyst</td>
                <td>9.1</td>
                <td>SQL, Python, Excel</td>
                <td style="color:var(--muted)">14 May, 2025</td>
                <td><span class="badge approved">Shortlisted</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      } @else if (nav.page() === 'interviews') {
        <section class="panel glass">
          <h2>Interview Schedule</h2>
          <p class="hint">Manage upcoming video interviews and feedback slots.</p>
          <table class="table" style="margin-top:12px">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Round</th>
                <th>Date & Time</th>
                <th>Platform</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Manogna P.</strong></td>
                <td>SDE Intern</td>
                <td>Round 1 (Technical)</td>
                <td style="color:var(--muted)">22 May, 2025 · 10:00 AM</td>
                <td>MS Teams</td>
                <td><span class="badge pending">Scheduled</span></td>
              </tr>
              <tr>
                <td><strong>Abhishek Sharma</strong></td>
                <td>Frontend Dev</td>
                <td>Round 2 (Coding)</td>
                <td style="color:var(--muted)">19 May, 2025 · 11:30 AM</td>
                <td>Google Meet</td>
                <td><span class="badge approved">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      } @else if (nav.page() === 'offers') {
        <section class="panel glass">
          <h2>Extended Offers</h2>
          <p class="hint">Track student responses to released job offers.</p>
          <table class="table" style="margin-top:12px">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Salary (CTC)</th>
                <th>Released Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Neha Gupta</strong></td>
                <td>Consultant Analyst</td>
                <td>11.5 LPA</td>
                <td style="color:var(--muted)">15 May, 2025</td>
                <td><span class="badge approved">Accepted</span></td>
              </tr>
              <tr>
                <td><strong>Rohan Verma</strong></td>
                <td>Ninja Developer</td>
                <td>3.6 LPA</td>
                <td style="color:var(--muted)">14 May, 2025</td>
                <td><span class="badge rejected">Declined</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      } @else if (nav.page() === 'candidates') {
        <section class="panel glass">
          <h2>Talent Pool Directory</h2>
          <p class="hint">Browse all students currently registered for campus placement.</p>
          <table class="table" style="margin-top:12px">
            <thead>
              <tr>
                <th>Student</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Key Skills</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Manogna P.</strong></td>
                <td>CSE</td>
                <td>9.20</td>
                <td>Angular, TypeScript, Java</td>
                <td><button class="btn primary sm" (click)="demoToast('Resume View')">View Resume</button></td>
              </tr>
              <tr>
                <td><strong>Rahul S.</strong></td>
                <td>CSE</td>
                <td>8.80</td>
                <td>React, Node.js, Express</td>
                <td><button class="btn primary sm" (click)="demoToast('Resume View')">View Resume</button></td>
              </tr>
              <tr>
                <td><strong>Priya K.</strong></td>
                <td>ECE</td>
                <td>8.50</td>
                <td>Embedded C, Python, IoT</td>
                <td><button class="btn primary sm" (click)="demoToast('Resume View')">View Resume</button></td>
              </tr>
            </tbody>
          </table>
        </section>
      } @else if (nav.page() === 'profile') {
        <section class="panel glass">
          <h2>Company Profile Details</h2>
          <p class="hint">Keep your public recruiter profile updated to attract high-quality applicants.</p>
          <div class="grid-form" style="margin-top:18px">
            <div class="field">
              <label>Company Display Name</label>
              <input type="text" value="Tech Solutions Inc." readonly />
            </div>
            <div class="field">
              <label>Industry Sector</label>
              <input type="text" value="Software Technology / IT Services" />
            </div>
            <div class="field">
              <label>Website URL</label>
              <input type="text" value="https://techsolutions.example.com" />
            </div>
            <div class="field">
              <label>Headquarters Location</label>
              <input type="text" value="Bengaluru, KA, India" />
            </div>
            <div class="field full">
              <label>Company Overview</label>
              <textarea rows="3">Acme Recruiting Solutions is a leading multinational software consultancy specializing in enterprise web applications, cloud hosting infrastructure, and modern AI/ML pipelines.</textarea>
            </div>
            <button class="btn primary" style="width:200px" (click)="demoToast('Profile Update')">Save Profile Details</button>
          </div>
        </section>
      } @else if (nav.page() === 'reports') {
        <div class="stats" style="grid-template-columns: repeat(4, 1fr)">
          <div class="stat glass">
            <div><div class="num">5</div><div class="lbl">Jobs Posted</div></div>
          </div>
          <div class="stat glass">
            <div><div class="num">12</div><div class="lbl">Candidates Shortlisted</div></div>
          </div>
          <div class="stat glass">
            <div><div class="num">4</div><div class="lbl">Offers Extended</div></div>
          </div>
          <div class="stat glass">
            <div><div class="num">3</div><div class="lbl">Scheduled Interviews</div></div>
          </div>
        </div>

        <section class="panel glass section-gap">
          <h2>Hiring Funnel Analytics</h2>
          <div class="bar-chart" style="margin-top:15px">
            <div class="bar-row">
              <span class="bar-label">Total Applications</span>
              <div class="bar-track"><div class="bar-fill" style="width: 100%"></div></div>
              <span class="bar-value">48</span>
            </div>
            <div class="bar-row">
              <span class="bar-label">Shortlisted Candidates</span>
              <div class="bar-track"><div class="bar-fill" style="width: 25%"></div></div>
              <span class="bar-value">12</span>
            </div>
            <div class="bar-row">
              <span class="bar-label">Interview Rounds</span>
              <div class="bar-track"><div class="bar-fill" style="width: 16%"></div></div>
              <span class="bar-value">8</span>
            </div>
            <div class="bar-row">
              <span class="bar-label">Offers Given</span>
              <div class="bar-track"><div class="bar-fill" style="width: 8%"></div></div>
              <span class="bar-value">4</span>
            </div>
          </div>
        </section>
      } @else if (nav.page() === 'settings') {
        <div class="settings-grid-custom">
          <section class="panel glass settings-card-custom" style="margin:0">
            <h2>Recruiter Preferences</h2>
            <div class="settings-row-custom" style="margin-top:12px">
              <span>Send interview email notifications automatically</span>
              <label class="toggle-switch-custom">
                <input type="checkbox" checked />
                <span class="toggle-slider-custom"></span>
              </label>
            </div>
            <div class="settings-row-custom">
              <span>Make company profile visible to all students</span>
              <label class="toggle-switch-custom">
                <input type="checkbox" checked />
                <span class="toggle-slider-custom"></span>
              </label>
            </div>
            <div class="settings-row-custom">
              <span>Subscribe to monthly student pool digests</span>
              <label class="toggle-switch-custom">
                <input type="checkbox" />
                <span class="toggle-slider-custom"></span>
              </label>
            </div>
          </section>

          <section class="panel glass settings-card-custom" style="margin:0">
            <h2>Recruiter Account</h2>
            <div class="field" style="margin-bottom:14px; margin-top:12px">
              <label>Official Recruiting Email</label>
              <input type="text" value="recruiting@techsolutions.example.com" readonly />
            </div>
            <button class="btn primary" style="width:100%" (click)="demoToast('Recruiter Settings')">Save Configurations</button>
          </section>
        </div>
      }
    } @else {
      <!-- ============ COMPANY DASHBOARD ============ -->
      <div class="console-head">
        <div class="console-title">
          <h1>Welcome back, {{ companyLabel() }}! 👋</h1>
          <p>Here's what's happening with your hiring today.</p>
        </div>
      </div>

      <div class="stats" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))">
        <div class="stat glass"><span class="ico round" style="background:#7c6cf0">💼</span>
          <div><div class="num"><count-up [value]="kpis().active" /></div><div class="lbl">Active Jobs</div>
          <div class="kpi-trend up">↑ 20% this month</div></div></div>
        <div class="stat glass"><span class="ico round" style="background:#0ea5e9">📄</span>
          <div><div class="num"><count-up [value]="kpis().applicants" /></div><div class="lbl">Total Applications</div>
          <div class="kpi-trend up">↑ 18% this month</div></div></div>
        <div class="stat glass"><span class="ico round" style="background:#f59e0b">⭐</span>
          <div><div class="num"><count-up [value]="kpis().shortlisted" /></div><div class="lbl">Shortlisted</div>
          <div class="kpi-trend up">↑ 12% this month</div></div></div>
        <div class="stat glass"><span class="ico round" style="background:#10b981">📅</span>
          <div><div class="num"><count-up [value]="kpis().interviews" /></div><div class="lbl">Interviews</div>
          <div class="kpi-trend">No change</div></div></div>
        <div class="stat glass"><span class="ico round" style="background:#8b5cf6">✉️</span>
          <div><div class="num"><count-up [value]="kpis().offers" /></div><div class="lbl">Offers Made</div>
          <div class="kpi-trend up">↑ 50% this month</div></div></div>
      </div>

      <div class="chart-grid" style="grid-template-columns: 1.35fr minmax(300px, 370px)">
        <div style="display:flex; flex-direction:column; gap:14px">
          <section class="panel glass" style="margin:0">
            <div class="console-head" style="margin:0 0 12px">
              <h2 style="margin:0; font-size:15px">Recent Job Postings</h2>
              <button class="expander" (click)="nav.goPage('jobs')">View all jobs →</button>
            </div>
            @if (loading()) {
              <div class="skeleton skel-row"></div><div class="skeleton skel-row"></div>
            } @else if (myPostings().length === 0) {
              <p class="empty">No postings yet — hit "Post a Job" in Quick Actions below.</p>
            } @else {
              <table class="table">
                <thead><tr><th>Job Title</th><th>Applicants</th><th>Status</th><th>Deadline</th></tr></thead>
                <tbody>
                  @for (p of myPostings().slice(0, 5); track p.id; let i = $index) {
                    <tr (click)="openTimeline(p)" style="cursor:pointer">
                      <td>
                        <div style="display:flex; gap:11px; align-items:center">
                          <span class="role-ico">{{ roleIcon(i) }}</span>
                          <div><div style="font-weight:600">{{ p.roleTitle }}</div>
                          <div class="jr-sub">Full-time · {{ p.companyName }}</div></div>
                        </div>
                      </td>
                      <td>{{ appCountFor(p) }}</td>
                      <td><span [class]="'badge ' + (p.status || '').toLowerCase()">{{ chipLabel(p.status) }}</span></td>
                      <td class="jr-sub">{{ p.deadline }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </section>

          <div class="chart-grid" style="grid-template-columns: 1fr 1fr; margin:0">
            <section class="panel glass" style="margin:0">
              <h2 style="margin:0 0 14px; font-size:15px">Quick Actions</h2>
              <div class="qa-row">
                <button class="qa" (click)="nav.goPage('post')"><span class="qa-ico" style="background:var(--primary-soft)">💼</span>Post a Job</button>
                <button class="qa" (click)="nav.goPage('apps')"><span class="qa-ico" style="background:#e0f2fe">👥</span>View Applications</button>
                <button class="qa" (click)="demoToast('Interview scheduling')"><span class="qa-ico" style="background:var(--green-soft)">🗓️</span>Schedule Interview</button>
                <button class="qa" (click)="demoToast('Offers')"><span class="qa-ico" style="background:var(--amber-soft)">✉️</span>Send Offer</button>
              </div>
            </section>
            <section class="panel glass" style="margin:0">
              <h2 style="margin:0 0 10px; font-size:15px">Company Profile Completion</h2>
              <div style="display:flex; gap:16px; align-items:center">
                <svg viewBox="0 0 84 84" class="ring">
                  <circle cx="42" cy="42" r="36" fill="none" stroke="var(--surface-2)" stroke-width="9"/>
                  <circle cx="42" cy="42" r="36" fill="none" stroke="var(--primary)" stroke-width="9"
                          stroke-linecap="round" stroke-dasharray="226" stroke-dashoffset="56.5"
                          transform="rotate(-90 42 42)" class="ring-fill"/>
                  <text x="42" y="48" text-anchor="middle" style="font-size:17px; font-weight:700; fill:var(--text)">75%</text>
                </svg>
                <div>
                  <p class="jr-sub" style="margin:0 0 10px">Complete your profile to attract more relevant candidates.</p>
                  <button class="btn primary sm" (click)="demoToast('Profile editing')">Complete Profile →</button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px">
          <section class="panel glass" style="margin:0">
            <div class="console-head" style="margin:0 0 12px">
              <h2 style="margin:0; font-size:15px">Applications Overview</h2>
              <span class="chip">This Month</span>
            </div>
            <chart-donut [data]="applicantDonut()" center-label="Total" />
            <div style="text-align:center; margin-top:10px">
              <button class="expander" (click)="nav.goPage('apps')">View full report →</button>
            </div>
          </section>

          <section class="panel glass" style="margin:0">
            <div class="console-head" style="margin:0 0 12px">
              <h2 style="margin:0; font-size:15px">Recent Applications</h2>
              <button class="expander" (click)="nav.goPage('apps')">View all →</button>
            </div>
            @if (recentApps().length === 0) {
              <p class="empty">No applications yet.</p>
            }
            @for (a of recentApps(); track a.id; let i = $index) {
              <div class="iv-row">
                <span class="init-av" [style.background]="avColor(i)">{{ initials(a.studentName) }}</span>
                <div class="jr-main">
                  <div class="jr-title" style="font-size:13px">{{ a.studentName }}</div>
                  <div class="jr-sub">{{ a.posting.roleTitle }}</div>
                </div>
                <div style="text-align:right">
                  <span class="badge" [class]="'badge ' + appChip(i).toLowerCase()">{{ appChip(i) }}</span>
                  <div class="jr-sub" style="margin-top:3px">{{ timeAgo(a.appliedAt) }}</div>
                </div>
              </div>
            }
          </section>
        </div>
      </div>
    }

    @if (timelineFor(); as tp) {
      <div class="overlay" (click)="closeTimeline()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Approval Timeline</h3>
          <p class="sub">{{ tp.roleTitle }} · {{ tp.companyName }}</p>
          @if (loadingHistory()) {
            <div class="skeleton skel-line" style="width:80%"></div>
            <div class="skeleton skel-line" style="width:60%"></div>
          } @else if (historyEntries().length === 0) {
            <p class="empty">No history recorded yet — transitions are tracked from now on.</p>
          } @else {
            <div class="timeline">
              @for (h of historyEntries(); track h.id) {
                <div class="tl-item" [style.--tl-color]="colorForStatus(h.toStatus)">
                  <div class="tl-status"><span class="tl-from">{{ h.fromStatus || 'Created' }} → </span>{{ h.toStatus }}</div>
                  @if (h.comment) { <div class="tl-comment">“{{ h.comment }}”</div> }
                  <div class="tl-time">{{ h.changedAt | date:'MMM d, y · h:mm a' }}</div>
                </div>
              }
            </div>
          }
          <div class="actions" style="margin-top:16px">
            <button class="btn ghost" (click)="closeTimeline()">Close</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CompanyView {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  nav = inject(NavService);

  stepLabels = ['Basics', 'Details', 'Preview'];
  step = signal(1);

  form = this.fb.nonNullable.group({
    companyName: ['', Validators.required],
    roleTitle: ['', Validators.required],
    salary: [''],
    description: ['', Validators.required],
    eligibility: ['', Validators.required],
    deadline: ['', Validators.required],
  });

  submitting = signal(false);
  loading = signal(true);
  message = signal('');
  isError = signal(false);
  lastCompany = signal('');
  private postings = signal<Posting[]>([]);
  private applications = signal<AppRecord[]>([]);

  timelineFor = signal<Posting | null>(null);
  historyEntries = signal<StatusChange[]>([]);
  loadingHistory = signal(false);

  companyLabel = computed(() => this.lastCompany() || 'Tech Solutions Inc.');

  myPostings = computed(() => {
    const company = this.lastCompany();
    const all = this.postings();
    return company ? all.filter(p => p.companyName.toLowerCase() === company.toLowerCase()) : all;
  });

  myApps = computed(() => {
    const ids = new Set(this.myPostings().map(p => p.id));
    return this.applications().filter(a => ids.has(a.posting?.id));
  });

  recentApps = computed(() =>
    [...this.myApps()].sort((a, b) => (b.appliedAt || '').localeCompare(a.appliedAt || '')).slice(0, 5));

  kpis = computed(() => {
    const mine = this.myPostings();
    const apps = this.myApps().length;
    return {
      active: mine.filter(p => p.status === 'APPROVED').length,
      applicants: apps,
      shortlisted: Math.round(apps * 0.35),
      interviews: Math.round(apps * 0.18),
      offers: Math.max(apps > 0 ? 1 : 0, Math.round(apps * 0.07)),
    };
  });

  applicantDonut = computed<DonutSlice[]>(() => {
    const apps = this.myApps().length;
    if (apps === 0) return [{ label: 'No applicants yet', value: 1, color: '#d7dae8' }];
    const k = this.kpis();
    const rejected = Math.round(apps * 0.19);
    return [
      { label: 'Applied', value: Math.max(0, apps - k.shortlisted - k.interviews - k.offers - rejected), color: '#4f46e5' },
      { label: 'Shortlisted', value: k.shortlisted, color: '#10b981' },
      { label: 'Interview', value: k.interviews, color: '#f59e0b' },
      { label: 'Offer', value: k.offers, color: '#0ea5e9' },
      { label: 'Rejected', value: rejected, color: '#9ca3af' },
    ];
  });

  isStubPage = computed(() =>
    ['shortlisted', 'interviews', 'offers', 'candidates', 'profile', 'reports', 'settings'].includes(this.nav.page()));

  stubIcon = computed(() => ({
    shortlisted: '⭐', interviews: '📅', offers: '✉️', candidates: '👥',
    profile: '🏢', reports: '📈', settings: '⚙️',
  } as Record<string, string>)[this.nav.page()] ?? '✨');

  stubTitle = computed(() => ({
    shortlisted: 'Shortlisted', interviews: 'Interviews', offers: 'Offers',
    candidates: 'Candidates', profile: 'Company Profile', reports: 'Reports', settings: 'Settings',
  } as Record<string, string>)[this.nav.page()] ?? '');

  constructor() {
    this.refresh();
  }

  roleIcon(i: number): string { return ROLE_ICONS[i % ROLE_ICONS.length]; }
  appChip(i: number): string { return APP_STATUSES[i % APP_STATUSES.length]; }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  avColor(i: number): string {
    const c = ['#7c6cf0', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return c[i % c.length];
  }

  timeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const h = Math.floor(ms / 3600000);
    if (h < 1) return 'just now';
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  }

  demoToast(what: string) {
    this.toast.show(`Action "${what}" completed successfully`, 'success');
  }

  chipLabel(status?: string): string {
    return status === 'APPROVED' ? 'Active'
         : status ? status[0] + status.slice(1).toLowerCase() : '';
  }

  appCountFor(p: Posting): number {
    return this.applications().filter(a => a.posting?.id === p.id).length;
  }

  bad(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  private stepControls(step: number): string[] {
    return step === 1 ? ['companyName', 'roleTitle'] : step === 2 ? ['description', 'eligibility', 'deadline'] : [];
  }

  next() {
    let valid = true;
    for (const name of this.stepControls(this.step())) {
      const c = this.form.get(name)!;
      c.markAsTouched();
      if (c.invalid) valid = false;
    }
    if (valid) this.step.update(s => Math.min(3, s + 1));
  }

  back() { this.step.update(s => Math.max(1, s - 1)); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.message.set('');
    const v = this.form.getRawValue();
    this.api.createPosting({ ...v, salary: v.salary || null }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.isError.set(false);
        this.lastCompany.set(v.companyName);
        this.toast.show(`"${v.roleTitle}" submitted for review`, 'success');
        this.form.reset({ companyName: v.companyName, roleTitle: '', salary: '', description: '', eligibility: '', deadline: '' });
        this.step.set(1);
        this.refresh();
        this.nav.goPage('dashboard');
      },
      error: () => {
        this.submitting.set(false);
        this.isError.set(true);
        this.message.set('Failed to submit. Is the backend running on port 8081?');
        this.toast.show('Could not reach the server', 'error');
      },
    });
  }

  openTimeline(p: Posting) {
    this.timelineFor.set(p);
    this.loadingHistory.set(true);
    this.historyEntries.set([]);
    this.api.getStatusHistory(p.id!).subscribe({
      next: hs => { this.historyEntries.set(hs); this.loadingHistory.set(false); },
      error: () => this.loadingHistory.set(false),
    });
  }

  closeTimeline() { this.timelineFor.set(null); }

  colorForStatus(status: string): string {
    switch (status) {
      case 'APPROVED': return 'var(--green)';
      case 'REJECTED': return 'var(--red)';
      case 'CLOSED': return 'var(--muted)';
      default: return 'var(--amber)';
    }
  }

  refresh() {
    this.loading.set(true);
    this.api.getAllPostings().subscribe({
      next: ps => { this.postings.set(ps); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.api.getApplications().subscribe({ next: as => this.applications.set(as), error: () => {} });
  }
}
