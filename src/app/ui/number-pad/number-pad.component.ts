import { Component, computed, effect, input, output, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ButtonComponent } from '@ui/button/button.component';

/** Largest number of digits the buffer accepts, guarding against silly overflow. */
const MAX_DIGITS = 6;
/** Largest number of banked parts, so the tally can't grow without bound. */
const MAX_PARTS = 12;

/**
 * The app's single, on-screen numeric keypad. Builds a multi-digit value purely from
 * taps — digits, a +/- sign toggle, a delete key, and Enter — so score entry never
 * relies on the OS keyboard (which pops up and reflows the layout on mobile).
 *
 * It's deliberately host-agnostic: drop it in inline (e.g. a player's turn) or inside a
 * dialog (see {@link NumberDialogComponent}). It emits the assembled value via `enter`
 * and clears itself, ready for the next entry. Pass an optional `value` to pre-fill the
 * buffer when editing an existing score. Both call sites always sit inside an ancestor
 * `stColor` scope, so the `+`/Enter keys use `status="player"` to pick up that color
 * (see the template) and the display/Enter-key border read `--st-player-color` directly.
 *
 * ## Summing
 *
 * Scores are often tallied from parts (6 + 8 + 12 + 3), so `+` banks the buffer onto a
 * tally and Enter emits the running total. There is no mode to switch: `+` is simply
 * another key, and the expression line above the pad sits empty until it's used, so
 * entering one plain number is exactly the taps it always was.
 *
 * - **The tally is text, and all of it stays visible.** It spans the host's full width
 *   rather than the narrow key grid, which is what makes a whole tally fit on one line.
 * - **Delete is digit-level, always.** There is no per-part delete; a mis-tapped tally is
 *   cheap to cancel and re-enter, and tap targets are what forced the parts to be too wide
 *   to show in the first place.
 * - **The line is always laid out**, so banking a part never reflows the pad mid-tally.
 */
@Component({
  selector: 'st-number-pad',
  imports: [NgIcon, ButtonComponent],
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

  /** Addends banked by the `+` key, in tap order. */
  readonly parts = signal<number[]>([]);

  /** Live, signed text for the display (`0` when nothing has been typed yet). */
  readonly displayValue = computed(() => (this.negative() ? '-' : '') + (this.digits() || '0'));
  /** The banked tally as a readable sum (`6 + 8 - 3`); empty until the first `+`. */
  readonly expression = computed(() =>
    this.parts()
      .map((part, index) => (index === 0 ? String(part) : `${part < 0 ? '-' : '+'} ${Math.abs(part)}`))
      .join(' '),
  );
  /** Numeric value of the buffer alone, ignoring anything already banked. */
  private readonly enteredValue = computed(() => {
    const magnitude = Number(this.digits() || '0');
    return this.negative() ? -magnitude : magnitude;
  });
  /** What Enter would emit right now: everything banked plus whatever's in the buffer. */
  readonly total = computed(() => this.parts().reduce((sum, part) => sum + part, this.enteredValue()));
  /** Whether `+` has something to bank and room to put it. */
  readonly canBank = computed(() => this.digits().length > 0 && this.parts().length < MAX_PARTS);

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

  /** Digit-level delete. The banked tally is never touched — cancel to abandon one. */
  backspace(): void {
    this.digits.update((cur) => cur.slice(0, -1));
  }

  toggleSign(): void {
    this.negative.update((neg) => !neg);
  }

  /** Bank the buffer onto the tally and clear it, ready for the next part. */
  plus(): void {
    if (!this.canBank()) {
      return;
    }
    this.parts.update((cur) => [...cur, this.enteredValue()]);
    this.digits.set('');
    this.negative.set(false);
  }

  confirm(): void {
    this.enter.emit(this.total());
    this.parts.set([]);
    this.digits.set('');
    this.negative.set(false);
  }
}
