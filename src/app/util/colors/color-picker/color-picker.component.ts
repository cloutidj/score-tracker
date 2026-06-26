import { Component, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PlayerColor } from '@models/player-color';
import { PLAYER_COLOR_LIST } from '@util/injection-tokens';
import { ColorSwatchComponent } from '../color-swatch/color-swatch.component';

@Component({
  selector: 'st-color-picker',
  imports: [ColorSwatchComponent],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorPickerComponent), multi: true },
  ],
})
export class ColorPickerComponent implements ControlValueAccessor {
  readonly playerColors = inject(PLAYER_COLOR_LIST);
  readonly selectedColor = signal<PlayerColor | null>(null);

  private onChangeFn: (val: PlayerColor) => void = () => {
    /* registered by registerOnChange */
  };
  private onTouchFn: () => void = () => {
    /* registered by registerOnTouched */
  };

  selectColor(color: PlayerColor): void {
    this.selectedColor.set(color);
    this.onTouchFn();
    this.onChangeFn(color);
  }

  writeValue(obj: PlayerColor | null): void {
    if (obj) {
      // Match against the canonical list so identity comparison in the template holds.
      const target = Object.assign(new PlayerColor(), obj);
      this.selectedColor.set(
        this.playerColors.find((c) => c.hexString() === target.hexString()) ?? null,
      );
    } else {
      this.selectedColor.set(null);
    }
  }

  registerOnChange(fn: (val: PlayerColor) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchFn = fn;
  }
}
