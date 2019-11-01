import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { transition, trigger } from '@angular/animations';
import { pulseGrow, pulseShrink } from '@util/animations/counter.animations';

@Component({
  selector: 'st-number-picker',
  templateUrl: './number-picker.component.html',
  styleUrls: [ './number-picker.component.scss' ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NumberPickerComponent), multi: true }
  ],
  animations: [
    trigger('counterFlip', [
      transition(':increment', pulseGrow),
      transition(':decrement', pulseShrink),
    ])
  ]
})
export class NumberPickerComponent implements ControlValueAccessor {
  public numberValue = 0;
  public onChangeFn: (val: number) => {};
  public onTouchFn: () => {};

  increment(): void {
    this.numberValue++;
    this.onChangeFn(this.numberValue);
  }

  decrement(): void {
    this.numberValue--;
    this.onChangeFn(this.numberValue);
  }

  writeValue(obj: any): void {
    this.numberValue = obj || 0;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchFn = fn;
  }
}
