import { Component, computed, input } from '@angular/core';

/** Brand-styled mini logo tiles for known companies; colored initial otherwise. */
@Component({
  selector: 'co-logo',
  template: `
    @switch (kind()) {
      @case ('google')    { <span class="co-tile light"><span class="co-g">G</span></span> }
      @case ('microsoft') { <span class="co-tile light"><span class="ms-grid"><i style="background:#F25022"></i><i style="background:#7FBA00"></i><i style="background:#00A4EF"></i><i style="background:#FFB900"></i></span></span> }
      @case ('amazon')    { <span class="co-tile" style="background:#131921"><span class="co-amz">a<i></i></span></span> }
      @case ('tcs')       { <span class="co-tile light"><span class="co-tcs">tcs</span></span> }
      @case ('infosys')   { <span class="co-tile light"><span style="color:#007CC3; font-style:italic; font-weight:700; font-size:11px">Infosys</span></span> }
      @case ('ibm')       { <span class="co-tile light"><span style="color:#1F70C1; font-weight:800; letter-spacing:0.05em; font-size:12px">IBM</span></span> }
      @case ('flipkart')  { <span class="co-tile" style="background:#2874F0"><span style="color:#FFD200; font-weight:800; font-style:italic; font-size:18px">F</span></span> }
      @case ('zomato')    { <span class="co-tile" style="background:#E23744"><span style="color:#fff; font-weight:800; font-size:15px">z</span></span> }
      @case ('deloitte')  { <span class="co-tile" style="background:#111"><span style="color:#fff; font-weight:700; font-size:11px">D<span style="color:#86BC25">.</span></span></span> }
      @case ('capgemini') { <span class="co-tile light"><span style="color:#12ABDB; font-size:16px">♠</span></span> }
      @default            { <span class="co-tile" [style.background]="fallbackColor()"><span style="color:#fff; font-weight:700; font-size:16px">{{ initial() }}</span></span> }
    }
  `,
})
export class CoLogo {
  name = input('');

  kind = computed(() => {
    const n = this.name().toLowerCase();
    for (const k of ['google', 'microsoft', 'amazon', 'tcs', 'infosys', 'ibm', 'flipkart', 'zomato', 'deloitte', 'capgemini']) {
      if (n.includes(k)) return k;
    }
    return 'other';
  });

  initial = computed(() => (this.name() || '?')[0].toUpperCase());

  fallbackColor = computed(() => {
    const palette = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    let h = 0;
    for (const c of this.name()) h = (h * 31 + c.charCodeAt(0)) % 997;
    return palette[h % palette.length];
  });
}
