import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavService } from './nav.service';

type PickRole = 'student' | 'company' | 'admin';

@Component({
  selector: 'app-login-view',
  imports: [FormsModule],
  template: `
    <div class="lg-split">
      <!-- ===== left showcase panel ===== -->
      <div class="lg-left">
        <span class="brand">
          @if (logoOk()) { <img src="logo.png" class="mark-img" (error)="logoOk.set(false)" alt="UniPlace" /> }
          @else { <span class="mark">🎓</span> }
          <span>UniPlace<div class="mk-brand-sub">University Placement Portal</div></span>
        </span>

        <h1 class="lg-head">One Platform.<br><span>Endless Opportunities.</span></h1>
        <p class="lg-sub">Connecting students, companies and placement cells through a secure
           and intelligent placement ecosystem.</p>

        <div class="lg-feats">
          <div class="lg-feat"><span class="lg-fi"><img src="company.png" class="fi-img" alt="" /></span>
            <div><b>For Companies</b><span>Post jobs and hire the best talent.</span></div></div>
          <div class="lg-feat"><span class="lg-fi"><img src="student.png" class="fi-img" alt="" /></span>
            <div><b>For Students</b><span>Discover opportunities and build your future.</span></div></div>
          <div class="lg-feat"><span class="lg-fi"><img src="admin.png" class="fi-img" alt="" /></span>
            <div><b>For Admins</b><span>Review, approve and ensure quality placements.</span></div></div>
          <div class="lg-feat"><span class="lg-fi">📊</span>
            <div><b>Smart Analytics</b><span>Real-time insights and placement statistics.</span></div></div>
        </div>

        @if (artOk()) {
          <img src="login-illustration.png" class="lg-art" (error)="artOk.set(false)" alt="" />
        }

        <div class="lg-strip glass">
          <div class="lg-s"><span class="lg-si">👥</span><div><b>5000+</b><span>Students</span></div></div>
          <div class="lg-s"><span class="lg-si">🏢</span><div><b>200+</b><span>Companies</span></div></div>
          <div class="lg-s"><span class="lg-si">💼</span><div><b>1200+</b><span>Jobs Posted</span></div></div>
          <div class="lg-s"><span class="lg-si">📈</span><div><b>95%</b><span>Placement Success</span></div></div>
        </div>
      </div>

      <!-- ===== right login card ===== -->
      <div class="lg-right">
        <div class="lg-card glass">
          <h2 class="lg-welcome">Welcome <span>Back!</span></h2>
          <p class="lg-wsub">Login to your account to continue</p>

          <div class="lg-lbl">I am logging in as</div>
          <div class="lg-roles">
            <button class="lg-role" [class.on]="picked() === 'student'" (click)="picked.set('student')">
              <img src="student.png" class="ri-img" alt="Student" />
              <b>Student</b><span>Find jobs and apply</span>
            </button>
            <button class="lg-role" [class.on]="picked() === 'company'" (click)="picked.set('company')">
              <img src="company.png" class="ri-img" alt="Company" />
              <b>Company</b><span>Post jobs and hire</span>
            </button>
            <button class="lg-role" [class.on]="picked() === 'admin'" (click)="picked.set('admin')">
              <img src="admin.png" class="ri-img" alt="Admin" />
              <b>Admin</b><span>Review and manage</span>
            </button>
          </div>

          <div class="lg-or"><span>or</span></div>

          <div class="field">
            <label>Email Address</label>
            <div class="lg-input">✉️ <input type="email" [(ngModel)]="email" placeholder="Enter your email" /></div>
          </div>
          <div class="field" style="margin-top:12px">
            <label>Password</label>
            <div class="lg-input">🔒
              <input [type]="showPw() ? 'text' : 'password'" [(ngModel)]="password" placeholder="Enter your password" />
              <span class="lg-eye" (click)="showPw.set(!showPw())">{{ showPw() ? '🙈' : '👁️' }}</span>
            </div>
          </div>

          <div class="lg-row">
            <label class="lg-remember"><input type="checkbox" [(ngModel)]="remember" /> Remember me</label>
            <span class="lg-link">Forgot Password?</span>
          </div>

          <button class="btn primary lg-login" (click)="enter()">Login <span style="margin-left:auto">→</span></button>

          <p class="lg-signup">Don't have an account? <span class="lg-link">Sign up here</span></p>
          <p class="lg-note">Demo mode — role selection is mocked per hackathon rules; no real authentication.</p>

          <div class="lg-or"><span>or continue with</span></div>
          <div class="lg-socials">
            <button class="lg-social" (click)="enter()">
              <span><span style="color:#4285F4">G</span></span> Google
            </button>
            <button class="lg-social" (click)="enter()">
              <span class="li-box" style="font-size:11px">in</span> LinkedIn
            </button>
            <button class="lg-social" (click)="enter()">
              <span class="ms-grid"><i style="background:#F25022"></i><i style="background:#7FBA00"></i><i style="background:#00A4EF"></i><i style="background:#FFB900"></i></span> Microsoft
            </button>
          </div>

          <button class="btn ghost sm" style="margin-top:16px; align-self:center" (click)="nav.go('landing')">← Back to home</button>
        </div>
      </div>
    </div>
  `,
})
export class LoginView {
  nav = inject(NavService);
  picked = signal<PickRole>('student');
  logoOk = signal(true);
  artOk = signal(true);
  showPw = signal(false);
  email = '';
  password = '';
  remember = false;

  enter() {
    this.nav.go(this.picked());
  }
}
