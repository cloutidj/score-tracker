import { Component, inject } from '@angular/core';
import { Player } from '@player/models/player';
import { ColorDirective } from '@color/color.directive';
import { ButtonComponent } from '@ui/button/button.component';
import { NumberPadComponent } from '@ui/number-pad/number-pad.component';
import { ScoreEntryHeaderComponent } from '@ui/score-entry-header/score-entry-header.component';
import { DialogRef } from '@ui/dialog/dialog-ref';
import { DIALOG_DATA, DIALOG_REF } from '@ui/dialog/dialog.tokens';

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
  imports: [ButtonComponent, ColorDirective, NumberPadComponent, ScoreEntryHeaderComponent],
  templateUrl: './number-dialog.component.html',
  styleUrl: './number-dialog.component.scss',
})
export class NumberDialogComponent {
  private readonly dialogRef = inject(DIALOG_REF) as DialogRef<number>;

  readonly data = inject(DIALOG_DATA) as NumberDialogData;

  constructor() {
    // Sizes the pane to the keypad's own width (see `_dialog.scss`) instead of the
    // dialog default, so the surface fills it exactly. Added here rather than at
    // every call site so every caller gets it.
    this.dialogRef.addPanelClass('st-number-dialog-pane');
  }

  confirm(value: number): void {
    this.dialogRef.close(value);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
