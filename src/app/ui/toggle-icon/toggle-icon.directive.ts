import { Directive, computed, input } from '@angular/core';

/**
 * Applies the shared "open = active glyph" convention to any Material icon button
 * holding an `<ng-icon>`: the glyph swaps regular (outline) → `…Fill` while open.
 * Phosphor ships a fill twin for every glyph, so this works for any icon whose
 * `…Fill` variant is registered in `icon-library.ts`.
 *
 * The directive just derives the active name — read it off the exported instance
 * and bind it to the child icon:
 *
 * ```html
 * <button matIconButton stToggleIcon icon="phosphorBook"
 *         [open]="open()" #t="stToggleIcon">
 *   <ng-icon [name]="t.iconName()" />
 * </button>
 * ```
 *
 * ARIA is intentionally left to the host: a toolbar toggle wants `aria-pressed`,
 * whereas a menu trigger already exposes `aria-expanded`. Used directly by the
 * color-picker trigger and wrapped by `st-toggle-icon-button` for the common case.
 */
@Directive({
  selector: '[stToggleIcon]',
  exportAs: 'stToggleIcon',
})
export class ToggleIconDirective {
  /** Regular (outline) Phosphor icon name, e.g. `phosphorBook`. Its `…Fill` twin
   *  must be registered in `icon-library.ts`. */
  readonly icon = input.required<string>();
  /** Whether the surface this control opens is currently open. */
  readonly open = input.required<boolean>();

  /** Phosphor name for the current state — bind to the child `<ng-icon [name]>`. */
  readonly iconName = computed(() => (this.open() ? this.icon() + 'Fill' : this.icon()));
}
