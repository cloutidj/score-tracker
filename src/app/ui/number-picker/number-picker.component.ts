import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'st-number-picker',
  imports: [MatButtonModule, FontAwesomeModule],
  templateUrl: './number-picker.component.html',
  styleUrl: './number-picker.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NumberPickerComponent), multi: true },
  ],
})
export class NumberPickerComponent implements ControlValueAccessor {
  readonly numberValue = signal(0);

  // Direction of the last step, driving the value display's pulse keyframe via a
  // bound class. Cleared on `animationend` so the same direction can fire again.
  readonly pulse = signal<'grow' | 'shrink' | null>(null);

  private onChangeFn: (val: number) => void = () => {
    /* registered by registerOnChange */
  };
  private onTouchFn: () => void = () => {
    /* registered by registerOnTouched */
  };

  increment(): void {
    this.numberValue.update((v) => v + 1);
    this.pulse.set('grow');
    this.onTouchFn();
    this.onChangeFn(this.numberValue());
  }

  decrement(): void {
    this.numberValue.update((v) => v - 1);
    this.pulse.set('shrink');
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
