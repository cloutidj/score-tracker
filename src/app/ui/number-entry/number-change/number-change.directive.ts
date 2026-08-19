import { Directive, effect, input, signal } from '@angular/core';

/**
 * Flashes the host when the bound number increases or decreases, by diffing each new value
 * against the previous one — no caller-supplied direction needed. Shared by `number-picker`
 * (its own `[(value)]`) and `health-points-game`'s life total, which only ever sees the
 * resulting value, not the delta that produced it.
 */
@Directive({
  selector: '[stNumberChange]',
  host: {
    '[class.st-number-increment]': "direction() === 'increment'",
    '[class.st-number-decrement]': "direction() === 'decrement'",
    '(animationend)': 'direction.set(null)',
  },
})
export class NumberChangeDirective {
  readonly stNumberChange = input.required<number>();

  protected readonly direction = signal<'increment' | 'decrement' | null>(null);
  private previous: number | undefined;

  constructor() {
    effect(() => {
      const value = this.stNumberChange();
      if (this.previous !== undefined && value !== this.previous) {
        this.direction.set(value > this.previous ? 'increment' : 'decrement');
      }
      this.previous = value;
    });
  }
}
