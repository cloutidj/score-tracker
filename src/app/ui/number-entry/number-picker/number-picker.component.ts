import { Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { NgIcon } from '@ng-icons/core';
import { IconButtonComponent } from '@ui/button/icon-button.component';
import { NumberChangeDirective } from '@ui/number-entry/number-change/number-change.directive';

@Component({
  selector: 'st-number-picker',
  imports: [NgIcon, IconButtonComponent, NumberChangeDirective],
  templateUrl: './number-picker.component.html',
  styleUrl: './number-picker.component.scss',
})
export class NumberPickerComponent implements FormValueControl<number> {
  /** Two-way bound to the field value by `[formField]` (or a plain `[(value)]`). */
  readonly value = model(0);
  /** Floor for `decrement()` — a count can't go negative by default. */
  readonly floor = input(0);
  /** Emitted on each step to mark the bound field touched. */
  readonly touch = output<void>();

  increment(): void {
    this.value.update((v) => v + 1);
    this.touch.emit();
  }

  decrement(): void {
    this.value.update((v) => Math.max(this.floor(), v - 1));
    this.touch.emit();
  }
}
