import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Player } from '@player/models/player';
import { ConfirmService } from '@ui/confirm-dialog/confirm.service';
import { NumberDialogService } from '@ui/number-dialog/number-dialog.service';
import { PlayerColorDirective } from '@player/colors/player-color.directive';
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
  private readonly confirm = inject(ConfirmService);
  private readonly numberDialog = inject(NumberDialogService);

  /** Prompt for a score and add it to this player's total (cancelling adds nothing). */
  addScore(player: Player): void {
    this.numberDialog
      .prompt({ player, action: 'Add Score' })
      .subscribe((value) => this.gameService.addScore(player, value));
  }

  /** Open this player's score history to review, correct, or remove past entries. */
  openHistory(player: Player): void {
    const data: FreeFormHistoryData = { player };
    this.dialog.open(FreeFormHistoryDialogComponent, { data, width: '22rem', maxWidth: '95vw' });
  }

  newGame(): void {
    this.confirm.newGame(() => this.gameService.reset());
  }
}
