import { Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { transition, trigger } from '@angular/animations';
import { pulseGrow, pulseShrink } from '@util/animations/counter.animations';

@Component({
  selector: 'st-number-picker',
  templateUrl: './number-picker.component.html',
  styleUrl: './number-picker.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NumberPickerComponent), multi: true },
  ],
  animations: [
    trigger('counterFlip', [
      transition(':increment', pulseGrow),
      transition(':decrement', pulseShrink),
    ]),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NumberPickerComponent implements ControlValueAccessor {
  readonly numberValue = signal(0);

  private onChangeFn: (val: number) => void = () => {
    /* registered by registerOnChange */
  };
  private onTouchFn: () => void = () => {
    /* registered by registerOnTouched */
  };

  increment(): void {
    this.numberValue.update((v) => v + 1);
    this.onTouchFn();
    this.onChangeFn(this.numberValue());
  }

  decrement(): void {
    this.numberValue.update((v) => v - 1);
    this.onTouchFn();
    this.onChangeFn(this.numberValue());
  }

  writeValue(obj: number | null): void {
    this.numberValue.set(obj ?? 0);
  }

  registerOnChange(fn: (val: number) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchFn = fn;
  }
}
