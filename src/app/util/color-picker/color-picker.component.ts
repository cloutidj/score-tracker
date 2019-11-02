import { Component, forwardRef, Inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PlayerColor } from '@models/player-color';
import { PLAYER_COLOR_LIST } from '@util/injection-tokens';

@Component({
  selector: 'st-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: [ './color-picker.component.scss' ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorPickerComponent), multi: true }
  ]
})
export class ColorPickerComponent implements ControlValueAccessor {
  public selectedColor: PlayerColor;
  public onChange: any;

  constructor(@Inject(PLAYER_COLOR_LIST) public playerColors: PlayerColor[]) {}

  selectColor(color: PlayerColor): void {
    this.selectedColor = color;
    this.onChange(this.selectedColor);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: any): void {
    this.selectedColor = obj;
  }
}
