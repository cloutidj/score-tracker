import { Component, model, output, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'st-number-picker',
  imports: [MatButtonModule, FontAwesomeModule],
  templateUrl: './number-picker.component.html',
  styleUrl: './number-picker.component.scss',
})
export class NumberPickerComponent implements FormValueControl<number> {
  /** Two-way bound to the field value by `[formField]` (or a plain `[(value)]`). */
  readonly value = model(0);
  /** Emitted on each step to mark the bound field touched. */
  readonly touch = output<void>();

  // Direction of the last step, driving the value display's pulse keyframe via a
  // bound class. Cleared on `animationend` so the same direction can fire again.
  readonly pulse = signal<'grow' | 'shrink' | null>(null);

  increment(): void {
    this.value.update((v) => v + 1);
    this.pulse.set('grow');
    this.touch.emit();
  }

  decrement(): void {
    this.value.update((v) => v - 1);
    this.pulse.set('shrink');
    this.touch.emit();
  }
}
