import { Component, input } from '@angular/core';
import { ButtonStatus } from '@ui/status/button-status';
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
 * {@link ButtonComponent}. The host carries `st-button` itself, alongside
 * `st-icon-button` and the exact same `st-button-<variant>`/
 * `st-button-status-<status>` classes `ButtonComponent` emits: an icon
 * button IS a button, resolved by the same rules, not a parallel copy of
 * them — `st-icon-button` only ever adds shape overrides (square size,
 * padding, border width) on top, never a second color/status mechanism.
 * `style` (this `stIconButton` value) and `status` are the same two
 * independent axes {@link ButtonComponent} has. `status` (see
 * {@link ButtonStatus}) defaults to `primary`, the same pinned brand color
 * `ButtonComponent` defaults to — swapping one component for the other with
 * the same `status` never changes the color.
 *
 * An icon button's traditional quiet-toolbar-glyph look (a close/edit/menu
 * icon with no color of its own) is `status="muted"`, set explicitly — it is
 * not what a bare, status-less icon button renders. Most icon buttons in
 * this app want that look, so most call sites set it.
 *
 * A control that sits directly on its own player-colored fill (a
 * `.st-player-row`/player-tile icon button) should use `status="contrast"`
 * instead, so its glyph stays legible against that fill instead of vanishing
 * into it — see {@link ButtonStatus}. It should also carry the plain
 * `st-on-fill` class, separate metadata some skins react to structurally
 * (e.g. giving it its own disc); `st-on-fill` has no effect on color by
 * itself.
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
