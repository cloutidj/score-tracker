import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';

/**
 * Shared affordance for every "open a contextual surface" control: a Material
 * icon button that reads as **lit (active color) while open** and default while
 * closed. The lit color is the universal open indicator, so it works for any
 * glyph (`book`, `users`, …) without needing a `far` outline twin.
 *
 * Pass `hasOutline` only for glyphs that ship a free `fas`+`far` pair (e.g.
 * `lightbulb`): the button then *also* swaps outline→filled as a bonus cue. The
 * icon stays visible while its surface is open, so the lit state doubles as a
 * "you are here" + close affordance.
 *
 * Presentational only — the owner holds the open state and reacts to `toggled`.
 */
@Component({
  selector: 'st-toggle-icon-button',
  imports: [MatButtonModule, FontAwesomeModule],
  template: `
    <button
      matIconButton
      type="button"
      [class.is-open]="open()"
      [attr.aria-label]="label()"
      [attr.aria-pressed]="open()"
      (click)="toggled.emit()"
    >
      <fa-icon [icon]="iconProp()"></fa-icon>
    </button>
  `,
  styleUrl: './toggle-icon-button.component.scss',
})
export class ToggleIconButtonComponent {
  /** Whether the surface this button controls is currently open. */
  readonly open = input.required<boolean>();
  /** Font Awesome glyph name (looked up in the shared library). */
  readonly icon = input.required<IconName>();
  /** Accessible label describing the action/surface. */
  readonly label = input.required<string>();
  /**
   * Set when `icon` has a free `fas`+`far` pair, to also swap outline→filled.
   * Defaults to false: rely on the lit color alone (works for any glyph).
   */
  readonly hasOutline = input(false);

  readonly toggled = output<void>();

  protected readonly iconProp = computed<IconName | [string, IconName]>(() => {
    const icon = this.icon();
    if (!this.hasOutline()) {
      return icon;
    }
    return this.open() ? ['fas', icon] : ['far', icon];
  });
}
