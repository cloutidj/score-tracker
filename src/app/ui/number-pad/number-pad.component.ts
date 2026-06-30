import { Component, computed, effect, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/** Largest number of digits the buffer accepts, guarding against silly overflow. */
const MAX_DIGITS = 6;

/**
 * The app's single, on-screen numeric keypad. Builds a multi-digit value purely from
 * taps — digits, a +/- sign toggle, a delete key, and Enter — so score entry never
 * relies on the OS keyboard (which pops up and reflows the layout on mobile).
 *
 * It's deliberately host-agnostic: drop it in inline (e.g. a player's turn) or inside a
 * dialog (see {@link NumberDialogComponent}). It emits the assembled value via `enter`
 * and clears itself, ready for the next entry. Pass an optional `value` to pre-fill the
 * buffer when editing an existing score. The display and Enter key inherit `--st-player`
 * from an ancestor `stPlayerColor` directive when present.
 */
@Component({
  selector: 'st-number-pad',
  imports: [MatButtonModule, FontAwesomeModule],
  templateUrl: './number-pad.component.html',
  styleUrl: './number-pad.component.scss',
})
export class NumberPadComponent {
  /** Optional starting value, used when editing an existing score rather than adding one. */
  readonly value = input<number | null>(null);
  /** Emitted with the assembled value when the user presses Enter. */
  readonly enter = output<number>();

  readonly digitKeys = [7, 8, 9, 4, 5, 6, 1, 2, 3];

  /** Magnitude as typed; never holds a sign and never a lone leading zero. */
  private readonly digits = signal('');
  private readonly negative = signal(false);
  private seeded = false;

  /** Live, signed text for the display (`0` when nothing has been typed yet). */
  readonly displayValue = computed(() => (this.negative() ? '-' : '') + (this.digits() || '0'));
  /** Numeric value the keypad would emit right now. */
  private readonly enteredValue = computed(() => {
    const magnitude = Number(this.digits() || '0');
    return this.negative() ? -magnitude : magnitude;
  });

  constructor() {
    // The bound `value` arrives during the host's first change detection, after the
    // field initializers run, so seed from an effect — once, leaving later edits alone.
    effect(() => {
      const initial = this.value();
      if (!this.seeded && initial != null) {
        this.seeded = true;
        this.negative.set(initial < 0);
        this.digits.set(String(Math.abs(initial)));
      }
    });
  }

  append(digit: number): void {
    this.digits.update((cur) => {
      if (cur.length >= MAX_DIGITS) {
        return cur;
      }
      // A lone leading zero is replaced rather than prefixed (so 0 then 5 reads as 5).
      return cur === '0' ? String(digit) : cur + digit;
    });
  }

  backspace(): void {
    this.digits.update((cur) => cur.slice(0, -1));
  }

  toggleSign(): void {
    this.negative.update((neg) => !neg);
  }

  confirm(): void {
    this.enter.emit(this.enteredValue());
    this.digits.set('');
    this.negative.set(false);
  }
}
