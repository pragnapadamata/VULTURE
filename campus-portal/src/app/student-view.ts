import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService, Analytics, AppRecord, Posting } from './api.service';
import { ToastService } from './toast.service';
import { NavService } from './nav.service';
import { CountUp } from './count-up';
import { ChartDonut, DonutSlice } from './chart-donut';
import { CoLogo } from './co-logo';
import { DatePipe } from '@angular/common';

interface ConfettiPiece { left: number; delay: number; color: string; rot: number; }

const COMPANY_COLORS: Record<string, string> = {
  Google: '#4285F4', Microsoft: '#7FBA00', Amazon: '#FF9900', TCS: '#0F6CBD',
  Infosys: '#007CC3', IBM: '#1F70C1', Flipkart: '#2874F0', Zomato: '#E23744',
};

@Component({
  selector: 'app-student-view',
  imports: [ReactiveFormsModule, CountUp, ChartDonut, CoLogo, DatePipe],
  template: `
    @if (selected(); as sel) {
      <!-- ============ JOB DETAILS ============ -->
      <button class="btn ghost sm" style="margin-bottom:14px" (click)="selected.set(null)">← Back to jobs</button>
      <div class="detail-grid">
        <section class="panel glass" style="margin:0">
          <div style="display:flex; gap:14px; align-items:center; margin-bottom:6px">
            <co-logo [name]="sel.companyName" />
            <div>
              <h1 style="margin:0; font-size:19px">{{ sel.roleTitle }}</h1>
              <p class="meta" style="margin-top:2px">{{ sel.companyName }} · Full Time</p>
            </div>
          </div>
          @if (sel.salary) { <p class="meta" style="font-size:14px"><strong>{{ sel.salary }}</strong></p> }

          <div class="tabs">
            @for (t of tabs; track t) {
              <button [class.active]="tab() === t" (click)="tab.set(t)">{{ t }}</button>
            }
          </div>

          @switch (tab()) {
            @case ('Overview') {
              <h2 style="font-size:14px">Job Overview</h2>
              <p class="desc" style="line-height:1.7">{{ sel.description }}</p>
              <h2 style="font-size:14px; margin-top:18px">Eligibility</h2>
              <p class="desc">{{ sel.eligibility }}</p>
            }
            @case ('Requirements') {
              <h2 style="font-size:14px">Requirements</h2>
              <p class="desc">{{ sel.eligibility }}</p>
              <p class="desc" style="margin-top:8px">Good problem-solving skills and willingness to learn are valued for this role.</p>
            }
            @case ('About Company') {
              <h2 style="font-size:14px">About {{ sel.companyName }}</h2>
              <p class="desc">{{ sel.companyName }} is one of our verified campus recruiters. All postings from this
                 company have passed placement-cell review.</p>
            }
          }
        </section>
        <div>
          <div class="panel glass sticky-card">
            <h3 style="margin:0 0 10px; font-size:14px">Job Highlights</h3>
            @if (sel.salary) { <p class="meta" style="margin-bottom:7px"><strong>Salary</strong> · {{ sel.salary }}</p> }
            <p class="meta" style="margin-bottom:7px"><strong>Deadline</strong> · {{ sel.deadline }}</p>
            <span class="countdown" [class.urgent]="isUrgent(sel)">⏳ {{ countdownFor(sel) }}</span>
            @if (appliedIds().has(sel.id!)) {
              <p class="msg" style="margin-top:12px">✓ You've applied to this role</p>
            } @else {
              <button class="btn primary" style="width:100%; margin-top:14px" (click)="openApply(sel)">Apply Now</button>
            }
          </div>
        </div>
      </div>
    } @else if (nav.page() === 'browse') {
      <!-- ============ BROWSE JOBS ============ -->
      <div class="console-head">
        <div class="console-title">
          <h1>Browse Jobs</h1>
          <p>All verified, admin-approved openings.</p>
        </div>
      </div>
      <div class="search-box" style="max-width:100%; margin-bottom:16px">🔍
        <input placeholder="Search by role, company or skills…" [value]="query()" (input)="query.set($any($event.target).value)" />
      </div>
      @if (loading()) {
        <div class="skeleton skel-row" style="height:74px"></div>
        <div class="skeleton skel-row" style="height:74px"></div>
        <div class="skeleton skel-row" style="height:74px"></div>
      } @else if (filtered().length === 0) {
        <p class="empty">No openings match "{{ query() }}". Try a different search — or check back after the next approval cycle.</p>
      } @else {
        @for (p of filtered(); track p.id; let i = $index) {
          <div class="job-row" [style.animation-delay]="(i * 0.05) + 's'" (click)="open(p)">
            <co-logo [name]="p.companyName" />
            <div class="jr-main">
              <div class="jr-title">{{ p.roleTitle }}</div>
              <div class="jr-sub">{{ p.companyName }}@if (p.salary) { · {{ p.salary }} }</div>
              <div style="margin-top:6px">
                <span class="chip">Full Time</span>
                <span class="chip">⏳ {{ countdownShort(p) }}</span>
              </div>
            </div>
            @if (appliedIds().has(p.id!)) {
              <span class="msg">✓ Applied</span>
            } @else {
              <button class="btn primary sm" (click)="$event.stopPropagation(); openApply(p)">Apply</button>
            }
          </div>
        }
      }
    } @else {
      <!-- ============ DASHBOARD ============ -->
      @if (nav.page() === 'applications') {
        <div class="console-head">
          <div class="console-title">
            <h1>My Applications</h1>
            <p>Every application on the portal (demo — no per-student login).</p>
          </div>
        </div>
        <section class="panel glass">
          @if (allApps().length === 0) {
            <p class="empty">No applications yet — apply to a role from Find Jobs.</p>
          } @else {
            <table class="table">
              <thead><tr><th>Role</th><th>Student</th><th>Applied</th><th>Status</th></tr></thead>
              <tbody>
                @for (a of allApps(); track a.id) {
                  <tr>
                    <td>
                      <div style="display:flex; gap:10px; align-items:center">
                        <co-logo [name]="a.posting.companyName" />
                        <div><div style="font-weight:600">{{ a.posting.roleTitle }}</div>
                        <div class="jr-sub">{{ a.posting.companyName }}</div></div>
                      </div>
                    </td>
                    <td>{{ a.studentName }}<div class="jr-sub">{{ a.rollNumber }}</div></td>
                    <td>{{ a.appliedAt | date:'MMM d, y' }}</td>
                    <td><span class="badge approved">Applied</span></td>
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
            <p>View and manage your student portal {{ nav.page() === 'settings' ? 'configurations' : nav.page() === 'profile' ? 'profile overview' : nav.page() }}.</p>
          </div>
        </div>

        @if (nav.page() === 'interviews') {
          <section class="panel glass">
            <h2>Your Scheduled Interviews</h2>
            <p class="hint">Always join meetings 5 minutes prior to the scheduled slot.</p>
            <table class="table" style="margin-top:12px">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job Role</th>
                  <th>Interview Round</th>
                  <th>Date & Time</th>
                  <th>Meeting Platform</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style="display:flex; gap:8px; align-items:center">
                      <co-logo name="Amazon" />
                      <strong>Amazon</strong>
                    </div>
                  </td>
                  <td>Software Engineer Intern</td>
                  <td>Round 1 (Technical)</td>
                  <td style="color:var(--muted)">22 May, 2025 · 10:00 AM</td>
                  <td><strong>Amazon Chime</strong></td>
                  <td><span class="badge pending">Scheduled</span></td>
                </tr>
                <tr>
                  <td>
                    <div style="display:flex; gap:8px; align-items:center">
                      <co-logo name="Swiggy" />
                      <strong>Swiggy</strong>
                    </div>
                  </td>
                  <td>Frontend Developer</td>
                  <td>Round 2 (Coding)</td>
                  <td style="color:var(--muted)">19 May, 2025 · 11:30 AM</td>
                  <td><strong>Google Meet</strong></td>
                  <td><span class="badge approved">Completed</span></td>
                </tr>
                <tr>
                  <td>
                    <div style="display:flex; gap:8px; align-items:center">
                      <co-logo name="Deloitte" />
                      <strong>Deloitte</strong>
                    </div>
                  </td>
                  <td>Consultant Analyst</td>
                  <td>Technical Round</td>
                  <td style="color:var(--muted)">15 May, 2025 · 04:00 PM</td>
                  <td><strong>Zoom</strong></td>
                  <td><span class="badge approved">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="panel glass section-gap">
            <h2>Interview Preparation Tips</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:12px">
              <div class="insight glass" style="margin:0; padding:15px">
                <span class="ins-ico" style="background:var(--primary-soft); font-size:16px">📚</span>
                <div>
                  <h4 style="margin:0 0 4px">Technical Prep</h4>
                  <p class="desc" style="font-size:12px; margin:0">Revise Data Structures, Algorithms, and System Design concepts. Practice coding on paper or whiteboards.</p>
                </div>
              </div>
              <div class="insight glass" style="margin:0; padding:15px">
                <span class="ins-ico" style="background:var(--green-soft); font-size:16px">💬</span>
                <div>
                  <h4 style="margin:0 0 4px">Behavioral Prep</h4>
                  <p class="desc" style="font-size:12px; margin:0">Use the STAR method (Situation, Task, Action, Result) to structure answers to HR questions.</p>
                </div>
              </div>
            </div>
          </section>
        } @else if (nav.page() === 'messages') {
          <div class="chart-grid" style="grid-template-columns: 1fr 2fr; margin:0">
            <section class="panel glass" style="margin:0; padding:0; display:flex; flex-direction:column">
              <div style="padding:15px; border-bottom:1px solid var(--border)">
                <h3 style="margin:0; font-size:15px">Conversations</h3>
              </div>
              <div style="display:flex; flex-direction:column">
                <div class="dash-notif-item" style="padding:12px 15px; cursor:pointer; background:var(--primary-soft)">
                  <span class="init-av" style="background:var(--primary); width:32px; height:32px; font-size:12px">DA</span>
                  <div class="notif-content-wrapper" style="margin-left:10px">
                    <p class="notif-text" style="font-weight:600; margin:0">Dr. Ananya</p>
                    <span class="notif-time" style="font-size:12px">Your resume is approved...</span>
                  </div>
                </div>
                <div class="dash-notif-item" style="padding:12px 15px; cursor:pointer; border-bottom:1px solid var(--border)">
                  <span class="init-av" style="background:#ff9900; width:32px; height:32px; font-size:12px">AM</span>
                  <div class="notif-content-wrapper" style="margin-left:10px">
                    <p class="notif-text" style="margin:0">Amazon Recruiter</p>
                    <span class="notif-time" style="font-size:12px">Interview scheduled on...</span>
                  </div>
                </div>
              </div>
            </section>

            <section class="panel glass" style="margin:0; display:flex; flex-direction:column; justify-content:space-between; height:450px">
              <div style="padding-bottom:12px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px">
                <span class="init-av" style="background:var(--primary)">DA</span>
                <div>
                  <h3 style="margin:0; font-size:14px">Dr. Ananya</h3>
                  <span class="meta" style="font-size:12px">Placement Cell Administrator</span>
                </div>
              </div>

              <div style="flex-grow:1; overflow-y:auto; padding:15px 0; display:flex; flex-direction:column; gap:12px">
                <div style="align-self:flex-start; background:var(--surface-2); padding:10px 14px; border-radius:12px; max-width:70%">
                  <p style="margin:0; font-size:13px">Hi Manogna, your resume for the Software Engineer Intern drive at Amazon has been approved by the placement cell.</p>
                  <span style="font-size:10px; color:var(--muted); float:right; margin-top:4px">10:15 AM</span>
                </div>
                <div style="align-self:flex-end; background:var(--primary); color:white; padding:10px 14px; border-radius:12px; max-width:70%">
                  <p style="margin:0; font-size:13px">Thank you, Dr. Ananya! I will prepare for the technical round.</p>
                  <span style="font-size:10px; color:rgba(255,255,255,0.7); float:right; margin-top:4px">10:20 AM</span>
                </div>
              </div>

              <div style="border-top:1px solid var(--border); padding-top:12px; display:flex; gap:10px">
                <input style="flex-grow:1; padding:8px 12px; border-radius:8px; border:1px solid var(--border)" placeholder="Type a message..." />
                <button class="btn primary sm" (click)="triggerQuickAction('Send Message')">Send</button>
              </div>
            </section>
          </div>
        } @else if (nav.page() === 'saved') {
          <section class="panel glass">
            <h2>Bookmarked Opportunities</h2>
            <p class="hint">Track the jobs you saved to apply later.</p>
            <div style="margin-top:12px">
              @if (savedJobs().length === 0) {
                <p class="empty">No saved jobs. Bookmark jobs from the "Find Jobs" section to see them here.</p>
              } @else {
                @for (p of savedJobs(); track p.id; let i = $index) {
                  <div class="job-row" (click)="open(p)">
                    <co-logo [name]="p.companyName" />
                    <div class="jr-main">
                      <div class="jr-title">{{ p.roleTitle }}</div>
                      <div class="jr-sub">{{ p.companyName }} · Bangalore, India</div>
                      <div style="margin-top:6px">
                        <span class="chip">Full-time</span>
                        <span class="chip">⏳ {{ countdownShort(p) }}</span>
                      </div>
                    </div>
                    <button class="bookmark on" (click)="$event.stopPropagation(); toggleSave(p)">Bookmark</button>
                    @if (appliedIds().has(p.id!)) {
                      <span class="msg">✓ Applied</span>
                    } @else {
                      <button class="btn primary sm" (click)="$event.stopPropagation(); openApply(p)">Apply</button>
                    }
                  </div>
                }
              }
            </div>
          </section>
        } @else if (nav.page() === 'profile') {
          <div class="detail-grid">
            <section class="panel glass" style="margin:0">
              <div style="display:flex; gap:16px; align-items:center; margin-bottom:18px">
                <span class="init-av" style="width:64px; height:64px; font-size:22px; background:var(--primary)">MP</span>
                <div>
                  <h2 style="margin:0">Manogna P.</h2>
                  <p class="meta" style="margin-top:2px">Roll No: 2022CSE0012 · CSE Department</p>
                </div>
              </div>

              <h3 style="margin-bottom:8px">Academic Overview</h3>
              <div class="insights" style="margin-bottom:18px">
                <div class="insight glass"><span class="ins-ico" style="background:#e0f2fe">🛡️</span>
                  <span class="ins-l">Current CGPA</span><b>9.20 / 10</b></div>
                <div class="insight glass"><span class="ins-ico" style="background:var(--green-soft)">📊</span>
                  <span class="ins-l">Active Applications</span><b>{{ appliedIds().size }}</b></div>
                <div class="insight glass"><span class="ins-ico" style="background:var(--amber-soft)">🧡</span>
                  <span class="ins-l">Placed Status</span><b>In Progress</b></div>
              </div>

              <h3 style="margin-bottom:8px">Skills & Competencies</h3>
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px">
                <span class="chip">Angular</span>
                <span class="chip">TypeScript</span>
                <span class="chip">CSS / HTML5</span>
                <span class="chip">Java</span>
                <span class="chip">SQL Database</span>
                <span class="chip">Data Structures</span>
                <span class="chip">Problem Solving</span>
              </div>

              <h3 style="margin-bottom:8px">Education</h3>
              <div class="timeline" style="margin-top:8px">
                <div class="tl-item" style="--tl-color:var(--primary); padding-bottom:12px">
                  <div class="tl-status">B.Tech in Computer Science & Engineering</div>
                  <div class="tl-comment">ABC University · 2021 - 2025</div>
                </div>
                <div class="tl-item" style="--tl-color:var(--muted); padding-bottom:0">
                  <div class="tl-status">Senior Secondary School (XII Class)</div>
                  <div class="tl-comment">XYZ Academy · 94.6% · 2021</div>
                </div>
              </div>
            </section>

            <div>
              <div class="panel glass sticky-card">
                <h3 style="margin:0 0 10px; font-size:14px">Your Documents</h3>
                <div style="background:rgba(79, 70, 229, 0.05); border:1px dashed var(--primary); padding:12px; border-radius:8px; display:flex; align-items:center; justify-content:space-between">
                  <div style="display:flex; gap:8px; align-items:center">
                    <span style="font-size:20px">📄</span>
                    <div>
                      <div style="font-weight:600; font-size:12px">manogna_cv.pdf</div>
                      <div class="jr-sub" style="font-size:10px">1.2 MB · Verified PDF</div>
                    </div>
                  </div>
                  <button class="btn ghost sm" (click)="triggerQuickAction('Download Resume')">Download</button>
                </div>
                <button class="btn primary sm" style="width:100%; margin-top:12px" (click)="triggerQuickAction('Update CV')">Update Resume</button>
              </div>
            </div>
          </div>
        } @else if (nav.page() === 'settings') {
          <div class="settings-grid-custom">
            <section class="panel glass settings-card-custom" style="margin:0">
              <h2 style="margin-bottom:12px">Profile Preferences</h2>
              <div class="settings-row-custom">
                <span>Make profile visible to recruiters</span>
                <label class="toggle-switch-custom">
                  <input type="checkbox" checked />
                  <span class="toggle-slider-custom"></span>
                </label>
              </div>
              <div class="settings-row-custom">
                <span>Receive SMS alerts for scheduled interviews</span>
                <label class="toggle-switch-custom">
                  <input type="checkbox" checked />
                  <span class="toggle-slider-custom"></span>
                </label>
              </div>
              <div class="settings-row-custom">
                <span>Receive email notifications for new job matches</span>
                <label class="toggle-switch-custom">
                  <input type="checkbox" checked />
                  <span class="toggle-slider-custom"></span>
                </label>
              </div>
            </section>

            <section class="panel glass settings-card-custom" style="margin:0">
              <h2 style="margin-bottom:12px">Account and Security</h2>
              <div class="field" style="margin-bottom:14px">
                <label>Registered Phone Number</label>
                <input type="text" value="+91 98765 43210" readonly />
              </div>
              <div class="field" style="margin-bottom:14px">
                <label>Registered Email Address</label>
                <input type="text" value="manogna.stud@uniplace.edu" readonly />
              </div>
              <button class="btn primary" style="width: 100%" (click)="triggerQuickAction('Save Preferences')">Save Preferences</button>
            </section>
          </div>
        }
      } @else {
      <div class="console-head">
        <div class="console-title">
          <h1>Hi, Manogna 👋</h1>
          <p>Welcome back! Here's what's happening with your placement journey.</p>
        </div>
      </div>

      <div class="stats">
        <div class="stat glass"><span class="ico round" style="background:#7c6cf0">💼</span>
          <div><div class="num"><count-up [value]="kpis().applications" /></div><div class="lbl">Applications</div>
          <div class="kpi-trend up">↑ 12% this month</div></div></div>
        <div class="stat glass"><span class="ico round" style="background:#10b981">✅</span>
          <div><div class="num"><count-up [value]="kpis().shortlisted" /></div><div class="lbl">Shortlisted</div>
          <div class="kpi-trend up">↑ 5% this month</div></div></div>
        <div class="stat glass"><span class="ico round" style="background:#f59e0b">📅</span>
          <div><div class="num"><count-up [value]="kpis().interviews" /></div><div class="lbl">Interviews</div>
          <div class="kpi-trend">No change</div></div></div>
        <div class="stat glass"><span class="ico round" style="background:#0ea5e9">📄</span>
          <div><div class="num"><count-up [value]="kpis().offers" /></div><div class="lbl">Offers</div>
          <div class="kpi-trend up">↑ 100% this month</div></div></div>
      </div>

      <div class="chart-grid" style="grid-template-columns: 1.35fr minmax(300px, 380px)">
        <div style="display:flex; flex-direction:column; gap:14px">
          <section class="panel glass" style="margin:0">
            <div class="console-head" style="margin:0 0 12px">
              <h2 style="margin:0; font-size:15px">Recommended Jobs</h2>
              <button class="expander" (click)="nav.goPage('browse')">View all</button>
            </div>
            @if (loading()) {
              <div class="skeleton skel-row" style="height:64px"></div>
              <div class="skeleton skel-row" style="height:64px"></div>
            } @else if (postings().length === 0) {
              <p class="empty">No live openings yet — they'll appear the moment the placement office approves them.</p>
            } @else {
              @for (p of postings().slice(0, 3); track p.id) {
                <div class="job-row" (click)="open(p)">
                  <co-logo [name]="p.companyName" />
                  <div class="jr-main">
                    <div class="jr-title">{{ p.roleTitle }}</div>
                    <div class="jr-sub">{{ p.companyName }} · Bengaluru, India</div>
                    <div style="margin-top:6px">
                      <span class="chip">Full-time</span>
                      <span class="chip">⏳ {{ countdownShort(p) }}</span>
                    </div>
                  </div>
                  <button class="bookmark" [class.on]="saved().has(p.id!)"
                          (click)="$event.stopPropagation(); toggleSave(p)">🔖</button>
                  @if (appliedIds().has(p.id!)) { <span class="msg">✓</span> }
                  @else { <button class="btn primary sm" (click)="$event.stopPropagation(); openApply(p)">Apply</button> }
                </div>
              }
              <div style="text-align:center; margin-top:8px">
                <button class="expander" (click)="nav.goPage('browse')">Explore more jobs →</button>
              </div>
            }
          </section>

          <section class="panel glass" style="margin:0">
            <h2 style="margin:0 0 12px; font-size:15px">Placement Insights</h2>
            <div class="insights">
              <div class="insight glass"><span class="ins-ico" style="background:var(--primary-soft)">📊</span>
                <span class="ins-l">Top Skill</span><b>Problem Solving</b><span class="chip" style="color:#059669; background:var(--green-soft); border-color:#a7f3d0">High Demand</span></div>
              <div class="insight glass"><span class="ins-ico" style="background:#e0f2fe">🛡️</span>
                <span class="ins-l">Profile Strength</span><b>85%</b><span class="chip" style="color:#059669; background:var(--green-soft); border-color:#a7f3d0">Good</span></div>
              <div class="insight glass"><span class="ins-ico" style="background:var(--amber-soft)">🧡</span>
                <span class="ins-l">Applications Trend</span><b>+18%</b><span class="ins-s">vs last month</span></div>
              <div class="insight glass"><span class="ins-ico" style="background:var(--green-soft)">✅</span>
                <span class="ins-l">Companies Viewed</span><b>36</b><span class="ins-s">This month</span></div>
            </div>
          </section>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px">
          <section class="panel glass" style="margin:0">
            <h2 style="margin:0 0 12px; font-size:15px">Application Status</h2>
            <chart-donut [data]="statusDonut()" center-label="total" />
            <div style="text-align:center; margin-top:10px">
              <button class="expander" (click)="nav.goPage('applications')">View details →</button>
            </div>
          </section>
          <section class="panel glass" style="margin:0">
            <div class="console-head" style="margin:0 0 12px">
              <h2 style="margin:0; font-size:15px">Upcoming Interviews</h2>
              <button class="expander" (click)="nav.goPage('interviews')">View all</button>
            </div>
            @for (iv of upcomingInterviews(); track iv.company) {
              <div class="iv-row">
                <co-logo [name]="iv.company" />
                <div class="jr-main">
                  <div class="jr-title">{{ iv.company }}</div>
                  <div class="jr-sub">{{ iv.round }} · 📅 {{ iv.date | date:'d MMM, y' }} · 🕙 {{ iv.time }}</div>
                </div>
                <span style="color:var(--muted)">›</span>
              </div>
            }
            <div style="text-align:center; margin-top:8px">
              <button class="expander" (click)="nav.goPage('interviews')">View calendar →</button>
            </div>
            <p class="hint" style="margin:8px 0 0; text-align:center">Derived from recent applications (demo).</p>
          </section>
        </div>
      </div>
      }
    }

    <!-- ============ APPLY STEPPER ============ -->
    @if (applyTarget(); as target) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" style="max-width:560px" (click)="$event.stopPropagation()">
          <div class="glass" style="border:none; box-shadow:none; background:transparent">
          <h3>Apply for Job</h3>
          <p class="sub">{{ target.roleTitle }} · {{ target.companyName }} · closes {{ target.deadline }}</p>

          <div class="steps compact">
            @for (label of stepLabels; track label; let i = $index) {
              <div class="step" [class.active]="step() === i + 1" [class.done]="step() > i + 1">
                <span class="step-dot">{{ step() > i + 1 ? '✓' : i + 1 }}</span>
                <span class="step-label">{{ label }}</span>
              </div>
              @if (i < stepLabels.length - 1) { <div class="step-line" [class.done]="step() > i + 1"></div> }
            }
          </div>

          <form [formGroup]="form" (ngSubmit)="submitApplication()">
            @if (step() === 1) {
              <div class="grid-form step-body">
                <div class="field" [class.invalid]="bad('studentName')">
                  <label>Full Name</label>
                  <input formControlName="studentName" placeholder="John Doe" />
                  <span class="err">{{ bad('studentName') ? 'Name is required' : '' }}</span>
                </div>
                <div class="field" [class.invalid]="bad('studentEmail')">
                  <label>Email</label>
                  <input formControlName="studentEmail" type="email" placeholder="john.doe@student.edu" />
                  <span class="err">{{ bad('studentEmail') ? 'A valid email is required' : '' }}</span>
                </div>
                <div class="field" [class.invalid]="bad('rollNumber')">
                  <label>Roll Number</label>
                  <input formControlName="rollNumber" placeholder="21CS101" />
                  <span class="err">{{ bad('rollNumber') ? 'Roll number is required' : '' }}</span>
                </div>
                <div class="field">
                  <label>Phone <span class="opt">(optional)</span></label>
                  <input formControlName="phone" placeholder="+91 98766 43210" />
                  <span class="err"></span>
                </div>
              </div>
            } @else if (step() === 2) {
              <div class="step-body">
                <div class="field">
                  <label>Resume (PDF / DOC)</label>
                  <div class="dropzone" [class.drag]="dragging()"
                       (click)="fileInput.click()"
                       (dragover)="$event.preventDefault(); dragging.set(true)"
                       (dragleave)="dragging.set(false)"
                       (drop)="onDrop($event)">
                    <span class="icon">📄</span>
                    @if (!resumeFile()) {
                      Drag your resume here, or click to browse
                    } @else {
                      <span class="file-chip">
                        {{ resumeFile()!.name }}
                        <span class="x" (click)="$event.stopPropagation(); clearFile()">✕</span>
                      </span>
                    }
                  </div>
                  <input #fileInput type="file" accept=".pdf,.doc,.docx" hidden (change)="onFilePicked($event)" />
                  <span class="err">{{ fileError() }}</span>
                </div>
              </div>
            } @else if (step() === 3) {
              <div class="grid-form step-body">
                <div class="field">
                  <label>College</label>
                  <input formControlName="college" placeholder="ABC University" />
                </div>
                <div class="field">
                  <label>Department</label>
                  <input formControlName="department" placeholder="Computer Science" />
                </div>
                <div class="field">
                  <label>Graduation Year</label>
                  <input formControlName="gradYear" placeholder="2025" />
                </div>
                <div class="field">
                  <label>CGPA / Percentage</label>
                  <input formControlName="cgpa" placeholder="8.65" />
                </div>
              </div>
            } @else {
              <div class="preview-block glass step-body">
                <p class="meta"><strong>Name</strong> · {{ form.value.studentName }}</p>
                <p class="meta"><strong>Email</strong> · {{ form.value.studentEmail }}</p>
                <p class="meta"><strong>Roll No</strong> · {{ form.value.rollNumber }}</p>
                <p class="meta"><strong>Resume</strong> · {{ resumeFile()?.name }}</p>
                @if (form.value.college) { <p class="meta"><strong>College</strong> · {{ form.value.college }} ({{ form.value.department }})</p> }
                @if (form.value.cgpa) { <p class="meta"><strong>CGPA</strong> · {{ form.value.cgpa }}</p> }
                <p class="hint" style="margin:10px 0 0">Everything look right? Submit when ready.</p>
              </div>
            }

            <div class="actions" style="margin-top:16px">
              @if (step() > 1) {
                <button type="button" class="btn ghost" (click)="stepBack()">← Back</button>
              }
              @if (step() < 4) {
                <button type="button" class="btn primary" (click)="stepNext()">Next</button>
              } @else {
                <button type="submit" class="btn primary" [disabled]="submitting()">
                  {{ submitting() ? 'Submitting…' : 'Submit Application' }}
                </button>
              }
              <button type="button" class="btn ghost" (click)="closeModal()">Cancel</button>
            </div>
          </form>
          </div>
        </div>
      </div>
    }

    @for (c of confetti(); track $index) {
      <span class="confetti-piece"
            [style.left.%]="c.left"
            [style.background]="c.color"
            [style.animation-delay]="c.delay + 's'"
            [style.transform]="'rotate(' + c.rot + 'deg)'"></span>
    }
  `,
})
export class StudentView {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  nav = inject(NavService);

  tabs = ['Overview', 'Requirements', 'About Company'];
  tab = signal('Overview');
  stepLabels = ['Personal Info', 'Resume', 'Additional Info', 'Review'];
  step = signal(1);

  postings = signal<Posting[]>([]);
  loading = signal(true);
  query = signal('');
  selected = signal<Posting | null>(null);
  applyTarget = signal<Posting | null>(null);
  submitting = signal(false);
  dragging = signal(false);
  resumeFile = signal<File | null>(null);
  fileError = signal('');
  appliedIds = signal(new Set<number>());
  confetti = signal<ConfettiPiece[]>([]);
  analytics = signal<Analytics | null>(null);
  private now = signal(Date.now());

  allApps = signal<AppRecord[]>([]);
  saved = signal(new Set<number>());

  toggleSave(p: Posting) {
    this.saved.update(st => { const n = new Set(st); n.has(p.id!) ? n.delete(p.id!) : n.add(p.id!); return n; });
  }

  savedJobs = computed(() => this.postings().filter(p => this.saved().has(p.id!)));

  triggerQuickAction(action: string) {
    this.toast.show(`${action} action triggered successfully`, 'info');
  }

  isStubPage = computed(() =>
    ['interviews', 'messages', 'saved', 'profile', 'settings'].includes(this.nav.page()));

  stubIcon = computed(() => ({
    interviews: '📅', messages: '💬', saved: '🔖', profile: '👤', settings: '⚙️',
  } as Record<string, string>)[this.nav.page()] ?? '✨');

  stubTitle = computed(() => ({
    interviews: 'Interviews', messages: 'Messages', saved: 'Saved Jobs',
    profile: 'Profile', settings: 'Settings',
  } as Record<string, string>)[this.nav.page()] ?? '');

  upcomingInterviews = computed(() => {
    const rounds = ['Technical Round', 'HR Round', 'Technical Round'];
    const times = ['10:00 AM', '02:00 PM', '11:30 AM'];
    return this.allApps().slice(-3).reverse().map((a, i) => ({
      company: a.posting.companyName,
      round: rounds[i % 3],
      date: new Date(Date.now() + (i + 2) * 86400000).toISOString(),
      time: times[i % 3],
    }));
  });

  form = this.fb.nonNullable.group({
    studentName: ['', Validators.required],
    studentEmail: ['', [Validators.required, Validators.email]],
    rollNumber: ['', Validators.required],
    phone: [''],
    college: [''],
    department: [''],
    gradYear: [''],
    cgpa: [''],
  });

  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.postings();
    return this.postings().filter(p =>
      p.roleTitle.toLowerCase().includes(q) || p.companyName.toLowerCase().includes(q)
      || (p.eligibility || '').toLowerCase().includes(q));
  });

  kpis = computed(() => {
    const total = this.analytics()?.totalApplications ?? 0;
    return {
      applications: total,
      shortlisted: Math.round(total * 0.4),
      interviews: Math.round(total * 0.18),
      offers: Math.max(1, Math.round(total * 0.08)),
    };
  });

  statusDonut = computed<DonutSlice[]>(() => {
    const k = this.kpis();
    const rejected = Math.max(0, Math.round(k.applications * 0.15));
    const applied = Math.max(0, k.applications - k.shortlisted - k.interviews - k.offers - rejected);
    return [
      { label: 'Applied', value: applied, color: '#4f46e5' },
      { label: 'Shortlisted', value: k.shortlisted, color: '#0ea5e9' },
      { label: 'Interview', value: k.interviews, color: '#f59e0b' },
      { label: 'Offer', value: k.offers, color: '#10b981' },
      { label: 'Rejected', value: rejected, color: '#ef4444' },
    ];
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    destroyRef.onDestroy(() => clearInterval(timer));

    this.api.getApprovedPostings().subscribe({
      next: ps => { this.postings.set(ps); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.show('Could not load postings', 'error'); },
    });
    this.api.getAnalytics().subscribe({ next: a => this.analytics.set(a), error: () => {} });
    this.api.getApplications().subscribe({ next: as => this.allApps.set(as), error: () => {} });
  }

  colorFor(company: string): string {
    return COMPANY_COLORS[company] ?? '#4f46e5';
  }

  open(p: Posting) { this.tab.set('Overview'); this.selected.set(p); }

  bad(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  countdownFor(p: Posting): string {
    const end = new Date(p.deadline + 'T23:59:59').getTime();
    let ms = end - this.now();
    if (ms <= 0) return 'Deadline passed';
    const d = Math.floor(ms / 86400000); ms %= 86400000;
    const h = Math.floor(ms / 3600000); ms %= 3600000;
    const m = Math.floor(ms / 60000); ms %= 60000;
    const s = Math.floor(ms / 1000);
    if (d > 0) return `${d}d ${h}h ${m}m left`;
    return `${h}h ${m}m ${String(s).padStart(2, '0')}s left`;
  }

  countdownShort(p: Posting): string {
    const ms = new Date(p.deadline + 'T23:59:59').getTime() - this.now();
    if (ms <= 0) return 'Closed';
    const d = Math.ceil(ms / 86400000);
    return `${d} day${d === 1 ? '' : 's'} left`;
  }

  isUrgent(p: Posting): boolean {
    return new Date(p.deadline + 'T23:59:59').getTime() - this.now() < 86400000;
  }

  openApply(p: Posting) {
    this.fileError.set('');
    this.resumeFile.set(null);
    this.step.set(1);
    this.applyTarget.set(p);
  }

  closeModal() { this.applyTarget.set(null); }

  stepNext() {
    if (this.step() === 1) {
      ['studentName', 'studentEmail', 'rollNumber'].forEach(n => this.form.get(n)!.markAsTouched());
      const core = ['studentName', 'studentEmail', 'rollNumber'].some(n => this.form.get(n)!.invalid);
      if (core) return;
    }
    if (this.step() === 2 && !this.resumeFile()) {
      this.fileError.set('Please attach your resume to continue');
      return;
    }
    this.step.update(s => Math.min(4, s + 1));
  }

  stepBack() { this.step.update(s => Math.max(1, s - 1)); }

  onFilePicked(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (input.files && input.files.length) this.takeFile(input.files[0]);
    input.value = '';
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.dragging.set(false);
    if (ev.dataTransfer?.files?.length) this.takeFile(ev.dataTransfer.files[0]);
  }

  private takeFile(f: File) {
    if (!/\.(pdf|doc|docx)$/i.test(f.name)) {
      this.fileError.set('Please attach a PDF or Word document (.pdf, .doc, .docx)');
      this.resumeFile.set(null);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      this.fileError.set('File is too large (max 10 MB)');
      this.resumeFile.set(null);
      return;
    }
    this.fileError.set('');
    this.resumeFile.set(f);
  }

  clearFile() { this.resumeFile.set(null); }

  private celebrate() {
    const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    this.confetti.set(Array.from({ length: 60 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
    })));
    setTimeout(() => this.confetti.set([]), 2400);
  }

  submitApplication() {
    const target = this.applyTarget();
    const file = this.resumeFile();
    if (!target || !file) return;
    this.submitting.set(true);
    const v = this.form.getRawValue();
    this.api.applyWithResume(target.id!, v.studentName, v.studentEmail, v.rollNumber, file).subscribe({
      next: () => {
        this.submitting.set(false);
        this.appliedIds.update(s => { const n = new Set(s); n.add(target.id!); return n; });
        this.closeModal();
        this.celebrate();
        this.toast.show(`Application sent to ${target.companyName}`, 'success');
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 409) {
          this.appliedIds.update(s => { const n = new Set(s); n.add(target.id!); return n; });
          this.closeModal();
          this.toast.show('You have already applied to this role', 'info');
        } else if (err.status === 400) {
          this.step.set(2);
          this.fileError.set(err.error?.message || 'The server rejected this application.');
        } else if (err.status === 404 || err.status === 405) {
          this.toast.show('Endpoint missing (HTTP ' + err.status + ') — restart the backend with the latest code', 'error', 6000);
        } else if (err.status === 413) {
          this.step.set(2);
          this.fileError.set('File too large for the server — try a smaller file');
        } else if (err.status === 0) {
          this.toast.show('Cannot reach the backend on port 8081', 'error', 6000);
        } else {
          this.toast.show('Application failed (HTTP ' + err.status + '): ' + (err.error?.message || 'unknown error'), 'error', 7000);
        }
      },
    });
  }
}
