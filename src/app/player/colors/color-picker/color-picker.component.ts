import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerColor, colorLabel, hexString } from '@player/models/player-color';
import { PLAYER_COLOR_LIST } from '@core/injection-tokens';
import { ColorSwatchComponent } from '../color-swatch/color-swatch.component';

@Component({
  selector: 'st-color-picker',
  imports: [MatButtonModule, MatMenuModule, FontAwesomeModule, ColorSwatchComponent],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
})
export class ColorPickerComponent implements FormValueControl<PlayerColor | null> {
  readonly playerColors = inject(PLAYER_COLOR_LIST);
  /** Exposed for the template's `track` and swatch `aria-label`. */
  protected readonly hexString = hexString;
  protected readonly colorLabel = colorLabel;

  /** Two-way bound to the field value by `[formField]`. */
  readonly value = model<PlayerColor | null>(null);
  /** Field state, auto-bound by `[formField]`. */
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly disabled = input(false);
  /** Emitted to mark the field touched once the user finishes with the menu. */
  readonly touch = output<void>();

  /** The picker has no `mat-error` slot, so it shows its own error ring once invalid and touched. */
  protected readonly showError = computed(() => this.invalid() && this.touched());
  /** Lit while the swatch menu is open — same "open = active color" convention as the toggle buttons. */
  protected readonly menuOpen = signal(false);

  // Matched by color value, not object identity, so a value written from a deserialized
  // player still highlights the canonical swatch.
  protected readonly selectedColor = computed(() => {
    const value = this.value();
    return value ? this.playerColors.find((c) => hexString(c) === hexString(value)) ?? null : null;
  });

  protected readonly triggerLabel = computed(() => {
    const color = this.selectedColor();
    return color ? `Player color: ${colorLabel(color)}. Change color.` : 'Choose player color';
  });

  protected isSelected(color: PlayerColor): boolean {
    const selected = this.selectedColor();
    return !!selected && hexString(selected) === hexString(color);
  }

  selectColor(color: PlayerColor): void {
    this.value.set(color);
  }
}
