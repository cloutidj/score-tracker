import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@player/models/player';
import { NumberDialogComponent, NumberDialogData } from '@ui/number-dialog/number-dialog.component';
import { PlayerColorDirective } from '@player/colors/player-color.directive';
import { FreeFormScoringService } from '../free-form-scoring.service';

export interface FreeFormHistoryData {
  player: Player;
}

/**
 * Per-player score history for free-form scoring: lists every entry in order and lets the
 * user correct a mistyped value or drop a wrong one. Reads the live session reactively
 * (by player number) so edits/removals — and adds made from here — reflect immediately,
 * and the totals/track elsewhere recompute through the same signal.
 */
@Component({
  selector: 'st-free-form-history-dialog',
  imports: [MatButtonModule, MatDialogModule, FontAwesomeModule, PlayerColorDirective],
  templateUrl: './free-form-history-dialog.component.html',
  styleUrl: './free-form-history-dialog.component.scss',
})
export class FreeFormHistoryDialogComponent {
  readonly data = inject<FreeFormHistoryData>(MAT_DIALOG_DATA);
  private readonly gameService = inject(FreeFormScoringService);
  private readonly dialog = inject(MatDialog);

  /** This player's live scores, looked up by number so it survives signal replacements. */
  readonly playerScores = computed(
    () =>
      this.gameService
        .scores()
        .find((s) => s.player.playerNumber === this.data.player.playerNumber) ?? null,
  );

  addScore(): void {
    this.promptValue('Add Score', (value) =>
      this.gameService.addScore(this.data.player, value),
    );
  }

  editEntry(index: number, current: number): void {
    this.promptValue(
      'Edit Score',
      (value) => this.gameService.editScore(this.data.player, index, value),
      current,
    );
  }

  removeEntry(index: number): void {
    this.gameService.removeScore(this.data.player, index);
  }

  private promptValue(action: string, apply: (value: number) => void, value?: number): void {
    const data: NumberDialogData = { player: this.data.player, action, value };
    this.dialog
      .open(NumberDialogComponent, { data })
      .afterClosed()
      .subscribe((result) => {
        if (result != null) {
          apply(result);
        }
      });
  }
}
