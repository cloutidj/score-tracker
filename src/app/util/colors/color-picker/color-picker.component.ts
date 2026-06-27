import { Component, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PlayerColor } from '@models/player-color';
import { PLAYER_COLOR_LIST } from '@util/injection-tokens';
import { ColorSwatchComponent } from '../color-swatch/color-swatch.component';

@Component({
  selector: 'st-color-picker',
  imports: [MatFormFieldModule, MatSelectModule, ColorSwatchComponent],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorPickerComponent), multi: true },
  ],
})
export class ColorPickerComponent implements ControlValueAccessor {
  readonly playerColors = inject(PLAYER_COLOR_LIST);
  readonly selectedColor = signal<PlayerColor | null>(null);
  protected readonly disabled = signal(false);

  private onChangeFn: (val: PlayerColor) => void = () => {
    /* registered by registerOnChange */
  };
  private onTouchFn: () => void = () => {
    /* registered by registerOnTouched */
  };

  // Selection state is matched by color value, not object identity, so a value
  // written from a deserialized player still highlights the canonical swatch.
  protected readonly compareColors = (a: PlayerColor | null, b: PlayerColor | null): boolean =>
    !!a && !!b && a.hexString() === b.hexString();

  selectColor(color: PlayerColor): void {
    this.selectedColor.set(color);
    this.onTouchFn();
    this.onChangeFn(color);
  }

  writeValue(obj: PlayerColor | null): void {
    if (obj) {
      // Match against the canonical list so the dropdown shows the named entry.
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

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
