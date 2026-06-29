import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@models/player';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@util/confirm-dialog/confirm-dialog.component';
import { NumberDialogComponent, NumberDialogData } from '@util/number-dialog/number-dialog.component';
import { PlayerColorDirective } from '@util/colors/player-color.directive';
import { FreeFormScoringService } from '../free-form-scoring.service';
import { FreeFormScoreTrackComponent } from '../free-form-score-track/free-form-score-track.component';
import {
  FreeFormHistoryData,
  FreeFormHistoryDialogComponent,
} from '../free-form-history-dialog/free-form-history-dialog.component';

/**
 * Free-form game view: a tile per player (themed in their color) showing their running
 * total. Tapping a tile opens the shared {@link NumberDialogComponent} to add a score —
 * positive or negative — to *that* player, at any time, in any order. Each tile also opens a
 * history dialog to correct/remove past entries, and a shared score track below the grid
 * shows who's ahead/behind. The leader is flagged once any score has been entered.
 */
@Component({
  selector: 'st-free-form-scoring-game',
  imports: [MatButtonModule, FontAwesomeModule, PlayerColorDirective, FreeFormScoreTrackComponent],
  templateUrl: './free-form-scoring-game.component.html',
  styleUrl: './free-form-scoring-game.component.scss',
})
export class FreeFormScoringGameComponent {
  readonly gameService = inject(FreeFormScoringService);
  private readonly dialog = inject(MatDialog);

  /** Prompt for a score and add it to this player's total (cancelling adds nothing). */
  addScore(player: Player): void {
    const data: NumberDialogData = {
      player,
      action: 'Add Score',
    };
    this.dialog
      .open(NumberDialogComponent, { data })
      .afterClosed()
      .subscribe((value) => {
        if (value != null) {
          this.gameService.addScore(player, value);
        }
      });
  }

  /** Open this player's score history to review, correct, or remove past entries. */
  openHistory(player: Player): void {
    const data: FreeFormHistoryData = { player };
    this.dialog.open(FreeFormHistoryDialogComponent, { data, width: '22rem', maxWidth: '95vw' });
  }

  newGame(): void {
    const data: ConfirmDialogData = {
      title: 'New Game',
      message: 'Discard the current game and start over?',
      confirmLabel: 'New Game',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.gameService.reset();
        }
      });
  }
}
