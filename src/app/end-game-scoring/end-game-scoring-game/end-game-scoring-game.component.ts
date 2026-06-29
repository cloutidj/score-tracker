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
import { EndGameScoringService } from '../end-game-scoring.service';
import { ScoringCategory } from '../models/scoring-config';

/**
 * End-game scoring view: a card per player (themed in their color) listing the chosen
 * config's categories with each player's entered value, the points it contributes, and a
 * running total. Tapping a category row opens the shared {@link NumberDialogComponent}
 * seeded with the current value to enter/correct it; the engine recomputes totals (and the
 * leader) reactively. The leader is flagged once any value has been entered.
 */
@Component({
  selector: 'st-end-game-scoring-game',
  imports: [MatButtonModule, FontAwesomeModule, PlayerColorDirective],
  templateUrl: './end-game-scoring-game.component.html',
  styleUrl: './end-game-scoring-game.component.scss',
})
export class EndGameScoringGameComponent {
  readonly gameService = inject(EndGameScoringService);
  private readonly dialog = inject(MatDialog);

  /** Prompt for a category value (pre-filled with the current one) and store it. */
  editValue(player: Player, category: ScoringCategory, current: number): void {
    const data: NumberDialogData = {
      title: `${player.name} — ${category.name}`,
      playerColor: player.color,
      value: current,
    };
    this.dialog
      .open(NumberDialogComponent, { data })
      .afterClosed()
      .subscribe((value) => {
        if (value != null) {
          this.gameService.setValue(player, category.id, value);
        }
      });
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
