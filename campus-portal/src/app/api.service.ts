import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Posting {
  id?: number;
  companyName: string;
  roleTitle: string;
  description: string;
  eligibility: string;
  deadline: string;
  salary?: string | null;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
}

export interface AppRecord {
  id: number;
  posting: Posting;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  appliedAt: string;
  resumeFileName?: string;
  hasResume?: boolean;
}

export interface Analytics {
  totalPostings: number;
  approvedPostings: number;
  pendingPostings: number;
  rejectedPostings: number;
  closedPostings: number;
  totalApplications: number;
  applicationsPerCompany: Record<string, number>;
  uniqueApplicants: number;
  postingsReachedApproved: number;
  placementRate: number;
  applicationsOverTime: Record<string, number>;
  companies: number;
}

export interface StatusChange {
  id: number;
  postingId: number;
  fromStatus: string | null;
  toStatus: string;
  changedAt: string;
  comment?: string | null;
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  // Local dev talks to the local backend; any deployed host calls the Railway backend directly.
  private base = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'http://localhost:8081/api'
    : 'https://vulture-production.up.railway.app/api';

  // ---- postings ----
  createPosting(p: Posting): Observable<Posting> {
    return this.http.post<Posting>(`${this.base}/postings`, p);
  }
  getApprovedPostings(): Observable<Posting[]> {
    return this.http.get<Posting[]>(`${this.base}/postings/approved`);
  }
  getPendingPostings(): Observable<Posting[]> {
    return this.http.get<Posting[]>(`${this.base}/postings/pending`);
  }
  getAllPostings(): Observable<Posting[]> {
    return this.http.get<Posting[]>(`${this.base}/postings`);
  }
  setPostingStatus(id: number, value: 'APPROVED' | 'REJECTED' | 'CLOSED', comment?: string): Observable<Posting> {
    const params: Record<string, string> = { value };
    if (comment && comment.trim()) params['comment'] = comment.trim();
    return this.http.put<Posting>(`${this.base}/postings/${id}/status`, null, { params });
  }

  // ---- applications ----
  applyWithResume(postingId: number, studentName: string, studentEmail: string,
                  rollNumber: string, resume: File): Observable<AppRecord> {
    const fd = new FormData();
    fd.append('postingId', String(postingId));
    fd.append('studentName', studentName);
    fd.append('studentEmail', studentEmail);
    fd.append('rollNumber', rollNumber);
    fd.append('resume', resume, resume.name);
    return this.http.post<AppRecord>(`${this.base}/applications/apply`, fd);
  }
  getApplications(): Observable<AppRecord[]> {
    return this.http.get<AppRecord[]>(`${this.base}/applications`);
  }
  getApplicationsByPosting(postingId: number): Observable<AppRecord[]> {
    return this.http.get<AppRecord[]>(`${this.base}/applications/posting/${postingId}`);
  }
  resumeUrl(applicationId: number): string {
    return `${this.base}/applications/${applicationId}/resume`;
  }

  getStatusHistory(postingId: number): Observable<StatusChange[]> {
    return this.http.get<StatusChange[]>(`${this.base}/postings/${postingId}/history`);
  }

  // ---- analytics ----
  getAnalytics(): Observable<Analytics> {
    return this.http.get<Analytics>(`${this.base}/analytics`);
  }

  // ---- notifications ----
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.base}/notifications`);
  }
  getUnreadCount(): Observable<{ unread: number }> {
    return this.http.get<{ unread: number }>(`${this.base}/notifications/unread-count`);
  }
  markNotificationRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.base}/notifications/${id}/read`, null);
  }
  markAllNotificationsRead(): Observable<Notification[]> {
    return this.http.put<Notification[]>(`${this.base}/notifications/read-all`, null);
  }
}
