import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Player } from '@models/player';
import { PlayerColorDirective } from '@util/colors/player-color.directive';
import { NumberPadComponent } from '@util/number-pad/number-pad.component';
import { ScoreEntryHeaderComponent } from '@util/score-entry-header/score-entry-header.component';

export interface NumberDialogData {
  /** Whose value this is — supplies both the heading name and the dialog's color theme. */
  player: Player;
  /** What the value is, shown beneath the name (a category, a round, "Add Score", …). */
  action: string;
  /** Pre-fill the field — used when editing an existing value rather than entering a new one. */
  value?: number;
}

/**
 * Dialog wrapper around the shared {@link NumberPadComponent}. Used whenever a score is
 * entered away from an inline pad (free-form add/edit, per-round table edit): the keypad
 * is the input, and its Enter key closes the dialog with the value; Cancel closes with none.
 * The {@link ScoreEntryHeaderComponent} heading and the keypad both theme to `data.player`'s
 * color, so every caller gets a consistent, player-colored dialog for free.
 */
@Component({
  selector: 'st-number-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    PlayerColorDirective,
    NumberPadComponent,
    ScoreEntryHeaderComponent,
  ],
  templateUrl: './number-dialog.component.html',
  styleUrl: './number-dialog.component.scss',
})
export class NumberDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NumberDialogComponent, number>);

  readonly data = inject<NumberDialogData>(MAT_DIALOG_DATA);

  constructor() {
    // Strip the dialog surface's own padding (see `_dialog.scss`) so the header band can
    // bleed to its edges. Added here rather than at every call site so every caller gets it.
    this.dialogRef.addPanelClass('st-number-dialog-pane');
  }

  confirm(value: number): void {
    this.dialogRef.close(value);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
