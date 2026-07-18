import { Component, computed, input } from '@angular/core';

export interface DonutSlice { label: string; value: number; color: string; }

/** Animated SVG donut chart. */
@Component({
  selector: 'chart-donut',
  template: `
    <div class="donut-wrap">
      <svg viewBox="0 0 180 180" class="donut" role="img">
        <circle cx="90" cy="90" r="70" fill="none" stroke="var(--surface-2)" stroke-width="24" />
        @for (s of segments(); track s.label) {
          <circle cx="90" cy="90" r="70" fill="none"
                  [attr.stroke]="s.color" stroke-width="24" stroke-linecap="butt"
                  [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset"
                  transform="rotate(-90 90 90)" class="donut-seg" />
        }
        <text x="90" y="84" text-anchor="middle" class="donut-num">{{ total() }}</text>
        <text x="90" y="104" text-anchor="middle" class="donut-lbl">{{ centerLabel() }}</text>
      </svg>
      <div class="donut-legend">
        @for (s of segments(); track s.label) {
          <div class="legend-row">
            <span class="legend-dot" [style.background]="s.color"></span>
            <span class="legend-name">{{ s.label }}</span>
            <span class="legend-val">{{ s.value }} <span class="legend-pct">({{ s.pct }}%)</span></span>
          </div>
        }
      </div>
    </div>
  `,
})
export class ChartDonut {
  data = input<DonutSlice[]>([]);
  centerLabel = input('postings', { alias: 'center-label' });
  private C = 2 * Math.PI * 70;

  total = computed(() => this.data().reduce((a, d) => a + d.value, 0));

  segments = computed(() => {
    const total = Math.max(this.total(), 1);
    let acc = 0;
    return this.data().filter(d => d.value > 0).map(d => {
      const frac = d.value / total;
      const seg = {
        ...d,
        dash: `${frac * this.C} ${this.C}`,
        offset: `${-acc * this.C}`,
        pct: Math.round(frac * 100),
      };
      acc += frac;
      return seg;
    });
  });
}
