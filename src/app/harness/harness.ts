import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NumberPadComponent } from '@util/number-pad/number-pad.component';
import { NumberPickerComponent } from '@util/number-picker/number-picker.component';

/**
 * Throwaway Phase 2 harness: smoke-tests the modal system + number components.
 * Removed once real features (forms, scoring) provide coverage in later phases.
 */
@Component({
  selector: 'st-harness',
  imports: [FormsModule, ClarityModule, NumberPadComponent, NumberPickerComponent],
  templateUrl: './harness.html',
})
export class Harness {
  readonly scores = signal<number[]>([]);
  pickerValue = 0;

  addScore(val: number): void {
    this.scores.update((s) => [...s, val]);
  }
}
