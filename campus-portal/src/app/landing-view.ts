import { Component, inject, signal } from '@angular/core';
import { NavService } from './nav.service';

@Component({
  selector: 'app-landing-view',
  template: `
    <!-- ===== navbar ===== -->
    <nav class="mk-nav">
      <div>
        <span class="brand">
          @if (logoOk()) { <img src="logo.png" class="mark-img" (error)="logoOk.set(false)" alt="UniPlace" /> }
          @else { <span class="mark">🎓</span> }
          UniPlace
        </span>
        <div class="mk-brand-sub">University Placement Portal</div>
      </div>
      <div class="mk-links">
        @for (l of links; track l.id) {
          <a [class.on]="active() === l.id" (click)="scrollTo(l.id)">{{ l.label }}</a>
        }
        <button class="btn primary sm" (click)="nav.go('login')">👤 Login</button>
      </div>
    </nav>

    <!-- ===== hero ===== -->
    <section class="mk-hero" id="sec-home">
      <div>
        <span class="mk-pill">✦ Bridging Talent With Opportunity</span>
        <h1>Connecting Talent<br>With <span class="grad">Opportunity.</span></h1>
        <p class="lede">A modern placement platform connecting students, companies, and placement
           cells through a seamless approval workflow.</p>
        <div class="actions">
          <button class="btn primary" (click)="nav.go('login')">Get Started →</button>
          <button class="btn ghost" (click)="nav.go('login')">Learn More →</button>
        </div>
        <div class="mk-checks">
          <div class="ck"><span class="ok">✓</span><div><b>200+</b><span>Recruiters</span></div></div>
          <div class="ck"><span class="ok">✓</span><div><b>5000+</b><span>Students</span></div></div>
          <div class="ck"><span class="ok">✓</span><div><b>95%</b><span>Placement Success</span></div></div>
        </div>
      </div>
      <div class="mk-visual">
        <img [src]="heroSrc()" alt="Students on laptops" class="mk-hero-img"
             (error)="heroFallback()" />
        <div class="float-card fc-1">
          <div class="fc-row">
            <span class="wordmark" style="font-size:16px"><span style="color:#4285F4">G</span></span>
            <div><div class="fc-title">Google</div><div class="fc-sub">Software Engineer</div></div>
          </div>
          <span class="badge approved" style="margin-top:7px; display:inline-block">Approved</span>
        </div>
        <div class="float-card fc-2">
          <div class="fc-row">
            <span style="width:26px; height:26px; border-radius:50%; background:var(--green); color:#fff; display:grid; place-items:center; font-size:13px">✓</span>
            <div><div class="fc-title">Application Received</div><div class="fc-sub">125 New</div></div>
          </div>
        </div>
        <div class="float-card fc-3">
          <div class="fc-sub">Placement Rate</div>
          <div class="fc-big" style="color:var(--green)">95% 📈</div>
        </div>
        <div class="float-card fc-4">
          <div class="fc-row">
            <span style="font-size:20px">💼</span>
            <div><div class="fc-title">1200+</div><div class="fc-sub">Jobs Posted</div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== stat band ===== -->
    <section class="mk-statband">
      <div class="inner glass">
        <div class="mk-stat">
          <div class="ic" style="background:var(--primary-soft)">👥</div>
          <b>200+</b><div class="l1">Recruiters</div><div class="l2">Top Companies</div>
        </div>
        <div class="mk-stat">
          <div class="ic" style="background:#e0f2fe">🎓</div>
          <b>5000+</b><div class="l1">Students</div><div class="l2">Active Students</div>
        </div>
        <div class="mk-stat">
          <div class="ic" style="background:var(--green-soft)">💼</div>
          <b>1200+</b><div class="l1">Jobs</div><div class="l2">Live Opportunities</div>
        </div>
        <div class="mk-stat">
          <div class="ic" style="background:#fff7ed">🚀</div>
          <b>95%</b><div class="l1">Placement Rate</div><div class="l2">Success Rate</div>
        </div>
      </div>
    </section>

    <!-- ===== recruiters ===== -->
    @if (logosImgOk()) {
      <section id="sec-companies" style="max-width:1240px; margin:44px auto 0; padding:0 4vw">
        <img src="recruiters.png" alt="Trusted by leading companies"
             style="width:100%; border-radius:18px" (error)="logosImgOk.set(false)" />
      </section>
    } @else {
    <section class="lc-wrap" id="sec-companies">
      <span class="lc-badge">👥 TRUSTED BY 300+ TOP RECRUITERS</span>
      <h2 class="lc-title">Trusted by <span>Leading Companies</span></h2>
      <p class="lc-sub">Top organizations trust UniPlace to find and hire the best talent from universities.</p>
      <div class="lc-grid">
        @for (l of logos; track l.id) {
          <div class="lc-card glass">
            @if (l.pre === 'ms') {
              <span class="ms-grid"><i style="background:#F25022"></i><i style="background:#7FBA00"></i><i style="background:#00A4EF"></i><i style="background:#FFB900"></i></span>
            } @else if (l.pre === 'zoho') {
              <span class="zoho-row">
                <i style="background:#E42527">Z</i><i style="background:#089949">O</i><i style="background:#F9B21D">H</i><i style="background:#226DB4">O</i>
              </span>
            }
            <span class="lc-mark" [style]="l.style || ''">
              @for (pt of l.parts; track $index) {
                <span [style.color]="pt.c || null">{{ pt.t }}</span>
              }
            </span>
            @if (l.post === 'smile') { <span class="amz-smile"></span> }
            @else if (l.post === 'in') { <span class="li-box">in</span> }
          </div>
        }
      </div>
    </section>
    }

    <!-- ===== features ===== -->
    <div class="mk-sec-title" id="sec-features">
      <span class="eyebrow">Platform Features</span>
      <h2>Everything You Need for Successful Placements</h2>
    </div>
    <section class="mk-features">
      <div class="feat glass">
        <div class="f-ic" style="background:var(--primary-soft)"><img src="company.png" class="fi-img" alt="" /></div>
        <h3>Company Job Posting</h3>
        <p>Companies can post jobs with details like eligibility, package, skills and application deadline.</p>
        <span class="more" (click)="nav.go('login')">Learn More</span>
      </div>
      <div class="feat glass">
        <div class="f-ic" style="background:var(--green-soft)"><img src="admin.png" class="fi-img" alt="" /></div>
        <h3>Approval Workflow</h3>
        <p>Every job goes through a strict approval process by placement cell before going live.</p>
        <span class="more" (click)="nav.go('login')">Learn More</span>
      </div>
      <div class="feat glass">
        <div class="f-ic" style="background:#fff7ed">📊</div>
        <h3>Powerful Analytics</h3>
        <p>Real-time insights on applications, placement rates, recruiter activity and student engagement.</p>
        <span class="more" (click)="nav.go('login')">Learn More</span>
      </div>
    </section>

    <!-- ===== how it works ===== -->
    <div class="mk-sec-title" id="sec-students">
      <span class="eyebrow">How It Works</span>
      <h2>Simple Steps, Powerful Outcomes</h2>
    </div>
    <section class="mk-steps">
      <div class="mk-step">
        <div class="s-ic" style="background:var(--primary-soft)"><img src="company.png" class="si-img" alt="" /></div><div class="s-n">1</div>
        <b>Company</b><span>Creates Job</span>
      </div>
      <div class="mk-step">
        <div class="s-ic" style="background:#e0f2fe"><img src="admin.png" class="si-img" alt="" /></div><div class="s-n">2</div>
        <b>Admin</b><span>Reviews & Approves</span>
      </div>
      <div class="mk-step">
        <div class="s-ic" style="background:var(--green-soft)"><img src="student.png" class="si-img" alt="" /></div><div class="s-n">3</div>
        <b>Students</b><span>View Approved Jobs</span>
      </div>
      <div class="mk-step">
        <div class="s-ic" style="background:#fff7ed"><img src="student.png" class="si-img" alt="" /></div><div class="s-n">4</div>
        <b>Students</b><span>Apply</span>
      </div>
      <div class="mk-step">
        <div class="s-ic" style="background:var(--primary-soft)">🏆</div><div class="s-n">5</div>
        <b>Placement</b><span>Success</span>
      </div>
    </section>

    <!-- ===== CTA banner ===== -->
    <section class="mk-cta">
      <div class="inner">
        <span class="cta-ico">🎓</span>
        <div class="grow">
          <h2>Ready to Start Your Placement Journey?</h2>
          <p>Join thousands of students and top recruiters on UniPlace today.</p>
        </div>
        <button class="btn" (click)="nav.go('login')">Explore Opportunities →</button>
      </div>
    </section>

    <!-- ===== footer ===== -->
    <footer class="mk-footer" id="sec-about">
      <div class="cols">
        <div>
          <span class="brand">
            @if (logoOk()) { <img src="logo.png" class="mark-img" (error)="logoOk.set(false)" alt="UniPlace" /> }
            @else { <span class="mark">🎓</span> }
            UniPlace
          </span>
          <p class="fdesc">A modern university placement portal bridging talent with opportunity.</p>
          <div class="socials"><span>in</span><span>🐦</span><span>📷</span><span>🐙</span></div>
        </div>
        <div>
          <h5>Quick Links</h5>
          <div class="fl"><span>Home</span><span>Features</span><span>Companies</span><span>Students</span><span>About Us</span></div>
        </div>
        <div>
          <h5>Resources</h5>
          <div class="fl"><span>Help Center</span><span>Contact Us</span><span>Privacy Policy</span><span>Terms of Service</span><span>FAQ</span></div>
        </div>
        <div>
          <h5>Contact Us</h5>
          <div class="fl">
            <span>✉️ hello&#64;uniplace.edu</span>
            <span>📞 +91 98765 43210</span>
            <span>📍 Bengaluru, Karnataka, India</span>
          </div>
        </div>
      </div>
      <div class="mk-copy">
        <span>© 2026 UniPlace. All rights reserved.</span>
        <span>Designed with ❤️ for better placements</span>
      </div>
    </footer>
  `,
})
export class LandingView {
  nav = inject(NavService);
  logoOk = signal(true);
  active = signal('home');
  links = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'companies', label: 'Companies' },
    { id: 'students', label: 'Students' },
    { id: 'about', label: 'About' },
  ];

  scrollTo(id: string) {
    this.active.set(id);
    document.getElementById('sec-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  logosImgOk = signal(true);
  heroSrc = signal('hero-illustration.png');

  heroFallback() {
    if (this.heroSrc() === 'hero-illustration.png') this.heroSrc.set('hero-illustration.svg');
  }

  logos: { id: number; parts: { t: string; c?: string }[]; style?: string; pre?: string; post?: string }[] = [
    { id: 1, parts: [{t:'G',c:'#4285F4'},{t:'o',c:'#EA4335'},{t:'o',c:'#FBBC05'},{t:'g',c:'#4285F4'},{t:'l',c:'#34A853'},{t:'e',c:'#EA4335'}], style: 'font-weight:600' },
    { id: 2, pre: 'ms', parts: [{t:'Microsoft',c:'#5f6368'}], style: 'font-weight:600' },
    { id: 3, parts: [{t:'amazon',c:'#131921'}], style: 'font-weight:700; letter-spacing:-0.03em', post: 'smile' },
    { id: 4, parts: [{t:'tcs'}], style: 'font-weight:700; background:linear-gradient(100deg,#7b2ff7,#f107a3); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent' },
    { id: 5, parts: [{t:'Infosys',c:'#007CC3'}], style: 'font-style:italic; font-weight:600' },
    { id: 6, parts: [{t:'IBM',c:'#1F70C1'}], style: 'font-weight:800; letter-spacing:0.1em' },
    { id: 7, parts: [{t:'▲ ',c:'#EB1000'},{t:'Adobe',c:'#EB1000'}], style: 'font-weight:700' },
    { id: 8, parts: [{t:'Deloitte',c:'#111'},{t:'.',c:'#86BC25'}], style: 'font-weight:700' },
    { id: 9, parts: [{t:'◉ ',c:'#76B900'},{t:'NVIDIA',c:'#111'}], style: 'font-weight:800; letter-spacing:0.02em' },
    { id: 10, parts: [{t:'accenture',c:'#111'},{t:'›',c:'#A100FF'}], style: 'font-weight:600; letter-spacing:-0.02em' },
    { id: 11, parts: [{t:'Capgemini',c:'#0070AD'},{t:'♠',c:'#12ABDB'}], style: 'font-weight:500' },
    { id: 12, parts: [{t:'cognizant',c:'#000048'}], style: 'font-weight:600' },
    { id: 13, parts: [{t:'wipro',c:'#3b2a66'},{t:'•',c:'#E2231A'},{t:'•',c:'#F7A800'},{t:'•',c:'#00A651'}], style: 'font-weight:700' },
    { id: 14, parts: [{t:'HCL',c:'#0072BC'}], style: 'font-weight:800; font-style:italic; letter-spacing:0.12em' },
    { id: 15, parts: [{t:'SAMSUNG',c:'#1428A0'}], style: 'font-weight:800; letter-spacing:0.08em; font-size:14px' },
    { id: 16, parts: [{t:'ORACLE',c:'#F80000'}], style: 'font-weight:700; letter-spacing:0.06em; font-size:15px' },
    { id: 17, parts: [{t:'ılıılı',c:'#049FD9'},{t:' cisco',c:'#049FD9'}], style: 'font-weight:600' },
    { id: 18, parts: [{t:'DELL',c:'#007DB8'}], style: 'font-weight:800; letter-spacing:0.14em' },
    { id: 19, parts: [{t:'☁ ',c:'#00A1E0'},{t:'salesforce',c:'#00A1E0'}], style: 'font-weight:600; font-size:15px' },
    { id: 20, pre: 'zoho', parts: [{t:''}] },
    { id: 21, parts: [{t:'Pay',c:'#003087'},{t:'Pal',c:'#009CDE'}], style: 'font-weight:800; font-style:italic' },
    { id: 22, parts: [{t:'Uber',c:'#000'}], style: 'font-weight:600' },
    { id: 23, parts: [{t:'intel',c:'#0068B5'},{t:'.',c:'#0068B5'}], style: 'font-weight:600; letter-spacing:-0.02em' },
    { id: 24, parts: [{t:'Flipkart ',c:'#2874F0'},{t:'🛒',c:'#FFD200'}], style: 'font-weight:700; font-style:italic' },
    { id: 25, parts: [{t:"BYJU'S",c:'#813588'}], style: 'font-weight:800' },
    { id: 26, parts: [{t:'₹ ',c:'#5F259F'},{t:'PhonePe',c:'#5F259F'}], style: 'font-weight:700' },
    { id: 27, parts: [{t:'JPMorgan Chase & Co.',c:'#1a1a1a'}], style: 'font-family:Georgia,serif; font-size:12.5px; font-variant:small-caps; font-weight:600' },
    { id: 28, parts: [{t:'◭ ',c:'#0052CC'},{t:'ATLASSIAN',c:'#0052CC'}], style: 'font-weight:700; letter-spacing:0.08em; font-size:13px' },
    { id: 29, parts: [{t:'Linked',c:'#0A66C2'}], style: 'font-weight:700', post: 'in' },
    { id: 30, parts: [{t:'◍ ',c:'#00B386'},{t:'Groww',c:'#44475B'}], style: 'font-weight:700' },
    { id: 31, parts: [{t:'⟋',c:'#3395FF'},{t:'Razorpay',c:'#02042B'}], style: 'font-weight:700; font-style:italic' },
    { id: 32, parts: [{t:'OYO',c:'#EE2E24'}], style: 'font-weight:900; letter-spacing:0.04em' },
    { id: 33, parts: [{t:'zomato',c:'#E23744'}], style: 'font-weight:800; letter-spacing:-0.02em' },
    { id: 34, parts: [{t:'🍊 '},{t:'SWIGGY',c:'#FC8019'}], style: 'font-weight:800; font-size:14px' },
    { id: 35, parts: [{t:'+ More',c:'#4f46e5'}], style: 'font-weight:700' },
  ];
}
