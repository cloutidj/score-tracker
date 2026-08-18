import { Component, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Player } from '@player/models/player';
import { ButtonComponent } from '@ui/button/button.component';
import { IconButtonComponent } from '@ui/button/icon-button.component';
import { NewGameConfirmService } from '@game-types/_shared/new-game-confirm.service';
import { DialogService } from '@ui/dialog/dialog.service';
import { NumberDialogService } from '@ui/number-entry/number-dialog/number-dialog.service';
import { ColorDirective } from '@color/color.directive';
import { NumberChangeDirective } from '@ui/number-entry/number-change/number-change.directive';
import { ScoreTrackComponent } from '@game-types/_shared/score-track/score-track.component';
import { FreeFormScoringService } from '../free-form-scoring.service';
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
  imports: [
    NgIcon,
    ButtonComponent,
    IconButtonComponent,
    ColorDirective,
    NumberChangeDirective,
    ScoreTrackComponent,
  ],
  templateUrl: './free-form-scoring-game.component.html',
  styleUrl: './free-form-scoring-game.component.scss',
})
export class FreeFormScoringGameComponent {
  readonly gameService = inject(FreeFormScoringService);
  private readonly dialog = inject(DialogService);
  private readonly confirm = inject(NewGameConfirmService);
  private readonly numberDialog = inject(NumberDialogService);

  readonly trackEntries = computed(() =>
    this.gameService.scores().map((s) => ({ player: s.player, total: s.total() })),
  );

  /** Prompt for a score and add it to this player's total (cancelling adds nothing). */
  addScore(player: Player): void {
    this.numberDialog
      .prompt({ player, action: 'Add Score' })
      .subscribe((value) => this.gameService.addScore(player, value));
  }

  /** Open this player's score history to review, correct, or remove past entries. */
  openHistory(player: Player): void {
    const data: FreeFormHistoryData = { player };
    this.dialog.open(FreeFormHistoryDialogComponent, { data, width: '22rem' });
  }

  newGame(): void {
    this.confirm.newGame(() => this.gameService.reset());
  }
}
