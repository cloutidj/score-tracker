import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { IconButtonComponent } from '@ui/button/icon-button.component';
import { ToggleIconDirective } from '@ui/toggle-icon/toggle-icon.directive';
import { ButtonStatus } from '@ui/button/button-status';

/**
 * Ergonomic wrapper for the common toggle case: an icon button that reads
 * as **active while open** and default while closed, owning its own ARIA and
 * click. The active-glyph convention (outline → filled) lives in the shared
 * `stToggleIcon` directive; for a control that needs its own button chrome (e.g. a
 * menu trigger), apply that directive directly instead of this wrapper.
 *
 * Presentational only — the owner holds the open state and reacts to `toggled`.
 */
@Component({
  selector: 'st-toggle-icon-button',
  host: { 'st-layout': 'horizontal inline' },
  imports: [NgIcon, IconButtonComponent, ToggleIconDirective],
  template: `
    <button
      stIconButton="text"
      [status]="status()"
      type="button"
      stToggleIcon
      [icon]="icon()"
      [open]="open()"
      #toggle="stToggleIcon"
      [attr.aria-label]="label()"
      [attr.aria-pressed]="open()"
      (click)="toggled.emit()"
    >
      <ng-icon [name]="toggle.iconName()"></ng-icon>
    </button>
  `,
  styleUrl: './toggle-icon-button.component.scss',
})
export class ToggleIconButtonComponent {
  /** Whether the surface this button controls is currently open. */
  readonly open = input.required<boolean>();
  /** Regular (outline) Phosphor icon name, e.g. `phosphorBook`. */
  readonly icon = input.required<string>();
  /** Accessible label describing the action/surface. */
  readonly label = input.required<string>();
  /** Color family status for the button */
  readonly status = input<ButtonStatus>('muted');

  readonly toggled = output<void>();
}
