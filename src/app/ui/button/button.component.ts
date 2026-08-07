import { Component, input } from '@angular/core';
import { ButtonStatus } from '@ui/status/button-status';

/** The four M3 button emphases, in ascending prominence. */
export type ButtonVariant = 'text' | 'filled' | 'outlined' | 'tonal';

/**
 * The app's button chrome, on an attribute selector so call sites stay a plain
 * `<button>` (or `<a>`) and nothing about their semantics changes:
 *
 * ```html
 * <button stButton="filled" type="button" (click)="save()">Save</button>
 * ```
 *
 * Styling lives in `src/styles/components/_button.scss`, not here — this
 * component only decides which classes (`style`, `status`) land on the
 * native element. `style` (this `stButton` value) and `status` are
 * independent axes — see {@link ButtonStatus}. A plain `<button stButton>`
 * is `status="primary"` by default: a flat skin brand color. A call site
 * that wants the button to adopt whatever player color is in scope sets
 * `status="player"` explicitly — it's never implicit.
 *
 * **There is no ripple.** Press feedback is a CSS state layer driven by
 * `--st-state-opacity-hover` / `-pressed`, which exist for exactly this.
 *
 * Restyle a button from a parent by setting its component tokens
 * (`--st-button-color-background` and friends), never a class rule of your
 * own — but at a selector specific enough to outrank the variant's own
 * default assignment (e.g. `.st-button.st-button-filled.your-class`, not
 * just `.your-class`) — see TOKEN-SCHEMA.md §6.
 */
@Component({
  selector: 'button[stButton], a[stButton]',
  template: '<ng-content/>',
  // A `[class]` host binding MERGES rather than replaces: Angular's styling
  // algorithm keeps static classes written at the call site and lets template
  // bindings win over host ones. So `class="create-button"` survives this.
  host: { '[class]': "'st-button st-button-' + variant() + ' st-button-status-' + status()" },
})
export class ButtonComponent {
  /**
   * Emphasis. A bare `<button stButton>` binds the empty string rather than
   * leaving the input at its default, so the transform folds `''` onto `text` —
   * without it, every valueless call site is a type error.
   */
  readonly variant = input<ButtonVariant, ButtonVariant | ''>('text', {
    alias: 'stButton',
    transform: (value) => value || 'text',
  });

  /** Color family — see {@link ButtonStatus}. Defaults to `primary`. */
  readonly status = input<ButtonStatus, ButtonStatus | ''>('primary', {
    transform: (value) => value || 'primary',
  });
}
