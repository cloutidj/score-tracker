import { Component, input } from '@angular/core';
import { ButtonStatus } from '@ui/status/button-status';

/**
 * Icon-only button chrome, on an attribute selector so call sites stay a plain
 * `<button>` (or `<a>`) holding a single glyph:
 *
 * ```html
 * <button stIconButton type="button" aria-label="Close" (click)="close()">
 *   <ng-icon name="phosphorX" />
 * </button>
 * ```
 *
 * Styling lives in `src/styles/components/_button.scss`, not here — see
 * {@link ButtonComponent}. `status` (see {@link ButtonStatus}) is the
 * color-family axis shared with it — defaults to `primary`, a flat skin
 * brand color. A control that should adopt whatever player color is in
 * scope sets `status="player"` explicitly.
 *
 * A control that sits directly on its own player-colored fill (a
 * `.st-player-row`/player-tile icon button) should use `status="contrast"`
 * instead of the default `primary`, so its glyph stays legible against that
 * fill instead of vanishing into it — see {@link ButtonStatus}. It should
 * also carry the plain `st-on-fill` class, separate metadata some skins react
 * to structurally (e.g. giving it its own disc); `st-on-fill` has no effect
 * on color by itself.
 *
 * No `style` axis yet — an icon button is one shape today.
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
  host: { '[class]': "'st-icon-button st-icon-button-status-' + status()" },
})
export class IconButtonComponent {
  /** Color family — see {@link ButtonStatus}. Defaults to `primary`. */
  readonly status = input<ButtonStatus, ButtonStatus | ''>('primary', {
    transform: (value) => value || 'primary',
  });
}
