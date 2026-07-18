import { Component, effect, input, signal } from '@angular/core';

/** Animated number counter: counts from the previous value to the new one. */
@Component({
  selector: 'count-up',
  template: `{{ text() }}`,
})
export class CountUp {
  value = input(0);
  decimals = input(0);
  suffix = input('');

  text = signal('0');
  private current = 0;
  private raf = 0;

  constructor() {
    effect(() => {
      const target = this.value() ?? 0;
      const dec = this.decimals();
      const suf = this.suffix();
      cancelAnimationFrame(this.raf);
      const from = this.current;
      const start = performance.now();
      const dur = 900;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        this.current = from + (target - from) * eased;
        this.text.set(this.current.toFixed(dec) + suf);
        if (t < 1) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    });
  }
}
