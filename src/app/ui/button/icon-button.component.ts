import { Component, input } from '@angular/core';
import { ButtonStatus } from '@ui/button/button-status';
import { ButtonVariant } from '@ui/button/button-variant';

/**
 * Icon-only button chrome, on an attribute selector so call sites stay a plain
 * `<button>` (or `<a>`) holding a single glyph:
 *
 * ```html
 * <button stIconButton="filled" type="button" aria-label="Close" (click)="close()">
 *   <ng-icon name="phosphorX" />
 * </button>
 * ```
 *
 * Styling lives in `src/styles/components/_button.scss`, not here — see
 * docs/UI-COMPONENTS.md § Buttons for the `variant`/`status` contract shared
 * with {@link ButtonComponent}. The host carries `st-button` itself alongside
 * `st-icon-button`, so an icon button is a button, not a parallel copy of one.
 *
 * No `block` variant — an icon button is always a fixed-size square.
 *
 * The glyph itself is sized globally in `src/styles/_base.scss`, not here: it
 * arrives through `<ng-content>`, and projected content carries the *call site's*
 * encapsulation attribute, so a rule scoped to this component would never
 * match it.
 *
 * **`aria-label` is the call site's job.** Nothing here can invent an accessible
 * name for a button whose only content is a decorative glyph.
 */
@Component({
  selector: 'button[stIconButton], a[stIconButton]',
  template: '<ng-content/>',
  host: { '[class]': "'st-button st-icon-button st-button-' + variant() + ' st-button-status-' + status()" },
})
export class IconButtonComponent {
  /**
   * Emphasis — see {@link ButtonComponent.variant}. A bare `<button stIconButton>`
   * binds the empty string rather than leaving the input at its default, so
   * the transform folds `''` onto `text` — without it, every valueless call
   * site is a type error.
   */
  readonly variant = input<ButtonVariant, ButtonVariant | ''>('text', {
    alias: 'stIconButton',
    transform: (value) => value || 'text',
  });

  /** Color family — see {@link ButtonStatus}. Defaults to `primary`. */
  readonly status = input<ButtonStatus, ButtonStatus | ''>('primary', {
    transform: (value) => value || 'primary',
  });
}
