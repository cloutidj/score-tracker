import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PlayerColor } from '@models/player-color';
import { PlayerColorDirective } from '@util/colors/player-color.directive';
import { NumberPadComponent } from '@util/number-pad/number-pad.component';

export interface NumberDialogData {
  title: string;
  playerColor?: PlayerColor;
  /** Pre-fill the field — used when editing an existing value rather than entering a new one. */
  value?: number;
}

/**
 * Dialog wrapper around the shared {@link NumberPadComponent}. Used whenever a score is
 * entered away from an inline pad (free-form add/edit, per-round table edit): the keypad
 * is the input, and its Enter key closes the dialog with the value; Cancel closes with none.
 */
@Component({
  selector: 'st-number-dialog',
  imports: [MatButtonModule, MatDialogModule, PlayerColorDirective, NumberPadComponent],
  templateUrl: './number-dialog.component.html',
  styleUrl: './number-dialog.component.scss',
})
export class NumberDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NumberDialogComponent, number>);

  readonly data = inject<NumberDialogData>(MAT_DIALOG_DATA);

  confirm(value: number): void {
    this.dialogRef.close(value);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
