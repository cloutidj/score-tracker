import { Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerColor } from '@models/player-color';
import { PLAYER_COLOR_LIST } from '@util/injection-tokens';
import { ColorSwatchComponent } from '../color-swatch/color-swatch.component';

@Component({
  selector: 'st-color-picker',
  imports: [MatButtonModule, MatMenuModule, FontAwesomeModule, ColorSwatchComponent],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorPickerComponent), multi: true },
  ],
})
export class ColorPickerComponent implements ControlValueAccessor {
  readonly playerColors = inject(PLAYER_COLOR_LIST);
  /** Show the trigger in its error state (red ring); driven by the parent form. */
  readonly invalid = input(false);
  readonly selectedColor = signal<PlayerColor | null>(null);
  protected readonly disabled = signal(false);
  /** Lit while the swatch menu is open — same "open = active color" convention as the toggle buttons. */
  protected readonly menuOpen = signal(false);

  protected readonly triggerLabel = computed(() => {
    const color = this.selectedColor();
    return color ? `Player color: ${color.name}. Change color.` : 'Choose player color';
  });

  private onChangeFn: (val: PlayerColor) => void = () => {
    /* registered by registerOnChange */
  };
  private onTouchFn: () => void = () => {
    /* registered by registerOnTouched */
  };

  // Selection is matched by color value, not object identity, so a value written
  // from a deserialized player still highlights the canonical swatch.
  protected isSelected(color: PlayerColor): boolean {
    return this.selectedColor()?.hexString() === color.hexString();
  }

  selectColor(color: PlayerColor): void {
    this.selectedColor.set(color);
    this.onTouchFn();
    this.onChangeFn(color);
  }

  writeValue(obj: PlayerColor | null): void {
    if (obj) {
      // Match against the canonical list so the swatch shows the named entry.
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
