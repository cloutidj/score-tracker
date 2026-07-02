import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgIcon } from '@ng-icons/core';
import { StColor } from '@color/models/st-color';
import { ColorHelper } from '@color/models/color-helper';
import { ColorSwatchComponent } from '../color-swatch/color-swatch.component';
import { ToggleIconDirective } from '@ui/toggle-icon/toggle-icon.directive';
import {COLOR_LIST} from '@color/color-list';

@Component({
  selector: 'st-color-picker',
  imports: [MatButtonModule, MatMenuModule, NgIcon, ToggleIconDirective, ColorSwatchComponent],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
})
export class ColorPickerComponent implements FormValueControl<StColor | null> {
  readonly playerColors = inject(COLOR_LIST);

  /** Two-way bound to the field value by `[formField]`. */
  readonly value = model<StColor | null>(null);
  /** Field state, auto-bound by `[formField]`. */
  readonly invalid = input(false);
  readonly touched = input(false);
  readonly disabled = input(false);
  /** Emitted to mark the field touched once the user finishes with the menu. */
  readonly touch = output<void>();

  /** The picker has no `mat-error` slot, so it shows its own error ring once invalid and touched. */
  protected readonly showError = computed(() => this.invalid() && this.touched());
  /** Open while the swatch menu is showing — drives the shared `stToggleIcon`
   *  active-glyph swap (outline → filled) on the trigger. */
  protected readonly menuOpen = signal(false);

  /** Per-swatch display model for the menu grid — hex/label formatting and the active
   * flag precomputed once instead of being recalculated per binding in the template.
   * Active is matched by color value, not object identity, so a value written from a
   * deserialized player still highlights the canonical swatch. */
  protected readonly swatches = computed(() => {
    const value = this.value();
    return this.playerColors.map((color) => ({
      color,
      hex: ColorHelper.hexString(color),
      label: ColorHelper.label(color),
      active: ColorHelper.sameColor(value ?? undefined, color),
    }));
  });

  /** The swatch matching the current value, if any — drives the trigger's label and fill. */
  protected readonly selectedSwatch = computed(() => this.swatches().find((s) => s.active) ?? null);

  protected readonly triggerLabel = computed(() => {
    const swatch = this.selectedSwatch();
    return swatch ? `Player color: ${swatch.label}. Change color.` : 'Choose player color';
  });

  selectColor(color: StColor): void {
    this.value.set(color);
  }
}
