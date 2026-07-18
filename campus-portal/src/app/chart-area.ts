import { Component, computed, input } from '@angular/core';

export interface AreaPoint { date: string; count: number; }

/** Animated SVG area/line chart for applications over time. */
@Component({
  selector: 'chart-area',
  template: `
    <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" class="area-chart" preserveAspectRatio="none" role="img">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35" />
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
        </linearGradient>
      </defs>
      @for (g of gridLines(); track g) {
        <line [attr.x1]="PAD" [attr.x2]="W - PAD" [attr.y1]="g" [attr.y2]="g"
              stroke="var(--border)" stroke-width="1" />
      }
      <path [attr.d]="areaPath()" fill="url(#areaFill)" />
      <path [attr.d]="linePath()" fill="none" stroke="var(--accent)" stroke-width="2.5"
            stroke-linejoin="round" stroke-linecap="round" pathLength="1" class="area-line" />
      @for (p of dots(); track p.x) {
        <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3.5" fill="var(--accent)" class="area-dot" />
      }
    </svg>
    <div class="area-labels">
      @for (l of labels(); track l) { <span>{{ l }}</span> }
    </div>
  `,
})
export class ChartArea {
  points = input<AreaPoint[]>([]);
  readonly W = 640;
  readonly H = 180;
  readonly PAD = 10;

  private maxY = computed(() => Math.max(...this.points().map(p => p.count), 1));

  private coords = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return [];
    const innerW = this.W - this.PAD * 2;
    const innerH = this.H - this.PAD * 2 - 8;
    const step = pts.length > 1 ? innerW / (pts.length - 1) : 0;
    const max = this.maxY();
    return pts.map((p, i) => ({
      x: this.PAD + i * step,
      y: this.PAD + innerH * (1 - p.count / max),
    }));
  });

  linePath = computed(() => {
    const c = this.coords();
    if (c.length === 0) return '';
    return c.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  });

  areaPath = computed(() => {
    const c = this.coords();
    if (c.length === 0) return '';
    const line = this.linePath();
    const last = c[c.length - 1];
    const first = c[0];
    return `${line} L${last.x.toFixed(1)},${this.H - this.PAD} L${first.x.toFixed(1)},${this.H - this.PAD} Z`;
  });

  dots = computed(() => this.coords());

  gridLines = computed(() => [this.PAD, this.H / 2, this.H - this.PAD]);

  labels = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return [];
    const fmt = (d: string) => {
      const dt = new Date(d + 'T00:00:00');
      return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };
    const mid = pts[Math.floor(pts.length / 2)];
    return [fmt(pts[0].date), fmt(mid.date), fmt(pts[pts.length - 1].date)];
  });
}
