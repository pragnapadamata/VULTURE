import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Analytics, AppRecord, Notification, Posting, StatusChange } from './api.service';
import { ToastService } from './toast.service';
import { NavService } from './nav.service';
import { CountUp } from './count-up';
import { ChartDonut, DonutSlice } from './chart-donut';
import { ChartArea, AreaPoint } from './chart-area';
import { CoLogo } from './co-logo';

const COMPANY_COLORS: Record<string, string> = {
  Google: '#4285F4', Microsoft: '#7FBA00', Amazon: '#FF9900', TCS: '#0F6CBD',
  Infosys: '#007CC3', IBM: '#1F70C1', Flipkart: '#2874F0', Zomato: '#E23744',
};

@Component({
  selector: 'app-admin-view',
  imports: [DatePipe, UpperCasePipe, FormsModule, CountUp, ChartDonut, ChartArea, CoLogo],
  template: `
    @if (nav.page() === 'dashboard') {
      <!-- ============ ADMIN DASHBOARD ============ -->
      <div class="console-head">
        <div class="console-title">
          <h1>Welcome back, Dr. Ananya 👋</h1>
          <p>Here's an overview of your university placement activities.</p>
        </div>
      </div>

      <div class="stats-row-custom">
        <div class="stat-card-custom glass">
          <div class="stat-icon-custom" style="background: rgba(99, 102, 241, 0.1); color: #4f46e5;">👥</div>
          <div class="stat-content-custom">
            <span class="lbl-custom">Students Applied</span>
            <span class="num-custom">{{ kpi().students }}</span>
            <span class="trend-lbl-custom up">↑ 8.4% this month</span>
          </div>
        </div>
        <div class="stat-card-custom glass">
          <div class="stat-icon-custom" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">🏢</div>
          <div class="stat-content-custom">
            <span class="lbl-custom">Registered Companies</span>
            <span class="num-custom">{{ kpi().companies }}</span>
            <span class="trend-lbl-custom up">↑ 12.6% this month</span>
          </div>
        </div>
        <div class="stat-card-custom glass">
          <div class="stat-icon-custom" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">💼</div>
          <div class="stat-content-custom">
            <span class="lbl-custom">Placement Drives</span>
            <span class="num-custom">{{ kpi().drives }}</span>
            <span class="trend-lbl-custom up">↑ 20% this month</span>
          </div>
        </div>
        <div class="stat-card-custom glass">
          <div class="stat-icon-custom" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">📄</div>
          <div class="stat-content-custom">
            <span class="lbl-custom">Total Applications</span>
            <span class="num-custom">{{ kpi().apps }}</span>
            <span class="trend-lbl-custom up">↑ 15.3% this month</span>
          </div>
        </div>
        <div class="stat-card-custom glass">
          <div class="stat-icon-custom" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">📊</div>
          <div class="stat-content-custom">
            <span class="lbl-custom">Placement Rate</span>
            <span class="num-custom">{{ kpi().rate }}%</span>
            <span class="trend-lbl-custom up">↑ 6.7% this month</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid-1">
        <!-- Recent Placement Drives -->
        <section class="panel glass" style="margin:0; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div class="panel-header-custom">
              <h2>Recent Placement Drives</h2>
              <span class="panel-link-custom" (click)="nav.goPage('drives')">View all</span>
            </div>
            <table class="table custom-dashboard-table">
              <thead>
                <tr>
                  <th>Drive Title</th>
                  <th>Company</th>
                  <th>Date</th>
                  <th>Registrations</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (d of dashboardDrives(); track d.title) {
                  <tr>
                    <td style="font-weight: 600;">{{ d.title }}</td>
                    <td>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        <co-logo [name]="d.company" />
                        <span>{{ d.company }}</span>
                      </div>
                    </td>
                    <td style="color: var(--muted);">{{ d.date }}</td>
                    <td style="font-weight: 600;">{{ d.registrations }}</td>
                    <td>
                      <span [class]="'badge ' + d.status.toLowerCase()">{{ d.status }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="panel-footer-custom" (click)="nav.goPage('drives')">
            <span>View all drives →</span>
          </div>
        </section>

        <!-- Placement Statistics -->
        <section class="panel glass" style="margin:0; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div class="panel-header-custom">
              <h2>Placement Statistics</h2>
              <select class="dashboard-select">
                <option>This Month</option>
              </select>
            </div>
            <div style="margin-top: 15px;">
              <chart-donut [data]="dashboardDonutData()" center-label="Total Offers" />
            </div>
          </div>
          <div class="panel-footer-custom" (click)="nav.goPage('analytics')">
            <span>View detailed report →</span>
          </div>
        </section>
      </div>

      <div class="dashboard-grid-2">
        <!-- Placement Trends -->
        <section class="panel glass" style="margin:0">
          <div class="panel-header-custom">
            <h2>Placement Trends</h2>
            <select class="dashboard-select">
              <option>Last 14 Days</option>
            </select>
          </div>
          <div style="position: relative; margin-top: 15px;">
            <chart-area [points]="areaPoints()" />
            
          </div>
        </section>

        <!-- Top Recruiting Companies -->
        <section class="panel glass" style="margin:0">
          <div class="panel-header-custom">
            <h2>Top Recruiting Companies</h2>
            <span class="panel-link-custom" (click)="triggerQuickAction('View top recruiting companies')">View all</span>
          </div>
          <div class="top-companies-list" style="margin-top: 15px;">
            @for (c of topCompanies(); track c.name) {
              <div class="company-row-custom">
                <co-logo [name]="c.name" />
                <div class="company-bar-wrapper">
                  <div class="company-bar-info">
                    <span class="company-name">{{ c.name }}</span>
                    <span class="company-count">{{ c.count }} Applications</span>
                  </div>
                  <div class="company-bar-track">
                    <div class="company-bar-fill" [style.width.%]="c.pct" [style.background]="colorFor(c.name)"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Recent Notifications -->
        <section class="panel glass" style="margin:0">
          <div class="panel-header-custom">
            <h2>Recent Notifications</h2>
            <span class="panel-link-custom" (click)="nav.goPage('notifications')">View all</span>
          </div>
          <div class="dashboard-notifications-list" style="margin-top: 15px;">
            @for (n of dashboardNotifications(); track n.text) {
              <div class="dash-notif-item">
                <div class="notif-icon-circle" [style.background-color]="n.color + '1a'" [style.color]="n.color">
                  {{ n.icon }}
                </div>
                <div class="notif-content-wrapper">
                  <p class="notif-text">{{ n.text }}</p>
                  <span class="notif-time">{{ n.time }}</span>
                </div>
              </div>
            }
          </div>
        </section>
      </div>

      <!-- Quick Actions -->
      <section class="panel glass quick-actions-panel">
        <h2>Quick Actions</h2>
        <div class="quick-actions-row">
          <button class="quick-action-btn" (click)="triggerQuickAction('Add New Drive')"><span class="btn-icon">📅</span> Add New Drive</button>
          <button class="quick-action-btn" (click)="triggerQuickAction('Add Company')"><span class="btn-icon">🏢</span> Add Company</button>
          <button class="quick-action-btn" (click)="triggerQuickAction('Upload Results')"><span class="btn-icon">📤</span> Upload Results</button>
          <button class="quick-action-btn" (click)="triggerQuickAction('Send Notification')"><span class="btn-icon">🔔</span> Send Notification</button>
          <button class="quick-action-btn" (click)="triggerQuickAction('Generate Report')"><span class="btn-icon">📊</span> Generate Report</button>
          <button class="quick-action-btn" (click)="triggerQuickAction('Manage Users')"><span class="btn-icon">👥</span> Manage Users</button>
          <button class="quick-action-btn" (click)="triggerQuickAction('Placement Settings')"><span class="btn-icon">⚙️</span> Placement Settings</button>
        </div>
      </section>

    } @else if (nav.page() === 'queue') {
      <!-- ============ APPROVAL QUEUE ============ -->
      <div class="console-head">
        <div class="console-title">
          <h1>Approval Queue</h1>
          <p>Postings stay invisible to students until approved here.</p>
        </div>
      </div>

      <section class="panel glass">
        @if (pending().length === 0) {
          <p class="empty">Queue is clear — nothing pending review. ✨</p>
        } @else {
          <table class="table">
            <thead>
              <tr><th>Job</th><th>Posted / Deadline</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              @for (p of pending(); track p.id) {
                <tr [class.row-exit]="leaving() === p.id">
                  <td>
                    <div style="display:flex; gap:11px; align-items:center">
                      <co-logo [name]="p.companyName" />
                      <div><div style="font-weight:600">{{ p.roleTitle }}</div><div class="jr-sub">{{ p.companyName }}</div></div>
                    </div>
                  </td>
                  <td class="jr-sub">Deadline {{ p.deadline }}</td>
                  <td><span class="badge pending">Pending</span></td>
                  <td><button class="btn primary sm" (click)="startReview(p)">Review</button></td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>

      <section class="panel glass">
        <h2>Applicants</h2>
        <p class="hint">Per-posting applicant lists with resumes and timelines.</p>
        @if (livePostings().length === 0) {
          <p class="empty">No approved or closed postings yet.</p>
        } @else {
          @for (p of livePostings(); track p.id) {
            <div class="section-gap" style="margin-top:12px">
              <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap">
                <button class="expander" (click)="toggleApplicants(p)">
                  {{ expanded() === p.id ? '▾' : '▸' }} {{ p.roleTitle }} · {{ p.companyName }}
                </button>
                <span [class]="'badge ' + (p.status || '').toLowerCase()">{{ p.status }}</span>
                <button class="btn ghost sm" (click)="openTimeline(p)">Timeline</button>
              </div>
              @if (expanded() === p.id) {
                <div class="applicant-block">
                  @if (loadingApplicants()) {
                    <div class="skeleton skel-row"></div>
                    <div class="skeleton skel-row"></div>
                  } @else if (applicants().length === 0) {
                    <p class="empty" style="border:none; padding:8px">No applications yet for this role.</p>
                  } @else {
                    <table class="table">
                      <thead>
                        <tr><th>Student</th><th>Email</th><th>Roll No</th><th>Applied</th><th>Resume</th></tr>
                      </thead>
                      <tbody>
                        @for (a of applicants(); track a.id) {
                          <tr>
                            <td style="font-weight:600">{{ a.studentName }}</td>
                            <td>{{ a.studentEmail }}</td>
                            <td>{{ a.rollNumber }}</td>
                            <td>{{ a.appliedAt | date:'MMM d, h:mm a' }}</td>
                            <td>
                              @if (a.hasResume) {
                                <a class="btn ghost sm" [href]="resumeUrl(a)" target="_blank" rel="noopener">View Resume</a>
                              } @else { <span class="meta">—</span> }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  }
                </div>
              }
            </div>
          }
        }
      </section>
    } @else if (nav.page() === 'analytics') {
      <!-- ============ ANALYTICS DASHBOARD ============ -->
      <div class="console-head">
        <div class="console-title">
          <h1>Analytics Overview</h1>
          <p>Live pipeline health across the placement season.</p>
        </div>
      </div>

      @if (analytics(); as a) {
        <div class="stats">
          <div class="stat glass"><span class="ico" style="background:var(--primary-soft)">💼</span>
            <div><div class="num"><count-up [value]="a.totalPostings" /><span class="trend up">+12.5%</span></div><div class="lbl">Total Jobs</div></div></div>
          <div class="stat glass"><span class="ico" style="background:var(--green-soft)">🗂️</span>
            <div><div class="num"><count-up [value]="a.totalApplications" /><span class="trend up">+18.3%</span></div><div class="lbl">Total Applications</div></div></div>
          <div class="stat glass"><span class="ico" style="background:var(--amber-soft)">📈</span>
            <div><div class="num"><count-up [value]="a.placementRate" [decimals]="1" suffix="%" /><span class="trend up">+8.2%</span></div><div class="lbl">Placement Rate</div></div></div>
          <div class="stat glass"><span class="ico" style="background:var(--red-soft)">🏢</span>
            <div><div class="num"><count-up [value]="companies()" /><span class="trend up">+7.1%</span></div><div class="lbl">Companies</div></div></div>
        </div>

        <div class="rate-hero glass">
          <div class="big"><count-up [value]="a.placementRate" [decimals]="1" suffix="%" /></div>
          <div class="expl">
            <h3>Placement rate</h3>
            <p>Unique students who applied ({{ a.uniqueApplicants }}) ÷ postings that reached
               APPROVED ({{ a.postingsReachedApproved }}) — approved and auto-closed postings both count.</p>
          </div>
        </div>

        <div class="chart-grid" style="grid-template-columns: 1.4fr minmax(260px, 330px)">
          <section class="panel glass" style="margin:0">
            <h2 class="chart-h">Applications Over Time</h2>
            <chart-area [points]="areaPoints()" />
          </section>
          <section class="panel glass" style="margin:0">
            <h2 class="chart-h">Postings by Status</h2>
            <chart-donut [data]="donutData()" />
          </section>
        </div>

        <section class="panel glass section-gap">
          <h2 class="chart-h">Top Recruiting Companies</h2>
          @if (companyBars().length === 0) {
            <p class="empty">No applications yet.</p>
          } @else {
            <div class="bar-chart">
              @for (b of companyBars(); track b.name; let i = $index) {
                <div class="bar-row">
                  <span class="bar-label">{{ b.name }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="b.pct" [style.animation-delay]="(i * 0.08) + 's'"></div>
                  </div>
                  <span class="bar-value">{{ b.count }}</span>
                </div>
              }
            </div>
          }
        </section>
      } @else {
        <div class="stats">
          <div class="skeleton" style="height:76px"></div>
          <div class="skeleton" style="height:76px"></div>
          <div class="skeleton" style="height:76px"></div>
          <div class="skeleton" style="height:76px"></div>
        </div>
        <div class="skeleton skel-card"></div>
      }
    } @else {
      <!-- Mock Views for other lists -->
      <div class="console-head">
        <div class="console-title">
          <h1 style="text-transform: capitalize;">
            {{ nav.page() === 'roles' ? 'Users & Roles' : nav.page() === 'logs' ? 'Audit Logs' : nav.page() === 'settings' ? 'Placement Settings' : nav.page() === 'drives' ? 'Placement Drives' : nav.page() }}
          </h1>
          <p>
            Overview and management of {{ nav.page() === 'roles' ? 'system users and access roles' : nav.page() === 'logs' ? 'application audit logs' : nav.page() === 'settings' ? 'placement rule configurations' : nav.page() }}.
          </p>
        </div>
      </div>

      @if (nav.page() === 'settings') {
        <!-- ============ SETTINGS FORMS ============ -->
        <div class="settings-grid-custom">
          <section class="panel glass settings-card-custom" style="margin:0">
            <h2 style="margin-bottom:12px">Portal Configuration</h2>
            <p class="hint">Toggle visibility and permissions for different portal actors.</p>
            <div class="settings-row-custom">
              <span>Allow student registration</span>
              <label class="toggle-switch-custom">
                <input type="checkbox" checked />
                <span class="toggle-slider-custom"></span>
              </label>
            </div>
            <div class="settings-row-custom">
              <span>Allow resume edits</span>
              <label class="toggle-switch-custom">
                <input type="checkbox" checked />
                <span class="toggle-slider-custom"></span>
              </label>
            </div>
            <div class="settings-row-custom">
              <span>Allow new company signups</span>
              <label class="toggle-switch-custom">
                <input type="checkbox" checked />
                <span class="toggle-slider-custom"></span>
              </label>
            </div>
            <div class="settings-row-custom">
              <span>Enable automatic approval for top recruiters</span>
              <label class="toggle-switch-custom">
                <input type="checkbox" />
                <span class="toggle-slider-custom"></span>
              </label>
            </div>
          </section>

          <section class="panel glass settings-card-custom" style="margin:0">
            <h2 style="margin-bottom:12px">Placement System Rules</h2>
            <p class="hint">Global system thresholds and verification bounds.</p>
            <div class="field" style="margin-bottom:14px">
              <label>Minimum Eligibility CGPA</label>
              <input type="number" step="0.1" value="6.0" />
            </div>
            <div class="field" style="margin-bottom:14px">
              <label>Maximum Active Applications per Student</label>
              <input type="number" value="5" />
            </div>
            <div class="field" style="margin-bottom:14px">
              <label>Offer Acceptance Grace Period (Days)</label>
              <input type="number" value="7" />
            </div>
            <button class="btn primary" style="width: 100%" (click)="triggerQuickAction('Save Configurations')">Save Configurations</button>
          </section>
        </div>

      } @else {
        <!-- ============ MOCK DATA TABLES ============ -->
        <section class="panel glass">
          @if (nav.page() === 'students') {
            <table class="table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Placed Company</th>
                  <th>Package</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (s of dashboardStudents; track s.roll) {
                  <tr>
                    <td style="font-weight:600">{{ s.roll }}</td>
                    <td style="font-weight:600">{{ s.name }}</td>
                    <td>{{ s.branch }}</td>
                    <td style="font-weight:600">{{ s.cgpa }}</td>
                    <td>
                      @if (s.company !== '-') {
                        <div style="display:flex; gap:8px; align-items:center">
                          <co-logo [name]="s.company" />
                          <span>{{ s.company }}</span>
                        </div>
                      } @else {
                        <span style="color:var(--muted)">-</span>
                      }
                    </td>
                    <td>{{ s.package }}</td>
                    <td>
                      <span class="badge" [class.approved]="s.status === 'Placed'" [class.pending]="s.status === 'In Progress'" [class.closed]="s.status === 'Unplaced'">
                        {{ s.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else if (nav.page() === 'companies') {
            <table class="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Sector</th>
                  <th>Job Roles</th>
                  <th>Min CGPA</th>
                  <th>Salary Package</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (c of dashboardCompanies; track c.name) {
                  <tr>
                    <td>
                      <div style="display:flex; gap:8px; align-items:center">
                        <co-logo [name]="c.name" />
                        <span style="font-weight:600">{{ c.name }}</span>
                      </div>
                    </td>
                    <td>{{ c.sector }}</td>
                    <td>{{ c.roles }}</td>
                    <td style="font-weight:600">{{ c.cgpa }}</td>
                    <td style="font-weight:600">{{ c.package }}</td>
                    <td>
                      <span class="badge" [class.approved]="c.status === 'Active'" [class.pending]="c.status === 'Pending Approval'">
                        {{ c.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else if (nav.page() === 'drives') {
            <table class="table">
              <thead>
                <tr>
                  <th>Drive Title</th>
                  <th>Company</th>
                  <th>Eligibility</th>
                  <th>Deadline</th>
                  <th>Registrations</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (d of dashboardAllDrives; track d.title) {
                  <tr>
                    <td style="font-weight:600">{{ d.title }}</td>
                    <td>
                      <div style="display:flex; gap:8px; align-items:center">
                        <co-logo [name]="d.company" />
                        <span>{{ d.company }}</span>
                      </div>
                    </td>
                    <td>{{ d.cgpa }}</td>
                    <td style="color:var(--muted)">{{ d.deadline }}</td>
                    <td style="font-weight:600">{{ d.count }} candidates</td>
                    <td>
                      <span class="badge" [class.approved]="d.status === 'Completed'" [class.pending]="d.status === 'Ongoing'" [class.interview]="d.status === 'Upcoming'">
                        {{ d.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else if (nav.page() === 'applications') {
            <table class="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Applied Role</th>
                  <th>Company</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (a of dashboardApplications; track a.student) {
                  <tr>
                    <td style="font-weight:600">{{ a.student }}</td>
                    <td>{{ a.role }}</td>
                    <td>
                      <div style="display:flex; gap:8px; align-items:center">
                        <co-logo [name]="a.company" />
                        <span>{{ a.company }}</span>
                      </div>
                    </td>
                    <td style="color:var(--muted)">{{ a.date }}</td>
                    <td>
                      <span class="badge" [class.approved]="a.status === 'Offer Released'" [class.pending]="a.status === 'Applied'" [class.interview]="a.status === 'Interview Scheduled' || a.status === 'Interview'" [class.shortlisted]="a.status === 'Shortlisted'" [class.rejected]="a.status === 'Rejected'">
                        {{ a.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else if (nav.page() === 'interviews') {
            <table class="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Round</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (i of dashboardInterviews; track i.candidate + i.time) {
                  <tr>
                    <td style="font-weight:600">{{ i.candidate }}</td>
                    <td>
                      <div style="display:flex; gap:8px; align-items:center">
                        <co-logo [name]="i.company" />
                        <span>{{ i.company }}</span>
                      </div>
                    </td>
                    <td>{{ i.role }}</td>
                    <td>{{ i.round }}</td>
                    <td style="color:var(--muted)">{{ i.time }}</td>
                    <td>
                      <span class="badge" [class.approved]="i.status === 'Completed'" [class.pending]="i.status === 'Scheduled'">
                        {{ i.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else if (nav.page() === 'offers') {
            <table class="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Company</th>
                  <th>Job Role</th>
                  <th>CTC</th>
                  <th>Released Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (o of dashboardOffers; track o.candidate + o.company) {
                  <tr>
                    <td style="font-weight:600">{{ o.candidate }}</td>
                    <td>
                      <div style="display:flex; gap:8px; align-items:center">
                        <co-logo [name]="o.company" />
                        <span>{{ o.company }}</span>
                      </div>
                    </td>
                    <td>{{ o.role }}</td>
                    <td style="font-weight:600">{{ o.ctc }}</td>
                    <td style="color:var(--muted)">{{ o.date }}</td>
                    <td>
                      <span class="badge" [class.approved]="o.status === 'Accepted'" [class.rejected]="o.status === 'Declined'">
                        {{ o.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else if (nav.page() === 'notifications') {
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Time Logged</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (n of dashboardNotificationLog(); track n.id) {
                  <tr>
                    <td style="font-weight:600">#{{ n.id }}</td>
                    <td style="font-weight:600; color:var(--primary)">{{ n.type }}</td>
                    <td>{{ n.msg }}</td>
                    <td style="color:var(--muted)">{{ n.time }}</td>
                    <td>
                      <span class="badge" [class.approved]="n.status === 'Sent'" [class.closed]="n.status === 'Read'">
                        {{ n.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else if (nav.page() === 'roles') {
            <table class="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email Address</th>
                  <th>Department / Company</th>
                  <th>Access Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (r of dashboardRoles; track r.email) {
                  <tr>
                    <td style="font-weight:600">{{ r.name }}</td>
                    <td style="color:var(--muted)">{{ r.email }}</td>
                    <td>{{ r.target }}</td>
                    <td style="font-weight:600; color:var(--primary)">{{ r.role }}</td>
                    <td>
                      <span class="badge approved">{{ r.status }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else if (nav.page() === 'logs') {
            <table class="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action performed</th>
                  <th>Component</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (l of dashboardAuditLogs; track l.time) {
                  <tr>
                    <td style="color:var(--muted)">{{ l.time }}</td>
                    <td style="font-weight:600">{{ l.user }}</td>
                    <td>{{ l.action }}</td>
                    <td style="font-weight:600; color:var(--primary)">{{ l.comp }}</td>
                    <td>
                      <span class="badge approved">{{ l.status }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <div style="padding: 40px; text-align: center; color: var(--muted);">
              <div style="font-size: 40px; margin-bottom: 12px;">📊</div>
              <p style="margin: 0; font-weight: 600; font-size: 15px; color: var(--text);">{{ nav.page() | uppercase }} View</p>
              <p style="margin: 5px 0 0; font-size: 13px;">High fidelity content is ready for integration.</p>
            </div>
          }
        </section>
      }
    }

    <!-- review modal -->
    @if (reviewTarget(); as rp) {
      <div class="overlay" (click)="cancelReview()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Review posting</h3>
          <p class="sub">{{ rp.roleTitle }} · {{ rp.companyName }}</p>
          <div class="preview-block glass" style="margin-bottom:14px">
            <p class="desc">{{ rp.description }}</p>
            <p class="meta"><strong>Eligibility</strong> · {{ rp.eligibility }}</p>
            <p class="meta"><strong>Deadline</strong> · {{ rp.deadline }}</p>
            @if (rp.salary) { <p class="meta"><strong>Salary</strong> · {{ rp.salary }}</p> }
          </div>
          <div class="field">
            <label>Comment <span class="opt">(optional — recorded in the timeline)</span></label>
            <textarea rows="2" [(ngModel)]="reviewComment" placeholder="e.g. Verified with company SPOC"></textarea>
          </div>
          <div class="actions" style="margin-top:14px">
            <button class="btn approve" (click)="decide('APPROVED')">✓ Approve</button>
            <button class="btn reject" (click)="decide('REJECTED')">✕ Reject</button>
            <button class="btn ghost" (click)="cancelReview()">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- timeline modal -->
    @if (timelineFor(); as tp) {
      <div class="overlay" (click)="timelineFor.set(null)">
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
            <button class="btn ghost" (click)="timelineFor.set(null)">Close</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminView {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  nav = inject(NavService);






  // Additional mock tables
  dashboardStudents = [
    { name: 'Manogna P.', roll: '2022CSE0012', branch: 'CSE', cgpa: 9.2, company: 'Amazon', package: '32.0 LPA', status: 'Placed' },
    { name: 'Rahul S.', roll: '2022CSE0045', branch: 'CSE', cgpa: 8.8, company: '-', package: '-', status: 'In Progress' },
    { name: 'Priya K.', roll: '2022ECE0104', branch: 'ECE', cgpa: 8.5, company: 'Deloitte', package: '12.0 LPA', status: 'Placed' },
    { name: 'Amit R.', roll: '2022ME0215', branch: 'ME', cgpa: 7.9, company: '-', package: '-', status: 'Unplaced' },
    { name: 'Sanjana G.', roll: '2022EE0187', branch: 'EEE', cgpa: 8.1, company: 'TCS', package: '7.0 LPA', status: 'Placed' }
  ];

  dashboardCompanies = [
    { name: 'Amazon', sector: 'Technology', roles: 'SDE Intern, SDE-1', cgpa: 8.5, package: '28 - 45 LPA', status: 'Active' },
    { name: 'TCS', sector: 'IT Services', roles: 'Ninja, Digital', cgpa: 6.0, package: '3.6 - 7.0 LPA', status: 'Active' },
    { name: 'Deloitte', sector: 'Consulting', roles: 'Analyst, Consultant', cgpa: 7.0, package: '8.5 - 12 LPA', status: 'Active' },
    { name: 'Microsoft', sector: 'Technology', roles: 'SDE-1, Program Manager', cgpa: 8.5, package: '32 - 50 LPA', status: 'Active' },
    { name: 'Swiggy', sector: 'E-Commerce', roles: 'Product Analyst', cgpa: 7.5, package: '14 - 18 LPA', status: 'Pending Approval' }
  ];

  dashboardAllDrives = [
    { title: 'Software Engineer Hiring', company: 'Amazon', cgpa: 'CGPA >= 8.5', deadline: '25 May, 2025', count: 312, status: 'Upcoming' },
    { title: 'Graduate Trainee Program', company: 'TCS', cgpa: 'CGPA >= 6.0', deadline: '18 May, 2025', count: 278, status: 'Ongoing' },
    { title: 'Data Analyst Recruitment', company: 'Deloitte', cgpa: 'CGPA >= 7.0', deadline: '12 May, 2025', count: 198, status: 'Completed' },
    { title: 'Product Intern Drive', company: 'Swiggy', cgpa: 'CGPA >= 7.5', deadline: '08 May, 2025', count: 154, status: 'Upcoming' },
    { title: 'SDE Intern Hiring', company: 'Microsoft', cgpa: 'CGPA >= 8.5', deadline: '02 May, 2025', count: 220, status: 'Completed' }
  ];

  dashboardApplications = [
    { student: 'Abhishek Sharma', role: 'Frontend Developer', company: 'Swiggy', date: '10 May, 2025', status: 'Shortlisted' },
    { student: 'Manogna P.', role: 'Software Engineer Intern', company: 'Amazon', date: '08 May, 2025', status: 'Interview' },
    { student: 'Rahul S.', role: 'Graduate Engineer Trainee', company: 'TCS', date: '06 May, 2025', status: 'Applied' },
    { student: 'Neha Gupta', role: 'Consultant Analyst', company: 'Deloitte', date: '05 May, 2025', status: 'Offer Released' },
    { student: 'Rohan Verma', role: 'SDE Intern', company: 'Microsoft', date: '02 May, 2025', status: 'Rejected' }
  ];

  dashboardInterviews = [
    { candidate: 'Manogna P.', company: 'Amazon', role: 'SDE Intern', round: 'Round 1 (Technical)', time: '22 May, 2025 · 10:00 AM', status: 'Scheduled' },
    { candidate: 'Rahul S.', company: 'TCS', role: 'GET', round: 'HR Interview', time: '21 May, 2025 · 02:30 PM', status: 'Scheduled' },
    { candidate: 'Abhishek Sharma', company: 'Swiggy', role: 'Frontend Dev', round: 'Round 2 (Coding)', time: '19 May, 2025 · 11:30 AM', status: 'Completed' },
    { candidate: 'Priya K.', company: 'Deloitte', role: 'Consultant Analyst', round: 'Technical Round', time: '15 May, 2025 · 04:00 PM', status: 'Completed' }
  ];

  dashboardOffers = [
    { candidate: 'Neha Gupta', company: 'Deloitte', role: 'Consultant Analyst', ctc: '11.5 LPA', date: '15 May, 2025', status: 'Accepted' },
    { candidate: 'Priya K.', company: 'Deloitte', role: 'Consultant Analyst', ctc: '11.5 LPA', date: '15 May, 2025', status: 'Accepted' },
    { candidate: 'Rohan Verma', company: 'TCS', role: 'Ninja Developer', ctc: '3.6 LPA', date: '14 May, 2025', status: 'Declined' },
    { candidate: 'Manogna P.', company: 'Nexora', role: 'Graduate Associate', ctc: '8.0 LPA', date: '12 May, 2025', status: 'Accepted' }
  ];


  dashboardRoles = [
    { name: 'Dr. Ananya', email: 'ananya.admin@uniplace.edu', target: 'Placement Cell', role: 'Administrator', status: 'Active' },
    { name: 'Prof. Satish', email: 'satish.coord@uniplace.edu', target: 'CSE Dept', role: 'Coordinator', status: 'Active' },
    { name: 'Rajesh Kumar', email: 'rajesh.amz@amazon.com', target: 'Amazon', role: 'Recruiter', status: 'Active' },
    { name: 'Manogna P.', email: 'manogna.stud@uniplace.edu', target: 'CSE Student', role: 'Student', status: 'Active' },
    { name: 'Divya Teja', email: 'divya.rec@deloitte.com', target: 'Deloitte', role: 'Recruiter', status: 'Active' }
  ];

  dashboardAuditLogs = [
    { time: '2026-07-18 10:14:02', user: 'Dr. Ananya', action: 'Approved Amazon SDE Job Posting', comp: 'Approval Queue', status: 'Success' },
    { time: '2026-07-18 09:30:15', user: 'Rajesh Kumar', action: 'Added New Drive - Software Engineer', comp: 'Placement Drives', status: 'Success' },
    { time: '2026-07-18 08:45:22', user: 'Manogna P.', action: 'Upload Resume - manogna_cv.pdf', comp: 'Student Profile', status: 'Success' },
    { time: '2026-07-18 07:12:00', user: 'System Daemon', action: 'Triggered Auto-Closure for expired drives', comp: 'Cron Jobs', status: 'Success' }
  ];

  applications = signal<AppRecord[]>([]);
  notifications = signal<Notification[]>([]);

  kpi = computed(() => {
    const a = this.analytics();
    return {
      students: a?.uniqueApplicants ?? 0,
      companies: a?.companies ?? 0,
      drives: a?.totalPostings ?? 0,
      apps: a?.totalApplications ?? 0,
      rate: a?.placementRate ?? 0,
    };
  });

  dashboardDrives = computed(() => this.allPostings().slice(0, 5).map(p => ({
    title: p.roleTitle,
    company: p.companyName,
    date: p.deadline,
    registrations: this.applications().filter(x => x.posting?.id === p.id).length,
    status: p.status === 'PENDING' ? 'Upcoming'
          : p.status === 'APPROVED' ? 'Ongoing'
          : p.status === 'CLOSED' ? 'Completed' : 'Rejected',
  })));

  /** Offer-type split derived from the live application total (demo split, real total). */
  dashboardDonutData = computed<DonutSlice[]>(() => {
    const total = this.analytics()?.totalApplications ?? 0;
    if (!total) return [{ label: 'No data yet', value: 1, color: '#d7dae8' }];
    const ft = Math.round(total * 0.66), intern = Math.round(total * 0.2), ppo = Math.round(total * 0.08);
    const hold = Math.max(0, Math.round(total * 0.03));
    const wd = Math.max(0, total - ft - intern - ppo - hold);
    return [
      { label: 'Full Time', value: ft, color: '#4f46e5' },
      { label: 'Internship', value: intern, color: '#10b981' },
      { label: 'PPO', value: ppo, color: '#f59e0b' },
      { label: 'On Hold', value: hold, color: '#3b82f6' },
      { label: 'Withdrawn', value: wd, color: '#9ca3af' },
    ];
  });

  topCompanies = computed(() => this.companyBars().slice(0, 5));

  dashboardNotifications = computed(() => this.notifications().slice(0, 4).map(n => ({
    icon: this.notifIcon(n.type),
    color: this.notifColor(n.type),
    text: n.message,
    time: this.timeAgo(n.createdAt),
  })));

  dashboardNotificationLog = computed(() => this.notifications().map(n => ({
    id: n.id,
    type: n.type.replace(/_/g, ' '),
    msg: n.message,
    time: this.timeAgo(n.createdAt),
    status: n.read ? 'Read' : 'Sent',
  })));

  notifIcon(type: string): string {
    switch (type) {
      case 'POSTING_APPROVED': return '✅';
      case 'POSTING_REJECTED': return '⛔';
      case 'POSTING_CLOSED': return '⏰';
      case 'NEW_APPLICATION': return '📥';
      default: return '🔔';
    }
  }

  notifColor(type: string): string {
    switch (type) {
      case 'POSTING_APPROVED': return '#10b981';
      case 'POSTING_REJECTED': return '#ef4444';
      case 'POSTING_CLOSED': return '#f59e0b';
      case 'NEW_APPLICATION': return '#3b82f6';
      default: return '#8b5cf6';
    }
  }

  timeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }

  pending = signal<Posting[]>([]);
  allPostings = signal<Posting[]>([]);
  analytics = signal<Analytics | null>(null);
  leaving = signal<number | null>(null);
  expanded = signal<number | null>(null);
  applicants = signal<AppRecord[]>([]);
  loadingApplicants = signal(false);

  reviewTarget = signal<Posting | null>(null);
  reviewComment = '';

  timelineFor = signal<Posting | null>(null);
  historyEntries = signal<StatusChange[]>([]);
  loadingHistory = signal(false);

  triggerQuickAction(action: string) {
    this.toast.show(`${action} action triggered successfully`, 'info');
  }

  livePostings = computed(() =>
    this.allPostings().filter(p => p.status === 'APPROVED' || p.status === 'CLOSED'));

  companies = computed(() => this.analytics()?.companies ?? 0);

  companyBars = computed(() => {
    const a = this.analytics();
    if (!a?.applicationsPerCompany) return [];
    const entries = Object.entries(a.applicationsPerCompany).sort((x, y) => y[1] - x[1]);
    const max = Math.max(...entries.map(([, c]) => c), 1);
    return entries.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  donutData = computed<DonutSlice[]>(() => {
    const a = this.analytics();
    if (!a) return [];
    return [
      { label: 'Approved', value: a.approvedPostings, color: '#10b981' },
      { label: 'Pending', value: a.pendingPostings, color: '#f59e0b' },
      { label: 'Rejected', value: a.rejectedPostings, color: '#ef4444' },
      { label: 'Closed', value: a.closedPostings, color: '#9ca3af' },
    ];
  });

  areaPoints = computed<AreaPoint[]>(() => {
    const a = this.analytics();
    if (!a?.applicationsOverTime) return [];
    return Object.entries(a.applicationsOverTime).map(([date, count]) => ({ date, count }));
  });

  constructor() {
    this.refresh();
  }

  colorFor(company: string): string {
    return COMPANY_COLORS[company] ?? '#4f46e5';
  }

  colorForStatus(status: string): string {
    switch (status) {
      case 'APPROVED': return 'var(--green)';
      case 'REJECTED': return 'var(--red)';
      case 'CLOSED': return 'var(--muted)';
      default: return 'var(--amber)';
    }
  }

  startReview(p: Posting) {
    this.reviewTarget.set(p);
    this.reviewComment = '';
  }

  cancelReview() { this.reviewTarget.set(null); }

  decide(value: 'APPROVED' | 'REJECTED') {
    const p = this.reviewTarget();
    if (!p) return;
    this.reviewTarget.set(null);
    this.leaving.set(p.id!);
    this.api.setPostingStatus(p.id!, value, this.reviewComment).subscribe({
      next: () => {
        setTimeout(() => { this.leaving.set(null); this.refresh(); }, 350);
        this.toast.show(
          `${p.roleTitle} ${value === 'APPROVED' ? 'approved — now live for students' : 'rejected'}`,
          value === 'APPROVED' ? 'success' : 'info');
      },
      error: () => {
        this.leaving.set(null);
        this.toast.show('Status update failed', 'error');
      },
    });
  }

  toggleApplicants(p: Posting) {
    if (this.expanded() === p.id) { this.expanded.set(null); return; }
    this.expanded.set(p.id!);
    this.loadingApplicants.set(true);
    this.applicants.set([]);
    this.api.getApplicationsByPosting(p.id!).subscribe({
      next: as => { this.applicants.set(as); this.loadingApplicants.set(false); },
      error: () => this.loadingApplicants.set(false),
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

  resumeUrl(a: AppRecord): string {
    return this.api.resumeUrl(a.id);
  }

  refresh() {
    this.api.getPendingPostings().subscribe({ next: ps => this.pending.set(ps), error: () => {} });
    this.api.getAllPostings().subscribe({ next: ps => this.allPostings.set(ps), error: () => {} });
    this.api.getAnalytics().subscribe({ next: a => this.analytics.set(a), error: () => {} });
    this.api.getApplications().subscribe({ next: as => this.applications.set(as), error: () => {} });
    this.api.getNotifications().subscribe({ next: ns => this.notifications.set(ns), error: () => {} });
  }
}
